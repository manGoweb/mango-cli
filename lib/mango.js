var fs = require('fs')
var log = require('better-console')
var path = require('path')


var Mango = function(){

}


Mango.prototype.init = function(folder, name, forkTemplate) {
	var git = require('gift')

	this._forkRepo(git, forkTemplate, folder, function(repo){

	})
}
Mango.prototype._forkRepo = function(git, remote, folder, callback){
	log.info('Forking a git repository ' + remote + ' to ' + folder)

	git.clone(remote, folder, function(err, repo){
		if(err) return log.error('Failed to clone a template repository', err)

		repo.remote_remove('origin', function(err){
			if(err) return log.error('Failed to remove the remote origin', err)
			log.log('Repository forked')
			callback(repo)
		})
	})
}
Mango.prototype._initRepo = function(git, folder, callback){
	log.info('Initializing an empty git repository in ' + folder)

	if(!fs.existsSync(folder)){
		log.log('Creating folder first')
		fs.mkdirSync(folder)
	}

	git.init(folder, function(err, repo){
		if(err) return log.error('Failed to initialize repository', err)
		log.log('Repository initialized')
		callback(repo)
	})
}



Mango.prototype.install = function(folder, config, packages) {
	log.info('Installing packages via NPM')

	var npm = require('npm')

	npm.load(function(err) {
		if(err) return log.error('Failed to load NPM to install packages', err)

		var pkgs = config.dependencies.concat(packages)

		npm.on("log", function (msg) {
			console.log(msg) // log the progress of the installation
		})
		npm.commands.install(folder, pkgs, function(err, data) {
			if(err) return log.error('Failed to install packages', err)
		})
	})
}



Mango.prototype.build = function(folder, config, tasks) {
	var dist = path.resolve(folder, config.dist_folder)
	var gulp = require('gulp')

	log.info('Building project assets for production to ' + dist)

	tasks = tasks.length ? tasks : ['styles', 'scripts', 'templates', 'images']

	tasks.forEach(function(task) {
		switch (task) {
			case 'styles':
				this._buildStyles(gulp, config, dist, false)
				break
			case 'scripts':
				this._buildScripts(gulp, config, dist, false)
				break
			case 'templates':
				this._buildTemplates(gulp, config, dist, false)
				break
			case 'images':
				this._buildImages(gulp, config, dist, false)
				break
		}
	}, this)
}
Mango.prototype._buildStyles = function(gulp, config, dist, development) {
	log.log('Compiling Stylus into minimized CSS')

	var cssmin = require('gulp-cssmin')
	var nib = require('nib')()
	var stylus = require('gulp-stylus')

	gulp.src(config.styles)
		.pipe(stylus({
			use: nib
		}))
		.pipe(cssmin())
		.pipe(gulp.dest(dist))
}
Mango.prototype._buildScripts = function(gulp, config, dist, development) {
	log.log('Compiling and minimizing scripts')

	var browserify = require('browserify')
	// var rename = require('gulp-rename')
	var transform = require('vinyl-transform')
	var uglify = require('gulp-uglify')
	var coffeeify = require('coffeeify')
	var reactify = require('reactify')

	var browserified = transform(function(filename) {
		var b = browserify(filename)
		b.transform(coffeeify)
		b.transform(reactify)
		return b.bundle()
	})

	gulp.src(config.scripts)
		.pipe(browserified)
		.pipe(uglify())
		.pipe(gulp.dest(dist))

}
Mango.prototype._buildTemplates = function(gulp, config, dist, development) {
	log.log('Compiling templates into HTML')

}
Mango.prototype._buildImages = function(gulp, config, dist, development) {
	log.log('Minimizing images')

	var imagemin = require('gulp-imagemin')
	var pngquant = require('imagemin-pngquant')

	gulp.src(config.images)
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))
		.pipe(gulp.dest(path.resolve(dist, 'img')))
}



Mango.prototype.dev = function(folder, config, proxy) {
	var browsersync = require('browser-sync')
	var dist = path.resolve(folder, config.dist_folder)
	var options = {}
	var gulp = require('gulp')
	var filterDist = '!' + config.dist_folder + '/**'

	log.info('Starting development mode and watching for assets change')

	if(proxy) {
		options.proxy = proxy
	} else {
		options.server = { baseDir: dist }
	}
	// Start browserSync
	browsersync(options)

	// Events and file watching
	gulp.watch(['**/*.styl', filterDist], { cwd: folder }, function(e) {
		this._buildStyles(gulp, config, dist, true)
	}.bind(this))

	gulp.watch(['**/*.js', filterDist], { cwd: folder }, function(e) {
		this._buildScripts(gulp, config, dist, true)
	}.bind(this))

	gulp.watch(['**/*.hbs', filterDist], { cwd: folder }, function(e) {
		this._buildScripts(gulp, config, dist, true)
	}.bind(this))

	gulp.watch(['**/*.jpg', '**/*.png', '**/*.svg', filterDist], { cwd: folder }, function(e) {
		this._buildScripts(gulp, config, dist, true)
	}.bind(this))

	// Reload
	gulp.watch('**', { cwd: dist }, function(e) {
		browsersync.reload(e.path)
		log.log('Reloading ' + e.path)
	})
}



module.exports = Mango
