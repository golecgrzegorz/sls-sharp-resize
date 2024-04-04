const sharp = require('sharp');

const resizeOptions = {
  width: 0,
  fit: 'inside',
  withoutEnlargement: true,
  withoutReduction: false,
}

module.exports.resizeImage = async function (sourceStream, options) {
  const sharpStream = sharp();

  // pipe readable
  sourceStream.pipe(sharpStream);

  const meta = await sharpStream.clone().metadata();
  const { width: originalWidth, height: originalHeight, orientation, channels } = meta;

  if (orientation > 5) {
    if (originalWidth > originalHeight) {
      sharpStream.rotate(90);
    }
  }

  const tasks = [];
  for (const width of options.widths) {
    resizeOptions.width = width;
    tasks.push(
        sharpStream.clone().resize(resizeOptions).toFormat(options.format, { quality: 90 })
    );
  }

  return await Promise.all(tasks);
}