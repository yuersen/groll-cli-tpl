/**
 * @file 静态资源基类
 * @author pxyamos
 */
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const log4js = require('log4js');
const write = require('write');

module.exports = class File {
  constructor(filepath, realpath) {
    let that = this;

    that.filepath = filepath.replace(/\?_inline/, ''); // 路径
    that.realpath = realpath.replace(/\?_inline/, ''); // 真实文件路径
    that.distpath = ''; // 本地构建资源路径
    that.packpath = ''; // 打包资源路径，即相对于构建目录路径
    that.extname = path.extname(that.filepath);
    that.dirname = path.dirname(that.filepath);
    that.basename = path.basename(that.filepath);
    that.filename = path.basename(that.filepath, that.extname);
    that.fileType = ''; // 文件类型 js/image/css/font
    that.original = ''; // 原始内容
    that.procontent = ''; // 加工内容
    that.dependencies = []; // 依赖资源 {marker: '', resource: new XFile()}
    that.isInline = /\?_inline/.test(filepath); // 是否内嵌
    that.alias = that.filename + that.createHash(filepath) + that.extname;
    that.isDevEnv = process.env.NODE_ENV === 'development';
  }

  /**
   * 创建 Hash
   * @param  {string} input - 待 hash 化的路径字符串
   * @return {string}
   */
  createHash(input) {
    return crypto
      .createHash('md5')
      .update(input || this.realpath)
      .digest('hex')
      .slice(0, 10);
  }

  /**
   * 设置文件原始内容
   * @param {stringtr} original - 文件原始内容
   */
  setOriginal(original) {
    this.original = original;
  }

  /**
   * 新增依赖
   * @param {object} deps - 依赖资源信息
   */
  addDeps(deps) {
    this.dependencies.push(deps);
  }

  /**
   * 读取文件内容
   * @returns {Promise}
   */
  readFile(filepath) {
    let that = this;
    return new Promise((resolve, reject) => {
      if (that.original) {
        return resolve(that.original);
      }

      let readable = fs.createReadStream(filepath, {
        highWaterMark: 2 * 1024 * 1024
      });

      readable.on('data', chunk => {
        that.original = chunk;
        resolve(chunk);
      });

      readable.on('error', err => {
        reject({
          message: `There is no such file or directory, open ${filepath} failed.`
        });
      });
    });
  }

  /**
   * 写入文件到构建目录
   * @returns {Promise}
   */
  writeFile() {
    let that = this;
    return new Promise((resolve, reject) => {
      // Write file to build path
      write(that.distpath, that.procontent)
        .then(() => {
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /**
   * 对静态资源进行打包，HtmlFile/JsFile/CssFile 继承该方法
   * ImageFile/FontFiel 重写
   * @returns {Promise}
   */
  pack() {
    let that = this;
    return new Promise((resolve, reject) => {
      let promiseList = [];
      that.dependencies.forEach(dep => {
        promiseList.push(
          new Promise((reve, rect) => {
            dep.resource
              .compile()
              .then(() => {
                dep.resource
                  .pack()
                  .then(content => {
                    let capture = content;
                    if (that.fileType === 'html') {
                      // 处理 html 依赖资源，js/css/img
                      // 非内嵌资源，替换对应的 URL
                      if (
                        !dep.resource.isInline
                        || (dep.resource.isInline
                          && dep.resource.fileType === 'image')
                      ) {
                        if (
                          /(?:src|href)\s*=\s*['"]([^'"]*)['"]/g.test(
                            dep.marker
                          )
                        ) {
                          capture = dep.marker.replace(RegExp.$1, content);
                        }
                      }
                    }
                    else if (that.fileType === 'css') {
                      // 处理 css 依赖资源
                      if (
                        !dep.resource.isInline
                        || (dep.resource.fileType === 'image'
                          && dep.resource.isInline)
                      ) {
                        capture = `url(${content})`;
                      }
                    }
                    // 替换标记内容
                    that.procontent = that.procontent.replace(
                      dep.marker,
                      capture
                    );
                    return reve();
                  })
                  .catch(err => {
                    rect(err);
                  });
              })
              .catch(err => {
                rect(err);
              });
          })
        );
      });

      Promise.all(promiseList)
        .then(() => {
          if (that.isInline) {
            return resolve(that.inline());
          }
          that.compress();
          that
            .writeFile()
            .then(() => {
              resolve(that.packpath);
            })
            .catch(err => {
              that.logError(err);
            });
        })
        .catch(err => {
          that.logError(err);
        });
    });
  }

  /**
   * 根据当前的构建环境对静态资源压缩
   * 非开发环境压缩
   * @param {Function} handler - 压缩相应资源
   */
  compress(handler) {
    if (process.env.NODE_ENV !== 'development') {
      handler && handler();
    }
  }

  /**
   * 输出错误/异常信息
   * @param {string}   module  - 错误/异常所属模块
   * @param {stringtr} message - 详细信息
   */
  logError(message) {
    let logger = log4js.getLogger();
    logger.level = 'error';
    logger.error(message);
  }
};
