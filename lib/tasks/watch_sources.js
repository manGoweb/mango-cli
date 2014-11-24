var c = require('better-console')
var path = require('path')
var watch = require('gulp-watch')
var filter = require('gulp-filter')

module.exports = function(gulp, config) {

	return function(done) {

		c.info('watch sources')

		var glob = config.src_folder + '/**/*.{css,styl,js,jsx,coffee,jade}'

		var handleCompileFile = function(file) {
			c.log('- handling change', path.relative('.', file.path))

			var ext = file.path.split('.').pop()

			switch(ext) {
				case 'css':
				case 'styl':
					return gulp.start('styles')
				case 'js':
				case 'jsx':
				case 'coffee':
					return gulp.start('scripts')
				case 'jade':
					return gulp.start('templates')
				default:
					return c.log('! unknown extension', ext)
			}
		}

		return watch(glob).pipe(filter(handleCompileFile))
	}
}