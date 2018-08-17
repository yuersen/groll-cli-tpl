/**
 * 构建目录信息
 * @author pxy0809
 */
const storage = require('./storage.js');
const conf = storage.getConfig();
let basePath = `./dist/${conf.version ? conf.version + '/' : ''}`;

module.exports = {
	base: basePath,
	html: basePath,
	js: `${basePath}js/`,
	css: `${basePath}css/`,
	img: `${basePath}img/`,
	font: `${basePath}font/`
};
