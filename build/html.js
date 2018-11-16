/**
 * @file 处理 html 文件
 * @author pxyamos
 * 1. 扫描指定的 html 中的 js/css/img，http/https 资源忽略
 * 2. 根据生成的 manifest 进行相应处理
 * 3. 判断当前构建环境，压缩输出 html 到指定路径
 */
const path = require('path');
const File = require('./file.js');
const JsFile = require('./rollup.js');
const CssFile = require('./css.js');
const ImageFile = require('./img.js');
const minify = require('html-minifier').minify;

module.exports = class HtmlFile extends File {
  constructor(filepath, realpath) {
    super(filepath, realpath);
    this.fileType = 'html';
    this.distpath = `./dist/${this.basename}`;
  }

  /**
   * 编译 HTML 文件
   * @returns {Promise}
   */
  compile() {
    let that = this;
    return new Promise((resolve, reject) => {
      super
        .readFile(that.realpath)
        .then(content => {
          content = content.toString('utf8');

          if (!content) {
            return resolve();
          }

          // 移除注释内容，排除注释内容可能包含 url
          content = content.replace(/<!--[\w\W\r\n]*?-->/gim, '');

          // Scan link/script/img tags
          that.scanLinkFile(content);
          that.scanScriptFile(content);
          that.scanImgFile(content);
          that.procontent = content;
          resolve();
        })
        .catch(err => {
          that.logError(err);
        });
    });
  }

  /**
   * 扫描 link 标签
   * @param {string} content - html 文本
   */
  scanLinkFile(content) {
    let that = this;
    let exp = /<link[^>]*\bhref\b\s*=\s*['"]((?!.*?(http(s?):|\/\/))+([^'"]*))['"][^>]*>/gi;
    content.replace(exp, (match, capture) => {
      that.addDeps({
        marker: match,
        resource: new CssFile(capture, path.resolve(that.dirname, capture))
      });
    });
  }

  /**
   * 扫描 script 标签
   * @param {string} content - html 文本
   */
  scanScriptFile(content) {
    let that = this;
    let exp = /<script[^>]*\bsrc\b\s*=\s*['"]((?!.*?(http(s?):|\/\/))+([^'"]*))['"][^>]*><\/script>/gi;
    content.replace(exp, (match, capture) => {
      that.addDeps({
        marker: match,
        resource: new JsFile(capture, path.resolve(that.dirname, capture))
      });
    });
  }

  /**
   * 扫描 img 标签
   * @param {string} content - html 文本
   */
  scanImgFile(content) {
    let that = this;
    let exp = /<img[^>|:]*\bsrc\b\s*=\s*['"]((?!.*?((http(s?)|data):|\/\/))+([^'"]*))['"][^>]*>/gi;
    content.replace(exp, (match, capture) => {
      that.addDeps({
        marker: match,
        resource: new ImageFile(capture, path.resolve(that.dirname, capture))
      });
    });
  }

  /**
   * 压缩 html 内容
   */
  compress() {
    let that = this;
    super.compress(() => {
      that.procontent = minify(that.procontent, {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        minifyJS: true,
        minifyCSS: true
      });
    });
  }
};
