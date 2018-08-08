const path = require('path');
const prefix = require('gulp-prefix'); // 添加前缀
const flatten = require('gulp-flatten'); // 移除多余的路径
const gulpif = require('gulp-if');
const rev = require('gulp-rev'); // 添加版本号
const revCollector = require('gulp-rev-collector');
const htmlmin = require('gulp-htmlmin'); // html 压缩组件
const gulpRemoveHtml = require('gulp-remove-html'); // 标签清除
const removeEmptyLines = require('gulp-remove-empty-lines'); // 清除空白行
const inlinesource = require('gulp-inline-source');

const conf = require('../config');
const utils = require('./utils.js');

// 新增公用依赖包
utils.publicDeps['flatten'] = flatten;
utils.publicDeps['rev'] = rev;
utils.publicDeps['revCollector'] = revCollector;
utils.publicDeps['gulpif'] = gulpif;

const gulp = utils.publicDeps.gulp;
const plumber = utils.publicDeps.plumber;
const through2 = utils.publicDeps.through2;

/**
 * 处理 HTML 文件中引入的资源
 */
function processResource(match, capture, dirname, type, inline) {
	let basename = path.basename(capture);

	// CDN 地址忽略
	if (utils.detectNetwork(capture)) {
		return match;
	}
	if (capture.indexOf('assets@') !== -1) {
		utils.entry[type === 'js' ? 'uncompiledjs': type].push(
			path.resolve(__dirname, capture.replace(/assets@/gi, '../src/assets/'))
		);
	} else {
		utils.entry[type === 'js' ? 'compiledjs': type].push(
			path.resolve(dirname, capture)
		);
	}
  return match.replace(capture, `${type}/${basename}`).replace(/\>/, ` ${inline}>`);
}

/**
 * html 文件处理
 * 1.处理 @include 引入的模板
 * 2.处理 script、link、image 标签 url 前缀
 * 3.移除相对路径
 */
module.exports.build = function() {
	console.log('[CFT] Compiling html file.');
	return gulp.src(utils.entry.html)
		.pipe(plumber())
		.pipe(through2.obj((file, enc, callback) => {
			// buffer to string
			let content = file.contents.toString(),
				dirname = path.dirname(file.path);

			content = content
				.replace(/<img[^(>|:)]*src=['"]([^'"]+)[^>]*>/gi, (match, capture) => {
					// 1.扫描内容，收集 HTML 中使用的图片
					return processResource(match, capture, dirname, 'img', '');
				})
				.replace(/<script[^>]*src=['"]([^'"]+)[^>]*><\/script>/gi, (match, capture) => {
					// 2.扫描内容，收集 HTML 中使用 js，所有扫描的 js 均是入口文件
					// 3.根据配置处理，是否使用内嵌 script
					return processResource(match, capture, dirname, 'js', conf.inline.script ? 'inline' : '');
				})
				.replace(/<link[^>]*href=['"]([^'"]+)[^>]*>/gi, (match, capture) => {
					// 4.扫描内容，收集 HTML 中使用 css，所有扫描的 css 均是入口文件
					// 5.根据配置处理，是否使用内嵌 style
					return processResource(match, capture, dirname, 'css', conf.inline.style ? 'inline' : '');
				});

			// 重写为 buffer
			file.contents = new Buffer(content, `utf-8`);
			callback(null, file);
		}))

		// 移除相对路径
		.pipe(flatten())
		.pipe(
			gulpif(
				utils.env !== 'development', 
				gulpRemoveHtml(), // 清除特定标签
				removeEmptyLines({removeComments: true}), // 清除空白行
				htmlmin({
					removeComments: true,// 清除HTML注释
					collapseWhitespace: true,// 压缩HTML
					collapseBooleanAttributes: true,// 省略布尔属性的值 <input checked="true"/> ==> <input />
					removeEmptyAttributes: true,// 删除所有空格作属性值 <input id="" /> ==> <input />
					removeScriptTypeAttributes: true,// 删除 <script> 的 type="text/javascript"
					removeStyleLinkTypeAttributes: true,// 删除 <style> 和 <link> 的 type="text/css"
					minifyJS: true,// 压缩页面JS
					minifyCSS: true// 压缩页面CSS
				})
			)
		)
		.pipe(gulp.dest(utils.dest.html));
};

/**
 * html 替换 css、js、图片 文件版本
 */
module.exports.rev = function() {
	return gulp.src([
			utils.dest.rev + '*.json',
			utils.dest.html + '*.html'
		])
		.pipe(plumber())
		.pipe(revCollector())
		.pipe(inlinesource())
		// 处理 script、link、image 标签 url 前缀
		.pipe(prefix(conf[utils.env].assetsPublicPath))
		.pipe(gulp.dest(utils.dest.html));
};