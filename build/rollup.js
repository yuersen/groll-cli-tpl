/**
 * @file Js 资源类
 * @author pxyamos
 * @description 使用 rollup 对当前 Js 进行构建处理
 */

const File = require('./file.js');
const rollup = require('rollup');

// rollup plugins
const hook = require('./rollplugin/hook.js');
const includePath = require('rollup-plugin-includepaths');
const babel = require('rollup-plugin-babel');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const replace = require('rollup-plugin-re');
const processText = require('./rollplugin/text.js');
const processCss = require('./rollplugin/css.js');
const uglifyJs = require('./rollplugin/uglify.js');
const processImage = require('./rollplugin/image.js');
const processJson = require('./rollplugin/json.js');
const eslint = require('./rollplugin/eslint.js');
const storage = require('./storage.js');
const assign = Object.assign;
const config = storage.getConfig();
const version = storage.getVersion();

module.exports = class JsFile extends File {
  constructor(filepath, realpath) {
    super(filepath, realpath);
    this.fileType = 'js';
    this.distpath = `./dist/static${version}/js/${this.alias}`;
    this.packpath = `${config.assetsPublicPath}static${version}/js/${this.alias}`;
  }

  /**
   * 编译JS文件
   * @returns {Promise}
   */
  compile() {
    let that = this;
    return new Promise((resolve, reject) => {
      let filter = {
        include: ['src/**/*.js'],
        exclude: ['node_modules/**']
      };
      let inputOpt = {
        input: that.realpath,
        external: ['vue', 'axios'],
        plugins: [
          // 函数钩子，执行预定义函数
          hook(filter),
          // 处理相对路径
          includePath(assign({}, filter, {
            paths: [
              'src/views',
              'src/components',
              'src/mock',
              'node_modules'
            ]
          })),
          // 处理 js 中引入的全局变量 process.env.xxx
          replace(assign({}, filter, {
            patterns: [{
              transform(code, id) {
                return code.replace(/\bprocess\.env\.(\w+)\b/gi, (match, capture) => {
                  return JSON.stringify(config[capture] || null);
                });
              }
            }]
          })),
          // 处理模板文件，支持.html/.tpl/.htm
          processText(assign({}, filter, {
            include: [
              'src/**/*.html',
              'src/**/*.tpl',
              'src/**/*.htm'
            ]
          })),
          processCss(assign({}, filter, {
            include: [
              'src/**/*.css',
              'src/**/*.less'
            ]
          }), that),
          processJson(), // 支持 import 'xx.json'
          processImage(assign({}, filter, {
            include: [
              'src/**/*.jpg',
              'src/**/*.jpeg',
              'src/**/*.png',
              'src/**/*.gif'
            ]
          })),
          nodeResolve({ // commonjs
            jsnext: true,
            main: true,
            browser: true
          }),
          eslint(filter, true),
          commonjs(), // support commonjs
          babel(filter),
          (process.env.NODE_ENV !== 'development' && uglifyJs())
        ]
      };
      let outputOpt = {
        file: that.distpath,
        format: 'iife',
        globals: { // 全局变量
          vue: 'Vue',
          axios: 'axios'
        },
        sourcemap: process.env.NODE_ENV === 'development' // 只在开发环境生成 sourcemap
      };

      // 使用 rollup 编译处理
      rollup.rollup(inputOpt)
        .then(bundle => {
          bundle.generate(outputOpt)
            .then(result => {
              that.procontent = result.code;
              resolve();
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
   * JS文件内嵌化处理
   * @returns {string}
   */
  inline() {
    return `<script>${this.procontent}</script>`;
  }
};
