# Configuration options

This document describes all available configuration options of mango.json file.

## Source and destination

* `src_folder` - a folder with all source files. Content of this folder is watched in dev mode for changes. This path is filtered from destination path.
* **`dist_folder`** - build destination folder. The only one required option.

## Tasks

All fields are array of filepath masks, relative from the mango.json file.

* `styles` - stylesheets. Can be CSS, LESS, SASS, Stylus
* `scripts` - javascript. Files are treated as CommonJS modules which don't leak to global namespace. String `DEBUG` is replaced with true/false based on dev/build task.
* `images` - image resources. Images are minified in dist build, but just copied in dev mode.
* `static` - static resources. Static files are copied to dist folder.
* `templates` - templates. Static HTML files or Jade templates.

## Dependecies

* `dependencies` - an array of [NPM packages](https://www.npmjs.com). They are installed into `node_modules` folder with `mango install` command. Then they are available in scripts as `require('module')` calls.
* `version` - semver string with required mango-cli version. Like `>=0.18`

## Data

* `data` - object containing data supplied to templates in build time.

Format: `"globalname": "any variable type OR filepath to JSON file"`

## Hooks

* `hooks` - object with additional commands you need to run before/after certain actions

Format: `"hookname": "command line command"`<br>
Available hooks: `init`, `preinstall`, `install`, `prebuild`, `build`, `predev`, `dev`, `watch`


## Experimental options

### Local config

All options can be overridden in `mango.local.json` file. Handy for development and deployment.

---

### BrowserSync

* `browsersync` - options passed to [BrowserSync](http://www.browsersync.io/docs/options/) dev server
* `proxy` - start dev server in [proxy mode](http://www.browsersync.io/docs/options/#option-proxy)
* `watch` - additional files to watch resulting in browser reload

---

### Styles

* `autoprefixer` - options passed to CSS [Autoprefixer](https://github.com/postcss/autoprefixer-core#usage)
* `cssmin` - options passed to [clean-css](https://github.com/jakubpawlowicz/clean-css#how-to-use-clean-css-programmatically) in build task.

---

### Scripts

* `uglify` - options passed to UglifyJS in build task.

---

### Patternlab

* `patternlab` - our fork of [patternlab-node](https://github.com/manGoweb/patternlab-node)

Format:
```json
"patterns": {
  "source": "patterns",
  "public": "dist",
  "data": "data/data.json",
  "listitems": "data/listitems.json"
},
"styleguide": "styleguide"
```

### Extensions mapping

File extensions are mapped to a certain task by default. This setting can be overridden in the mango.json.
For example:

```
"mapping":{
  "scripts": ["js", "jsx", "es6", "es", "coffee", "my.extension", "tpl.html"]
}
```
