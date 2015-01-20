module.exports = function(gulp, config) {

	return function(done) {
		var c = require('better-console')
		c.info('Starting BrowserSync server...')

		var browsersync = require('browser-sync')
		var fs = require('fs')

		var bsOptions = config.browsersync || {}

		// Switch between proxy and server modes
		if(config.proxy) {
			bsOptions.proxy = config.proxy
		} else if(config.snippet) {
			// snippet mode
		} else {
			bsOptions.server = { baseDir: config.dist_folder }
		}
		// Fix for Nette debug bar
		bsOptions.snippetOptions = {
			rule: {
				match: /<body[^>]*>/i,
				fn: function (snippet, match) {
					if(match === '<body id=\\"tracy-debug\\">') {
						return match
					}
					return match + snippet;
				}
			}
		}


		// Start a browsersync server
		browsersync(bsOptions, function(err, bs) {
			var snippet_filename = '.mango-snippet.html';
			if(config.snippet) {
				require('fs').writeFile(snippet_filename, bs.getOption('snippet'), function(){
					process.on('exit', function(){
						require('fs').unlinkSync(snippet_filename)
					})
				})
			}
			if(!err){
				c.warn('Server started, kill it with CTRL+C when you\'re done')
			}
		})

		// Now configude watch task
		var glob = [ config.dist_folder + '/**/*.*' ]

		if(config.watch) {
			glob = glob.concat(config.watch)
		}

		var options = {
			base: config.dir,
			read: false
		}

		var changeHandler = function(file) {
			// files only
			if(!fs.existsSync(file.path) || !fs.lstatSync(file.path).isFile()) {
				return false
			}
			browsersync.reload(file.path)
		}

		return gulp.watch(glob, options, changeHandler)
	}
}
