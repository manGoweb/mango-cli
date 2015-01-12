
module.exports = function(gulp, config) {

	return function(done) {
		if(!config.patternlab) return done()
		var c = require('better-console')
		c.info('~ patternlab watch')

		var glob = []

		var options = {
			base: config.dir,
			read: false
		}

		if(config.patternlab.patterns.source) glob.push(config.patternlab.patterns.source + '/**/*.{html,hbs,mustache,json}')
		if(config.patternlab.patterns.data) glob.push(config.patternlab.patterns.data)
		if(config.patternlab.patterns.listitems) glob.push(config.patternlab.patterns.listitems)
		if(config.patternlab.styleguide) glob.push(config.patternlab.styleguide + '/**')

		return gulp.watch(glob, options, ['patternlab'])
	}

}