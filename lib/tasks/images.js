module.exports = function(gulp, config) {
	var errorHandler = require('../helpers/error_handler')()

	return function(done) {
		if(!config.images) return done()
		var c = require('better-console')
		c.info('~ images')

		var imagemin = require('gulp-imagemin')
		var pngquant = require('imagemin-pngquant')
		var plumber = require('gulp-plumber')

		var task = gulp.src(config.images, { base: config.src_folder })

		// Init plumber in devmode
		if(config.devmode){
			task = task.pipe(plumber({ errorHandler: errorHandler.fail }))
		}

		if(!config.devmode) {
			task = task.pipe(imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }],
				use: [pngquant()]
			}))
		}

		if(config.devmode){
			task.on('end', function() {
				errorHandler.done()
			})
		}

		return task.pipe(gulp.dest(config.dist_folder))
	}
}
