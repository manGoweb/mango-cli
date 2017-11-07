module.exports = function(gulp, config) {
	var errorHandler = require('../helpers/error_handler')()

	return function(done) {
		if(!config.scripts) return done()
		var c = require('better-console')
		c.info('~ scripts')

		var _ = require('lodash')
		var babel = require('babel-core')
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
				highlightCode: false,
				presets: [
						"babel-preset-env",
						"babel-preset-typescript",
					].map(require.resolve),
				plugins: [
						"babel-plugin-transform-decorators-legacy",
						"babel-plugin-transform-class-properties",
						"babel-plugin-transform-react-jsx",
						"babel-plugin-transform-object-rest-spread",
					].map(require.resolve), // as Babel looks for a plugin
			})

			return { code: result.code, sourceMap: JSON.stringify(result.map) }
		}

		var webmakeOptions = {
				'ext': [
					'coffee',
					{ name: 'BabelTypescript', extension: 'ts', type: 'js', compile: babelTransform },
					{ name: 'BabelJSX', extension: 'jsx', type: 'js', compile: babelTransform },
					{ name: 'BabelES6', extension: 'es6', type: 'js', compile: babelTransform },
					{ name: 'BabelES', extension: 'es', type: 'js', compile: babelTransform }
				],
				'sourceMap': config.devmode,
				'cache': config.devmode
		}
		if(config.webmake) {
			_.assign(webmakeOptions, config.webmake)
		}

		var task = gulp.src(config.scripts, { base: config.src_folder, cwd: config.dir })

		// Init plumber in devmode
		if(config.devmode){
			task = task.pipe(plumber({ errorHandler: errorHandler.fail }))
		}

		task = task.pipe(webmake(webmakeOptions))
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

		if(config.devmode){
			task.on('end', function() {
				errorHandler.done()
			})
		}

		return task.pipe(gulp.dest(config.dist_persistent_folder))
	}
}
