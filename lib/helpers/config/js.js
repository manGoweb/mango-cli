var _ = require('lodash')

var Js = {}

Js.getExtensions = function () {
	return ['config.js']
}

Js.get = async function (path) {
	const config = require(path)

	if(_.isFunction(config)) {
		return await config()
	}

	return config
}

Js.save = function (path, config) {
	throw new Error('Saving the JS config is not supported.')
}

module.exports = Js
