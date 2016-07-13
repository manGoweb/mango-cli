
module.exports = function(gulp, config) {

	return function(done) {
		if(!config.styles) return done()
		var c = require('better-console')
		c.info('~ styles')

		var autoprefixer = require('autoprefixer')
		var cache = require('gulp-cached')
		var minifycss = require('gulp-minify-css')
		var gulpFilter = require('gulp-filter')
		var less = require('gulp-less')
		var nib = require('nib')
		var path = require('path')
		var plumber = require('gulp-plumber')
		var postcss = require('gulp-postcss')
		var sass = require('gulp-sass')
		var sassGlob = require('gulp-sass-glob')
		var sourcemaps = require('gulp-sourcemaps')
		var stylus = require('gulp-stylus')
		var assign = require('lodash/object/assign')

		var filterLess = gulpFilter('**/*.less', { restore: true })
		var filterSass = gulpFilter('**/*.{scss,sass}', { restore: true })
		var filterStylus = gulpFilter('**/*.styl', { restore: true })

		var task = gulp.src(config.styles, {
			base: config.src_folder,
			cwd: config.dir
		})

		var stylusOptions = assign({}, {
			use: nib(),
			define: {
				debug: config.devmode
			},
			'include css': true
		}, config.stylus | {})

		// Init sourcemaps and plumber in devmode
		if(config.devmode){
			task = task
				.pipe(plumber({ errorHandler: require('../helpers/error_handler') }))
				.pipe(sourcemaps.init())
		}

		// Stylus part
		task = task.pipe(filterStylus)
			.pipe(stylus(stylusOptions))
			.pipe(filterStylus.restore)
		// Sass part
			.pipe(filterSass)
			.pipe(sassGlob())
			.pipe(sass())
			.pipe(filterSass.restore)
		// LESS part
			.pipe(filterLess)
			.pipe(less())
			.pipe(filterLess.restore)
		// Autoprefixer with custom options
			.pipe(cache('styles', { optimizeMemory: true }))
			.pipe(postcss([
				autoprefixer(config.autoprefixer ? config.autoprefixer : {
					cascade: false, remove: false
				})
			]))

		// Minimalization OR sourcemaps goodness
		if(!config.devmode) {

			if(config.cssmin !== false) {
				task = task.pipe(minifycss(config.cssmin ? config.cssmin : {
					advanced: false,
					noAdvanced: true
				}))
			}

		} else {
			task = task.pipe(sourcemaps.write('.'))
		}

		return task.pipe(gulp.dest(config.dist_folder))
	}
}
