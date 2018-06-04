var jsExtensions = [ '.js', '.jsx', '.es6', '.es', '.ts', '.tsx' ]

module.exports = function(gulp, config) {
	var errorHandler = require('../helpers/error_handler')()

	return function(done) {
		if(!config.scripts) return done()
		var c = require('better-console')
		c.info('~ scripts')

		var assign = require('lodash').assign
		var cache = require('gulp-cached')
		var path = require('path')
		var plumber = require('gulp-plumber')
		var named = require('vinyl-named')

		var webpack = require('webpack')
		var gulpWebpack = require('webpack-stream')

		var webpackConfig = assign({}, {
			mode: config.devmode ? 'development' : 'production',
			devtool: config.devmode ? 'source-map' : false,
			stats: {
				assets: false,
				builtAt: false,
				children: false,
				entrypoints: false,
				version: true,
				performance: false,
				timings: false,
				publicPath: false,
				timings: false,
			},
			resolve: {
				extensions: jsExtensions,
			},
			module: {
				rules: [
					{ test: /\.ya?ml$/, use: require.resolve('yml-loader') },
					{ test: /\.pug$/, use: require.resolve('pug-loader') },
					{ test: /\.html?$/,
						use: {
							loader: require.resolve('html-loader'),
							options: {
								attrs: false,
								minimize: true,
							}
						}
					}, {
						test: function(filepath) {
							var ext = path.extname(filepath)
							return jsExtensions.indexOf(ext) !== -1
						},
						use: {
							loader: require.resolve('babel-loader'),
							options: {
								presets: [
									[ require.resolve('@babel/preset-env'), { modules: false } ],
									require.resolve('@babel/preset-react'),
									require.resolve('@babel/preset-typescript'),
								],
								plugins: [
									'@babel/plugin-syntax-decorators',
									'@babel/plugin-proposal-decorators',
									'@babel/plugin-syntax-class-properties',
									'@babel/plugin-proposal-class-properties',
									'@babel/plugin-syntax-object-rest-spread',
									'@babel/plugin-proposal-object-rest-spread',
								].map(require.resolve),
								cacheDirectory: true,
							}
						}
					},
				]
			},
			plugins: [
				new webpack.DefinePlugin({
					'DEBUG': JSON.stringify(!!config.devmode), // inject DEBUG variable
					'BUILDSTAMP': (config.buildstamp && !config.devmode) ? JSON.stringify(config.stamp) : JSON.stringify(''), // inject BUILDSTAMP variable
				}),
			],
		}, config.webpack || {})

		// ---

		var task = gulp.src(config.scripts, {
			base: config.src_folder,
			cwd: config.dir
		})

		// Init plumber in devmode
		if(config.devmode){
			task = task
				.pipe(plumber({ errorHandler: errorHandler.fail }))
		}

		task = task
			.pipe(named(function(file) {
				var ext = path.extname(file.path)
				var relative = path.relative(config.src_folder, file.path)
				// Give file a name under the correct folder, without an extension
				return relative.replace(new RegExp(`\\${ext}$`, 'i'), '')
			}))
			.pipe(gulpWebpack(webpackConfig, webpack))
			.pipe(cache('scripts', { optimizeMemory: true }))

		if(config.devmode){
			task.on('end', function() {
				errorHandler.done()
			})
		}

		return task.pipe(gulp.dest(config.dist_persistent_folder))
	}
}
