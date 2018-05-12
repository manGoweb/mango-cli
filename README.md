<p align="center"><img width="128" src="https://s3.eu-central-1.amazonaws.com/uploads.mangoweb.org/go-outline.svg"></p>

mango-cli [![CircleCI](https://circleci.com/gh/manGoweb/mango-cli/tree/master.svg?style=svg)](https://circleci.com/gh/manGoweb/mango-cli/tree/master) [![Build Status](https://travis-ci.org/manGoweb/mango-cli.svg?branch=master)](https://travis-ci.org/manGoweb/mango-cli) [![Build status](https://ci.appveyor.com/api/projects/status/vwqy0au8l17xlmt9/branch/master?svg=true)](https://ci.appveyor.com/project/enzy/mango-cli/branch/master) [![NPM downloads](https://img.shields.io/npm/dm/mango-cli.svg)](https://www.npmjs.com/package/mango-cli)
=========

Scaffold and build your projects way more faster than before. Preconfigured frontend devstack to the absolute perfection. Fully automated to save your precious time. Ready for any type of web project.

**A little example project** is here: [manGoweb/mango-cli-example](https://github.com/mangoweb/mango-cli-example).


- [Installation](#installation)
	- [Requirements](#requirements)
	- [Alternative methods](#alternative-methods)
- [Usage](#usage)
	- [Project scaffolding and initialization](#project-scaffolding-and-initialization)
	- [Managing project dependencies](#managing-project-dependencies)
	- [Project build](#project-build)
- [Configuration](docs/config.md)
- [FAQ](https://github.com/manGoweb/mango-cli/wiki/FAQ)

## Under the hood

<table>
<tr><th colspan=2 align=left>Styles</th></tr>
<tr><td><a href="http://learnboost.github.io/stylus">Stylus</a></td><td>expressive, robust, feature-rich CSS preprocessor</td></tr>
<tr><td><a href="https://github.com/sass/libsass">Sass</a></td><td>CSS with superpowers</td></tr>
<tr><td><a href="http://lesscss.org">Less</a></td><td>the dynamic stylesheet language</td></tr>
<tr><td><a href="https://github.com/postcss/autoprefixer">Autoprefixer </a></td><td>vendor prefixes based on the real usage</td></tr>
<tr><td><a href="https://github.com/jakubpawlowicz/clean-css">Clean-CSS</a></td><td>Fast and efficient CSS minifier</td></tr>

<tr><th colspan=2 align=left>Templates</th></tr>
<tr><td><a href="https://pugjs.org">Pug (Jade)</a></td><td>robust, elegant and feature rich template engine</td></tr>

<tr><th colspan=2 align=left>Scripts</th></tr>
<tr><td><a href="https://webpack.js.org">Webpack</a></td><td>Static module bundler for modern JavaScript applications</td></tr>
<tr><td><a href="https://babeljs.io/">Babel</a></td><td>Use next generation JavaScript today</td></tr>
<tr><td><a href="http://facebook.github.io/react">React</a></td><td>JavaScript library for building user interfaces from Facebook</td></tr>
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

### Requirements

Before installation check that your system has these requirements:

- [Node.js LTS (8.x)](https://nodejs.org/en/download/)
- [Git](http://git-scm.com) executable in `PATH`

#### Mac OS X

   * `python` (`v2.7` recommended, `v3.x.x` is __*not*__ supported) (already installed on Mac)
   * [Xcode](https://developer.apple.com/xcode/download/)
     * You also need to install the `Command Line Tools` via Xcode. You can find this under the menu `Xcode -> Preferences -> Downloads`
   * [libvips](https://jcupitt.github.io/libvips/) via Homebrew `brew install vips`

#### Windows

   * [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools) via `npm install -g --production windows-build-tools` (from an elevated PowerShell)
     * will install and configure *Python v2.7* and *Visual C++ Build Tools 2015* for you

#### Linux

   * `python` (`v2.7` recommended, `v3.x.x` is __*not*__ supported)
   * `make`
   * A proper C/C++ compiler toolchain, like [GCC](https://gcc.gnu.org)


### Alternative methods

#### Docker

We also provide a Docker image `mangoweb/mango-cli` which is available on the [Docker HUB](https://hub.docker.com/r/mangoweb/mango-cli/)

#### Pre-packed archives

If you're still having problems with the installation, check out prepared [release packages](https://github.com/manGoweb/mango-cli/releases).

Extract them locally and run `npm link` in the `mango-cli` folder (on Mac OS X you still need the `libvips` dependency though).


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
* `-s, --source [git_repository]` - git repository with a template to fork. Default is currently the [mango-cli-example](https://github.com/manGoweb/mango-cli-example)


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
  - templates/**/*.pug
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

Options:
* `[tasks...]` - run only specified tasks as `styles`, `scripts`, `images`, `templates`, `static`


#### Development mode

```sh
mango dev [http_proxy]
```

Starts BrowserSync server (or proxy server) and fs watch for assets change.


## Configuration

More in [Configuration options](docs/config.md) docs...


## FAQ

More in [the Wiki page...](https://github.com/manGoweb/mango-cli/wiki/FAQ)


## Copyright

Copyright 2016-2018 [manGoweb s.r.o.](https://www.mangoweb.cz) Code released under [the MIT license](LICENSE). Evolved from [Frontbase](http://frontbase.org) devstack.
