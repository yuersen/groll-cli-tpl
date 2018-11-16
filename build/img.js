/**
 * @file 处理图片资源
 * @author pxyamos
 * 1. 合并配置指定图片列表，html中使用图片列表
 * 2. manifest 化处理
 * 3. 压缩
 */
const File = require('./file.js');
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminMozjpeg = require('imagemin-mozjpeg');
const storage = require('./storage.js');
const config = storage.getConfig();
const version = storage.getVersion();

module.exports = class ImageFile extends File {
  constructor(filepath, realpath) {
    super(filepath, realpath);
    this.fileType = 'image';
    this.distpath = `./dist/static${version}/img/${this.alias}`;
    this.packpath = `${config.assetsPublicPath}static${version}/img/${this.alias}`;
  }

  /**
   * 编译 image 资源
   * @returns {Promise}
   */
  compile() {
    let that = this;
    return new Promise((resolve, reject) => {
      super
        .readFile(that.realpath)
        .then(chunk => {
          that.original = chunk; // Backup original content
          imagemin
            .buffer(chunk, {
              plugins: [
                imageminMozjpeg(),
                imageminPngquant({
                  quality: '65-80'
                })
              ]
            })
            .then(data => {
              that.procontent = data;
              resolve(data);
            })
            .catch(err => {
              reject(err);
            });
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /**
   * 打包 image 资源
   * @returns {Promise}
   */
  pack() {
    let that = this;

    return new Promise((resolve, reject) => {
      if (that.isInline) {
        return resolve(that.toBase64());
      }
      super.writeFile();
      return resolve(that.packpath);
    });
  }

  /**
   * image to base64
   */
  toBase64() {
    let ext = this.extname.replace('.', '');
    return `data:image/${ext};base64,${this.procontent.toString('base64')}`;
  }
};
