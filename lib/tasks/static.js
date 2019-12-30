module.exports = function (gulp, config) {
	var errorHandler = require('../helpers/error_handler')()

	return function (done) {
		if (!config.static) return done()
		var c = require('better-console')
		c.info('~ static')

		var plumber = require('gulp-plumber')
		var rename = require('gulp-rename')
		var path = require('path')

		var task = gulp.src(config.static, { base: config.dir, cwd: config.dir, allowEmpty: true })

		// Init plumber in devmode
		if (config.devmode) {
			task = task.pipe(plumber({ errorHandler: errorHandler.fail }))
		}

		var path_src = path.normalize(config.src_folder)

		task = task.pipe(rename(function (filepath) {
			// Extract src_folder from file paths
			if (filepath.dirname.indexOf(path_src) === 0) {
				filepath.dirname = filepath.dirname.substr(path_src.length)
			}
		}))

		if (config.devmode) {
			task.on('end', function () {
				errorHandler.done()
			})
		}

		return task.pipe(gulp.dest(config.dist_persistent_folder))
	}
}
