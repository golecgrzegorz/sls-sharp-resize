const { resizeImage } = require('./libs/sharp-resize');
const { getObject, putObject } = require('./libs/s3');
const { Buffer } = require('buffer');
const path = require('path');

const sharpOptions = {
  format: 'webp',
  widths: [1920, 1600, 1280, 800, 512, 360]
};

async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', chunk => chunks.push(chunk));
    readableStream.on('end', () => resolve(Buffer.concat(chunks)));
    readableStream.on('error', reject);
  });
}

module.exports.onUploadProcessImage = async (event) => {
  const { Records } = event;
  for(const record of Records) {
    const { bucket, object } = record.s3;

    try {
      const source = await getObject({
        Bucket: bucket.name,
        Key: object.key
      });

      const body = await streamToBuffer(source.Body);
      const fileName = path.basename(object.key);
      const resizedImages = await resizeImage(body, fileName, sharpOptions);

      const uploadPromises = [];
      for (const image of resizedImages) {

        uploadPromises.push(putObject({
          Bucket: process.env.TARGET_BUCKET,
          Key: image.name,
          Body: image.source.data,
          ContentType: `image/${sharpOptions.format}`
          // ACL: 'public-read'
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
