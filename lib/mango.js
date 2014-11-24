var c = require('better-console')
var notify = require('gulp-notify')


var Mango = module.exports = function(folder, config) {
	this.config = config
	this.config.dir = folder
	this.config.src_dir = folder
	this.config.devmode = false
}


Mango.prototype.init = function(forkTemplate) {
	this._forkRepository(this.config.dir, forkTemplate, function() {
		c.info('init done')
	})
}

Mango.prototype._forkRepository = function(destination, remote, callback) {
	c.log('Forking', remote, 'to', destination)

	var git = require('gift')

	git.clone(remote, destination, function(err, repo) {
		if(err) {
			return c.error('Failed to clone', err)
		}

		repo.remote_remove('origin', function(err) {
			if(err) {
				return c.error('Failed to remove origin', err)
			}
			c.info('Repository forked')
			if(typeof callback === 'function') {
				callback(repo)
			}
		})
	})
}

Mango.prototype._initRepo = function(folder, callback) {
	c.log('Initializing empty git repo in', folder)

	var fs = require('fs')
	var git = require('gift')

	if(!fs.existsSync(folder)) {
		fs.mkdirSync(folder)
	}

	git.init(folder, function(err, repo) {
		if(err) {
			return c.error('Failed git repo initialization', err)
		}
		c.info('Repository initialized')
		if(typeof callback === 'function') callback(repo)
	})
}

Mango.prototype.install = function() {
	c.log('Installing NPM packages')

	var npm = require('npm')

	npm.load(function(err){
		if(err) {
			return c.error('Failed loading NPM package.json', err)
		}
		npm.on('log', console.log)

		npm.commands.install(this.config.dir, this.config.dependencies, function(err, data) {
			if(err) {
				return c.error('Failed installing packages', err)
			}
		})
	}.bind(this))
}

Mango.prototype._cleanup = function() {
	if(this.config.dist_folder){
		c.log('Cleaning dist folder')
		var del = require('del')
		var path = require('path')
		var dir = path.resolve(this.config.dir, this.config.dist_folder)
		return del.sync(dir)
	}
	return false
}

Mango.prototype.build = function(tasks) {
	c.info('Building project assets for production')
	var gulp = require('gulp')

	this._registerGulpTasks(gulp)
	this._cleanup()

	gulp.start('compile')
}

Mango.prototype.dev = function(http_proxy) {
	c.info('Starting development mode and watching for assets change')
	var gulp = require('gulp')
	var runSequence = require('run-sequence')

	this.config.devmode = true

	if(typeof http_proxy !== 'undefined') {
		this.config.proxy = http_proxy
	}

	this._registerGulpTasks(gulp)
	this._cleanup()

	runSequence('compile', [ 'watch:sources', 'watch:reload' ])
}

Mango.prototype._registerGulpTasks = function(gulp) {
	gulp.task('styles', require('./tasks/styles')(gulp, this.config))
	gulp.task('scripts', require('./tasks/scripts')(gulp, this.config))
	gulp.task('images', require('./tasks/images')(gulp, this.config))
	gulp.task('templates', require('./tasks/templates')(gulp, this.config))

	gulp.task('watch:sources', require('./tasks/watch_sources')(gulp, this.config))
	gulp.task('watch:reload', require('./tasks/watch_reload')(gulp, this.config))

	gulp.task('compile', ['styles', 'scripts', 'templates', 'images'])
}
