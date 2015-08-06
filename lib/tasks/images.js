
module.exports = function(gulp, config) {

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
			task = task.pipe(plumber({ errorHandler: require('../helpers/error_handler') }))
		}

		if(!config.devmode) {
			task = task.pipe(imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }],
				use: [pngquant()]
			}))
		}

		return task.pipe(gulp.dest(config.dist_folder))
	}
}
