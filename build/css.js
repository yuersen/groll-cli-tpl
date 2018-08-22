/**
 * Compile css files
 * @author pxy0809
 * 1. 扫描所有的 url（背景/字体），存入 storage
 * 2. 将已压缩 css 写入到指定的目录
 */
const fs = require('fs');
const write = require('write');
const dest = require('./dest.js');
const utils = require('./utils.js');

/**
 * 扫描指定的 css 并使用 postcss 处理
 * @param  {String} cssPath - css 文件路径
 * @param  {String} alias   - css 文件别名
 * @return {Promise}
 */
function scan(cssPath, alias) {
	return new Promise((resolve, reject) => {
		fs.readFile(cssPath, (err, content) => {
			if (err) {
				reject({
					title: `Read ${cssPath} file failed.`,
					message: new Error(err)
				});
				throw err;
			}

			utils.less(content.toString('utf8')).then(res => {
				let paths = res.imports;
				paths.unshift(cssPath);

				let cssText = utils.urlInCss(res.css, paths, true);
				write(`${dest.css}${alias}`, cssText, (err) => { // 写入 css 文件
					if (err) {
						reject({
							title: `Write ${cssPath} to ${dest.css}${alias} file failed.`,
							message: new Error(err)
						});
						throw err;
					}
					resolve();
				});
			})
		});
	}).catch(err => {
		utils.error(err);
	});
};

/**
 * 编译 css
 * @param {Object[]} cssList - css 文件信息列表
 * @param {String} cssList[].extname - 后缀
 * @param {String} cssList[].absolute - 绝对路径
 * @param {String} cssList[].basename - 文件名
 * @param {String} cssList[].alias - 文件别名，即文件名 + MD5(absolute)
 * @return {Promise}
 */
module.exports.build = function(cssList) {
	return new Promise((resolve, reject) => {
		let promises = [];
		let keys = Object.keys(cssList);

		if (!keys.length) {
			return resolve();
		}

		keys.forEach(cssPath => {
			promises.push(scan(cssPath, cssList[cssPath].alias));
		});

		Promise.all(promises).then(reslists => {
			resolve();
			utils.log('Finish compiling css files.');
		})
	});
};