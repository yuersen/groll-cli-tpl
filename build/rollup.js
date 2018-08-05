const gulp = require('gulp');
const path = require('path');
const through2 = require('through2');
const plumber = require('gulp-plumber');
const rollupEach = require('gulp-rollup-each');
const flatten = require('gulp-flatten'); // 移除多余的路径
const rev = require('gulp-rev'); // 添加版本号
const revCollector = require('gulp-rev-collector');
const gulpif = require('gulp-if');
const uglify = require('gulp-uglify');
const rollup = require('rollup'); // rollup and plugin
const babel = require('rollup-plugin-babel');
const eslint = require('rollup-plugin-eslint').eslint;
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const json = require('rollup-plugin-json');
const posthtml = require('rollup-plugin-posthtml-template');
const includePaths = require('rollup-plugin-includepaths');
const postcss = require('rollup-plugin-postcss');
const postcssCopy = require('postcss-copy'); // postcss
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const precss = require('precss');
const atImport = require("postcss-import")
const include = require('posthtml-include');
const postExtend = require('postcss-extend');
const utils = require('./utils.js'); // config
const entry = require('./html.js');
const conf = require('../config');

let useEslint = conf.deve.useEslint;

/**
 * 使用 rollup 构建 js
 */
gulp.task('compile:js', () => {
  return gulp.src(entry.compiledJs)
    .pipe(plumber())
    .pipe(
      rollupEach({ // inputOptions
        // 排除的文件
        external: ['vue'],
        // 使用的插件列表
        plugins: [
          includePaths({ // 处理相对路径
            include: {},
            paths: ['src/views', 'src/components', 'src/mock', 'node_modules'],
          }),
          posthtml({ // post html
            plugins: [include()]
          }),
          postcss({ // post CSS
            plugins: [
              atImport({
                path: ['src/assets/css']
              }),
              postcssCopy({ // 拷贝 css 中的图片到指定文件夹
                basePath: ['src'],
                dest: utils.destBasePath,
                template(fileMeta) {
                  return 'img/' + fileMeta.name + fileMeta.hash.substr(8) + '.' + fileMeta.ext;
                }
              }),
              postExtend(),
              precss(),
              autoprefixer(),
              cssnano()
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
            exclude: 'node_modules/**'
          }),
          (useEslint && eslint({
            include: 'src/**/*.js',
            exclude: [
              'node_modules/**'
            ]
          }))
        ]
      }, (file) => { // outputOptions
        return {
          format: 'iife',
          name: path.basename(file.path, '.js'),
          globals: {
            vue: 'Vue'
          }
        };
      }, rollup)
    )
    .pipe(rev())
		.pipe(flatten())
		.pipe(gulpif(utils.env !== 'deve', uglify()))
    .pipe(gulp.dest(utils.destJsPath))
    .pipe(rev.manifest('rev-js-manifest.json'))
    .pipe(gulp.dest(utils.revPath));
});

gulp.task('uncompile:js', () => {
  return gulp.src(entry.unCompiledJs)
    .pipe(flatten())
    .pipe(gulp.dest(utils.destJsPath));
});

gulp.task('build:js', ['compile:js', 'uncompile:js']);