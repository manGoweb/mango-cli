mango-cli [![Build Status](https://travis-ci.org/manGoweb/mango-cli.svg)](https://travis-ci.org/manGoweb/mango-cli)
=========

Scaffold and build your projects way more faster than before. Preconfigured frontend devstack to the absolute perfection. Fully automated to save your precious time. Ready for any type of web project.

## Under the hood

* [Stylus](http://learnboost.github.io/stylus) - expressive, robust, feature-rich CSS preprocessor
* [Jade](http://jade-lang.com) - robust, elegant and feature rich template engine
* [React](http://facebook.github.io/react) - JavaScript library for building user interfaces from Facebook
* [CoffeeScript](http://coffeescript.org) - little language that compiles into JavaScript
* [Browserify](http://browserify.org) - JavaScript bundling with require() in the browser
* [BrowserSync](http://www.browsersync.io) - Time-saving synchronised browser testing
* [NPM](https://www.npmjs.org) - Node.js package manager
* [Gulp](http://gulpjs.com/) - Automated build tasks
* [UglifyJS](http://lisperator.net/uglifyjs) - JavaScript minifier
* [Clean-CSS](https://github.com/jakubpawlowicz/clean-css) - Fast and efficient CSS minifier
* [Imagemin](https://github.com/imagemin/imagemin) - Seamless image minification
* [Sourcemaps](https://github.com/floridoo/gulp-sourcemaps) - debug like a pro


## Installation

Install mango-cli once from `npm` and use it everywhere:

```sh
npm install -g mango-cli
```

Just a few requirements you already have: [Node.js](http://nodejs.org) and [Git](http://git-scm.com) executable in PATH


## Usage

* `mango init` - scaffolding and initialization
* `mango install` - dependency installation
* `mango build` - production build
* `mango dev` - development mode

Feel free to use `mango [command] -h` for detailed instructions


### Project scaffolding and initialization

```sh
mango init [options] [directory]
```

Forks a template into folder.

Options:
* `-s, --source [git_repository]` - Template git repository to fork. Default repo is currently [manGoweb/WordPress-boilerplate](https://github.com/manGoweb/WordPress-boilerplate)


### Managing project dependencies

```sh
mango install [packages...]
```

Installs packages from NPM and stores them in `node_modules` folder, from where you can `require` them (thanks to browserify).
Maintain current list in the `mango.json` config file under the `dependencies` section.


### Project build

Assuming the config file `mango.json` is present in a current directory and contains:

```json
{
	"styles": [
		"styles/screen.styl"
	],
	"scripts": [
		"scripts/index.js"
	],
	"images": [
		"img/**/*.{jpg,png,svg}"
	],
	"templates": [
		"templates/**/*.jade",
	],
	"dependencies": [
		"jquery"
	],
	"watch": [
		"app/**"
	],
	"dist_folder": "dist"
}
```


#### Production build

```sh
mango build [tasks...]
```

All assets are compiled and minified into `dist_folder`, ready for production use.

Options:
* `[tasks...]` - run only specified tasks as `styles`, `scripts`, `images`, `templates`


#### Development mode

```sh
mango dev [http_proxy]
```

Starts BrowserSync server (or proxy server) and watch for assets change.



## Copyright

Copyright 2014 by [manGoweb s.r.o.](http://www.mangoweb.cz) Code released under [the MIT license](LICENSE). Evolved from [Frontbase](http://frontbase.org) devstack.
