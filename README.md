mango-cli
=========

Project scaffolding and build tool to accelerate development


## Requirements

* Node.js
* Git executable in PATH


## Installation

Install mango-cli straight from `npm` with:

```sh
npm install -g mango-cli
```


## Usage


### Project initialization

```sh
mango init --source [git_repo] [path_to] [project_name]
```

\- forks a repository to given folder


### Managing project dependencies


```sh
mango install [packages...]
```


### Project build

Assuming a config file `.mango` is present in a current directory and contains:

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
		'img/**/*.jpg',
		'img/**/*.png',
		'img/**/*.svg'
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

