module.exports = function(gulp, config) {

	return function(done) {
		if(!config.scripts) return done()
		var c = require('better-console')
		c.info('~ scripts')

		var browserify = require('browserify')
		var coffeeify = require('coffeeify')
		var deamdify = require('deamdify')
		var deglobalify = require('deglobalify')
		var envify = require('envify/custom')
		var plumber = require('gulp-plumber')
		var reactify = require('reactify')
		var sourcemaps = require('gulp-sourcemaps')
		var transform = require('vinyl-transform')
		var uglify = require('gulp-uglify')

		var browserified = transform(function(filename) {
			var b = browserify({
				entries: filename,
				debug: config.devmode
			})
			b.transform(envify({
				NODE_ENV: config.devmode ? 'development' : 'production'
			}))
			b.transform(coffeeify)
			b.transform(reactify)
			b.transform(deamdify)
			b.transform(deglobalify)
			return b.bundle()
		})

		var task = gulp.src(config.scripts, { base: config.src_folder })
			.pipe(plumber({ errorHandler: require('../helpers/error_handler') }))
			.pipe(browserified)

		if(config.devmode) {
			task = task.pipe(sourcemaps.init({loadMaps: true}))
				.pipe(sourcemaps.write('.'))
		} else {
			task = task.pipe(uglify())
		}

		return task.pipe(gulp.dest(config.dist_folder))
	}
}
