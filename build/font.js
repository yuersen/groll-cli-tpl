/**
 * @file Font 资源类
 * @author pxyamos
 */
const File = require('./file.js');
const storage = require('./storage.js');
const config = storage.getConfig();
const version = storage.getVersion();

module.exports = class FontFile extends File {
  constructor(filepath, realpath) {
    super(filepath, realpath);
    this.fileType = 'font';
    this.distpath = `./dist/static${version}/font/${this.alias}`;
    this.packpath = `${config.assetsPublicPath}static${version}/font/${this.alias}`;
  }

  /**
   * 编译 Font 资源
   * @returns {Promise}
   */
  compile() {
    let that = this;
    return new Promise((resolve, reject) => {
      super
        .readFile(that.realpath)
        .then(chunk => {
          that.original = chunk;
          resolve(chunk);
        })
        .catch(err => {
          reject(`Compile ${that.realpath} failed.`);
        });
    });
  }

  /**
   * 打包 Font 资源
   * @returns {Promise}
   */
  pack() {
    let that = this;
    return new Promise((resolve, reject) => {
      if (that.isInline) {
        return resolve(that.toBase64());
      }
      super.writeFile();
      return resolve(that.distpath);
    });
  }

  /**
   * Font 资源 base64 处理
   * @returns {string}
   */
  toBase64() {
    let ext = this.extname.replace('.', '');
    return `data:image/${ext};base64,${this.procontent.toString('base64')}`;
  }
};
