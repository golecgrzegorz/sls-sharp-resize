const { resizeImage } = require('./libs/sharp-resize-stream');
const { getObject, uploadStream } = require('./libs/s3');
const path = require('path');

const sharpOptions = {
  format: 'webp',
  widths: [1920, 1600, 1280, 800, 512, 360]
};

module.exports.onUploadProcessImage = async (event) => {

  const { Records } = event;
  for(const record of Records) {
    const { bucket, object } = record.s3;

    try {
      const source = await getObject({
        Bucket: bucket.name,
        Key: object.key
      });

      const resizedStreams = await resizeImage(source.Body, sharpOptions);

      const uploadPromises = [];
      const ext = path.extname(object.key);
      const filename = path.basename(object.key, ext);
      for (let i= 0; i < resizedStreams.length; i++) {
        const stream = resizedStreams[i];
        uploadPromises.push(uploadStream(stream, {
          Bucket: process.env.TARGET_BUCKET,
          Key: `${filename}_${sharpOptions.widths[i]}.${sharpOptions.format}`,
          ContentType: `image/${sharpOptions.format}`
        }));
      }

      await Promise.all(uploadPromises);

    } catch (error) {
      console.error('>>> ERROR :: while resizing images', error.message, {
        Bucket: bucket.name,
        Key: object.key
      })
    }

  }
};
