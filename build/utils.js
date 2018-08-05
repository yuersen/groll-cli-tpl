
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
const zip = require('gulp-zip');
const ftp = require('vinyl-ftp');
const plumber = require('gulp-plumber');
const del = require('del');
const through2 = require('through2');
const conf = require('../config');
const pkg = require('../package.json');
const env = process.env.NODE_ENV.substr(0, 4);

let htmlEntry = [];
let destBasePath = `./dist/${conf.version ? conf.version + '/' : ''}`;

/**
 * 清理上次构建文件
 * 所有任务的开始
 */
gulp.task('clean', (cb) => {
	return del([
		destBasePath // 清除当前版本下的文件
	]).then(paths => {
		// TODO
	});
});

/**
 * 构建入口
 */
gulp.task('entry', ['clean'], () => {
	let entry = conf.entry.map((val) => {
		return `./src/views/${val}.html`;
	});

	return gulp.src(entry)
		.pipe(plumber())
		.pipe(through2.obj((file, enc, callback) => {
			let filename = path.basename(file.path, '.html');
			htmlEntry.push(file.path);
			callback();
		}));
});

/**
 * 判断是否网络资源
 * http/https
 */
function detectNetwork(url) {
	return /^(https|http):\/\/?/.test(url);
}

/**
 * 根据路径获取相关信息
 */
function getInfoFromPath(filepath) {
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
gulp.task('zip', () => {
	if (conf[env].zip) {
		return gulp.src(destBasePath + '*')
		.pipe(zip(`${pkg.name}${conf.version}.zip`))
		.pipe(gulp.dest('dist'));
	}
	return null;
});

/**
 * ftp
 */
gulp.task('ftp', () => {
	let ftpconf = conf[env].ftp;

	if (ftpconf.enabled) {
		var conn = ftp.create(Object.assgin({}, ftpconf));
		return gulp.src(destBasePath + '**', {base: '.', buffer: false})
			.pipe(conn.dest(`/${pkg.name}`))
	}
	return null;
})

module.exports = {
	env: env,
	htmlEntry: htmlEntry,

	destBasePath: destBasePath,
	revPath: `${destBasePath}dev/`,
	destHtmlPath: destBasePath,
	destImgPath: `${destBasePath}img/`,
	destJsPath: `${destBasePath}js/`,
	destCssPath: `${destBasePath}css/`,

	detectNetwork: detectNetwork,
	getInfoFromPath: getInfoFromPath
};