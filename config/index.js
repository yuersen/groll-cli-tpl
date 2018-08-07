/**
 * 构建配置
 * 开发环境 -> 单元测试环境 -> 测试环境 -> 生成环境
 * TOOD
 * 1.单元测试环境
 */
module.exports = {
	version: '1.0.0',
	entry: ['index'],
	inline: { // 控制css/js以style和script标签形式存在
		style: true,
		script: false
	},

	// 开发环境
	development: { 
		assetsPublicPath: './',
		useEslint: false,
		host: 'localhost',
		port: 8090,
		open: true, // 服务器启动时自动打开的网址
		proxyTable: {
			'/api': {
	      target: 'http://test.fiy.com',
	      changeOrigin: true,
	      pathRewrite: {
	        '^/api': ''
	      }
	    }
	  }
	},

	// 单元测试环境
	unit: { 

	},

	// 测试环境
	test: { 
		assetsPublicPath: './',
		proxyTable: {
			'/api': {
	      target: 'http://test.fiy.com',
	      changeOrigin: true,
	      pathRewrite: {
	        '^/api': ''
	      }
	    }
	  },
	  zip: false,
	  ftp: {
			enabled: false, // 启用？默认不启用
			host: '',
			post: '',
			user: 'admin',
			password: 'admin',
			parallel: 3 // 并行传输数，默认为 3
		}
	},

	// 生产环境
	production: { 
		assetsPublicPath: './',
		proxyTable: {
			'/api': {
	      target: 'http://test.fiy.com',
	      changeOrigin: true,
	      pathRewrite: {
	        '^/api': ''
	      }
	    }
	  },
	  zip: true,
	  ftp: {
			enabled: false, // 启用？默认不启用
			host: '',
			post: '',
			user: 'admin',
			password: 'admin',
			parallel: 3 // 并行传输数，默认为 3
		}
	}
};