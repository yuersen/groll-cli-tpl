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
		postcss: {
			'postcss-import': {
	      path: ['src/assets/css', 'src/views', 'node_modules']
	    },
	    'postcss-extend': null,
	    'precss': null,
	    'postcss-define-function': {
	    	// Remove unknown callFns and do not throw a error. Default is false.
	    	silent: false
	    },
	    'autoprefixer': null,
	    'postcss-csso': {
				comments: false,
				forceMediaMerge: false
			}
		}
	},
	rollup: { // js 编译选项
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
	},
	img: { // image 编译选项
		/**
		 * js 中使用图片白名单
		 * 原因：路径需要动态计算，编译阶段不可预知，需要通过白名单指定相关图片
  	 */
		white: []
	}
};