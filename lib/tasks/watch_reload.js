module.exports = function(gulp, config) {

	return function(done) {
		var c = require('better-console')
		c.info('watch reload')

		var browsersync = require('browser-sync')
		var fs = require('fs')
		var watch = require('gulp-watch')
		var filter = require('gulp-filter')

		var options = {}

		if(config.proxy) {
			options.proxy = proxy
		} else {
			options.server = { baseDir: config.dist_folder }
		}

		browsersync(options)

		// create dist_folder if not exists
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

		var glob = [config.dist_folder + '/**/*.*']
		if(config.watch) glob.concat(config.watch)

		var handleReloadFile = function(file) {
			// files only
			if(!fs.existsSync(file.path) || !fs.lstatSync(file.path).isFile()) {
				return false
			}
			c.log('- handling reload', file.path)
			browsersync.reload(file.path)
		}

		return watch(glob).pipe(filter(handleReloadFile))
	}
}