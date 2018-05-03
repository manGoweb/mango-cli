var mappingDefaults = {
	styles: ['css', 'less', 'scss', 'sass', 'styl'],
	scripts: ['js', 'jsx', 'es6', 'es', 'coffee', 'ts', 'tsx'],
	templates: ['jade', 'pug', 'json', 'html', 'htm', 'yml', 'yaml'],
	images: ['jpg', 'jpeg', 'png', 'svg'],
	sprites: ['svg']
}


module.exports = function(gulp, config, watch) {
	var mapping = require('lodash').merge({}, mappingDefaults, config.mapping || {})

	var fileExtensions = []
	var mappingRegEx = {}
	Object.keys(mapping).forEach(function(key) {
		mappingRegEx[key] = []
		mappingRegEx[key] = mapping[key].map(function(i) {
			var ext = '.' + i.replace(/^\./, '') // remove . from the beginning of the string
			if(fileExtensions.indexOf(key) == -1) {
				fileExtensions.push(ext.substring(1))
			}
			return new RegExp(ext + '$')
		})
	})

	return function(done) {
		var c = require('better-console')
		c.info('Watching sources for change and recompilation...')

		var log = require('better-console')
		var minimatch = require('minimatch')
		var path = require('path')
		var runcmd = require('../helpers/runcmd')
		var glob = '**/*.{' + fileExtensions.join() + '}'
		var subtractPaths = require('../helpers/subtractPaths')
		var distFolderRelative = subtractPaths(config.dist_folder, config.dir)
		var globDist = distFolderRelative + '/**/*.*'


		var completeHandler = function(e) {
			if(config.hooks && config.hooks.watch) {
				log.info('~ watch hook: ' + config.hooks.watch)
				runcmd(config.hooks.watch, config.dir, function() {
					log.info('/>')
				})
			}
		}

		var changeHandler = function(filepath) {
			// Filter dist sources
			if (minimatch(filepath, globDist)) {
				return
			}

			config._lastChanged = filepath

			var handlers = []

			Object.keys(mappingRegEx).forEach(function (key) {

				mappingRegEx[key].forEach(function(regexp) {
					if(filepath.match(regexp)) {
						handlers.push(key)
					}
				})
			})

			if (!handlers.length) {
				c.warn('! unknown extension', path.extname(filepath), filepath)
				return
			}

			handlers.forEach(function(handler) {
				gulp.start(handler, completeHandler)
			})


		}

		watch(glob, changeHandler)

		done()
	}
}
