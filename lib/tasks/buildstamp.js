
module.exports = function(gulp, config) {

	return function(done) {
		if(!config.buildstamp || config.devmode) return done()
		var c = require('better-console')
		c.info('~ buildstamp')

		var rename = require('gulp-rename')
		var path = require('path')
		var file = require('gulp-file')

		var subtractPaths = require('../helpers/subtractPaths')

		var distFolderRelative = subtractPaths(config.dist_folder, config.dir)
		var pathToDistRelative = subtractPaths(config.dir, process.cwd())

		var task = gulp.src(config.buildstamp, {
			base: path.join(pathToDistRelative, distFolderRelative),
			cwd: config.dir
		})

		task = task.pipe(rename(function(oldPath) {
			oldPath.basename = config.stamp + oldPath.basename

			return oldPath
		}))

		task = task.pipe(file('.buildstamp.txt', config.stamp + '\n'))

		return task.pipe(gulp.dest(config.dist_folder))
	}
}
