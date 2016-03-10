var jf = require('jsonfile')

var Json = {}

Json.getExtension = function () {
	return 'json'
}

Json.get = function (path) {
	return jf.readFileSync(path, { throws: true })
}

Json.save = function (path, config) {
	jf.spaces = 2 // set proper formatting
	jf.writeFile(path, config, function (err) {
		if(err) throw err
	})
}

module.exports = Json
