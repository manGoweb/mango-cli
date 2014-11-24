var c = require('better-console')
var path = require('path')
var stylus = require('gulp-stylus')
var nib = require('nib')
var cssmin = require('gulp-cssmin')
var plumber = require('gulp-plumber')

module.exports = function(gulp, config) {

	return function(done) {

		if(typeof config.styles === 'undefined') return done()

		c.info('~ styles')

		var stylus_options = {
			use: nib(),
			sourcemap: {
				inline: true
			}
		}

		if(config.devmode) {
			stylus_options.sourcemap = { inline: true }
		}

		var task = gulp.src(config.styles, { base: config.src_folder })
			.pipe(plumber())
			.pipe(stylus(stylus_options))

		if(!config.devmode) {
			task = task.pipe(cssmin())
		}

		return task.pipe(gulp.dest(config.dist_folder))
	}
}