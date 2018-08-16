/**
 * 处理 html 文件
 * @author pxy0809
 * 1. 扫描指定的 html 中的 js/css/img，http/https 资源忽略
 * 2. 根据生成的 manifest 进行相应处理
 * 3. 判断当前构建环境，压缩输出 html 到指定路径
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const write = require('write');
const through2 = require('through2');
const minify = require('html-minifier').minify;
const base = require('./base.js');
const conf = require('../config/index.js');
const dest = require('./dest.js');
const utils = require('./utils.js');
const storage = require('./storage.js');

let scriptExp = /<script[^>]*\bsrc\b\s*=\s*['"]((?!.*?http(s?):)+([^'"]*))['"][^>]*><\/script>/gi;
let imgExp = /<img[^>|:]*\bsrc\b\s*=\s*['"]((?!.*?http(s?):)+([^'"]*))['"][^>]*>/gi;
let linkExp = /<link[^>]*\bhref\b\s*=\s*['"]((?!.*?http(s?):)+([^'"]*))['"][^>]*>/gi;

/**
 * 对指定的 html 进行扫描
 * @param  {String} pattern - 指定路径的匹配规则
 * @return {Promise}
 */
function scan(pattern) {
	return new Promise((resolve, reject) => {
		glob(pattern, (err, files) => {
			if (err) {
				reject({
					title: `Scan ${pattern} failed.`,
					message: new Error(err)
				});
				throw err;
			}

			let promises = []; // 存储所有的 promise
			files.forEach(filepath => {
				promises.push(
					new Promise((resolvz, rejecz) => {
						fs.createReadStream(filepath)
							.pipe(through2.obj((file, enc, callback) => {
								let content = file.toString('utf8');

								// 处理 script/link/img 标签中的 url
								content = processUrl(content, filepath);

								if (process.env.NODE_ENV !== 'development') { // 非开发环境压缩处理
									content = minify(content, base.html.minify);
								}

								// 写入构建目录
								write(`${dest.html}${path.basename(filepath)}`, content, err => {
									if (err) {
										reject({
											title: `Write ${filepath} file failed.`,
											message: new Error(err)
										});
										throw err;
									}
									resolvz();
								});
								callback();
							}));
					})
				);
			});

			Promise.all(promises).then(entry => {
				resolve();
			});
		});
	}).catch(err => {
		utils.error(err);
	});
}

/**
 * 处理 script/link/img 标签中的 url
 * @param {String} content - html 文本内容
 * @param {String} filepath - html 路径
 */
function processUrl(content, filepath) {
	let env = process.env.NODE_ENV;
	let prefix = conf[env].assetsPublicPath;

	function getPaths(url, filepath) {
		let paths = {
			extname: path.extname(url)
		};
		paths.basename = path.basename(url, paths.extname);
		paths.absolute = utils.absolute(filepath, url);
		paths.alias = `${paths.basename}-${utils.createHash(paths.absolute)}${paths.extname}`;
		
		return paths;
	}

	content = content
		// 处理 script 标签引入的 js 文件，http(s) 资源忽略
		.replace(scriptExp, (match, capture) => {
			let pzths = getPaths(capture, filepath);
			let item = storage.addJs(pzths.absolute, pzths);

			return match.replace(capture, `${prefix}js/${item.alias}`);
		})
		// 处理 link 标签引入的 css 文件，http(s) 资源忽略
		.replace(linkExp, (match, capture) => {
			let pzths = getPaths(capture, filepath);
			let item = storage.addCss(pzths.absolute, pzths);

			return match.replace(capture, `${prefix}css/${item.alias}`);
		})
		// 处理 img 标签引入的 image 文件，http(s) 资源忽略
		.replace(imgExp, (match, capture) => {
			let pzths = getPaths(capture, filepath);
			let item = storage.addImg(pzths.absolute, pzths);

			return match.replace(capture, `${prefix}img/${item.alias}`);
		});

	return content;
}

/**
 * 构建图片
 * @param {Array} htmlpath - html 路径
 * @return {Promise}
 */
module.exports.build = function (htmlpath) {
	return new Promise((resolve, reject) => {
		let promises = [];
		let entries = htmlpath.length ? htmlpath : conf.entry;

		if (!entries.length) {
			return resolve();
		}

		entries.forEach(pattern => {
			promises.push(scan(`./src/views/${pattern}.html`));
		});

		Promise.all(promises).then(() => {
			resolve();
			utils.log('Finish compiling Html files.');
		});
	});
};