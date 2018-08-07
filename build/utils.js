
/**
 * 处理 html/less/js 入口
 * 默认约定：
 * 	1.模块中的 html、less、js 入口文件命名与模块名严格保持一致
 * 根据配置 modules 中的模块名，匹配对应的 html 入口，确定 js 和 less 的入口
 * xx: 匹配 xx.html
 * xx/*: 匹配 xx/*.html
 * xx/**\/*: 匹配 xx 文件下的所有包含子文件夹中的 html 
 */
const gulp = require('gulp');
const path = require('path');
const plumber = require('gulp-plumber');
const del = require('del');
const zip = require('gulp-zip');
const through2 = require('through2');
const conf = require('../config');
const pkg = require('../package.json');

let destBasePath = `../dist/${conf.version ? conf.version + '/' : ''}`;
let entry = {
	html: [],
	css: [],
	img: [],
	compiledjs: [],
	uncompiledjs: []
};
let dest = {
	base: destBasePath,
	html: destBasePath,
	css: `${destBasePath}css/`,
	img: `${destBasePath}img/`,
	js: `${destBasePath}js/`,
	rev: `${destBasePath}dev/`
};
let env = process.env.NODE_ENV.trim();

/**
 * 清理上次构建文件
 * 所有任务的开始
 */
module.exports.clean = function clean() {
	return del.sync([
		destBasePath + '**' // 清除当前版本下的文件
	], {
		force: true // Allow deleting the current working directory and outside.
	});
}

/**
 * 构建入口
 */
module.exports.getEntryTask = function() {
	let htmlEntry = conf.entry.map((val) => {
		return `../src/views/${val}.html`;
	});

	return gulp.src(htmlEntry)
		.pipe(plumber())
		.pipe(through2.obj((file, enc, callback) => {
			let filename = path.basename(file.path, '.html');
			entry.html.push(file.path);
			callback();
		}));
}

/**
 * 判断是否网络资源
 * http/https
 */
module.exports.detectNetwork = function(url) {
	return /^(https|http):\/\/?/.test(url);
}

/**
 * 根据路径获取相关信息
 */
module.exports.getInfoFromPath = function(filepath) {
	let basename = path.basename(filepath),
		dirname = path.dirname(filepath),
		extname = path.extname(filepath);

	return {
		basename: basename,
		dirname: dirname,
		extname: extname,
		filename: basename.replace(extname, '')
	};
}

/**
 * zip
 */
module.exports.zipTask = function() {
	if (conf[env].zip) {
		return gulp.src(destBasePath + '*')
		.pipe(zip(`${pkg.name}${conf.version}.zip`))
		.pipe(gulp.dest(destBasePath));
	}
	return null;
};

/**
 * ftp
 */
module.exports.ftpTask = function() {
	let ftpconf = conf[env].ftp;

	if (ftpconf.enabled) {
		var conn = require('vinyl-ftp').create(Object.assgin({}, ftpconf));
		return gulp.src(destBasePath + '**', {base: '.', buffer: false})
			.pipe(conn.dest(`/${pkg.name}`))
	}
	return null;
};

module.exports.entry = entry;
module.exports.dest = dest;
module.exports.env = env;

/**
 * 公用依赖包
 * 将公用依赖包存储，防止二次加载
 */
module.exports.publicDeps = {
	gulp: gulp,
	plumber: plumber,
	through2: through2
};
console.log('[CFT] Compiling...');