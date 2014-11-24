
module.exports = function(gulp, config) {

	return function(done) {
		if(typeof config.scripts === 'undefined') return done()
		var c = require('better-console')
		c.info('~ scripts')

		var browserify = require('browserify')
		var transform = require('vinyl-transform')
		var uglify = require('gulp-uglify')
		var coffeeify = require('coffeeify')
		var reactify = require('reactify')
		var plumber = require('gulp-plumber')
		var sourcemaps = require('gulp-sourcemaps')

		var browserified = transform(function(filename) {
			var b = browserify({
				entries: filename,
				debug: config.devmode
			})
			b.transform(coffeeify)
			b.transform(reactify)
			return b.bundle()
		})

		var task = gulp.src(config.scripts, { base: config.src_folder })
			.pipe(plumber())
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