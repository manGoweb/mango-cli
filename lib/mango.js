var c = require('better-console')
var minimatch = require('minimatch')
var path = require('path')
var pkg = require('../package.json')
var semver = require('semver')
var util = require('util')
var fs = require('fs')

var Mango = module.exports = function(folder, config) {
	this.config = config || {}
	this.config.dir = folder ? path.resolve(folder) : folder
	this.config.devmode = false
	this.defaultTasks = ['styles', 'scripts', 'templates', 'patternlab', 'images', 'sprites', 'static']
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

	var runcmd = require('./helpers/runcmd')
	var cmd = 'npm install --no-optional '

	// Serialize dependencies into string
	cmd += this.config.dependencies.join(' ')

	// Run in command line
	runcmd(cmd, this.config.dir, function() {
		if(callback instanceof Function) callback()
	})
}

Mango.prototype._cleanup = function() {
	if(this.config.dist_folder && this.config.cleanup !== false){
		c.warn('~ cleaning dist folder')
		var del = require('del')
		var path = require('path')
		var dir = path.resolve(this.config.dir, this.config.dist_folder)
		try {
			return del.sync(dir, { force: true })
		} catch(e) {
			c.error(e)
		}
	}
	return false
}

Mango.prototype.build = function(tasks, callback) {
	c.info('Building project assets for production')
	var gulp = require('gulp')

	this._registerGulpTasks(gulp)

	if(!tasks || !tasks.length){
		tasks = 'compile'
		this._cleanup()
	}

	gulp.start(tasks, callback)
}

Mango.prototype.dev = function(http_proxy, callback) {
	c.info('Starting development mode')

	this.showProjectTitle()

	var gulp = require('gulp')
	var runSequence = require('run-sequence').use(gulp)
	var gutil = require('gulp-util')

	gulp.on('task_stop', function (e) {
		var duration = Math.round(e.duration*10000)/10
		var duration_str = duration + ' ms'

		if(duration > 2000) {
			duration_str = gutil.colors.yellow.bgRed(duration_str)
		} else if(duration > 1000) {
			duration_str = gutil.colors.yellow(duration_str)
		}
		c.debug('~ ' + e.task + ' finished after', duration_str)
	})

	this.config.devmode = true

	if(typeof http_proxy !== 'undefined') {
		this.config.proxy = http_proxy
	}

	this._registerGulpTasks(gulp)
	this._cleanup()

	runSequence('compile', [ 'watch:sources', 'watch:reload', 'watch:patternlab' ], callback)
}

Mango.prototype._task = function(name, gulp) {
	var fn = require('./tasks/' + name)(gulp, this.config)
	return gulp.task(name, fn)
}

Mango.prototype._registerGulpTasks = function(gulp) {
	// Filter tasks with missing config entry
	var activeTasks = this.defaultTasks.filter(function(task) {
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

	// Filter patternlab watch if config is missing
	var patternlab_watch
	if(this.config.patternlab){
		patternlab_watch = require('./tasks/patternlab_watch')(gulp, this.config, watcher)
	} else {
		patternlab_watch = function(done) { done() }
	}
	gulp.task('watch:patternlab', patternlab_watch)

	// Join build tasks together
	var runSequence = require('run-sequence').use(gulp)
	gulp.task('compile', function(callback) {
		runSequence(activeTasks, 'buildstamp', callback)
	})
}

// Single watch instance with multiple subscribers
Mango.prototype._watch = function(glob, callback) {
	var basedir = this.config.dir

	if(!this.watcher){
		var chokidar = require('chokidar')
		this.watcher = chokidar.watch(basedir, {
			ignored: /[\/\\]\./,
			ignoreInitial: true,
			persistent: true
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
