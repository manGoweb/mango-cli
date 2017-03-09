mango-cli [![CircleCI](https://circleci.com/gh/manGoweb/mango-cli/tree/master.svg?style=svg)](https://circleci.com/gh/manGoweb/mango-cli/tree/master) [![Build Status](https://travis-ci.org/manGoweb/mango-cli.svg?branch=master)](https://travis-ci.org/manGoweb/mango-cli) [![Build status](https://ci.appveyor.com/api/projects/status/vwqy0au8l17xlmt9/branch/master?svg=true)](https://ci.appveyor.com/project/enzy/mango-cli/branch/master) [![NPM downloads](https://img.shields.io/npm/dm/mango-cli.svg)](https://www.npmjs.com/package/mango-cli)
=========

[mangoweb.github.io/mango](http://mangoweb.github.io/mango)

Scaffold and build your projects way more faster than before. Preconfigured frontend devstack to the absolute perfection. Fully automated to save your precious time. Ready for any type of web project.

**A little example project** is here: [manGoweb/mango-cli-example](https://github.com/mangoweb/mango-cli-example).

If you already have `mango-cli` you can init the example project simply by `mango init [your-directory]`

## Under the hood

<table>
<tr><th colspan=2 align=left>Styles</th></tr>
<tr><td><a href="http://learnboost.github.io/stylus">Stylus</a></td><td>expressive, robust, feature-rich CSS preprocessor</td></tr>
<tr><td><a href="https://github.com/sass/libsass">Sass</a></td><td>CSS with superpowers</td></tr>
<tr><td><a href="http://lesscss.org">Less</a></td><td>the dynamic stylesheet language</td></tr>
<tr><td><a href="https://github.com/postcss/autoprefixer">Autoprefixer </a></td><td>vendor prefixes based on the real usage</td></tr>
<tr><td><a href="https://github.com/jakubpawlowicz/clean-css">Clean-CSS</a></td><td>Fast and efficient CSS minifier</td></tr>

<tr><th colspan=2 align=left>Templates</th></tr>
<tr><td><a href="http://jade-lang.com">Jade</a></td><td>robust, elegant and feature rich template engine</td></tr>

<tr><th colspan=2 align=left>Scripts</th></tr>
<tr><td><a href="https://babeljs.io/">Babel</a></td><td>Use next generation JavaScript today</td></tr>
<tr><td><a href="http://facebook.github.io/react">React</a></td><td>JavaScript library for building user interfaces from Facebook</td></tr>
<tr><td><a href="http://coffeescript.org">CoffeeScript</a></td><td>little language that compiles into JavaScript</td></tr>
<tr><td><a href="https://github.com/medikoo/modules-webmake">Webmake</a></td><td>JavaScript bundling with require() in the browser</td></tr>
<tr><td><a href="http://lisperator.net/uglifyjs">UglifyJS</a></td><td>JavaScript minifier</td></tr>

<tr><th colspan=2 align=left>Tools</th></tr>
<tr><td><a href="http://www.browsersync.io">BrowserSync</a></td><td>Time-saving synchronised browser testing</td></tr>
<tr><td><a href="https://www.npmjs.org">NPM</a></td><td>Node.js package manager</td></tr>
<tr><td><a href="http://gulpjs.com/">Gulp</a></td><td>Automated build tasks</td></tr>
<tr><td><a href="https://github.com/imagemin/imagemin">Imagemin</a></td><td>Seamless image minification</td></tr>
<tr><td><a href="https://github.com/floridoo/gulp-sourcemaps">Sourcemaps</a></td><td>debug like a pro</td></tr>
</table>

## Installation

Install mango-cli once from `npm` and use it everywhere:

```sh
npm install -g mango-cli
```

Just a few requirements you already have: latest [Node.js](http://nodejs.org) and [Git](http://git-scm.com) executable in `PATH`.

If you are running __Windows__, there are even some more [special requirements because of node-gyp](https://github.com/TooTallNate/node-gyp).<br>On __OS X__ you can come across a problem with missing vips library. Install it with `brew install homebrew/science/vips --with-webp --with-graphicsmagick` first and then continue.

If you're having problems with the installation, check out prepared [release packages](https://github.com/manGoweb/mango-cli/releases). Extract them locally and run `npm link` in the `mango-cli` folder.

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
* `-s, --source [git_repository]` - git repository with a template to fork. Default is currently the [Frontbase](http://frontbase.org)


### Managing project dependencies

```sh
mango install [packages...]
```

Installs packages from NPM and stores them in `node_modules` folder, from where you can `require` them (thanks to browserify).
Maintain current list in the `mango.yaml` config file under the `dependencies` section.


### Project build

Assuming the config file `mango.yaml` is present in a current directory and contains:

```yaml
styles:
  - styles/screen.styl
scripts:
  - scripts/index.js
images:
  - images/**/*.{jpg,png,svg}
templates:
  - templates/**/*.jade
static:
  - fonts/**
dependencies:
  - jquery
watch:
  - app/**
dist_folder: dist
```

Config file can be also in `mango.json` file and parsed as a JSON file.


#### Production build

```sh
mango build [tasks...]
```

All assets are compiled and minified into `dist_folder`, ready for production use.
In case of server compilation try a stripped down [mango-cli-core](https://github.com/manGoweb/mango-cli-core) package instead.

Options:
* `[tasks...]` - run only specified tasks as `styles`, `scripts`, `images`, `templates`, `static`


#### Development mode

```sh
mango dev [http_proxy]
```

Starts BrowserSync server (or proxy server) and watch for assets change.


## Configuration

More in [Configuration options](docs/config.md) docs...

## Copyright

Copyright 2016-2017 [manGoweb s.r.o.](https://www.mangoweb.cz) Code released under [the MIT license](LICENSE). Evolved from [Frontbase](http://frontbase.org) devstack.
