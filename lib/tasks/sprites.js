
module.exports = function(gulp, config) {

	return function(done) {
		if(!config.sprites) return done()
		var c = require('better-console')
		c.info('~ sprites')

		var path = require('path')
		var plumber = require('gulp-plumber')
		var svgSprite = require('gulp-svg-sprite')
		var merge = require('merge-stream')

		var tasks = merge()

		for(var i = 0; i < config.sprites.length; i++) {
			(function() {
			var prefix = config.sprites[i].name
			var generator = (function(name) {
				var namePath = name.split(path.sep)
				var fileName = namePath[namePath.length - 1].split('.')
				fileName.pop() // Remove file extension
				var id = 'shape-' + (prefix ? prefix + '-' : '') + fileName.join('.')
				return id

			}).bind(prefix)
			var task = gulp.src(config.sprites[i].path, { base: config.src_folder, cwd: config.dir })
				.pipe(svgSprite({
					svg: {
						rootAttributes: {
							'xmlns': 'http://www.w3.org/2000/svg',
							'xmlns:xlink': 'http://www.w3.org/1999/xlink'
						}
					},
					shape: {
						id: {
							generator: generator
						}
					},
					mode: {
						symbol: {
							inline: true,
							dest: 'sprites',
							sprite: 'shapes' + (config.sprites[i].name ? '-' + config.sprites[i].name : '')
						}
					}
				}))

				if(config.devmode){
					task = task.pipe(plumber({ errorHandler: require('../helpers/error_handler') }))
				}
				tasks.add(task.pipe(gulp.dest(config.dist_folder)))
				})()
		}

		return tasks
	}
}
