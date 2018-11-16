/**
 * @file 处理 import image from 'path/to/image'
 * @author pxyamos
 * Images are encoded using base64, which means they will be 33% larger
 * than the size on disk. You should therefore only use this for small
 * images where the convenience of having them available on startup (e.g.
 * rendering immediately to a canvas without co-ordinating asynchronous loading
 * of several images) outweighs the cost.
 */
const { createFilter } = require('rollup-pluginutils');
const { extname } = require('path');
const { readFileSync } = require('fs');
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminMozjpeg = require('imagemin-mozjpeg');

const mimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};
module.exports = function processImage(option) {
  let opt = option || {};
  let filter = createFilter(opt.include, opt.exclude);
  return {
    name: 'processImage',
    transform(code, id) {
      if (!filter(id)) {
        return null;
      }
      return new Promise((resolve, reject) => {
        let data = readFileSync(id);
        imagemin.buffer(data, {
          plugins: [
            imageminMozjpeg(),
            imageminPngquant({
              quality: '65-80'
            })
          ]
        })
          .then(data => {
            let base64 = `data:${
              mimeTypes[extname(id)]
            };base64,${data.toString('base64')}`;
            return resolve({
              code: `export default ${JSON.stringify(base64)};\n`,
              map: {
                mappings: ''
              }
            });
          })
          .catch(err => {
            reject(err);
          });
      });
    }
  };
};
