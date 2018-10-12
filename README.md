# Groll-cli

`groll-cli` 是一种命令行接口脚手架工具，实现自动化开发流程，它可以创建项目、添加文件以及执行一大堆开发任务，比如测试、打包和发布。

使用 `groll-cli` 创建的新项目，使用 `npm scripts` 对项目进行构建。使用的核心 `npm` 包如下：

- [html-minifier](https://www.npmjs.com/package/html-minifier): 一个高度可配置的、经过良好测试的、基于javascript的HTML缩小器。
- [less](https://www.npmjs.com/package/less): Less 是一门 CSS 预处理语言，它扩展了 CSS 语言，增加了变量、Mixin、函数等特性，使 CSS 更易维护和扩展。
- [clean-css](https://www.npmjs.com/package/clean-css): 快速高效的 css 压缩工具；
- [imagemin](https://www.npmjs.com/package/imagemin): 支持 PNG、 JPEG、 GIF 和 SVG 图片压缩。
- [rollup](https://rollupjs.cn/): 对静态资源进行打包处理。 rollup 是一个 JavaScript 模块打包器，可以将小块代码编译成大块复杂的代码。
- [chokidar](https://www.npmjs.com/package/chokidar): 基于node.JS的监听文件夹改变模块。
- [browser-sync](http://www.browsersync.cn/): Browsersync 能让浏览器实时、快速响应您的文件更改（html、js、css、sass、less等）并自动刷新页面。更重要的是 Browsersync 可以同时在PC、平板、手机等设备下进项调试。

## 安装

在开始之前，请确保安装了 Node.js 的最新版本。 Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行环境。Node.js 使用了一个事件驱动、非阻塞式 I/O 的模型，使其轻量又高效。 使用 Node.js 最新的长期支持版本(LTS - Long Term Support)，是理想的起步。使用旧版本，你可能遇到各种问题，建议使用版本 > 6.9.5。

以下的 NPM 安装方式，将使 `groll-cli` 在全局环境下可用，考虑到部分依赖资源，国外镜像下载比较慢，您可以将镜像切换到淘宝镜像地址。切换方式如下：

```
npm --registry=https://registry.npm.taobao.org
```

如果您已经切换镜像成功，那么执行如下命令全局安装 `groll-cli`。

```
npm install --global/-g git+https://github.com/pxy0809/groll-cli.git
```

同时也可以通过 npm 私服安装：

```
# 切换镜像
npm set registry http://npm.flyui.cn
# 安装
npm install -g groll-cli
```

安装完成，命令行输入:

```
groll-cli
```

输出：

```
Usage: groll-cli <command>
 Options:
  -V, --version output the version number
  -h, --help  output usage information
 Commands:
  init|i   Generate a new project by template.
```
## 起步

### 创建项目

如果您已经成功安装 `groll-cli`，那么您可以通过如下命令创建一个新的项目：

```
groll-cli init
? Please enter the project name (project)
? Please enter a brief introduction to the project (A project that created by groll-cli)
? Please enter the creation author (admin)
? Please enter the project version (1.0.0)
```

执行该命令后，需要手动输入新创建的项目信息，如果您觉得比较麻烦，可以使用 `Enter` 键，使用提供的默认值。创建项目完成后，会在控制台输出如下信息。

```
^.^ Generated project success. please use [npm install] to install dependency.
```

### 安装依赖

项目创建成功后，我们需要手动的安装一些运行依赖包资源。 安装过程很简单，在项目根目录，执行如下命令即可：

```
npm install
```

### NPM 脚本

新创建的项目，使用 CLI 脚本进行构建，开发环境运行如下命令：

```
npm run dev
```

该命令会自动构建项目，解析依赖模块，将待构建的文件输出到 `dist/version` 文件夹下，并创建本地的 web 容易，方便预览和调试。打开浏览器并访问 `http://localhost:8090`，就可以看到应用正常运行。

生产环境运行如下命令：

```
npm run build
```

该命令用于部署时，将静态资源构建压缩输出到 `dist/version` 文件夹下。

## 工程结构

`groll-cli` 脚手架工具就是为我们搭建了开发所需要的环境，开发者只需要在生成的项目结构的基础上进行开发即可，非常简单。为了高效的使用 `groll-cli`, 首先熟悉使用 `groll-cli` 脚手架生成的项目结构。

```
project
|- build
|- config
|- dist
|- src	
|- .babelrc
|- .editorconfig
|- .gitignore
|- package.json
|_ README.md
```

### build 文件夹

该文件夹存放所有构建的脚本。整体构建思路如下：从指定入口 HTML 文件，扫描依赖的静态资源（图片、样式和脚本），并针对三者进行构建。也就是说，没有在入口文件中使用的静态资源，不在构建范围内，从而提升构建速度。

```
build
|- base.js
|- css.js
|- dest.js
|- font.js
|- html.js
|- img.js
|- index.js
|- rollup.js
|- server.js
|- storage.js
|_ utils.js
```

- `base.js`

存储对 html / css / js 构建的相关配置。可根据项目实际情况进行扩展。

- `css.js`

使用 `less` 对当前指定的 `css` 文件进行编译处理、压缩、输出到 `dist/version/css` 文件中。

- `dest.js`

目存储操作路径信息，例如：构建 html、css、js 的路径信息。

- `font.js`

对字体进行复制、添加 MD5 后缀处理。

- `html.js`

根据用户命令行输入（`npm run dev -- xx/index`）或取配置文件（`config/index.js`）`entry` 选项获取打包入口 html 文件。对入口 html 文件进行扫描，收集所有 `link`、`script`、`img`标签引入的静态资源，调用 `storage.js` 相关的方法存储相关数据，供编译 `css`、`img` 和 `js` 使用。同时根据构建环境，对 html 文件进行压缩处理，将处理后的文件输出到 `dist/version` 目录。

- `img.js`

对图片资源进行复制、添加 MD5 后缀、压缩等处理。输出图片资源到 `dist/version/img` 构建目录。

- `index.js`

打包构建入口文件，对用户命令行输入做相应处理，加载组织 html、css、js、img 和 font 模块，调用相关编译处理方法。

- `rollup.js`

使用 rollup 模块打包器对 js 进行打包，将符合 ES 规范的小块代码编译成大块复杂的代码。支持加载 Commonjs 规范的第三方公用库。根据构建环境，对打包过后的 js 进行压缩等处理，输出相应文件到 `dist/version/js` 构建目录。

- `server.js`

使用 Browsersync 构建 web 服务，同时设置相关开发环境的服务代理。Browsersync 能让浏览器实时、快速响应您的文件更改（html、js、css、sass、less等）并自动刷新页面。更重要的是 Browsersync 可以同时在PC、平板、手机等设备下进项调试。

- `storage.js`

数据缓存桥，存储 html、css、js、img 和 font 信息，并在不同阶段的构建，实时更新相关模块的信息。

- `utils.js`

提供基础的操作工具函数，例如：情况构建文件夹，计算路径配置等。

### config 文件夹

存储开发环境、单元测试环境、测试环境和部署环境配置信息。

```
config
|_ index.js
```

- `version` 当前构建版本，构建目录会根据构建版本号创建不同的文件，如果不希望使用版本号，可以置空。
- `entry` 构建页面入口（构建以页面为单位），必选项。可以以列表的方式列出每次构建的文件，也可以通过 glob 规则指定文件。通过命令行指定的优先级高于 `entry` 指定的入口文件。例如：
	- `['index', 'home']`: 构建 `views` 下的 index.html 和 home.html 文件。
	- `[*]`: 构建 `views` 下的所有的 html 文件。
	- `[index/*]`: 构建 `views/index` 下的所有的 html 文件。
	- `[**/*]`: 构建 `views` 下的所有文件夹下的所有 html 文件。
	- `[!index/*]`: 不构建 `views/index` 下的所有 html 文件。
- `inline` 是否以内嵌(使用 style 和 script 标签将 css 和 js 直接写入到页面，提升页面渲染时间)的方式对引入的 css 和 js 进行处理。默认 css 使用内嵌方式。
- `development`: 开发环境配置。具体选项如下：
	- `assetsPublicPath`: 引入的静态资源的根路径；
	- `useEslint`: 是否启用 eslint 对构建代码进行检测，默认 `true`；
	- `host`: 指定开发环境构建 web 服务 host，默认 `'localhost'`;
	- `port`: 指定开发环境构建 web 服务 port，默认 `8090`;
	- `open`: 指定开发环境构建服务器启动时自动打开的网址，默认 `true`;
	- `proxyTable`: 代理现有的服务相关配置;
		- `target`: 被代理到的主机地址；
		- `changeOrigin`：默认 true ，是否需要改变原始主机头为目标 URL；
		- `pathRewrite`：重写请求，比如: `api/old-path`，那么请求会被解析为 `/api/new-path` 。
- `unit`: 单元测试环境配置。暂未集成。
- `test`: 测试环境相关配置。具体选项如下：
	- `assetsPublicPath`: 引入的静态资源的根路径；
	- `useEslint`: 是否启用 eslint 对构建代码进行检测，默认 `true`；
	- `host`: 指定开发环境构建 web 服务 host，默认 `'localhost'`;
	- `port`: 指定开发环境构建 web 服务 port，默认 `8090`;
	- `open`: 指定开发环境构建服务器启动时自动打开的网址，默认 `true`;
	- `proxyTable`: 代理现有的服务相关配置;
		- `target`: 被代理到的主机地址；
		- `changeOrigin`：默认 true ，是否需要改变原始主机头为目标 URL；
		- `pathRewrite`：重写请求，比如: `api/old-path`，那么请求会被解析为 `/api/new-path` 。
- `production`: 生产环境相关配置。具体选项如下：
	- `assetsPublicPath`: 引入的静态资源的根路径；
	- `useEslint`: 是否启用 eslint 对构建代码进行检测，默认 `true`；
	- `host`: 指定开发环境构建 web 服务 host，默认 `'localhost'`;
	- `port`: 指定开发环境构建 web 服务 port，默认 `8090`;
	- `open`: 指定开发环境构建服务器启动时自动打开的网址，默认 `true`;
	- `proxyTable`: 代理现有的服务相关配置;
		- `target`: 被代理到的主机地址；
		- `changeOrigin`：默认 true ，是否需要改变原始主机头为目标 URL；
		- `pathRewrite`：重写请求，比如: `api/old-path`，那么请求会被解析为 `/api/new-path` 。

### dist 文件夹

存储以版本号进行管理，经过一系列编译处理（资源压缩、MD5化等）的静态资源。

```
dist
|- 1.0.0
|- 1.0.1
 |- css
  |- reset-594dcdwd46.css
  |- index-iou8902ndf.css
 |- font
  |- fontawesome-webfont.ttf
 |- img
  |- logo-aedfjsdk2sd.png
 |- js
  |- index-89fdjduejnd.js
  |- vue.min.js
 |_ index.html
|_ 1.x.x
```

注意，构建目录和开发源码目录不一样，所有资源均归类到一级文件夹下。

### src 文件夹

存储未作任何处理的静态资源，是开发者组织静态资源、编写核心业务逻辑的地方。

```
src	
|- assets
 |- img
 |- css
 |- font
 |_ lib
|- components
 |_ helloworld
  |- helloworld.html
  |- helloworld.css
  |_ helloworld.js
|- mock
|_ views
 |- img
  |_ idx-icon.png
 |- index.html
 |- index.js
 |_ index.css
```

- `assets 文件夹` 该文件夹存储模块化和第三方资源。
	- `img` 存储跨页面或模块使用的公用图片，图片格式不限，在 css 或者 html 中可以通过相对路径的方式引用，构建工具会自动解析路径。
	- `css` 存储跨页面或模块使用的 css, 如果第三方资源，不以 URL 的方式引入，也存储在该文件夹下，在 html 中可以通过相对路径的方式引用。
	- `font` 存储跨字体文件,在 css 中可以通过相对路径的方式引用。
	- `lib` 存储第三方公用js库或者框架,在 html 中可以通过相对路径的方式引用。
- `components 文件夹` 存储模块化资源，模块化规范严格遵循 ES 规范，即使用 export 对外输出本模块变量的接口，使用 import 导入一个模块 export 接口。
- `mock 文件夹` 存储 mock 接口文件，约定采用 json 格式的文件，在 js 中可以直接通过 import data from 'xx.json' 方式使用。
- `views 文件夹` 存储页面文件，如果页面较多，建议使用文件夹的方式进行组织，例如：`view/user/user.html`、`view/user/list.html`。以页面为单位组织静态资源，即该页面特有的样式、脚本和图片资源，以就近原则，存储在该页面周围，方便后续的插拔扩展。
	- `html 文件` 严格使用 HTML5 标准声明。
	- `js 文件` js 遵循 ES 规范，对于第三方资源，尽可能使用 NPM 或者 CDN 方式使用。对于 Commonjs 规范的包，可以直接按照规范使用，底层做兼容处理。
	- `css 文件` css 通过 postcss 处理，支持 sass 语法规则，如果你对主流 css 预处理器 less/sass/stylus 中任意一种熟悉的话，可以零成本快速开发。

### 其他文件

- `.babelrc` Babel转换器配置文件，能让我们可以在项目中使用ES6/7来编写代码。
- `.eslintrc` ES6校验配置文件，Lint功能可以帮你保持代码风格的统一。
- `package.json` npm配置文件，其中列出了项目使用到的第三方依赖包。 你还可以在这里添加自己的自定义脚本。
<<<<<<< HEAD

## Demo

### html 文件

在 `scr/views` 文件夹下使用 HTML5 标准头进行创建 html 文件（如果需要组织多个 html 文件，可以用文件夹进行组织）。

使用相对路径引入依赖的 css 和 js 入口文件。如果需要使用或者依赖第三方资源，直接按照彼此之间的依赖关系，使用 `link` 或者 `script` 标签直接引入。

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<meta name="HandheldFriendly" content="true">
  <title>index</title>
  <link rel="stylesheet" href="https://yarnpkg.com/en/package/normalize.css">
  <link rel="stylesheet" href="./index.css">
</head>

<body>
	<div id="app" class="app">
		<img v-bind:src="logo" alt="logo">
		<hello-groll></hello-groll>
	</div>

	<script src="https://cdn.bootcss.com/vue/2.5.16/vue.min.js"></script>
	<script src="./index.js"></script>
</body>
</html>
```

### css 文件

css 文件内部可以直接使用 less 语法，编译阶段自动使用 less 解析器进行解析，并输出到指定目录下。 如果依赖其他模块，可直接使用 `@import xx.less` 或者 `@import (less) xx.css` 进行引入，具体请参考 [less 官网](http://lesscss.cn/)。

```css
.app {
	h2 {
		color: #6cf;
	}
}
```

### js 文件

js 文件支持 ES6 规范，即使用 `import` 和 `export` 导入和导出模块。同时也支持导入非 js 文件，例如：css 和 html 文件，这在封装组件时，非常有用。

- `index.js`

```js
import Vue from 'vue';
import HelloGroll './hello-groll.js';

new Vue({
	el: '#app',
	components: {
		HelloGroll
	},
	data: {
		logo: './img/logo.png'
	}
});
```

- `hello-groll.js`

```js
import Vue from 'vue';
import tpl from './hello-groll.html';
import './hello-groll.css';

export default Vue.component('hello-groll', {
	template: tpl,
	data() {
		return {
			greet: 'First experience of Groll'
		};
	}
});
```

- `hello-groll.html`

```html
<div class="hello-groll">
	<h2 v-text="greet"></h2>
</div>
```

- `hello-groll.css`

```css
.hello-groll {
	h2 {
		color: #666;
	}
}
```

注意：

- 在 js 动态设置图片路径，因需要运行阶段才能获得真实的路径，编译阶段无法处理，可以通过特殊标记 `<# {path: img/path, alias: xx.png} #>` 进行预先声明。编译阶段，根据此标记，获取图片信息，进行压缩等处理。书写标记的过程中，必须保证 `alias` 的唯一性，因为所有图片都是编译输出到同一层级的文件夹下，如果存在同名文件的会出现覆盖问题。

### 编译预览

编译阶段，需要指定入口文件，两种方式：

1. 在 `config/index.js` 文件的 `entry` 选项配置入口文件，例如: `index`，编译工具自动到 `src/views` 下去匹配对应的文件。
2. 通过命令行指定入口，例如： `npm run dev -- index`。

编译阶段需要使用一些配置文件进行环境的构建，两种方式：

1. 在 `config/index.js` 文件的相关环境选项配置数据。
2. 通过命令行 `--config` 指定配置文件，例如： `npm run dev -- index --config src/views/config.js`，如果没有指定，则使用默认的配置（`config/index.js`）。

## 更新历史

- 2018/08/21
	- 扫描html 文件忽略 img 标签值为 `data:xxx`。
	- 支持通过 `script` 标签引入本地资源，编译阶段合并压缩，输出 `bundle-md5-hash.js`。
- 2018/08/22
	- 对 src 目录下的 less 文件进行监听，并在改变后调用浏览器自动刷新
	- 使用 autoprefixer + postcss 对 css 进行兼容前缀添加
- 2018/08/24
	- 解决 uglifyjs 导致无法正常生成 sourcemap
- 2018/09/10
	- 新增构建钩子 hook.js ，编译阶段执行
	- 新增静态资源(js/css/img/font)目录支持，默认 `static`
- 2018/10/10
	- 优化HTML文件过大（>=64KB），分布读取解析