/**
 * 压缩 js
 */
const UglifyJS = require('uglify-js');

module.exports = function uglifyJs() {
  return { // 压缩 js 代码
    name: 'uglifyJs',
    transformBundle(code) {
      return UglifyJS.minify(code, {
        compress: {
          drop_console: true, // 移除 console.*
          drop_debugger: true // 移除 debugger
        }
      });
    }
  };
};