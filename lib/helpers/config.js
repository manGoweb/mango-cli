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
		"sprites": null,
		"buildstamp": null,
		"dependencies": null,
		"watch": null
	}
	this.parsers = [Yaml, Json]
}

Config.prototype._getParsedConfig = function (local) {
	var baseFilename = local ? CONFIG_FILENAME_LOCAL : CONFIG_FILENAME
	var returning = null
	this.parsers.forEach(function(parser) {
		parser.getExtensions().forEach(function (extension) {
			var resolvedPath = path.resolve(this.dir, baseFilename + '.' + extension)
			if(!returning && fs.existsSync(resolvedPath)) {
				returning = parser.get(resolvedPath)
			}
		}.bind(this))
	}.bind(this))
	if(returning) return returning
}

/**
 * Get config object
 * @param  {boolean} filter local config
 * @return {Object} config object
 */
Config.prototype.get = function(filterLocal, reuseBuildstamp) {
	var k
	var config = {}
	var config_main
	var config_local

	try {
		config_main = this._getParsedConfig(false)
		config_local = this._getParsedConfig(true)
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

	if (config.src_folder === '.') {
		config.src_folder = this.dir
	}

	config.dist_folder = path.resolve(this.dir + '/' + config.dist_folder)

	if(reuseBuildstamp) {
		try {
			config.stamp = fs.readFileSync(config.dist_folder + '/.buildstamp.txt').toString().trim()
		} catch (e) {
			log.error('Failed to load .buildstamp.txt file from ' + config.dist_folder)
			process.exit(1)
		}
	} else {
		config.stamp = (Date.now() / 1000 | 0) + '-'
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

	// Find correct extension & parser
	var done = false
	this.parsers.forEach(function(parser) {
		parser.getExtensions().forEach(function (extension) {
			var resolvedPath = path.resolve(this.dir, CONFIG_FILENAME + '.' + extension)
			if(!done && fs.existsSync(resolvedPath)) {
				// Write to file
				parser.save(resolvedPath, config)
				done = true
			}
		}.bind(this))
	}.bind(this))

	if(!done) {
		log.error('No config found to write to.')
	}
}
