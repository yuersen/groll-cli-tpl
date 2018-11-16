/**
 * @file 存储需要缓存的数据
 * @author pxyamos
 */
const merge = require('merge');
const config = require('../config');

// 存储所有的配置信息
let configCached = config;
module.exports.setConfig = function (config) {
  merge(configCached, config || {});
};

module.exports.getConfig = function () {
  return configCached[process.env.NODE_ENV];
};

module.exports.getVersion = function () {
  return configCached.version;
};

module.exports.getEntry = function () {
  return configCached.entry;
};