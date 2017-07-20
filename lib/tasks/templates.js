module.exports = function(gulp, config) {
	var errorHandler = require('../helpers/error_handler')()
	var resolveData = require('../helpers/resolveData')

	return function(done) {
		if(!config.templates) return done()
		var c = require('better-console')

		var _ = require('lodash')
		var s_ = require('stream');
		var cache = require('gulp-cached')
		var data = require('gulp-data')
		var frontMatter = require('gulp-front-matter')
		var gulpFilter = require('gulp-filter')
		var gulpif = require('gulp-if')
		var pug = require('pug')
		var gulpPug = require('gulp-pug')
		var jf = require('jsonfile')
		var path = require('path')
		var plumber = require('gulp-plumber')
		var merge = require('merge-stream')

		var filterPug = gulpFilter('**/*.{jade,pug}', { restore: true })
		var filterStatic = gulpFilter('**/*.{html,htm}', { restore: true })

		var sourceGlob = []
		var templatesData = {}
		var masterTemplates = []

		for (var i = 0; i < config.templates.length; i++) {
			var template = config.templates[i]
			// Master templates
			if(typeof template == 'object' && typeof template.template == 'string') {
				masterTemplates.push(template)
			// Single templates
			} else if (typeof template == "string") {
				sourceGlob.push(template)
			} else {
				c.error('Templates: Unrecognised type of input')
			}
		}

		// Try to read data from external JSON files or pass inline object
		if(config.data) {
			for(var key in config.data){
				var value = config.data[key]
				var resolve = resolveData(value, config)
				if(resolve !== null) {
					value = resolve
				}
				templatesData[key] = value
			}
		}
		templatesData.require = require
		templatesData.devmode = config.devmode
		templatesData.production = !config.devmode
		templatesData.buildstamp = (config.buildstamp && !config.devmode) ? config.stamp : ''

		// Default Jade options
		var pugOptions = {
			pug: pug,
			pretty: true,
			cache: true,
			compileDebug: true,
			doctype: 'html',
			basedir: config.dir
		}
		if(config.pug) {
			_.assign(pugOptions, config.pug)
		}

		var source = merge()

		// Pipe all normal templates
		source.add(gulp.src(sourceGlob))

		// Pipe templates, which has to be multiplied
		_.each(masterTemplates, template => {
			var transformFnc = function() {
				var stream = new s_.Transform({ objectMode: true })

				stream._transform = (file, enc, callback) => {
					file.templateData = template.data
					callback(null, file)
				}
				return stream
			}

			source.add(gulp.src(template.template).pipe(transformFnc()))
		})

		// Init plumber in devmode
		var task = source
		if(config.devmode){
			task = task.pipe(plumber({ errorHandler: errorHandler.fail }))
		}

		task = task.pipe(frontMatter({
				property: 'frontMatter',
				remove: true
			}))
			// Add data to files which needs that
			.pipe(filterPug)
			.pipe(function () {
				var transformStream = new s_.Transform({objectMode: true});
				transformStream._transform = function (file, encoding, callback) {
					if(file.templateData) {
						var filesData = resolveData(file.templateData, config)
						// console.log('filesData', filesData)
						for (var index in filesData) {
							var fileClone = file.clone()
							var fileData = filesData[index]
							fileClone.path = path.join(fileClone.base, index)
							fileClone.data = {fileData: fileData}
							this.push(fileClone)
						}
						callback()
						return
					}
					callback(null, file)
				}
				return transformStream
			}())
			.pipe(data(function(file) {
				var name = path.basename(file.path)
				var data = _.cloneDeep(templatesData)

				// In case of name == key, assign value as global object
				if(typeof templatesData[name] !== 'undefined') {
					return _.assign(data, templatesData[name], file.frontMatter, file.data)
				} else {
					return _.assign(data, file.frontMatter, file.data)
				}
			}))
			.pipe(gulpPug(pugOptions))
			.pipe(filterPug.restore)
			.pipe(cache('templates', { optimizeMemory: true }))

		if(config.devmode){
			task.on('end', function() {
				errorHandler.done()
			})
		}

		return task.pipe(gulp.dest(config.dist_folder))
	}
}
