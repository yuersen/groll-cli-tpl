const path = require('path');
const rollupEach = require('gulp-rollup-each');
const uglify = require('gulp-uglify');
const rollup = require('rollup'); // rollup and plugin
const babel = require('rollup-plugin-babel');
const eslint = require('rollup-plugin-eslint').eslint;
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const json = require('rollup-plugin-json');
const postcss = require('rollup-plugin-postcss');
const replace = require('rollup-plugin-re');

const utils = require('./utils.js'); // config
const conf = require('../config');

const gulp = utils.publicDeps.gulp;
const through2 = utils.publicDeps.through2;
const plumber = utils.publicDeps.plumber;
const flatten = utils.publicDeps.flatten; // 移除多余的路径
const rev = utils.publicDeps.rev; // 添加版本号
const revCollector = utils.publicDeps.revCollector;
const gulpif = utils.publicDeps.gulpif;

let useEslint = conf.development.useEslint;
let imgExp = /["'][^(http(s)?)]([^"']*)\.(png|jpg|jpeg|gif)["']/gi;

/**
 * 使用 rollup 构建 js
 */
module.exports.build = function() {
  console.log('[CFT] Compiling js file.');
  return gulp.src(utils.entry.compiledjs)
    .pipe(plumber())
    .pipe(
      rollupEach({ // inputOptions
        // 排除的文件
        external: conf.rollup.external,
        // 使用的插件列表
        plugins: [
          require('rollup-plugin-includepaths')({ // 处理相对路径
            include: {},
            paths: ['../src/views', '../src/components', '../src/mock', '../node_modules'],
          }),
          // 处理 js 定义的 image 路径
          replace({
            patterns: [{
              transform: function(code, filepath) {
                if (imgExp.test(code)) {
                  return code.replace(imgExp, (match, capture) => {
                    let matched = match.replace(/'|"/g, '');
                      name = path.basename(matched);

                    utils.entry.img.push(path.resolve(path.dirname(filepath), matched));
                    return `'img/${name}'`;
                  });
                }
              }
            }]
          }),
          require('rollup-plugin-string')({
            include: '../src/**/*.html'
          }),
          postcss({ // post CSS
            plugins: [
              require("postcss-import")({
                path: ['../src/assets/css', '../src/views']
              }),
              require('postcss-copy')({ // 拷贝 css 中的图片到指定文件夹
                basePath: ['../src'],
                dest: utils.dest.base,
                template(fileMeta) {
                  return 'img/' + fileMeta.name + fileMeta.hash.substr(8) + '.' + fileMeta.ext;
                }
              }),
              require('postcss-extend')(),
              require('precss')(),
              require('autoprefixer')(),
              require('postcss-csso')()
            ],
            extensions: ['.css']
          }),
          json(),
          resolve({ // commonjs
            jsnext: true,
            main: true,
            browser: true
          }),
          commonjs(), // support commonjs
          babel({ // babel
            exclude: '../node_modules/**'
          }),
          (useEslint && eslint({
            include: '../src/**/*.js',
            exclude: [
              '../node_modules/**'
            ]
          }))
        ]
      }, (file) => { // outputOptions
        return {
          format: 'iife',
          name: path.basename(file.path, '.js'),
          globals: conf.rollup.globals
        };
      }, rollup)
    )
    .pipe(rev())
		.pipe(flatten())
		.pipe(gulpif(utils.env !== 'development', uglify()))
    .pipe(gulp.dest(utils.dest.js))
    .pipe(rev.manifest('rev-js-manifest.json'))
    .pipe(gulp.dest(utils.dest.rev));
};

module.exports.unbuild = function() {
  return gulp.src(utils.entry.uncompiledjs)
    .pipe(flatten())
    .pipe(gulp.dest(utils.dest.js));
};

module.exports.rev = function() {
  return gulp.src([
      utils.dest.rev + 'rev-img-manifest.json',
      utils.dest.js + '*.js'
    ])
    .pipe(revCollector())
    .pipe(gulp.dest(utils.dest.js));
};