const browserSync = require('browser-sync').create(); // browsersync
const proxyMiddleware = require('http-proxy-middleware'); // proxy
const dest = require('./dest.js');
const storage = require('./storage.js');

let conf = storage.getConfig();
let devConfig = conf[process.env.NODE_ENV];

module.exports.create = function() {
	let proxyTable = devConfig.proxyTable,
		proxys = [];

	// proxy api requests
	// 根据配置分别创建多个代理设置
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
	    baseDir: dest.base,
	    middleware: proxys
	  },
	  host: devConfig.host,
	  port: devConfig.port,
	  open: devConfig.open,
	  logLevel: 'silent',
		reloadOnRestart: true, // 不自动重装下一个Browsersync重装所有的浏览器
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
	console.log(`[^_^] Server: listening on port ${devConfig.port}, Accessing in: http://${devConfig.host}:${devConfig.port}`);
};
module.exports.browserSync = browserSync;