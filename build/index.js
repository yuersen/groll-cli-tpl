const del = require('del');
const argvs = require('yargs').argv
const chokidar = require('chokidar');
const storage = require('./storage.js');
const utils	= require('./utils.js');
const pkg = {};

// 处理用户自定义指定配置文件并与默认的进行合并处理
// npm run dev -- --config path/to/custom/config.js
if (argvs.config) {
	storage.setConfig(require('../' + argvs.config) || {});
}

['dest', 'html', 'css', 'rollup', 'img', 'font', 'server'].forEach(pkn => {
	pkg[pkn] = require(`./${pkn}.js`);
});

/**
 * 构建所有静态资源
 */
function build(callback) {
	// 首先把图片白名单放入storage
	// utils.collectImgInJs(base.img.white);

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

del(pkg.dest.base, {force: true}).then(() => {
	utils.log('Start building, please wait a moment.');
	if (process.env.NODE_ENV === 'development') {
		build(() => {
			// 创建服务，监听文件变化
			pkg.server.create();
			chokidar.watch([
				'./src/**/*.html',
				'./src/**/*.js',
				'./src/**/*.css'
			]).on('change', (path, stats) => {
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




