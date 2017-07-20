var c = require('better-console')
var jf = require('jsonfile')
var path = require('path')

/**
 * Reads data from external JSON files
 *
 * @param  {[type]} value [description]
 * @return {object}       data
 */
module.exports = function resolveData(value) {
	var resolve = null

	if(typeof value == 'string' && ~value.indexOf('.json')) {
		resolve = jf.readFileSync(path.resolve(config.dir, value), { throws: false })

		if(resolve === null) {
			c.error('Error in JSON data parsing for file ' + value)
		}

	} else if (typeof value == 'object') {
		resolve = value
	}

	return resolve
}