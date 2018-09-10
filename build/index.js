const del = require('del');
const argvs = require('yargs').argv
const chokidar = require('chokidar');
const storage = require('./storage.js');
const dest = require('./dest.js');
const pkg = {};

// 处理用户自定义指定配置文件并与默认的进行合并处理
// npm run dev -- --config path/to/custom/config.js
if (argvs.config) {
	storage.setConfig(require('../' + argvs.config) || {});
}

// 若命令行中通过 --v 1.0.0 指定构建版本，更新 dest 中的构建路径
if (argvs.v) {
	dest.update(argvs.v);
}

['utils', 'html', 'css', 'rollup', 'img', 'font', 'server'].forEach(pkn => {
	pkg[pkn] = require(`./${pkn}.js`);
});

/**
 * 构建所有静态资源
 */
function build(callback) {
	// 从命令行获取构建入口
	// 如果没有指定，则使用配置 config/index.js 中的 entry 作为入口
	pkg.html.build(argvs._)
		.then(() => {
			Promise.all([pkg.rollup.build(storage.getJs()), pkg.css.build(storage.getCss())])
				.then(() => {
					Promise.all([pkg.img.build(storage.getImg()),	pkg.font.build(storage.getFont())])
						.then(() => {
							callback && callback();
						});
				});
		});
}

del(dest.paths().base, {force: true}).then(() => {
	pkg.utils.log('Start building, please wait a moment.');
	if (process.env.NODE_ENV === 'development') {
		build(() => {
			// 创建服务，监听文件变化
			pkg.server.create();
			chokidar.watch([
				'./src/**/*.html',
				'./src/**/*.js',
				'./src/**/*.css',
				'./src/**/*.less'
			]).on('change', (path, stats) => {
				storage.clear();
				build(() => {
					pkg.server.browserSync.reload();
				});
			});
		});
	}
	else {
		build();
	}
});




