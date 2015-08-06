
module.exports = function(gulp, config) {

	return function(done) {
		if(!config.templates) return done()
		var c = require('better-console')
		c.info('~ templates')

		var gulpFilter = require('gulp-filter')
		var gulpJade = require('gulp-jade')
		var jade = require('jade')
		var jadeInheritance = require('gulp-jade-inheritance')
		var jf = require('jsonfile')
		var path = require('path')
		var plumber = require('gulp-plumber')
		var gulpif = require('gulp-if')
		var cache = require('gulp-cached')

		var filterJade = gulpFilter('**/*.jade')
		var filterStatic = gulpFilter('**/*.{html,htm}')

		var templatesData = {}

		if(config.data) {
			for(key in config.data){
				var value = config.data[key]

				// Read data from external JSON files
				if(typeof value == 'string' && ~value.indexOf('.json')){
					value = jf.readFileSync(path.resolve(config.dir, value), { throws: false })
					if(value === null) {
						c.error('Error in JSON data parsing for file ' + config.data[key])
					}
				}

				templatesData[key] = value
			}
		}

		var task = gulp.src(config.templates)

		// Init plumber in devmode
		if(config.devmode){
			task = task.pipe(plumber({ errorHandler: require('../helpers/error_handler') }))
		}

		// Static part
		task = task.pipe(filterStatic)
			.pipe(filterStatic.restore())
		// Jade part
			.pipe(filterJade)
			.pipe(gulpif(config._lastChanged, jadeInheritance({ basedir: config.dir })))
			.pipe(gulpJade({
				jade: jade,
				locals: templatesData,
				pretty: true,
				cache: true
			}))
			.pipe(filterJade.restore())
			.pipe(cache('templates', { optimizeMemory: true }))

		return task.pipe(gulp.dest(config.dist_folder))
	}
}
