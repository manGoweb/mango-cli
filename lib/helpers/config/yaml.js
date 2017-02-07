var fs = require('fs')
var yaml = require('js-yaml')

var Yaml = {}

Yaml.getExtensions = function () {
	return ['yaml', 'yml']
}

Yaml.get = function (path) {
	return yaml.load(fs.readFileSync(path, { throws: true }))
}

Yaml.save = function (path, config) {
	fs.writeFile(path, yaml.dump(config), function (err) {
		if(err) throw err
	})
}

module.exports = Yaml
