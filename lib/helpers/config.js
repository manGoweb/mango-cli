var log = require('better-console')
var path = require('path')
var fs = require('fs')

var Yaml = require('./config/yaml')
var Json = require('./config/json')

var CONFIG_FILENAME = 'mango'
var CONFIG_FILENAME_LOCAL = 'mango.local'


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
	var parsers = [Yaml, Json]
	this.parser = this._getParser(parsers)
}

/**
 * Decide which parser will be used
 * @return {Object} parser
 */
Config.prototype._getParser = function(parsers) {
	var returning = null
	parsers.forEach((function(parser) {
		if(fs.existsSync(path.resolve(this.dir, CONFIG_FILENAME + '.' + parser.getExtension()))) returning = parser
	}).bind(this))
	if(returning) return returning
	log.error('Cannot find mango config file')
	process.exit(1)
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
		config_main = this.parser.get(path.resolve(this.dir, CONFIG_FILENAME + '.' + this.parser.getExtension()))

		var localPath = path.resolve(this.dir, CONFIG_FILENAME_LOCAL + '.' + this.parser.getExtension())
		if(fs.existsSync(localPath)) {
			config_local = this.parser.get(localPath)
		}
	} catch (e) {
		log.error('Config file in invalid format: ', e.message)
	}

	if(!config_main){
		log.error('Cannot load the config file mango.json or mango.yaml')
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

	if(config_local && (filterLocal === undefined || filterLocal !== true)) {
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
	var config_path = path.resolve(this.dir, CONFIG_FILENAME + '.' + this.parser.getExtension())
	this.parser.save(config_path)
}
