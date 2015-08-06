module.exports = function(gulp, config) {

	return function(done) {
		if(!config.scripts) return done()
		var c = require('better-console')
		c.info('~ scripts')

		var babel = require('babel')
		var cache = require('gulp-cached')
		var plumber = require('gulp-plumber')
		var replace = require('gulp-replace')
		var sourcemaps = require('gulp-sourcemaps')
		var uglify = require('gulp-uglify')
		var webmake = require('gulp-webmake')

		var babelTransform = function(code, opts){
			var result = babel.transform(code, {
				sourceMap: config.devmode,
				filename: opts.localFilename,
				highlightCode: false
			})
			return { code: result.code, sourceMap: result.map}
		}

		var task = gulp.src(config.scripts, { base: config.src_folder })

		// Init plumber in devmode
		if(config.devmode){
			task = task.pipe(plumber({ errorHandler: require('../helpers/error_handler') }))
		}

		task = task.pipe(webmake({
				'ext': [
					'coffee',
					{ name: 'BabelJSX', extension: 'jsx', type: 'js', compile: babelTransform },
					{ name: 'BabelES6', extension: 'es6', type: 'js', compile: babelTransform },
					{ name: 'BabelES', extension: 'es', type: 'js', compile: babelTransform }
				],
				'sourceMap': config.devmode,
				'cache': config.devmode
			}))
			.pipe(replace(/process\.env\.NODE_ENV/g, config.devmode ? "'development'" : "'production'")) // do simple envify
			.pipe(replace('DEBUG', config.devmode ? 'true' : 'false')) // inject DEBUG variable
			.pipe(cache('scripts', { optimizeMemory: true }))

		if(config.devmode) {
			task = task.pipe(sourcemaps.init({loadMaps: true}))
				.pipe(sourcemaps.write('.'))
		} else {
			if(config.uglify !== false){
				var uglifyOptions = (typeof config.uglify == 'object') ? config.uglify : {}
				task = task.pipe(uglify(uglifyOptions))
			}
		}



		return task.pipe(gulp.dest(config.dist_folder))
	}
}
