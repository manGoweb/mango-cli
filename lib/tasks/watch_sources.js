
module.exports = function(gulp, config) {

	return function(done) {
		var c = require('better-console')
		c.info('watch sources')

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
			c.log('- handling change', path.relative(config.dir, file.path))

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
					return c.log('! unknown extension', ext)
			}
		}

		return gulp.watch(glob, options, changeHandler)
	}
}
