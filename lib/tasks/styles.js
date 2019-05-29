module.exports = function(gulp, config) {
	var errorHandler = require('../helpers/error_handler')()

	return function(done) {
		if(!config.styles) return done()
		var c = require('better-console')
		c.info('~ styles')

		var autoprefixer = require('autoprefixer')
		var cache = require('gulp-cached')
		var cleancss = require('gulp-clean-css')
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
		var assign = require('lodash').assign

		var filterLess = gulpFilter('**/*.less', { restore: true })
		var filterSass = gulpFilter('**/*.{scss,sass}', { restore: true })
		var filterStylus = gulpFilter('**/*.styl', { restore: true })

		var task = gulp.src(config.styles, {
			base: config.src_folder,
			cwd: config.dir,
			allowEmpty: true,
		})

		var stylusOptions = assign({}, {
			use: nib(),
			define: {
				debug: config.devmode
			},
			'include css': true
		}, config.stylus | {})

		var sassOptions = {}

		if(config.sassNodeModulesAlias) {
			var sassOptions = assign({}, sassOptions, {
				importer: require('node-sass-package-importer')()
			})
		}

		// Init sourcemaps and plumber in devmode
		if(config.devmode){
			task = task.pipe(plumber({ errorHandler: errorHandler.fail }))

			if(config.disableSourcemaps !== true) {
				task = task.pipe(sourcemaps.init())
			}
		}

		// Stylus part
		task = task.pipe(filterStylus)
			.pipe(stylus(stylusOptions))
			.pipe(filterStylus.restore)
		// Sass part
			.pipe(filterSass)
			.pipe(sassGlob())
			.pipe(sass(sassOptions))
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
				task = task.pipe(cleancss(config.cssmin ? config.cssmin : {
					timeout: 30, // clean-css^3.4
					inlineTimeout: 30, // forward compatibility with clean-css^4.0
					advanced: false,
				}))
			}

		} else {
			if(config.disableSourcemaps !== true) {
				task = task.pipe(sourcemaps.write('.'))
			}
		}

		if(config.devmode){
			task.on('end', function() {
				errorHandler.done()
			})
		}

		return task.pipe(gulp.dest(config.dist_persistent_folder))
	}
}
