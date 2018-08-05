const gulp = require('gulp');
const browserSync = require('browser-sync').create(); // browsersync
const proxyMiddleware = require('http-proxy-middleware'); // proxy
const conf = require('../config');
const dev = conf.deve;

gulp.task('server', () => {
	let proxyTable = dev.proxyTable,
		proxys = [];

	// proxy api requests
	Object.keys(proxyTable).forEach(context => {
	  let options = proxyTable[context];
	  if (typeof options === 'string') {
	    options = {
	      target: options
	    };
	  }
	  proxys.push(proxyMiddleware(context, options));
	});

	browserSync.init({
		server: {
	    baseDir: `./dist/${conf.version}/`,
	    middleware: proxys
	  },
	  host: dev.host,
	  port: dev.port,
	  open: dev.open,
	  logLevel: 'silent',
	  notify: false, // 不显示在浏览器中的任何通知
	  snippetOptions: {
			//提供一个自定义的正则表达式插入片段。
			rule: {
			  match: /<\/body>/i,
			  fn: function (snippet, match) {
			  	// 重写 console，阻止 browsersync 在控制台输出信息
			    return snippet + match +
			      	`<script>
			      		var consoleLogMethod = window.console.log;
			      		window.console.log = function() {
				      		if (!/engine\.io|socket\.io/.test('' + arguments[0])) {
				      			consoleLogMethod.apply(this, arguments);
				      		}
				      	}
			      	</script>`;
			  }
			}
		}
	});
	console.log(`[^_^] Server: listening on port ${dev.port}, Accessing in: http://${dev.host}:${dev.port}`);
});

module.exports = browserSync;