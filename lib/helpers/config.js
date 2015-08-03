var jf = require('jsonfile')
var log = require('better-console')
var path = require('path')

var CONFIG_FILENAME = 'mango.json'
var CONFIG_FILENAME_LOCAL = 'mango.local.json'


/**
 * Config helper
 *
 * @param  {string} path to a folder with the config file
 */
var Config = module.exports = function(folder) {
	this.dir = folder || process.cwd()
	this.defaults = {
		"src_folder": ".",
		"dist_folder": "dist",
		"styles": null,
		"scripts": null,
		"images": null,
		"static": null,
		"templates": null,
		"dependencies": null,
		"watch": null
	}
}

/**
 * Get config object
 * @param  {boolean} filter local config
 * @return {Object} config object
 */
Config.prototype.get = function(filterLocal) {
	var k
	var config = {}
	var config_main
	var config_local

	try {
		config_main = jf.readFileSync(path.resolve(this.dir, CONFIG_FILENAME), { throws: true })
		config_local = jf.readFileSync(path.resolve(this.dir, CONFIG_FILENAME_LOCAL), { throws: false })
	} catch(e){
		log.error('Config file in invalid format: ', e.message)
	}

	if(!config_main){
		log.error('Cannot load the config file mango.json')
		process.exit(1)
	}

	if(this.defaults) {
		for(k in this.defaults) {
			config[k] = this.defaults[k]
		}
	}

	if(config_main) {
		for(k in config_main) {
			config[k] = config_main[k]
		}
	}

	if(config_local) {
		for(k in config_local) {
			config[k] = config_local[k]
		}
	}

	return config
}

/**
 * Save config state to file
 * @param  {Object} config state to save
 */
Config.prototype.save = function(config) {
	// Filter out null values
	for(var prop in config){
		if(config.hasOwnProperty(prop) && !config[prop]){
			delete config[prop];
		}
	}
	// Write to file
	jf.spaces = 2 // set proper formatting
	jf.writeFile(path.resolve(this.dir, CONFIG_FILENAME), config, function (err) {
		if(err) log.error(err)
	})
}