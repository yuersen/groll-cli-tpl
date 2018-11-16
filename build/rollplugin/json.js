const { createFilter, dataToEsm } = require('rollup-pluginutils');

/**
 * 处理 import 'xx.json'
 */
module.exports = function processJson(option) {
  let opt = option || {};
  let filter = createFilter(opt.include, opt.exclude);
  let indent = 'indent' in opt ? opt.indent : '\t';
  return {
    name: 'processJson',
    transform(json, id) {
      if (id.slice(-5) !== '.json') {
        return null;
      }
      if (!filter(id)) {
        return null;
      }

      const data = JSON.parse(json);
      if (Object.prototype.toString.call(data) !== '[object Object]') {
        return {
          code: `export default ${json};\n`,
          map: {
            mappings: ''
          }
        };
      }

      return {
        code: dataToEsm(data, {
          preferConst: opt.preferConst,
          indent
        }),
        map: {
          mappings: ''
        }
      };
    }
  };
}
