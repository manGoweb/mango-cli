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
var Config = module.exports = function(folder, custompath) {
	this.dir = folder || process.cwd()
	this.custompath = custompath
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

/**
 * Get parser and resolved path
 * @param {boolean} local Take local config or general one
 * @return {object|null}
 */
Config.prototype._getParser = function (local) {
	var baseFilename = local ? CONFIG_FILENAME_LOCAL : CONFIG_FILENAME
	var returning = null
	this.parsers.forEach(function(parser) {
		parser.getExtensions().forEach(function (extension) {
			var resolvedPath = path.resolve(this.dir, baseFilename + '.' + extension)
			if(!returning && fs.existsSync(resolvedPath)) {
				returning = {
					parser: parser,
					path: resolvedPath
				}
			}
		}.bind(this))
	}.bind(this))
	if(returning) return returning
}

Config.prototype._getParsedConfig = function (local) {
	var parser = this._getParser(local)
	return parser ? parser.parser.get(parser.path) : null
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
		if(!this.custompath) {
			config_main = this._getParsedConfig(false)
			config_local = this._getParsedConfig(true)
		} else {
		// If passed directly, don't look anywhere else
			config_main = this._getCustom(this.custompath)
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

Config.prototype._getCustom = function(custompath) {
	var resolvedPath = path.resolve(this.dir, custompath)
	var parsedPath = path.parse(resolvedPath)
	var parser = null

	this.parsers.forEach((_parser) => {
		if(~_parser.getExtensions().indexOf(parsedPath.ext.substr(1))) {
			parser = _parser
			return false
		}
	})

	if(!parser) throw new Error('Cannot read custom config file')

	return parser.get(resolvedPath)

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
	var parser = this._getParser(false)
	if(parser) {
		parser.parser.save(parser.path, config)
	} else {
		log.error('No config found to write to.')
	}
}
