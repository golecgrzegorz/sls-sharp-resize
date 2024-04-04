const sharp = require('sharp');
const path = require('path');

const resizeOptions = {
  width: 0,
  fit: 'inside',
  withoutEnlargement: true,
  withoutReduction: false,
}

module.exports.resizeImage = async function (source, filename, options) {
  let sharpSrc = sharp(source);

  const { width: originalWidth, height: originalHeight, orientation } = await src.metadata();
  if (orientation > 5) {
    if (originalWidth > originalHeight) {
      sharpSrc.rotate(90);
    }
  }

  const tasks = [];
  for await (const width of options.widths) {

    resizeOptions.width = width;
    const {
      data,
      info: { width, height, channels }
    } = await sharpSrc.resize(resizeOptions).raw().toBuffer({ resolveWithObject: true });

    // as a new source we set resized increase performance
    sharpSrc = sharp(data, { raw: { width, height, channels } });
    tasks.push(sharpSrc.toFormat(options.format).toBuffer());
  }

  const resizedSources = await Promise.all(tasks);
  const ext = path.extname(filename);
  const output = [];

  for (let i= 0; i < resizedSources.length; i++) {
    output.push({
      name: `${path.basename(filename, ext)}_${options.widths[i]}.${options.format}`,
      source: resizedSources[i]
    });
  }

  return output;
}