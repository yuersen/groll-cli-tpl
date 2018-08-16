/**
 * 工具函数
 * @author pxy0809
 */
const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');
const less = require('less');
const CleanCSS = require('clean-css');
const base = require('./base.js');
const conf = require('../config/index.js');
const storage = require('./storage.js');

/**
 * 生成 MD5 hash
 */
module.exports.createHash = input => {
	return crypto.createHash('md5').update(input).digest('hex').slice(0, 10);
};

/**
 * 计算绝对路径
 * @param {String} curUrl - 当前的 url
 * @param {String} preUrl - 待计算 url
 */
module.exports.absolute = (curUrl, preUrl) => {
	return path.resolve(__dirname, '../', path.dirname(curUrl), preUrl);
};

/**
 * 输出错误信息
 * @param {String|Object} title - 错误信息的标题
 * @param {String|Undefined} message - 错误信息的内容
 */
module.exports.error = function error(title, message) {
	let info = typeof title === 'object' ? title : {title, message};
	console.error(`${chalk.red(info.title)}\n`, info.message);
};

/**
 * 输出常规信息
 * @param {String} msg - 待输出的信息
 */
module.exports.log = function log(msg) {
	console.info(`${chalk.green('[Groll]')} ${msg}`);
};

/**
 * 创建文件夹
 * @param {String} dest - 目标地址
 * @param {Function} cb - 回调函数
 */
module.exports.mkdir = function mkdir(dest, cb) {
	let dir = path.resolve(process.cwd(), dest);
	let extname = path.extname(dir);

	if (extname) {
		dir = path.dirname(dir);
	}
	fs.mkdir(dir, err => {
		if (err && err.code !== 'EEXIST') {
			return cb(dir, new Error(err));
		}
		cb(dir);
	});
};

/**
 * 使用 postcss 处理 css 文件
 * @param {String} cssText - css 文本
 * @param {Object} options - 选项配置
 * @return {Promise}
 */
module.exports.less = function (cssText, opts) {
	return less.render(cssText, opts || {});
};

/**
 * 压缩 css
 */
module.exports.cleanCss = function(input, options) {
	return new CleanCSS(options || {}).minify(input).styles;
};


/**
 * 提取 css 中的图片和字体
 * @param {String} cssText - css 文本
 * @param {Array} paths - 当前 css 依赖的 css 文件
 * @param {Boolean} islink - 是否通过 link 标签引入
 * @return {String}
 */
module.exports.urlInCss = function (cssText, paths, islink) {
	// 匹配非 http(s) 和 data: 资源
	let urlexp = /\burl\b\s*\(\s*['"]?((?!.*?(http(s?))|(data):)+[^\)'"]*)['"]?\s*\)/gi;
	let prefix = islink ? '../' : './';

	// 获取当前扫描图片或者字体真实路径
	// 图片或者字体可能在当前 css 中，可能在依赖的 css 中
	let absUrl = (url, paths) => {
		let absolute;
		for (let i = 0, l = paths.length; i < l; i++) {
			absolute = path.resolve(path.dirname(paths[i]), url);
			if (fs.pathExistsSync(absolute)) {
				return absolute;
			}
		}
		return '';
	};

	cssText = cssText.replace(urlexp, (match, capture) => {
		// 移除url中的查询条件 url('iconfont.eot?t=1534151265299');
		let urls = capture.split('?');
		let pzth = {};
		let item;
		
		pzth.extname = path.extname(urls[0]);
		pzth.absolute = absUrl(urls[0], paths);
		pzth.basename = path.basename(urls[0], pzth.extname);
		pzth.alias = `${pzth.basename}-${module.exports.createHash(pzth.absolute)}${pzth.extname}`;

		if (['.png', '.jpg', 'jpeg', '.gif'].indexOf(pzth.extname) !== -1) {
			item = storage.addImg(pzth.absolute, pzth);
			return match.replace(capture, `${prefix}img/${item.alias}`);
		} else {
			item = storage.addFont(pzth.absolute, pzth);
			urls[1] = urls[1] ? '?' + urls[1] : '';
			return match.replace(capture, `${prefix}font/${item.alias}${urls[1]}`);
		}
	});
	return cssText;
};

/**
 * 处理 js 中图片路径
 */
module.exports.collectImgInJs = function(imgs) {
	imgs = Array.isArray(imgs) ? imgs : [imgs];
	imgs.forEach(item => {
		let paths = {};
		paths.extname = path.extname(item.path);
		paths.absolute = path.resolve(process.cwd(), item.path);
		paths.basename = path.basename(item.path);
		paths.alias = item.alias;

		storage.addImg(paths.absolute, paths);
	});
};