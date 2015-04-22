
module.exports = function(gulp, config) {

	return function(done) {
		if(!config.templates) return done()
		var c = require('better-console')
		c.info('~ templates')

		var jade = require('jade')
		var gulpJade = require('gulp-jade')
		var gulpHandlebars = require('gulp-static-handlebars')
		var plumber = require('gulp-plumber')
		var gulpFilter = require('gulp-filter')
		var gulpExtReplace = require('gulp-ext-replace')

		var filterJade = gulpFilter('**/*.jade')
		var filterHandlebars = gulpFilter('**/*.hbs')
		var filterStatic = gulpFilter('**/*.{html,htm}')

		var data = {}

		var task = gulp.src(config.templates)
			.pipe(plumber({ errorHandler: require('../helpers/error_handler') }))

		// Static part
		task = task.pipe(filterStatic)
			.pipe(filterStatic.restore())
		// Jade part
			.pipe(filterJade)
			.pipe(gulpJade({
				jade: jade,
				locals: data,
				pretty: true
			}))
			.pipe(filterJade.restore())
		// Handlebars part
			.pipe(filterHandlebars)
			.pipe(gulpHandlebars({
				contents: data
				},
				{
					partials: gulp.src('**/partials/**/*.hbs')
				}
			))
			.pipe(gulpExtReplace('.html'))
			.pipe(filterHandlebars.restore())

		return task.pipe(gulp.dest(config.dist_folder))
	}
}
