/**
 * 对 img 文件进行处理
 * @author pxy0809
 * 1. 合并配置指定图片列表，html中使用图片列表
 * 2. manifest 化处理
 * 3. 压缩
 */
const fs = require('fs-extra');
const path = require('path');
const imagemin = require('imagemin');
const dest = require('./dest.js').paths();
const utils = require('./utils.js');

/**
 * 扫描图片，并做复制、压缩处理
 * @param  {String} imgPath - 图片路径
 * @param  {String} alias - 图片别名
 * @return {Promise}
 */
function scan(imgPath, alias) {
	return new Promise((resolve, reject) => {
		if (process.env.NODE_ENV === 'development') {
			fs.copy(imgPath, `${dest.img}${alias}`)
				.then(() => {
					resolve();
				})
				.catch(err => {
					reject({
						title: `Copy ${imgPath} file failed.`,
						message: new Error(err)
					});
				});
		}
		else { // 压缩处理
			imagemin([imgPath], dest.img).then(() => {
				fs.rename(`${dest.img}${path.basename(imgPath)}`, `${dest.img}${alias}`);
				resolve();
			});
		}
	}).catch(err => {
		utils.error(err);
	});
}

/**
 * 构建图片
 * @param {Object[]} imgList - 图片文件信息列表
 * @param {String} imgList[].extname - 后缀
 * @param {String} imgList[].absolute - 绝对路径
 * @param {String} imgList[].basename - 文件名
 * @param {String} imgList[].alias - 文件别名，即文件名 + MD5(absolute)
 * @return {Promise}
 */
module.exports.build = function (imgList) {
	return new Promise((resolve, reject) => {
		let promises = [];
		let keys = Object.keys(imgList);

		if (!keys.length) {
			return resolve();
		}

		keys.forEach(imgPath => {
			promises.push(scan(imgPath, imgList[imgPath].alias));
		});

		Promise.all(promises).then(result => {
			resolve();
			utils.log('Finish compiling image files.');
		});
	});
};