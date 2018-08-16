const del = require('del');
const chokidar = require('chokidar');
const dest = require('./dest.js');
const html = require('./html.js');
const css = require('./css.js');
const roll = require('./rollup.js');
const utils	= require('./utils.js');
const img = require('./img.js');
const font = require('./font.js');
const server = require('./server.js');
const base = require('./base.js');
const path = require('path');
const storage = require('./storage.js');

/**
 * 构建所有静态资源
 */
function build(callback) {
	// 首先把图片白名单放入storage
	utils.collectImgInJs(base.img.white);

	// 从命令行获取构建入口
	// 如果没有指定，则使用配置 config/index.js 中的 entry 作为入口
	html.build(process.argv.slice(2))
		.then(() => {
			Promise.all([roll.build(storage.getJs()), css.build(storage.getCss())])
				.then(() => {
					Promise.all([img.build(storage.getImg()),	font.build(storage.getFont())])
						.then(() => {
							callback && callback();
						});
				});
		});
}

del(dest.base, {force: true}).then(() => {
	utils.log('Start building, please wait a moment.');
	if (process.env.NODE_ENV === 'development') {
		build(() => {
			// 创建服务，监听文件变化
			server.create();
			chokidar.watch([
				'./src/**/*.html',
				'./src/**/*.js',
				'./src/**/*.css'
			]).on('change', (path, stats) => {
				build(() => {
					server.browserSync.reload();
				});
			});
		});
	}
	else {
		build();
	}
});




