
module.exports = function(gulp, config, watch) {

	return function(done) {
		var c = require('better-console')
		c.info('Watching sources for change and recompilation...')

		var minimatch = require('minimatch')
		var path = require('path')
		var runcmd = require('../helpers/runcmd')
		var glob = '**/*.{css,styl,scss,less,js,jsx,es6,es,coffee,jade,json,html,htm}'
		var globDist = config.dist_folder + '/**/*.*'

		var mapping = {
			styles: ['css', 'less', 'scss', 'styl'],
			scripts: ['js', 'jsx', 'es6', 'es', 'coffee'],
			templates: ['jade', 'json', 'html', 'htm']
		};

		if(config.mapping) {
			Object.keys(config.mapping).forEach(function(key) {
				mapping[key] = config.mapping[key]
			})
		}

		Object.keys(mapping).forEach(function(key) {
			mapping[key].map(function(i) {
				return '.' + i.replace(/^\./, '') // remove . from the beginning of the string
			})
		})

		var completeHandler = function(e) {
			if(config.hooks && config.hooks.watch) runcmd(config.hooks.watch)
		}

		var changeHandler = function(filepath) {
			// Filter dist sources
			if (minimatch(filepath, globDist)) {
				return
			}

			config._lastChanged = filepath

			var handler = false

			Object.keys(mapping).forEach(function (key) {

				mapping[key].forEach(function(ext) {
					if(filepath.match(new RegExp(ext + '$'))) {
						handler = key
					}
				})
			})

			if (!handler) {
				c.warn('! unknown extension', path.extname(filepath), filepath)
				return
			}

			gulp.start(handler, completeHandler)
		}

		watch(glob, changeHandler)

		done()
	}
}
