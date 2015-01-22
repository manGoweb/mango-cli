
module.exports = function(gulp, config, watch) {

	return function(done) {
		if(!config.patternlab) return done()
		var c = require('better-console')
		c.info('WATCH: patternlab')

		// Watch patterns
		watch(config.patternlab.patterns.source + '/**/*.{html,hbs,mustache,json}', function() {
			gulp.start('patternlab')
		})

		// Watch styleguide template
		watch(config.patternlab.styleguide + '/**', function() {
			gulp.start('patternlab')
		})

		done()
	}

}