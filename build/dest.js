/**
 * 构建目录信息
 * @author pxy0809
 */
const conf = require('../config/index.js');
let basePath = `./dist/${conf.version ? conf.version + '/' : ''}`;

module.exports = {
	base: basePath,
	html: basePath,
	js: `${basePath}js/`,
	css: `${basePath}css/`,
	img: `${basePath}img/`,
	font: `${basePath}font/`
};
