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
let js = {};

module.exports.addJs = function(pzth, value) {
	if (pzth in js) {
		return js[pzth];
	}
	js[pzth] = value;
	return value;
};
module.exports.getJs = function() {
	return js;
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