
module.exports = function(gulp, config) {

	return function(done) {
		if(!config.styles) return done()
		var c = require('better-console')
		c.info('~ styles')

		var autoprefixer = require('gulp-autoprefixer')
		var cssmin = require('gulp-cssmin')
		var gulpFilter = require('gulp-filter')
		var nib = require('nib')
		var path = require('path')
		var plumber = require('gulp-plumber')
		var sass = require('gulp-sass')
		var sourcemaps = require('gulp-sourcemaps')
		var stylus = require('gulp-stylus')

		var filterStylus = gulpFilter('**/*.styl')
		var filterSass = gulpFilter('**/*.scss')

		var task = gulp.src(config.styles, { base: config.src_folder })

			.pipe(plumber({ errorHandler: require('../helpers/error_handler') }))
			// Stylus part
			.pipe(filterStylus)
			.pipe(stylus({
				use: nib(),
				define: { debug: config.devmode },
				sourcemap: config.devmode ? { inline: true } : false,
				"include css": true
			}))
			.pipe(filterStylus.restore())
			// Sass part
			.pipe(filterSass)
			.pipe(sass())
			.pipe(filterSass.restore())
			// Autoprefixer with custom options
			.pipe(autoprefixer(config.autoprefixer ? config.autoprefixer : { cascade: false, remove: false }))


		// Minimalization
		if(!config.devmode) {
			task = task.pipe(cssmin())
		}

		return task.pipe(gulp.dest(config.dist_folder))
	}
}
