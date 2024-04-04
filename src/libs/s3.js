const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const stream = require('stream');

const s3Client = new S3Client();

async function getObject(options) {
  return s3Client.send(new GetObjectCommand(options));
}
async function putObject(options) {
  return s3Client.send(new PutObjectCommand(options));
}

async function uploadStream(readableStream, params) {
  const passThroughStream = new stream.PassThrough();

  try {
    const parallelUploads3 = new Upload({
      client: s3Client,
      params: {
        Bucket: params.Bucket,
        Key: params.Key,
        ContentType: params.ContentType,
        Body: passThroughStream,
        // ACL:'public-read',
      },
      queueSize: 4,
      partSize: 1024 * 1024 * 5,
      leavePartsOnError: false,
    });

    readableStream.pipe(passThroughStream);
    return parallelUploads3.done();
  } catch (error) {
    console.error('>>> ERR :: uploadStream', error);
  }

}

module.exports = {
  getObject,
  putObject,
  uploadStream
}