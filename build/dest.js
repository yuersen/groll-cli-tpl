/**
 * 构建目录信息
 * @author pxy0809
 */
const storage = require('./storage.js');
const conf = storage.getConfig();
//let basePath = `./dist/${conf.version ? conf.version + '/' : ''}`;

let cache = {};
function create(version) {
	let base = './dist/';
	let assetDir = 'static' + version + '/';
	return {
		base: base,
		html: base,
		assetDir: assetDir,
		js: `${base}${assetDir}js/`,
		css: `${base}${assetDir}css/`,
		img: `${base}${assetDir}img/`,
		font: `${base}${assetDir}font/`
	};
}
// 取默认的配置中版本
cache = create(conf.version || '');
module.exports.paths = function() {
	return cache;
};

// 从外部指定版本等信息
module.exports.update = function(version) {
	cache = create(version);
	return cache;
};
