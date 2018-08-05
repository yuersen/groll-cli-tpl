/**
 * 开发环境配置
 */
module.exports = {
	assetsPublicPath: './',
	useEslint: true,
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
};