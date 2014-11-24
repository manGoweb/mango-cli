// important libs
var gulp = require('gulp')
var plumber = require('gulp-plumber')
var notify = require('gulp-notify')
var c = require('better-console')

// lazy libs
var git
var fs, path, watch, filter
var stylus, nib, cssmin
var browserify, transform, uglify, coffeeify, reactify, sourcemaps
var jade
var imagemin, pngquant

// class Mango
var Mango = function() {}
Mango.prototype.init = function(folder, name, forkTemplate) {
	this.forkRepository(folder, forkTemplate, function() {
		c.info('init done')
	})
}
Mango.prototype.forkRepository = function(destination, remote, cb) {
	c.log('Forking', remote, 'to', destination)

	git = git || require('gift')

	git.clone(remote, destination, function(err, repo) {
		if(err) {
			return c.error('Failed to clone', err)
		}

		repo.remote_remove('origin', function(err) {
			if(err) {
				return c.error('Failed to remove origin', err)
			}
			c.info('Repository forked')
			if(typeof cb === 'function') {
				cb(repo)
			}
		})
	})
}
Mango.prototype.initRepo = function(folder, cb) {
	c.log('Initializing empty git repo in', folder)

	fs = fs || require('fs')

	if(!fs.existsSync(folder)) {
		fs.mkdirSync(folder)
	}

	git = git || require('git')

	git.init(folder, function(err, repo) {
		if(err) {
			return c.error('Failed git repo initialization', err)
		}
		c.info('Repository initialized')
		if(typeof cb === 'function') cb(repo)
	})
}
Mango.prototype.install = function(config) {
	c.log('Installing NPM packages')

	var npm = require('npm')

	npm.load(function(err){
		if(err) {
			return c.error('Failed loading NPM package.json', err)
		}

		npm.on('log', function(msg) {
			console.log(msg)
		})

		npm.commands.install(config.cwd, config.dependencies, function(err, data) {
			if(err) {
				return c.error('Failed installing packages', err)
			}
		})
	})
}
Mango.prototype.clean = function() {
	c.log('CLEAN')
	gulp.start('cleanup')
}
Mango.prototype.build = function(tasks) {
	c.log('BUILD')
	gulp.start('build')
}
Mango.prototype.dev = function() {
	c.log('DEV')
	gulp.start('dev')

}
module.exports = Mango
// end class Mango

var MODE_BUILD = 'build'
var MODE_DEV = 'dev'

// defaults
var config = {
	MODE: MODE_BUILD,

	cwd: '.',

	src_folder: 'theme',
	dist_folder: 'public/assets',

	styles: [ 'theme/styles/screen.styl' ],
	scripts: [ 'theme/scripts/ie8.js', 'theme/scripts/index.js' ],
	images: [ 'theme/img/**/*.{jpg,png,svg}' ],

	reload: [ 'app/**/*.*', 'theme/**/*.{latte,php}' ],

	dependencies: [],

	browsersync: {
		logLevel: "debug",
		open: true,
		proxy: '127.0.0.1/wp/public',
		ghostMode: {
			clicks: true,
			location: true,
			forms: true,
			scroll: true
		}
	}
}


// the work code


var onTaskError = notify.onError({
   title:    'Error',
   subtitle: '<%= file.relative %>',
   message:  '<%= error.message %>'
})



gulp.task('cleanup', function(done) {
	require('del')(config.dist_folder, done)
})




gulp.task('build', function(done) {
	c.info('build')
	config.MODE = MODE_BUILD
	gulp.start('compile:all', done)
})




gulp.task('dev', function(done) {
	c.info('dev')
	config.MODE = MODE_DEV

	gulp.start(['watch:sources', 'watch:reload'], done)
})




gulp.task('watch:sources', function(done) {
	c.info('watch sources')

	path = path || require('path')
	watch = watch || require('gulp-watch')
	filter = filter || require('gulp-filter')

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

	return watch(glob)
		.pipe(filter(handleCompileFile))
})




gulp.task('watch:reload', function(done) {
	c.info('watch reload')

	var browsersync
	var options = {}

	if(typeof config.browsersync !== 'undefined') {
		for(var i in config.browsersync) {
			options[i] = config.browsersync[i]
		}
	}

	if(!options.proxy) {
		options.server = { baseDir: config.dist_folder }
	}

	browsersync = require('browser-sync')

	browsersync(options)

	// create dist_folder if not exists
	fs = fs || require('fs')
	if(!fs.existsSync(config.dist_folder)) {
		fs.mkdirSync(config.dist_folder)
	}

	// watch empty directory workaround
	if(fs.readdirSync(config.dist_folder).length === 0) {
		var foofile = config.dist_folder + '/mango.temp.css'
		fs.writeFileSync(foofile, '' + Math.random())
		setTimeout(function() {
			fs.unlink(foofile)
		}, 5000)
	}

	watch = watch || require('gulp-watch')
	filter = filter || require('gulp-filter')

	var glob = config.reload.concat(config.dist_folder + '/**/*.*')

	var handleReloadFile = function(file) {
		fs = fs || require('fs')

		found = false

		// files only
		if(!fs.existsSync(file.path) || !fs.lstatSync(file.path).isFile()) {
			return false
		}

		c.log('- handling reload', file.path)
		browsersync.reload(file.path)
	}

	return watch(glob)
		.pipe(filter(handleReloadFile))
})




gulp.task('init', function(done) {
	c.info('init')
	done()
})




gulp.task('install', function(done) {
	c.info('install')
	done()
})

//




gulp.task('compile:all', [ 'cleanup' ], function(done) {
	c.info('compile:all')
	gulp.start('compile', done)
})




gulp.task('compile', [ 'styles', 'scripts', 'templates', 'images', 'static' ], function(done) {
	c.info('compile')
	done()
})




gulp.task('styles', function(done) {
	if(typeof config.styles === 'undefined') {
		return false
		// c.warn('skip: styles')
	} else {
		c.info('~ styles')
	}

	path = path || require('path')

	stylus = stylus || require('gulp-stylus')
	nib = nib || require('nib')
	cssmin = cssmin || require('gulp-cssmin')

	var stylus_options = {
		use: nib(),
		sourcemap: {
			inline: true
		}
	}

	if(config.MODE === MODE_DEV) {
		stylus_options.sourcemap = { inline: true }
	}

	var task = gulp.src(config.styles, { base: config.src_folder })
		.pipe(plumber({ errorHandler: onTaskError }))
		.pipe(stylus(stylus_options))

	if(config.MODE === MODE_BUILD) {
		task = task.pipe(cssmin())
	}

	task = task.pipe(gulp.dest(config.dist_folder))

	return task
})




gulp.task('scripts', function(done) {
	if(typeof config.scripts === 'undefined') {
		return false
		// c.warn('skip: scripts')
	} else {
		c.info('~ scripts')
	}

	browserify = browserify || require('browserify')
	transform = transform || require('vinyl-transform')
	uglify = uglify || require('gulp-uglify')
	coffeeify = coffeeify || require('coffeeify')
	reactify = reactify || require('reactify')

	var browserified = transform(function(filename) {
		var b = browserify({
			entries: filename,
			debug: (config.MODE === MODE_DEV)
		})
		b.transform(coffeeify)
		b.transform(reactify)
		return b.bundle()
	})

	var task = gulp.src(config.scripts, { base: config.src_folder })
		.pipe(plumber({errorHandler: onTaskError}))
		.pipe(browserified)

	if(config.MODE === MODE_DEV) {
		task = task.pipe(sourcemaps.init({loadMaps: true}))
			.pipe(sourcemaps.write('.'))
	} else {
		task = task.pipe(uglify())
	}

	task = task.pipe(gulp.dest(config.dist_folder))

	return task
})




gulp.task('images', function(done) {
	if(typeof config.images === 'undefined') {
		return false
		// c.warn('skip: images')
	} else {
		c.info('~ images')
	}

	var task = gulp.src(config.images, { base: config.src_folder })
		.pipe(plumber({errorHandler: onTaskError}))

	if(config.MODE === MODE_BUILD) {
		imagemin = imagemin || require('gulp-imagemin')
		pngquant = pngquant || require('imagemin-pngquant')

		task = task.pipe(imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }],
				use: [pngquant()]
			}))
	}

	task = task.pipe(gulp.dest(config.dist_folder))

	return task
})




gulp.task('templates', function(done) {
	if(typeof config.templates === 'undefined') {
		return false
		// c.warn('skip: templates')
	} else {
		c.info('~ templates')
	}

	var data = {}

	jade = require('gulp-jade')

	var task = gulp.src(config.templates)
		.pipe(plumber({errorHandler: onTaskError}))
		.pipe(jade({
			locals: data,
			pretty: true
		}))
		.pipe(gulp.dest(config.dist_folder))

	return task
})




gulp.task('static', function(done) {
	if(typeof config.static === 'undefined') {
		return false
		// c.warn('skip: static')
	} else {
		c.info('~ static')
	}
	done()
})

var controller = function(action, params) {
	if(!(action in gulp.tasks)) {
		return c.error('unknown action', action)
	}
	if(typeof params !== 'undefined') {
		c.warn('no config found. Using defaults')
	}
	for(var k in params) {
		config[k] = params[k]
	}

	gulp.start(action)
}

module.exports = Mango
