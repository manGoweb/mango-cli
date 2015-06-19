
module.exports = function(gulp, config, watch) {

	return function(done) {
		var c = require('better-console')
		c.info('Watching sources for change and recompilation...')

		var minimatch = require('minimatch')
		var path = require('path')
		var runcmd = require('../helpers/runcmd')
		var glob = '**/*.{css,styl,scss,less,js,jsx,es6,es,coffee,jade,json,html,htm}'
		var globDist = config.dist_folder + '/**/*.*'

		var completeHandler = function(e) {
			if(config.hooks && config.hooks.watch) runcmd(config.hooks.watch)
		}

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
					return gulp.start('styles', completeHandler)
				case '.js':
				case '.jsx':
				case '.es6':
				case '.es':
				case '.coffee':
					return gulp.start('scripts', completeHandler)
				case '.jade':
				case '.json':
				case '.html':
				case '.htm':
					return gulp.start('templates', completeHandler)
				default:
					return c.warn('! unknown extension', ext, filepath)
			}
		}

		watch(glob, changeHandler)

		done()
	}
}
