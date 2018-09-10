/**
 * 对字体文件进行处理
 * @author pxy0809
 */
const fs = require('fs-extra');
const dest = require('./dest.js').paths();
const utils = require('./utils.js');

function scan(fontPath, alias) {
	return new Promise((resolve, reject) => {
		fs.copy(fontPath, `${dest.font}${alias}`)
			.then(() => {
				resolve();
			})
			.catch(err => {
				reject({
					title: `Copy ${fontPath} file failed.`,
					message: new Error(err)
				});
			});
	}).catch(err => {
		utils.error(err);
	});
}

module.exports.build = function (fontList) {
	return new Promise((resolve, reject) => {
		let promises = [];
		let keys = Object.keys(fontList);

		if (!keys.length) {
			return resolve();
		}

		keys.forEach(fontPath => {
			promises.push(scan(fontPath, fontList[fontPath].alias));
		});

		Promise.all(promises).then(result => {
			resolve();
		});
	});
};