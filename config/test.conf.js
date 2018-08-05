/**
 * 测试环境配置
 */
module.exports = {
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
};