const { createFilter } = require('rollup-pluginutils');
const { minify } = require('html-minifier');
/**
 * 处理 import 'xx.html' 或者 import 'xx.tpl'
 */
module.exports = function processText(option) {
  let opt = option || {};
  let filter = createFilter(opt.include, opt.exclude);
  return {
    name: 'processText',
    transform(code, id) {
      if (filter(id)) {
        let minifyCode = minify(code, {
          removeComments: true,
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeEmptyAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          minifyJS: true,
          minifyCSS: true
        });
        return {
          // 使用 html-minifier 压缩 html 片段
          code: `export default ${JSON.stringify(minifyCode)}`,
          map: {
            mappings: ''
          }
        };
      }
    }
  };
};
