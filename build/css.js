const utils = require('./utils.js');

const gulp = utils.publicDeps.gulp;
const plumber = utils.publicDeps.plumber;
const flatten = utils.publicDeps.flatten; // 移除多余的路径
const rev = utils.publicDeps.rev; // 添加版本号
const revCollector = utils.publicDeps.revCollector;

/**
 * less 文件处理
 * 1.编译 less
 * 2.生成 md5
 * 3.移除相对路径
 * 4.输出到指定目录
 * 5.生成 manifest.json 文件
 */
module.exports.build = function() {
  console.log('[CFT] Compiling css file.');
	return gulp.src(utils.entry.css)
		.pipe(plumber())
		.pipe(
			require('gulp-postcss')([
        // @import 查找路径
        require('postcss-import')({
          path: ['src/assets/css']
        }),
        // An async postcss plugin to copy all assets referenced in CSS files 
        // to a custom destination folder and updating the URLs.
        require('postcss-copy')({
          basePath: ['src'],
          dest: utils.destBasePath,
          template(fileMeta) {
            return 'img/' + fileMeta.name + fileMeta.hash.substr(8) + '.' + fileMeta.ext;
          }
        }),
        require('precss')(),
        require('autoprefixer')(),
        require('postcss-csso')()
			])
		)
		.pipe(rev())
		.pipe(flatten())
		.pipe(gulp.dest(utils.dest.css))
		.pipe(rev.manifest('rev-css-manifest.json'))
    .pipe(gulp.dest(utils.dest.rev));
};