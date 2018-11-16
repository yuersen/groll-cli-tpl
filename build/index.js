/**
 * @file 构建主逻
 * @author pxyamos
 */
const del = require('del');
const path = require('path');
const argvs = require('yargs').argv;
const glob = require('glob');
const chokidar = require('chokidar');
const storage = require('./storage.js');

const { HtmlFile, entries, webserver } = (function () {
  // 处理用户自定义指定配置文件并与默认的进行合并处理
  // npm run dev -- --config path/to/custom/config.js
  if (argvs.config) {
    storage.setConfig(require('../' + argvs.config) || {});
  }

  // 若命令行中通过 --v 1.0.0 指定构建版本，更新 dest 中的构建路径
  // npm run dev -- --v 1.0.0
  if (argvs.v) {
    storage.setConfig({
      version: argvs.v
    });
  }

  return {
    HtmlFile: require('./html.js'),
    entries: storage.getEntry(),
    webserver: require('./server.js')
  };
})();

/**
 * 构建所有静态资源
 */
function build(callback) {
  // 从命令行获取构建入口
  // 如果没有指定，则使用配置 config/index.js 中的 entry 作为入口
  let patterns = argvs._.length ? argvs._ : entries;
  let sources = [];
  let promiseList = [];

  // 对当前入口 glob 进行处理
  patterns.forEach(pattern => {
    let matched = glob.sync(
      `./src/views/${pattern}${
        path.extname(pattern) === '.html' ? '' : '.html'
      }`
    );

    if (matched) {
      matched.forEach(entry => {
        sources.push(new HtmlFile(entry, path.resolve(process.cwd(), entry)));
      });
    }
  });

  sources.forEach(htmlFile => {
    promiseList.push(
      new Promise((resolve, reject) => {
        htmlFile
          .compile()
          .then(() => {
            htmlFile.pack().then(() => {
              resolve();
            });
          })
          .catch(err => {
            htmlFile.logError(err);
          });
      })
    );
  });

  Promise.all(promiseList).then(() => {
    callback && callback();
  });
}

del('./dist/', {
  force: true
})
  .then(() => {
    console.log('[^.^] Building, please wait a moment.');
    build(
      process.env.NODE_ENV === 'development'
        ? () => {
          let server = webserver();
          chokidar.watch([
            './src/**/*.html',
            './src/**/*.js',
            './src/**/*.css',
            './src/**/*.less'
          ]).on('change', (path, stats) => {
            build(() => {
              server.reload();
            });
          });
        }
        : void 0
    );
  })
  .catch(err => {
    console.error('Unable to delete dist folder normally.');
    console.error(err);
  });