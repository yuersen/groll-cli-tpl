/**
 * 构建配置
 * 开发环境 -> 单元测试环境 -> 测试环境 -> 生成环境
 * TOOD
 * 1.单元测试环境
 */
module.exports = {
	version: '1.0.0',
	entry: ['index'],

	// 开发环境
	development: {
		assetsPublicPath: './',
		useEslint: false,
		host: 'localhost',
		port: 8090,
		open: true, // 服务器启动时自动打开的网址
		proxyTable: {
			'/test': {
	      target: 'http://test.fiy.com',
	      changeOrigin: true,
	      pathRewrite: {
	        '^/test': ''
	      }
	    },
	    '/apptest': { // 报告接口代理
	    	target: 'http://apptest.zhixue.com',
				changeOrigin: true,
				pathRewrite: {
				  '^/apptest': ''
				}
	    }
		},
		TEST_BASE_URL: '/test',
		APPTEST_BASE_URL: '/apptest'
	},

	// 单元测试环境
	unit: {

	},

	// 测试环境
	test: {
		assetsPublicPath: 'http://fiy.test.com/', //资源部署服务器地址
		proxyTable: {
			'/api': {
	      target: 'http://fiy.test.com',   // 若使用node部署，这是node 代理地址
	      changeOrigin: true,
	      pathRewrite: {
	        '^/api': ''
	      }
	    }
	  },
		TEST_BASE_URL: 'http://test.fiy.com',
		APPTEST_BASE_URL: 'http://apptest.fiy.com'
	},

	// 生产环境
	production: {
		assetsPublicPath: 'http://fiy.prod.com/',
		proxyTable: {
			'/api': {
	      target: 'http://fiy.prod.com',
	      changeOrigin: true,
	      pathRewrite: {
	        '^/api': ''
	      }
	    }
	  },
		TEST_BASE_URL: 'http://www.fiy.com',
		APPTEST_BASE_URL: 'http://app.fiy.com'
	}
};
