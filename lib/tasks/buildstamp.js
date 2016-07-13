
module.exports = function(gulp, config) {

	return function(done) {
		if(!config.buildstamp || config.devmode) return done()
		var c = require('better-console')
		c.info('~ buildstamp')

		var rename = require('gulp-rename')
		var path = require('path')
		var file = require('gulp-file')

		var task = gulp.src(config.buildstamp, { base: config.dir })

		var path_dist = path.normalize(config.dist_folder)

		task = task.pipe(rename(function(path) {
			path.basename = config.stamp + path.basename

			// Extract dist_folder from file paths
			if(path.dirname.indexOf(path_dist) === 0){
				path.dirname = path.dirname.substr(path_dist.length)
			}

			return path
		}))

		task = task.pipe(file('buildstamp.txt', config.stamp))

		return task.pipe(gulp.dest(config.dist_folder))
	}
}
