var Js = {}

Js.getExtensions = function () {
	return ['js']
}

Js.get = function (path) {
	return require(path)
}

Js.save = function (path, config) {
	throw new Error('Saving the JS config is not supported.')
}

module.exports = Js
