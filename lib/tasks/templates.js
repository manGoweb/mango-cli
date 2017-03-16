module.exports = function(gulp, config) {
	var errorHandler = require('../helpers/error_handler')()

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
		var gulpJade = require('gulp-jade')
		var jade = require('jade')
		var jadeInheritance = require('gulp-jade-inheritance')
		var jf = require('jsonfile')
		var path = require('path')
		var plumber = require('gulp-plumber')
		var merge = require('merge-stream')

		var filterJade = gulpFilter('**/*.jade', { restore: true })
		var filterStatic = gulpFilter('**/*.{html,htm}', { restore: true })

		var templatesData = {}

		var glob = []
		var templatesWithData = []
		for (var i = 0; i < config.templates.length; i++) {
			var template = config.templates[i]
			if(typeof template == 'object' && typeof template.template == 'string' && typeof template.data == 'string') {
				templatesWithData.push(template)
			} else if (typeof template == "string") {
				glob.push(template)
			} else {
				c.error('Templates: Unrecognised type of input')
			}
		}

		// Read data from external JSON files
		var resolveData = function(value) {
			var resolve = null
			if(typeof value == 'string' && ~value.indexOf('.json')){
				resolve = jf.readFileSync(path.resolve(config.dir, value), { throws: false })
				if(resolve === null) {
					c.error('Error in JSON data parsing for file ' + value)
				}
			}
			return resolve
		}
		if(config.data) {
			for(var key in config.data){
				var value = config.data[key]

				// Try to read data from external JSON files
				var resolve = resolveData(value)
				if(resolve !== null) value = resolve

				templatesData[key] = value
			}
		}

		// Default Jade options
		var jadeOptions = {
			jade: jade,
			pretty: true,
			cache: true,
			doctype: 'html',
			basedir: config.dir
		}
		if(config.jade) {
			_.assign(jadeOptions, config.jade)
		}

		var source = merge()

		// Pipe all normal templates
		source.add(gulp.src(glob, { cwd: config.dir }))

		// Pipe templates, which has to be multiplied
		for (var i = 0; i < templatesWithData.length; i++) {
			var template = templatesWithData[i]
			source.add(gulp.src(template.template, { cwd: config.dir })
				.pipe(function () {
					var transformStream = new s_.Transform({objectMode: true})
					transformStream._transform =  function (file, enc, callback) {
						file.templateData = template.data

						callback(null, file)
					}
					return transformStream
				}()))
		}

		// Init plumber in devmode
		var task = source
		if(config.devmode){
			task = task.pipe(plumber({ errorHandler: errorHandler.fail }))
		}

		templatesData.require = require
		templatesData.devmode = config.devmode
		templatesData.production = !config.devmode
		templatesData.buildstamp = (config.buildstamp && !config.devmode) ? config.stamp : ''

		task = task.pipe(frontMatter({
				property: 'frontMatter',
				remove: true
			}))
			// Add data to files which needs that
			.pipe(filterJade)
			.pipe(function () {
				var transformStream = new s_.Transform({objectMode: true});
				transformStream._transform = function (file, encoding, callback) {
					if(file.templateData) {
						var filesData = resolveData(file.templateData)
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
					return _.assign(data, templatesData[name], file.frontMatter)
				} else {
					return _.assign(data, file.frontMatter)
				}
			}))
			.pipe(gulpif(config._lastChanged, jadeInheritance({ basedir: config.dir })))
			.pipe(gulpJade(jadeOptions))
			.pipe(filterJade.restore)
			.pipe(cache('templates', { optimizeMemory: true }))

		if(config.devmode){
			task.on('end', function() {
				errorHandler.done()
			})
		}

		return task.pipe(gulp.dest(config.dist_folder))
	}
}
