
module.exports = function(gulp, config) {

	return function(done) {
		if(!config.templates) return done()
		var c = require('better-console')
		c.info('~ templates')

		var _ = require('lodash')
		var cache = require('gulp-cached')
		var data = require('gulp-data')
		var gulpFilter = require('gulp-filter')
		var gulpif = require('gulp-if')
		var gulpJade = require('gulp-jade')
		var jade = require('jade')
		var jadeInheritance = require('gulp-jade-inheritance')
		var jf = require('jsonfile')
		var path = require('path')
		var plumber = require('gulp-plumber')

		var filterJade = gulpFilter('**/*.jade')
		var filterStatic = gulpFilter('**/*.{html,htm}')

		var templatesData = {}

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
			for(key in config.data){
				var value = config.data[key]

				// Try to read data from external JSON files
				var resolve = resolveData(value)
				if(resolve !== null) value = resolve

				templatesData[key] = value
			}
		}

		var task = gulp.src(config.templates)

		// Init plumber in devmode
		if(config.devmode){
			task = task.pipe(plumber({ errorHandler: require('../helpers/error_handler') }))
		}

		task = task.pipe(filterJade)
			.pipe(gulpif(config._lastChanged, jadeInheritance({ basedir: config.dir })))
			.pipe(data(function(file) {
				// In case of name == key, assign value as global object
				var name = path.basename(file.path)
				if(typeof templatesData[name] !== 'undefined') {
					return _.assign(_.cloneDeep(templatesData), templatesData[name])
				} else {
					return templatesData
				}
			}))
			.pipe(gulpJade({
				jade: jade,
				pretty: true,
				cache: true,
				doctype: 'html'
			}))
			.pipe(filterJade.restore())
			.pipe(cache('templates', { optimizeMemory: true }))

		return task.pipe(gulp.dest(config.dist_folder))
	}
}
