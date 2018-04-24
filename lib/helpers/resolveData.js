var c = require('better-console')
var fs = require('fs')
var jf = require('jsonfile')
var path = require('path')
var yaml = require('js-yaml')

var REjson = /\.json$/i
var REyaml = /\.ya?ml$/i

/**
 * Reads data from external JSON files
 *
 * @param  {[type]} value [description]
 * @return {object}       data
 */
module.exports = function resolveData(value, config) {
	var resolve = null

	if(typeof value == 'string') {
		// Test for json extension
		if(REjson.test(value)) {
			resolve = jf.readFileSync(path.resolve(config.dir, value), { throws: false })
			if(resolve === null) {
				c.error('Error parsing JSON file ' + value)
			}
		// Test for yaml extension
		} else if(REyaml.test(value)) {
			resolve = yaml.load(fs.readFileSync(path.resolve(config.dir, value), { throws: false }))
			if(resolve === null) {
				c.error('Error parsing YAML file ' + value)
			}
		// Simple string value
		} else {
			resolve = value
		}

	// Direct value
	} else {
		resolve = value
	}

	return resolve
}
