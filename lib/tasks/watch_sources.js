
module.exports = function(gulp, config) {

	return function(done) {
		var c = require('better-console')
		c.info('Watching sources for change and recompilation...')

		var path = require('path')

		var glob = [
			'**/*.{css,styl,scss,js,jsx,coffee,jade}',
			'!' + config.dist_folder + '/**/*'
		]

		var options = {
			base: path.resolve(config.dir, config.src_folder),
			read: false
		}

		var changeHandler = function(file) {
			var ext = path.extname(file.path)

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
					return c.warn('! unknown extension', ext, file)
			}
		}

		return gulp.watch(glob, options, changeHandler)
	}
}
