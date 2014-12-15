
module.exports = function(gulp, config) {

	return function(done) {
		if(!config.patternlab) return done()
		var c = require('better-console')
		c.info('~ patternlab')

		try {
			var patternlab = require('../../node_modules/patternlab-node/builder/patternlab.js')()

			// Configure the Pattern Lab
			patternlab.configure(config.patternlab)

			// Build a styleguide
			patternlab.build()

		} catch(e) {
			c.error(e)
		}

		done()
	}

}