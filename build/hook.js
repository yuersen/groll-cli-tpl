const path = require('path');
const dest = require('./dest.js').paths();
const utils = require('./utils.js');
const storage = require('./storage.js');

let conf = storage.getConfig();
let prefix = conf[process.env.NODE_ENV].assetsPublicPath;

module.exports = {
	url: function(url, filepath) {
		let absUrl = utils.resolve(filepath, url),
			paths = {}, item;
		
		paths.extname = path.extname(url);
		paths.absolute = absUrl;
		paths.basename = path.basename(url, paths.extname);
		paths.alias = paths.basename + '-' + utils.createHash(absUrl) + paths.extname;

		item = storage.addImg(absUrl, paths);
		return JSON.stringify(`${prefix}${dest.assetDir}img/${item.alias}`);
	}
};