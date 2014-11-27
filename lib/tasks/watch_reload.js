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
			options.proxy = config.proxy
		} else {
			options.server = { baseDir: config.dist_folder }
		}

		browsersync(options)

		var glob = [config.dist_folder + '/**/*.*']
		if(config.watch) {
			glob = glob.concat(config.watch)
		}

		var handleReloadFile = function(file) {
			// files only
			if(!fs.existsSync(file.path) || !fs.lstatSync(file.path).isFile()) {
				return false
			}
			c.log('- handling reload', file.path)
			browsersync.reload(file.path)
		}

		return watch(glob, { base: config.dir, read: false }).pipe(filter(handleReloadFile))
	}
}
