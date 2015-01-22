
module.exports = function(gulp, config, watch) {

	return function(done) {
		var c = require('better-console')
		c.info('Watching sources for change and recompilation...')

		var minimatch = require('minimatch')
		var path = require('path')
		var glob = '**/*.{css,styl,scss,js,jsx,coffee,jade}'
		var globDist = config.dist_folder + '/**/*.*'

		var changeHandler = function(filepath) {
			// Filter dist sources
			if(minimatch(filepath, globDist)) {
				return
			}
			// Decide what task should run from file extension
			var ext = path.extname(filepath)
			switch(ext) {
				case '.css':
				case '.styl':
				case '.scss':
					return gulp.start('styles')
				case '.js':
				case '.jsx':
				case '.coffee':
					return gulp.start('scripts')
				case '.jade':
					return gulp.start('templates')
				default:
					return c.warn('! unknown extension', ext, filepath)
			}
		}

		watch(glob, changeHandler)

		done()
	}
}
