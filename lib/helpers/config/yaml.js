var fs = require('fs')
var yaml = require('js-yaml')

var Yaml = {}

Yaml.getExtension = function () {
	return 'yaml'
}

Yaml.get = function (path) {
	return yaml.load(fs.readFileSync(path, { throws: true }))
}

Yaml.save = function (path, config) {
	fs.writeFile(path, yaml.dump(config), function (err) {
		throw err
	})
}

module.exports = Yaml
