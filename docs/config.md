# Configuration options

This document describes all available configuration options of mango.yaml or mango.json file.

## Source and destination

* `src_folder` - a folder with all source files. Content of this folder is watched in dev mode for changes. This path is filtered from destination path.
* **`dist_folder`** - build destination folder. The only one required option.

## Tasks

All fields are array of filepath masks, relative from the mango config file file.

* `styles` - stylesheets. Can be CSS, LESS, SASS, Stylus
* `scripts` - javascript. Files are treated as CommonJS modules which don't leak to global namespace. String `DEBUG` is replaced with true/false based on dev/build task.
* `images` - image resources. Images are minified in dist build, but just copied in dev mode.
* `static` - static resources. Static files are copied to dist folder.
* `templates` - templates. Static HTML files or Jade templates.
* `sprites` - svg symbols. Creating SVG sprites from multiple SVG files.
* `buildstamp` - cache control. Renaming specified files in dist folder with build unique prefix.

## Dependecies

* `dependencies` - an array of [NPM packages](https://www.npmjs.com). They are installed into `node_modules` folder with `mango install` command. Then they are available in scripts as `require('module')` calls.
* `version` - semver string with required mango-cli version. Like `>=0.18`

## Data

* `data` - object containing data supplied to templates in build time.

Format: `"globalname": "any variable type OR filepath to JSON file"`

If `globalname` match filename, its value gets assigned as current scope, overriding (but not clears) previous state

## Hooks

* `hooks` - object with additional commands you need to run before/after certain actions

Format: `"hookname": "command line command"`<br>
Available hooks: `init`, `preinstall`, `install`, `prebuild`, `build`, `predev`, `dev`, `watch`


## Experimental options

### Local config

All options can be overridden in `mango.local.yaml` (or `mango.local.json`) file. Handy for development and deployment.

---

### BrowserSync

* `browsersync` - options passed to [BrowserSync](http://www.browsersync.io/docs/options/) dev server
* `proxy` - start dev server in [proxy mode](http://www.browsersync.io/docs/options/#option-proxy)
* `watch` - additional files to watch resulting in browser reload

---

### Styles

* `stylus` - options passed to Stylus compiler. Default sets `'include css': true`
* `autoprefixer` - options passed to CSS [Autoprefixer](https://github.com/postcss/autoprefixer-core#usage)
* `cssmin` - options passed to [clean-css](https://github.com/jakubpawlowicz/clean-css#how-to-use-clean-css-api) in build task.

---

### Templates

* `jade` - options passed to the [Jade compiler](http://jade-lang.com/api). Defaults are `pretty: true`, `cache: true`, `doctype: 'html'`
* `templates` - it's elements can be string (glob) or object for generating multiple files from single template. The object needs to have two properties: `template` (containing filename of the template) and `data` (file containing json object where keys will become filenames for generated html and values will be passed to template in `fileData` variable)
* Additional data passed to templates: `devmode` == mango dev, and `production` == mango build

---

### Images

* `images` - array of all images - element can be:
    * string (glob) of source image for minification or
    * object for resize
        * `src` - string (glob) source of images
        * `sizes` - array of widths (int)
        * `aspectRatio` - aspect ratio of image on output (float = width/height), if undefined or false aspect ratio of image is used

---

### Scripts

* `uglify` - options passed to UglifyJS in build task.

---

### Sprites

* `sprites` - an array of objects. Each object contains `path` to SVG files (e.g. `src/images/sources/foo/*.svg`) and `name` (a prefix to SVG ids in generated sprites and name of the file)

---

### Buildstamp

* `buildstamp` - an array of file paths. A copy of selected files is made with prefix unique to each build in filename. The prefix is available by `#{buildstamp}` in jade and stored in file `dist_folder/.buildstamp.txt` for other template engines. In development the prefix is empty.

---

### Patternlab

* `patternlab` - our fork of [patternlab-node](https://github.com/manGoweb/patternlab-node)

Format:
```yaml
patterns:
  source: patterns
  public: dist
  data: data/data.json
  listitems: data/listitems.json
styleguide: styleguide
```

### Extensions mapping

File extensions are mapped to a certain task by default. This setting can be overridden in the mango config file.
For example:

```
"mapping":{
  "scripts": ["js", "jsx", "es6", "es", "coffee", "my.extension", "tpl.html"]
}
```
