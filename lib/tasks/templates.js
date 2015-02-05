
module.exports = function(gulp, config) {

	return function(done) {
		if(!config.templates) return done()
		var c = require('better-console')
		c.info('~ templates')

		var jade = require('jade')
		var gulpJade = require('gulp-jade')
		var plumber = require('gulp-plumber')
		var gulpFilter = require('gulp-filter')

		var filterJade = gulpFilter('**/*.jade')
		var filterStatic = gulpFilter('**/*.{html,htm}')

		var data = {}

		var task = gulp.src(config.templates)
			.pipe(plumber({ errorHandler: require('../helpers/error_handler') }))

		// Static part
		task = task.pipe(filterStatic)
			.pipe(filterStatic.restore())
		// Sass part
			.pipe(filterJade)
			.pipe(gulpJade({
				jade: jade,
				locals: data,
				pretty: true
			}))
			.pipe(filterJade.restore())

		return task.pipe(gulp.dest(config.dist_folder))
	}
}
