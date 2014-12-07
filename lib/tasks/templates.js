
module.exports = function(gulp, config) {

	return function(done) {
		if(!config.templates) return done()
		var c = require('better-console')
		c.info('~ templates')

		var jade = require('jade')
		var gulpJade = require('gulp-jade')
		var plumber = require('gulp-plumber')

		var data = {}

		var task = gulp.src(config.templates)
			.pipe(plumber({ errorHandler: require('../helpers/error_handler') }))
			.pipe(gulpJade({
				jade: jade,
				locals: data,
				pretty: true
			}))

		return task.pipe(gulp.dest(config.dist_folder))
	}
}
