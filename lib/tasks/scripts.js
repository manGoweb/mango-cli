module.exports = function(gulp, config) {

	return function(done) {
		if(!config.scripts) return done()
		var c = require('better-console')
		c.info('~ scripts')

		var webmake = require('gulp-webmake')
		var plumber = require('gulp-plumber')
		var sourcemaps = require('gulp-sourcemaps')
		var uglify = require('gulp-uglify')

		var task = gulp.src(config.scripts, { base: config.src_folder })
			.pipe(plumber({ errorHandler: require('../helpers/error_handler') }))
			.pipe(webmake({
				ext: [ 'coffee' ],
				sourceMap: config.devmode
			}))

		if(config.devmode) {
			task = task.pipe(sourcemaps.init({loadMaps: true}))
				.pipe(sourcemaps.write('.'))
		} else {
			task = task.pipe(uglify())
		}

		return task.pipe(gulp.dest(config.dist_folder))
	}
}
