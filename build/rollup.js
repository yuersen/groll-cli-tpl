/**
 * 对 js 文件进行处理
 * 1. 扫描所有的 url（背景/字体），供图片打包处理使用
 * 2. manifest 化处理
 * 3. 压缩
 */
const path = require('path');
const rollup = require('rollup');
const {createFilter, dataToEsm} = require('rollup-pluginutils');
const includePath = require('rollup-plugin-includepaths');
const babel = require('rollup-plugin-babel');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const replace = require('rollup-plugin-re');
const UglifyJS = require('uglify-js');
const {minify} = require('html-minifier');
const {CLIEngine} = require('eslint');
const base = require('./base.js');
const dest = require('./dest.js');
const utils = require('./utils.js');
const conf = require('../config/index.js');

/**
 * 处理 import 'xx.html' 或者 import 'xx.tpl'
 */
function importText(include, exclude) {
	const filter = createFilter(include, exclude);
	return {
		name: 'importText',
		transform(code, id) {
			if (filter(id)) {
				return {
					// 使用 html-minifier 压缩 html 片段
					code: `export default ${JSON.stringify(minify(code, base.html.minify))};`,
					map: { mappings: '' }
				};
			}
		}
	};
}

/**
 * 处理 import 'xx.css'
 */
function cssInJs(options) {
	const opts = options || {};
	const filter = createFilter(opts.include, opts.exclude);
	return {
		name: 'cssInJs',
		transform(code, id) {
			return new Promise((resolve, reject) => {
				if (!filter(id)) {
					return resolve(null);
				}

				return Promise.resolve(utils.less(code).then(res => {
					let paths = res.imports;
					paths.unshift(id);

					let cssText = utils.urlInCss(res.css, paths, false);
					let cleanText = utils.cleanCss(cssText);
					let output = `
            \nvar css = ${JSON.stringify(cleanText)};
            \export default 'css';
            \nimport styleInject from 'style-inject';
            \nstyleInject(css);
          `;
					return resolve({
						code: output,
						map: {
							mappings: ''
						}
					})
				}));
			});
		}
	};
}

/**
 * 处理 js 用到的图片
 * 约定使用 //<# {path: img/path, alias: imgAlias} #>
 */
function imgInJs(options) {
	const opts = options || {};
	const filter = createFilter(opts.include, opts.exclude);
	return {
		name: 'imgInJs',
		transform(code, id) {
			if (filter(id)) {
				code.replace(/\/\/\s*<\s*#\s*(\{[^\}]*\})\s*#\s*>/gi, (match, capture) => {
					utils.collectImgInJs(eval('(' + capture + ')'));
					return match;
				});
			}
			return null;
		}
	};
}

/**
 * 压缩 js
 */
function uglifyJs() {
	return { // 压缩 js 代码
  	name: 'uglifyJs',
	 	transformBundle(code) {
	 		return process.env.NODE_ENV !== 'development'
	 			? UglifyJS.minify(code, base.rollup.minify) : code;
	 	}
	};
}

/**
 * eslint
 */
function eslint(options, useEslint) {
	const cli = new CLIEngine(options);
	let formatter = options.formatter;

	if (!useEslint) {
  	return {
  		name: 'eslint',
    	transform(code, id) {
    		return null;
    	}
  	};
	}

	if (typeof formatter !== 'function') {
		formatter = cli.getFormatter(formatter || 'stylish');
	}

	const filter = createFilter(
		options.include,
		options.exclude || /node_modules/
	);
	const normalizePath = function (id) {
		return path.relative(process.cwd(), id).split(path.sep).join('/');
	};
	return {
		name: 'eslint',
		transform(code, id) {
			const file = normalizePath(id);
			const report = cli.executeOnText(code, file);
			const result = formatter(report.results);
			const hasWarnings = options.throwOnWarning && report.warningCount !== 0;
			const hasErrors = options.throwOnError && report.errorCount !== 0;

			if (cli.isPathIgnored(file) || !filter(id)) {
				return null;
			}
			if (report.warningCount === 0 && report.errorCount === 0) {
				return null;
			}
			if (result) {
				console.log(result);
			}
			if (hasWarnings && hasErrors) {
				throw Error('Warnings or errors were found');
			}
			if (hasWarnings) {
				throw Error('Warnings were found');
			}
			if (hasErrors) {
				throw Error('Errors were found');
			}
		}
	};
}

/**
 * 处理 import 'xx.json'
 */
function importJson(options) {
	options = options || {};
	const filter = createFilter(options.include, options.exclude);
	const indent = 'indent' in options ? options.indent : '\t';
	return {
		name: 'importJson',
		transform(json, id) {
			if (id.slice(-5) !== '.json') {
				return null;
			}
			if (!filter(id)) {
				return null;
			}

			const data = JSON.parse(json);
			if (Object.prototype.toString.call(data) !== '[object Object]') {
				return {code: `export default ${json};\n`, map: {mappings: ''}};
			}

			return {
				code: dataToEsm(data, {preferConst: options.preferConst, indent}),
				map: {mappings: ''}
			};
		}
	};
}

/**
 * 处理 js 文件
 */
function scan(jsPath, alias) {
	return new Promise((resolve, reject) => {
		let config = conf[process.env.NODE_ENV];
		let inputOptions = Object.assign({}, base.rollup.input, {
			input: jsPath,
			plugins: [
				imgInJs({
					include: ['src/**/*.js'],
					exclude: ['node_modules/**']
				}),
				includePath({ // 处理相对路径
					include: {},
					paths: ['src/views', 'src/components', 'src/mock', 'node_modules']
				}),
				replace({ // 处理 js中引入的全局变量 process.env.xxx
					include: 'src/**/*.js',
					exclude: 'node_modules/**',
					patterns: [{
						transform (code, id) { // replace by function
							return code.replace(/\bprocess\.env\.(\w+)\b/gi, (match, capture) => {
								return JSON.stringify(config[capture] || null);
							});
			      }
					}]
				}),
				importText(['src/**/*.html']),
				cssInJs({
					include: ['src/**/*.css']
				}),
				importJson(), // 支持 import 'xx.json'
				nodeResolve({ // commonjs
					jsnext: true,
					main: true,
					browser: true
				}),
				commonjs(), // support commonjs
				babel({ // babel
					exclude: 'node_modules/**'
				}),
				eslint({
					include: 'src/**/*.js',
					exclude: ['node_modules/**']
				}, conf.development.useEslint),
				uglifyJs()
			]
		});
		let outputOptions = Object.assign({}, base.rollup.output, {
			file: `${dest.js}${alias}`
		});

		rollup.rollup(inputOptions).then(bundle => {
			bundle.write(outputOptions);
			resolve();
		}).catch(err => {
			utils.error('Rollup running error reporting', err);
		});
	});
}

/**
 * 编译 js
 * @param {Object[]} jsList - js 文件信息列表
 * @param {String} jsList[].extname - 后缀
 * @param {String} jsList[].absolute - 绝对路径
 * @param {String} jsList[].basename - 文件名
 * @param {String} jsList[].alias - 文件别名，即文件名 + MD5(absolute)
 * @return {Promise}
 */
module.exports.build = function (jsList) {
	return new Promise((resolve, reject) => {
		let promises = [];
		let keys = Object.keys(jsList);

		if (!keys.length) {
			return resolve();
		}
		
		keys.forEach(jsPath => {
			promises.push(scan(jsPath, jsList[jsPath].alias));
		});
		Promise.all(promises).then(reslists => {
			resolve();
			utils.log('Finish compiling js files.');
		});
	});
};