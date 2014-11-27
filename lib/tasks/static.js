
module.exports = function(gulp, config) {

	return function(done) {
		if(typeof config.static === 'undefined' || !config.static) return done()
		var c = require('better-console')
		c.info('~ static')

		var plumber = require('gulp-plumber')

		var task = gulp.src(config.static, { base: config.src_folder })
			.pipe(plumber({ errorHandler: require('../helpers/error_handler') }))

		return task.pipe(gulp.dest(config.dist_folder))
	}
}
