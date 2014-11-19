mango-cli
=========

A project scaffolding and build tool to accelerate your development


## Installation

Install mango-cli straight from `npm` with:

```sh
npm install -g mango-cli
```


### Requirements

* Node.js
* Git executable in PATH



## Usage


### Project initialization

```sh
mango init --source [git_repo] [path_to] [project_name]
```

Forks a repository to folder. Default repo is currently [manGoweb/WordPress-boilerplate](https://github.com/manGoweb/WordPress-boilerplate)


### Managing project dependencies


```sh
mango install [packages...]
```

Maintain current dependencies in the `.mango` config file under the `dependencies` section.


### Project build

Assuming the config file `.mango` is present in a current directory and contains:

```js
#!/usr/bin/env node
module.exports = {

	styles: [
		'styles/screen.styl'
	],

	scripts: [
		'js/index.js'
	],

	images: [
		'img/**/*.{jpg,png,svg}'
	],

	dependencies: [
		'jquery'
	],

	dist_folder: 'dist'

}
```

Current support for:

* Stylus - expressive, robust, feature-rich CSS preprocessor
* CoffeeScript - little language that compiles into JavaScript
* React - JavaScript library for building user interfaces
* Browserify - Node.js modules in the browser
* NPM - Node.js package manager


#### Production build

```sh
mango build [tasks...]
```

All assets are compiled and minified into dist folder, ready for production use.


#### Develomned mode

```sh
mango dev [http_proxy]
```

Starts BrowserSync server (or proxy server) and watch for assets change.
