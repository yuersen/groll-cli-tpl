const gulp = require('gulp');
const runSequence = require('run-sequence');

const utils = require('./build/utils.js');
const img = require('./build/img.js');
const entry = require('./build/html.js');
const css = require('./build/css.js');
const js = require('./build/rollup.js');
const server = require('./build/server.js');
const conf = require('./config');

gulp.task('watch', () => {
	return gulp.watch('./src/**/*', () => {
		runSequence(
			// 'entry',
			'build:html',
			'build:css',
			'build:img',
			'build:js',
			'rev:html',
			() => {
				server.reload();
			}
		);
	});
});
// 开发环境
gulp.task('dev', (cb) => {
	runSequence(
		'entry',
		'build:html',
		'build:css',
		'build:img',
		'build:js',
		'rev:html', 
		['server', 'watch'],
		cb
	);
});

// 测试和生产环境
gulp.task('build', (cb) => {
	runSequence(
		'entry',
		'build:html',
		'build:css',
		'build:img',
		'build:js',
		'rev:html', 
		'zip',
		'ftp',
		cb
	);
});