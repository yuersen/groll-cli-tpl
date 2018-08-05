const deve = require('./deve.conf.js');
const unit = require('./unit.conf.js');
const test = require('./test.conf.js');
const prod = require('./prod.conf.js');

/**
 * 构建配置
 * 开发环境 -> 单元测试环境 -> 测试环境 -> 生成环境
 * TOOD
 * 1.单元测试环境
 */
module.exports = {
	version: '',
	entry: ['index'],
	inline: { // 控制css/js以style和script标签形式存在
		style: true,
		script: false
	},
	deve,
	unit,
	test,
	prod
};