const { createFilter } = require('rollup-pluginutils');

// 自定义钩子
let hooks = {};

module.exports = function hook(option) {
  let opt = option || {};
  let filter = createFilter(opt.include, opt.exclude);

  return {
    name: 'hook',
    transform(code, id) {
      if (filter(id)) {
        code = code.replace(/\bFIY\b\.([0-9a-zA-Z]+)\b\(([^\)]*)\)/gi, (match, method, param) => {
          let hook = hooks[method];
          let params = param.split(',').map(val => {
            return eval('(' + val.trim() + ')');
          });
          if (!hook) {
            throw new Error(`The ${method} isn't a hook methods. Please check ${id} file`);
          }
          params.push(id);
          return hook.apply(null, params) || match;
        });
      }
      return {
        code: code,
        map: {
          mappings: ''
        }
      };
    }
  };
}
