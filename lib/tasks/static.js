
module.exports = function(gulp, config) {

	return function(done) {
		if(!config.static) return done()
		var c = require('better-console')
		c.info('~ static')

		var plumber = require('gulp-plumber')
		var rename = require('gulp-rename')

		var task = gulp.src(config.static, { base: config.dir })
			.pipe(plumber({ errorHandler: require('../helpers/error_handler') }))
			.pipe(rename(function(path) {
				// Extract src_folder from file paths
				if(path.dirname.indexOf(config.src_folder) === 0){
					path.dirname = path.dirname.substr(config.src_folder.length)
				}
			}))

		return task.pipe(gulp.dest(config.dist_folder))
	}
}
