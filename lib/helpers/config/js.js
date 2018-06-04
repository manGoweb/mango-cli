var _ = require('lodash')

var Js = {}

Js.getExtensions = function () {
	return ['js']
}

Js.get = async function (path) {
	const config = require(path)
	return _.isFunction(config) ? await config() : config
}

Js.save = function (path, config) {
	throw new Error('Saving the JS config is not supported.')
}

module.exports = Js
