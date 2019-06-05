const path = require('path')

module.exports = function(gulp, config, watch) {

	return function(done) {
		var c = require('better-console')
		c.info('Starting BrowserSync server...')

		var browsersync = require('browser-sync').create()
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
		browsersync.init(bsOptions, function(err, bs) {
			var snippet_filename = path.resolve(config.dist_folder, '.mango-snippet.html');
			if(config.snippet) {
				require('fs').writeFile(snippet_filename, bs.getOption('snippet'), function(){
					process.on('exit', function(){
						require('fs').unlinkSync(snippet_filename)
					})
				})
			}
			if(!err){
				c.warn(`Server started on ${bs.options.get('urls').get('local')}, kill it with CTRL+C when you're done`)
			}
		})

		// Now configude watch task
		var subtractPaths = require('../helpers/subtractPaths')
		var distFolderRelative = subtractPaths(config.dist_folder, config.dir)

		var glob = [ distFolderRelative + '/**/*.*' ]

		if(config.watch) {
			glob = glob.concat(config.watch)
		}

		// var options = {
		// 	base: config.dir,
		// 	read: false,
		// 	interval: 500
		// }

		var changeHandler = function(filepath) {
			// ignore *.map and *.gz files
			if(~filepath.search(/\.(map|gz)$/i)) {
				return false
			}

			// files only
			try {

				if(!fs.existsSync(filepath) || !fs.lstatSync(filepath).isFile()) {
					return false
				}
				c.log('~ changed: ' + filepath)
				browsersync.reload(filepath)

			} catch(e) {
				c.error(e)
			}
		}

		for(var k in glob) {
			watch(glob[k], changeHandler)
		}

		done()
	}
}
