
module.exports = function(gulp, config) {

	return function(done) {
		if(!config.styles) return done()
		var c = require('better-console')
		c.info('~ styles')

		var autoprefixer = require('gulp-autoprefixer')
		var cssmin = require('gulp-cssmin')
		var gulpFilter = require('gulp-filter')
		var less = require('gulp-less')
		var nib = require('nib')
		var path = require('path')
		var plumber = require('gulp-plumber')
		var sass = require('gulp-sass')
		var sourcemaps = require('gulp-sourcemaps')
		var stylus = require('gulp-stylus')

		var filterLess = gulpFilter('**/*.less')
		var filterSass = gulpFilter('**/*.scss')
		var filterStylus = gulpFilter('**/*.styl')

		var task = gulp.src(config.styles, { base: config.src_folder })

		// Init sourcemaps and plumber in devmode
		if(config.devmode){
			task = task
				.pipe(plumber({ errorHandler: require('../helpers/error_handler') }))
				.pipe(sourcemaps.init())
		}

		// Stylus part
		task = task.pipe(filterStylus)
			.pipe(stylus({
				use: nib(),
				define: { debug: config.devmode },
				'include css': true
			}))
			.pipe(filterStylus.restore())
		// Sass part
			.pipe(filterSass)
			.pipe(sass())
			.pipe(filterSass.restore())
		// LESS part
			.pipe(filterLess)
			.pipe(less())
			.pipe(filterLess.restore())
		// Autoprefixer with custom options
			.pipe(autoprefixer(config.autoprefixer ? config.autoprefixer : { cascade: false, remove: false }))


		// Minimalization OR sourcemaps goodness
		if(!config.devmode) {
			task = task.pipe(cssmin())
		} else {
			task = task.pipe(sourcemaps.write('.'))
		}

		return task.pipe(gulp.dest(config.dist_folder))
	}
}
