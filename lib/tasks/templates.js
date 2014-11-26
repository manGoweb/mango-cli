
module.exports = function(gulp, config) {

	return function(done) {
		if(typeof config.templates === 'undefined' || !config.templates) return done()
		var c = require('better-console')
		c.info('~ templates')

		var jade = require('gulp-jade')
		var plumber = require('gulp-plumber')

		var data = {}

		var task = gulp.src(config.templates)
			.pipe(plumber())
			.pipe(jade({
				locals: data,
				pretty: true
			}))

		return task.pipe(gulp.dest(config.dist_folder))
	}
}
