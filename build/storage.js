/**
 * 存储需要缓存的数据
 */
const merge = require('merge');
const conf = require('../config');

// 存储所有的图片信息
let images = {};

module.exports.addImg = function(pzth, value) {
	if (pzth in images) {
		return images[pzth];
	}
	images[pzth] = value;
	return value;
};
module.exports.getImg = function() {
	return images;
};

// 存储所有的 js 文件信息
/**
 * 'path/to/html': {
 * 	entry: 'path/to/entry',
 * 	alias: '',
 * 	external: {
 * 		bundle: true/false,
 * 		content: ['path/to/1.js'],
 * 		alias: 'alias/js'
 * 	}
 * }
 */
let js = {};
module.exports.addJs = function(htmlpath, val, cover) {
	if (!js[htmlpath]) {
		js[htmlpath] = merge({}, {
			alias: '',
			basename: '',
			hash: '',
			extname: '',
			absolute: '',
			external: []
		}, val || {});
	}
	if (cover) {
		js[htmlpath] = Object.assign(js[htmlpath], val);
	}
	return js[htmlpath];
};
module.exports.getJs = function() {
	return js;
};
module.exports.updateJsExternal = function(htmlpath, external) {
	let item = module.exports.addJs(htmlpath);
	item.external.push(external);
	return item;
};

// 存储所有的 css 文件信息
let css = {};

module.exports.addCss = function(pzth, value) {
	if (pzth in css) {
		return css[pzth];
	}
	css[pzth] = value;
	return value;
};
module.exports.getCss = function() {
	return css;
};

// 存储所有的字体文件信息
let font = {};

module.exports.addFont = function(pzth, value) {
	if (pzth in font) {
		return font[pzth];
	}
	font[pzth] = value;
	return value;
};
module.exports.getFont = function() {
	return font;
};

// 存储所有的配置信息
let config = conf;
module.exports.setConfig = function(cong) {
	merge(config, cong || {});
};
module.exports.getConfig = function() {
	return config;
};

function clean (obj) {
	for (let i in obj) {
		delete obj[i];
	}
	return obj;
}
module.exports.clear = function() {
	js = clean(js);
	images = clean(images);
	css = clean(css);
	font = clean(font);
};

