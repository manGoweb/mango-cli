module.exports = function(gulp, config) {

	return function(done) {
		if(!config.scripts) return done()
		var c = require('better-console')
		c.info('~ scripts')

		var plumber = require('gulp-plumber')
		var react = require('react-tools')
		var sourcemaps = require('gulp-sourcemaps')
		var uglify = require('gulp-uglify')
		var webmake = require('gulp-webmake')

		var task = gulp.src(config.scripts, { base: config.src_folder })
			.pipe(plumber({ errorHandler: require('../helpers/error_handler') }))
			.pipe(webmake({
				ext: [
					'coffee',
					{
						name: 'ReactJSX',
						extension: 'jsx',
						type: 'js',
						compile: function(source, opts) {
							var result = react.transform(source, {
								sourceMap: opts.sourceMap,
								sourceFilename: opts.localFilename
							})
							return { code: result }
						}
					}
				],
				sourceMap: config.devmode
			}))

		if(config.devmode) {
			task = task.pipe(sourcemaps.init({loadMaps: true}))
				.pipe(sourcemaps.write('.'))
		} else {
			task = task.pipe(uglify())
		}

		return task.pipe(gulp.dest(config.dist_folder))
	}
}
