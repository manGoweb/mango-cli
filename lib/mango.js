const c = require('better-console')
const minimatch = require('minimatch')
const path = require('path')
const pkg = require('../package.json')
const semver = require('semver')
const util = require('util')
const fs = require('fs')
const gulp = require('gulp')

var Mango = module.exports = function(folder, config) {
	this.config = config || {}
	this.config.dir = folder ? path.resolve(folder) : folder
	this.config.devmode = false
	this.defaultTasks = ['styles', 'scripts', 'templates', 'images', 'sprites', 'static']
	this.checkVersion()
}


Mango.prototype.checkVersion = function() {
	if(this.config.version && !semver.satisfies(pkg.version.replace(/\-.*/i, ''), this.config.version)){
		c.error('Installed version of the mango-cli (' + pkg.version + ') doesn\'t satisfy the version specified in mango config file (' + this.config.version + ')')
		process.exit(1)
	}
}

Mango.prototype.init = function(forkTemplate, callback) {
	c.info('Initializing a new project')
	if((/^[a-z0-9_-]+\/[a-z0-9_-]+$/i).test(forkTemplate)) {
		forkTemplate = "git@github.com:" + forkTemplate + ".git"
	}
	this._forkRepository(this.config.dir, forkTemplate, function(err) {
		if(callback instanceof Function) callback(err)
	})
}

Mango.prototype._forkRepository = function(destination, remote, callback) {
	c.log('~ forking', remote, 'to', destination)

	var git = require('gift')

	git.clone(remote, destination, function(err, repo) {
		if(err) {
			c.error('Failed to clone', err)
			if(callback instanceof Function) callback(err)
			return
		}

		repo.remote_remove('origin', function(err) {
			if(err) c.error('Failed to remove origin', err)
			if(callback instanceof Function) callback(err, repo)
		})
	})
}

Mango.prototype._initRepo = function(folder, callback) {
	c.log('~ initializing empty git repo in', folder)

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

Mango.prototype.showProjectTitle = function() {
	var dir_path = require('fs').realpathSync('.')
	var dir_name = require('path').basename(dir_path)

	process.title = dir_name
}

Mango.prototype.install = function(callback) {
	c.info('Installing NPM packages')

	if(!this.config.dependencies || !this.config.dependencies.length){
		c.log('~ no dependencies to install')
		if(callback instanceof Function) callback()
		return
	}

	var nodeDir = path.resolve(this.config.dir + '/node_modules')

	try {
		fs.accessSync(nodeDir, fs.constants.F_OK) // Check if the dir exists
	} catch (err) {
		fs.mkdirSync(nodeDir) // Creating the dir so that node doesn't bubble up where we don't want it to.
		// See https://docs.npmjs.com/files/folders#more-information
	}

	// Serialize dependencies into string
	var runcmd = require('./helpers/runcmd')
	var cmd = `npm install --no-optional --prefix "${this.config.dir}/" ${this.config.dependencies.join(' ')}`
	// var cmd = `npm install --no-optional ${this.config.dependencies.join(' ')}`

	// Run in command line
	runcmd(cmd, this.config.dir, function() {
		if(callback instanceof Function) callback()
	})
}

Mango.prototype._cleanupDir = function(dir) {
	if(dir && this.config.cleanup !== false){
		c.warn('~ cleaning ' + dir + ' folder')
		var del = require('del')
		var path = require('path')
		var absDir = path.resolve(this.config.dir, dir)
		try {
			return del.sync(absDir, { force: true })
		} catch(e) {
			c.error(e)
		}
	}
	return false
}

Mango.prototype._cleanup = function() {
	var status = this._cleanupDir(this.config.dist_folder)
	status &= this._cleanupDir(this.config.dist_persistent_folder)
	return status
}

Mango.prototype.build = function(tasks, blacklistTasks, callback) {
	c.info('Building project assets for production')

	this._registerGulpTasks(gulp, tasks, blacklistTasks)

	if(!tasks || !tasks.length){
		this._cleanup()
	}

	gulp.task('compile')(callback)
}

Mango.prototype.dev = function(http_proxy, callback) {
	c.info('Starting development mode')

	this.showProjectTitle()

	gulp.on('task_stop', function (e) {
		var duration = Math.round(e.duration*10000)/10
		var duration_str = duration + ' ms'
		c.debug('~ ' + e.task + ' finished after', duration_str)
	})

	this.config.devmode = true

	if(typeof http_proxy !== 'undefined') {
		this.config.proxy = http_proxy
	}

	gulp.task('watch:scripts', require('./tasks/scripts')(gulp, this.config))

	this._registerGulpTasks(gulp, [], [ 'scripts' ])
	this._cleanup()

	gulp.series('compile', gulp.parallel('watch:scripts', 'watch:sources', 'watch:reload'))(callback)
}

Mango.prototype._task = function(name, gulp) {
	var fn = require('./tasks/' + name)(gulp, this.config)
	gulp.task(name, fn)
	return name
}

Mango.prototype._registerGulpTasks = function(gulp, whitelist, blacklist) {
	// Filter tasks not on whitelist or with missing config entry
	var activeTasks = this.defaultTasks
		.filter(function (task) {
			if(whitelist && whitelist.length) {
				return whitelist.indexOf(task) != -1 ? task : false
			} else {
				return task
			}
		})
		.filter(function(task) {
			if(blacklist && blacklist.length) {
				return blacklist.indexOf(task) != -1 ? false : task
			} else {
				return task
			}
		})
		.filter(function(task) {
			if(this.config[task]){
				return this._task(task, gulp)
			}
			return false
		}, this)

	this._task('buildstamp', gulp)

	// Watch tasks
	var watcher = this._watch.bind(this)
	gulp.task('watch:reload', require('./tasks/watch_reload')(gulp, this.config, watcher))
	gulp.task('watch:sources', require('./tasks/watch_sources')(gulp, this.config, watcher))

	// Join build tasks together
	// If using whitelist and buildstamp not present
	if((whitelist && whitelist.length && whitelist.indexOf('buildstamp') == -1) || (blacklist && blacklist.length && blacklist.indexOf('buildstamp') != -1)) {
		gulp.task('compile', gulp.parallel(activeTasks))
	} else {
		gulp.task('compile', gulp.series(gulp.parallel(activeTasks), 'buildstamp'))
	}
}

// Single watch instance with multiple subscribers
Mango.prototype._watch = function(glob, callback) {
	var basedir = this.config.dir

	if(!this.watcher){
		var chokidar = require('chokidar')
		this.watcher = chokidar.watch(basedir, {
			ignored: /[\/\\]\./,
			ignoreInitial: true,
			persistent: true,
			ignorePermissionErrors: true,
			usePolling: false,
		})
	}

	this.watcher.on('all', function(event, filepath) {
		var rel = path.relative(basedir, filepath)

		if(minimatch(rel, glob)){
			callback(rel)
		}
	})

	return this.watcher
}
