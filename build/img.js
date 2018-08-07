const utils = require('./utils.js');

const gulp = utils.publicDeps.gulp;
const plumber = utils.publicDeps.plumber;
const flatten = utils.publicDeps.flatten; // 移除多余的路径
const rev = utils.publicDeps.rev; // 添加版本号
const revCollector = utils.publicDeps.revCollector;
const gulpif = utils.publicDeps.gulpif;

/**
 * 构建规则：
 * 	1.当前模块img文件全部拷贝
 * 	2.动态扫描html和css中的使用的公用图片，并将其加入到构建目录中
 * 	3.只处理 html 中引入的图片，css中，单独处理
 */
module.exports.build = function() {
	console.log('[CFT] Compiling image file.');
	return gulp.src(utils.entry.img)
		.pipe(plumber())
		.pipe(rev())
		.pipe(flatten())
		// 生产环境图片处理
		.pipe(gulpif(utils.env !== 'development', require('gulp-imagemin')()))
		.pipe(gulp.dest(utils.dest.img))
    .pipe(rev.manifest('rev-img-manifest.json'))
    .pipe(gulp.dest(utils.dest.rev));
}