const gulp = require('gulp');
const plumber = require('gulp-plumber');
const flatten = require('gulp-flatten'); // 移除多余的路径
const rev = require('gulp-rev'); // 添加版本号
const revCollector = require('gulp-rev-collector');

const postcss = require('gulp-postcss');
const postcssCopy = require('postcss-copy');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const precss = require('precss');
const atImport = require("postcss-import")

const utils = require('./utils.js');
const entry = require('./html.js');

/**
 * less 文件处理
 * 1.编译 less
 * 2.生成 md5
 * 3.移除相对路径
 * 4.输出到指定目录
 * 5.生成 manifest.json 文件
 */
gulp.task('build:css', function() {
	return gulp.src(entry.css)
		.pipe(plumber())
		.pipe(
			postcss([
        // @import 查找路径
        atImport({
          path: ['src/assets/css']
        }),
        // An async postcss plugin to copy all assets referenced in CSS files 
        // to a custom destination folder and updating the URLs.
        postcssCopy({
          basePath: ['src'],
          dest: utils.destBasePath,
          template(fileMeta) {
            return 'img/' + fileMeta.name + fileMeta.hash.substr(8) + '.' + fileMeta.ext;
          }
        }),
        precss(),
        // assets(),
        autoprefixer(),
        cssnano()
			])
		)
		.pipe(rev())
		.pipe(flatten())
		.pipe(gulp.dest(utils.destCssPath))
		.pipe(rev.manifest('rev-css-manifest.json'))
    .pipe(gulp.dest(utils.revPath));
});