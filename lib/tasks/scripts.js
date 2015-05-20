module.exports = function(gulp, config) {

	return function(done) {
		if(!config.scripts) return done()
		var c = require('better-console')
		c.info('~ scripts')

		var plumber = require('gulp-plumber')
		var sourcemaps = require('gulp-sourcemaps')
		var uglify = require('gulp-uglify')
		var webmake = require('gulp-webmake')
		var babel = require('babel')
		var replace = require('gulp-replace')

		var babelTransform = function(code, opts){
			var result = babel.transform(code, {
				sourceMap: config.devmode,
				filename: opts.localFilename
			})
			return { code: result.code, sourceMap: result.map}
		}

		var task = gulp.src(config.scripts, { base: config.src_folder })
			.pipe(plumber({ errorHandler: require('../helpers/error_handler') }))
			.pipe(webmake({
				'ext': [
					'coffee',
					{ name: 'BabelJSX', extension: 'jsx', type: 'js', compile: babelTransform },
					{ name: 'BabelES6', extension: 'es6', type: 'js', compile: babelTransform },
					{ name: 'BabelES', extension: 'es', type: 'js', compile: babelTransform }
				],
				'sourceMap': config.devmode
			}))
			// do simple envify
			task.pipe(replace(/process\.env\.NODE_ENV/g, config.devmode ? "'development'" : "'production'"))

		if(config.devmode) {
			task = task.pipe(sourcemaps.init({loadMaps: true}))
				.pipe(sourcemaps.write('.'))
		} else {
			task = task.pipe(uglify())
		}

		return task.pipe(gulp.dest(config.dist_folder))
	}
}
