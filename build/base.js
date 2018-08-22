module.exports = {
	html: { // html 编译选项
		minify: {
			removeComments: true,
			collapseWhitespace: true,
			collapseBooleanAttributes: true,
			removeEmptyAttributes: true,
			removeScriptTypeAttributes: true,
			removeStyleLinkTypeAttributes: true,
			minifyJS: true,
			minifyCSS: true
		}
	},
	css: { // css 编译选项

	},
	rollup: { // js 编译选项
		sign: { // 标记
			entry: 'data-entry' // 入口文件标记，默认在 script 标签中有 data-entry 标记的文件，是 js 入口文件
		},
		external: { // 通过 script 引入的非模块化的 js 文件
			bundle: true // 是否合并到单文件
		},
		input: {
			external: ['vue', 'axios'] // 第三方，忽略打包
		},
		output: {
			format: 'iife',
			globals: { // 全局变量
	      vue: 'Vue',
	      axios: 'axios'
	    }
		},
		minify: {
			ie8: true
		}
	}
};