var c = require('better-console')
var jade = require('gulp-jade')
var plumber = require('gulp-plumber')

module.exports = function(gulp, config) {

	return function(done) {

		if(typeof config.templates === 'undefined') return done()

		c.info('~ templates')

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