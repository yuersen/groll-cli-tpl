/**
 * @file CSS 资源类
 * @author pxyamos
 */
const File = require('./file.js');
const ImageFile = require('./img.js');
const FontFile = require('./font.js');
const less = require('less');
const postcss = require('postcss');
const CleanCSS = require('clean-css');
const autoprefixer = require('autoprefixer');
const path = require('path');
const storage = require('./storage.js');
const config = storage.getConfig();
const version = storage.getVersion();

module.exports = class CssFile extends File {
  constructor(filepath, realpath) {
    super(filepath, realpath);
    this.fileType = 'css';
    this.distpath = `./dist/static${version}/css/${this.alias}`;
    this.packpath = `${config.assetsPublicPath}static${version}/css/${this.alias}`;
    this.imported = false; // 标记当前的 css 是否是通过 import 导入
  }

  /**
   * CSS资源编译
   * @returns {Promise}
   */
  compile() {
    let that = this;
    return new Promise((resolve, reject) => {
      super.readFile(that.realpath).then(content => {
        content = content.toString('utf8');
        less
          .render(content, {
            paths: [],
            relativeUrls: true
          })
          .then(result => {
            // from 和 to 属性，因不输出具体的 css 文件，可忽略
            postcss([
              autoprefixer({
                browsers: ['> 1%', 'iOS 7', 'Android >= 3.2']
              })
            ])
              .process(result.css, {
                from: '/static/css/index.css',
                to: '/static/css/index.css'
              })
              .then(res => {
                that.procontent = that.cleanCSS(res.css);
                that.scanUrlInCss(res.css);
                resolve();
              })
              .catch(err => {
                reject(err);
              });
          })
          .catch(err => {
            reject(err);
          });
      });
    });
  }

  /**
   * 压缩 CSS
   * @param {string} cssText - css 文本
   * @param {object} option - CleanCSS 配置
   * @returns {string}
   */
  cleanCSS(cssText, option) {
    return new CleanCSS(option || {}).minify(cssText).styles;
  }

  /**
   * 扫描 css 文本中的 url
   * @param {string} cssText - css text
   */
  scanUrlInCss(cssText) {
    let that = this;
    let dirname = path.dirname(that.realpath);
    cssText.replace(/url\(((\s*)(['"]?)(.+?)\2(\s*))\)/g, (match, capture) => {
      let ext = path.extname(capture.replace(/\?_inline/, '')); // 处理内嵌 url
      let abspath = path.resolve(dirname, capture);
      let sourInfo = {
        marker: `url(${path.normalize(capture).split(path.sep).join('/')})`
      };

      sourInfo.resource
        = ['.jpg', '.jpeg', '.png', '.gif'].indexOf(ext) !== -1
          ? new ImageFile(capture, abspath)
          : new FontFile(capture, abspath);
      that.dependencies.push(sourInfo);
    });
  }

  /**
   * css 内嵌化处理
   * @returns {string}
   */
  inline() {
    return this.imported
      ? this.procontent
      : `<style>${this.procontent}</style>`;
  }
};
