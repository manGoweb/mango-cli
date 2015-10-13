module.exports = function(gulp, config, watch) {

	return function(done) {
		var c = require('better-console')
		c.info('Starting BrowserSync server...')

		var browsersync = require('browser-sync')
		var compress = require('compression')
		var fs = require('fs')

		var bsOptions = config.browsersync || {}

		// Switch between proxy and server modes
		if(config.proxy) {
			bsOptions.proxy = config.proxy
		} else if(config.snippet) {
			// snippet mode
		} else {
			bsOptions.server = {
				baseDir: config.dist_folder,
				middleware: [compress()]
			}
		}

		bsOptions.logLevel = bsOptions.logLevel || "silent"

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
			var snippet_filename = config.snippetFilename;
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

		// var options = {
		// 	base: config.dir,
		// 	read: false,
		// 	interval: 500
		// }

		var changeHandler = function(filepath) {
			// ignore *.map files
			if(filepath.substr(-4) === '.map') {
				return false
			}
			// files only
			if(!fs.existsSync(filepath) || !fs.lstatSync(filepath).isFile()) {
				return false
			}
			c.log('~ changed: ' + filepath)
			browsersync.reload(filepath)
		}

		for(var k in glob) {
			watch(glob[k], changeHandler)
		}

		done()
	}
}
