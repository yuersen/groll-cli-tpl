const runSequence = require('run-sequence');
const utils = require('./utils.js');
const html = require('./html.js');
const css = require('./css.js');
const img = require('./img.js');
const roll = require('./rollup.js');
const server = require('./server.js');
const gulp = utils.publicDeps.gulp;

gulp.task('clean', utils.clean);
gulp.task('entry', utils.getEntryTask);
gulp.task('build:html', html.build);
gulp.task('rev:html', html.rev);
gulp.task('build:css', css.build);
gulp.task('build:img', img.build);
gulp.task('compile:js', roll.build);
gulp.task('uncompile:js', roll.unbuild);
gulp.task('zip', utils.zipTask);
gulp.task('ftp', utils.ftpTask);
gulp.task('server', server.create);

gulp.task('watch', () => {
	return gulp.watch('../src/**/*', () => {
		runSequence(
			'entry',
			'build:html',
			'build:css',
			'build:img',
			['compile:js', 'uncompile:js'],
			'rev:html', 
			() => {
				server.browserSync.reload();
			}
		);
	});
});

// 开发环境
gulp.task('development', (cb) => {
	runSequence(
		'clean',
		'entry',
		'build:html',
		'build:css',
		'build:img',
		['compile:js', 'uncompile:js'],
		'rev:html', 
		['server', 'watch'],
		cb
	);
});

// 测试和生产环境
gulp.task('production', (cb) => {
	runSequence(
		'clean',
		'entry',
		'build:html',
		'build:css',
		'build:img',
		['compile:js', 'uncompile:js'],
		'rev:html', 
		'zip',
		'ftp',
		cb
	);
});