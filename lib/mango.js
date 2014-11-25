var c = require('better-console')


var Mango = module.exports = function(folder, config) {
	this.config = config || {}
	this.config.dir = folder
	this.config.src_dir = folder
	this.config.devmode = false
}


Mango.prototype.init = function(forkTemplate, callback) {
	this._forkRepository(this.config.dir, forkTemplate, function(err) {
		c.info('init done')
		if(callback instanceof Function) callback(err)
	})
}

Mango.prototype._forkRepository = function(destination, remote, callback) {
	c.log('Forking', remote, 'to', destination)

	var git = require('gift')

	git.clone(remote, destination, function(err, repo) {
		if(err) {
			c.error('Failed to clone', err)
			if(callback instanceof Function) callback(err)
			return
		}

		repo.remote_remove('origin', function(err) {
			if(err) c.error('Failed to remove origin', err)
			c.info('Repository forked')
			if(callback instanceof Function) callback(err, repo)
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
			c.error('Failed git repo initialization', err)
		}
		c.info('Repository initialized')
		if(callback instanceof Function) callback(err, repo)
	})
}

Mango.prototype.install = function(callback) {
	c.log('Installing NPM packages')

	var npm = require('npm')

	npm.load(function(err){
		if(err) {
			c.error('Failed loading NPM package.json', err)
			if(callback instanceof Function) callback(err)
			return
		}

		npm.on('log', console.log)

		npm.commands.install(this.config.dir, this.config.dependencies, function(err, data) {
			if(err) c.error('Failed installing packages', err)
			if(callback instanceof Function) callback(err)
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

Mango.prototype.build = function(tasks, callback) {
	c.info('Building project assets for production')
	var gulp = require('gulp')

	this._registerGulpTasks(gulp)
	this._cleanup()

	gulp.start('compile', callback)
}

Mango.prototype.dev = function(http_proxy, callback) {
	c.info('Starting development mode and watching for assets change')
	var gulp = require('gulp')
	var runSequence = require('run-sequence')

	this.config.devmode = true

	if(typeof http_proxy !== 'undefined') {
		this.config.proxy = http_proxy
	}

	this._registerGulpTasks(gulp)
	this._cleanup()

	runSequence('compile', [ 'watch:sources', 'watch:reload' ], callback)
}

Mango.prototype._registerGulpTasks = function(gulp) {
	gulp.task('styles', require('./tasks/styles')(gulp, this.config))
	gulp.task('scripts', require('./tasks/scripts')(gulp, this.config))
	gulp.task('images', require('./tasks/images')(gulp, this.config))
	gulp.task('templates', require('./tasks/templates')(gulp, this.config))
	gulp.task('static', require('./tasks/static')(gulp, this.config))

	gulp.task('watch:sources', require('./tasks/watch_sources')(gulp, this.config))
	gulp.task('watch:reload', require('./tasks/watch_reload')(gulp, this.config))

	gulp.task('compile', ['styles', 'scripts', 'templates', 'images', 'static'])
}
