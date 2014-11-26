
module.exports = function(gulp, config) {

	return function(done) {
		var c = require('better-console')
		c.info('watch sources')

		var path = require('path')
		var watch = require('gulp-watch')
		var filter = require('gulp-filter')

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

		return watch(glob, { base: config.dir }).pipe(filter(handleCompileFile))
	}
}
