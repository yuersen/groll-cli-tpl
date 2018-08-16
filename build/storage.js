/**
 * 存储需要缓存的数据
 */
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