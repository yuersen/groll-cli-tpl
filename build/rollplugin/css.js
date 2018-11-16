/**
 * @file 处理 import 导入 css 或者 less 文件
 * @author pxyamos
 */
const { createFilter } = require('rollup-pluginutils');
const CssFile = require('../css.js');
module.exports = function processCss(option, parent) {
  let opt = option || {};
  let filter = createFilter(opt.include, opt.exclude);

  return {
    name: 'processCss',
    transform(code, id) {
      return new Promise((resolve, reject) => {
        if (!filter(id)) {
          return resolve(null);
        }

        // 导入 CSS 或者 less 文件作为依赖
        let css = new CssFile(id, id);
        let marker = css.createHash();
        css.setOriginal = code;
        css.isInline = true;
        css.imported = true;
        parent.addDeps({
          marker: marker,
          resource: css
        });
        return resolve({
          code: `
            \nvar css = ${JSON.stringify(marker)};
            \nexport default 'css';
            \nimport styleInject from 'style-inject';
            \nstyleInject(css);
          `,
          map: {
            mappings: ''
          }
        });
      });
    }
  };
};
