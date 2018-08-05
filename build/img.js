const gulp = require('gulp');
const plumber = require('gulp-plumber');
const flatten = require('gulp-flatten'); // 移除多余的路径
const imagemin = require('gulp-imagemin'); // 图片压缩
const rev = require('gulp-rev'); // 添加版本号
const revCollector = require('gulp-rev-collector');
const gulpif = require('gulp-if');

const utils = require('./utils.js');
const entry = require('./html.js');

/**
 * 构建规则：
 * 	1.当前模块img文件全部拷贝
 * 	2.动态扫描html和css中的使用的公用图片，并将其加入到构建目录中
 * 	3.只处理 html 中引入的图片，css中，单独处理
 */
gulp.task('build:img', () => {
	return gulp.src(entry.img)
		.pipe(plumber())
		.pipe(rev())
		.pipe(flatten())
		// 生产环境图片处理
		.pipe(gulpif(utils.env !== 'deve', imagemin()))
		.pipe(gulp.dest(utils.destImgPath))
    .pipe(rev.manifest('rev-img-manifest.json'))
    .pipe(gulp.dest(utils.revPath));
});