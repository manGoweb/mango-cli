
module.exports = function(gulp, config, watch) {

	return function(done) {
		var c = require('better-console')
		c.info('Watching sources for change and recompilation...')

		var minimatch = require('minimatch')
		var path = require('path')
		var glob = '**/*.{css,styl,scss,less,js,jsx,coffee,jade,html,htm}'
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
				case '.less':
				case '.scss':
				case '.styl':
					return gulp.start('styles', function(e){})
				case '.js':
				case '.jsx':
				case '.coffee':
					return gulp.start('scripts', function(e){})
				case '.jade':
				case '.html':
				case '.htm':
					return gulp.start('templates', function(e){})
				default:
					return c.warn('! unknown extension', ext, filepath)
			}
		}

		watch(glob, changeHandler)

		done()
	}
}
