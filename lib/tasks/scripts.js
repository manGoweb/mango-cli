const jsExtensions = [ '.js', '.jsx', '.es6', '.es' ]
const tsExtensions = [ '.ts', '.tsx' ]
const svelteExtensions = [ '.svelte' ]
const otherExtensions = [ '.json' ]
const resolveExtensions = [].concat(otherExtensions, jsExtensions, tsExtensions, svelteExtensions)
const webpack = require('webpack')

module.exports = function(gulp, config) {
	const errorHandler = require('../helpers/error_handler')()

	return function(done) {
		if(!config.scripts) return done()
		const c = require('better-console')

		if(config.devmode) {
			c.info('Starting webpack in watch mode...')
		} else {
			c.info('~ scripts')
		}

		const assign = require('lodash').assign
		const cache = require('gulp-cached')
		const path = require('path')
		const plumber = require('gulp-plumber')
		const named = require('vinyl-named')

		const gulpWebpack = require('webpack-stream')

		const babelOptions = {
			presets: [
				[ require.resolve('@babel/preset-env'), { modules: false } ],
				require.resolve('@babel/preset-react'),
			],
			plugins: [
				[ require.resolve('@babel/plugin-syntax-decorators'), { legacy: true } ],
				[ require.resolve('@babel/plugin-proposal-decorators'), { legacy: true } ],
				'@babel/plugin-syntax-class-properties',
				'@babel/plugin-proposal-class-properties',
				'@babel/plugin-syntax-object-rest-spread',
				'@babel/plugin-proposal-object-rest-spread',
				'@babel/plugin-syntax-dynamic-import',
			].map(plugin => (typeof plugin == 'string') ? require.resolve(plugin) : plugin),
			cacheDirectory: true,
		}

		const webpackConfig = assign({}, {
			mode: config.devmode ? 'development' : 'production',
			devtool: config.devmode ? 'cheap-source-map' : false,
			watch: config.devmode,
			watchOptions: {
				ignored: [ 'node_modules' ],
			},
			stats: {
				assets: false,
				builtAt: false,
				entrypoints: false,
				children: false,
				performance: false,
				publicPath: false,
				timings: false,
				version: true,
			},
			resolve: {
				extensions: resolveExtensions,
				mainFields: ['svelte', 'browser', 'module', 'main'],
				alias: {
					svelte: path.resolve('node_modules', 'svelte'),
				},
			},
			module: {
				rules: [
					{ test: /\.ya?ml$/, use: require.resolve('yml-loader') },
					{ test: /\.pug$/, use: require.resolve('pug-loader') },
					{ test: /\.svelte$/, use: require.resolve('svelte-loader') },
					{ test: /\.html?$/,
						use: {
							loader: require.resolve('html-loader'),
							options: {
								attributes: false,
								minimize: true,
							}
						}
					}, {
						// ES6+
						test: function(filepath) {
							const ext = path.extname(filepath)
							return jsExtensions.indexOf(ext) !== -1
						},
						use: [
							{ loader: require.resolve('babel-loader'), options: babelOptions },
						]
					}, {
						// TypeScript
						test: function(filepath) {
							const ext = path.extname(filepath)
							return tsExtensions.indexOf(ext) !== -1
						},
						use: [
							{ loader: require.resolve('babel-loader'), options: babelOptions },
							{ loader: require.resolve('ts-loader') },
						]
					}
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

		let task = gulp.src(config.scripts, {
			base: config.src_folder,
			cwd: config.dir,
			allowEmpty: true,
		})

		// Init plumber in devmode
		if(config.devmode){
			task = task
				.pipe(plumber({ errorHandler: errorHandler.fail }))
		}

		task = task
			.pipe(named(function(file) {
				const ext = path.extname(file.path)
				const relative = path.relative(config.src_folder, file.path)
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
