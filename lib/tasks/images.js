var c = require('better-console')
var imagemin = require('gulp-imagemin')
var pngquant = require('imagemin-pngquant')
var plumber = require('gulp-plumber')

module.exports = function(gulp, config) {

	return function(done) {

		if(typeof config.images === 'undefined') return done()

		c.info('~ images')

		var task = gulp.src(config.images, { base: config.src_folder })
			.pipe(plumber())

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