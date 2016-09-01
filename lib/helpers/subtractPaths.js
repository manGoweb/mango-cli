var path = require('path')

/**
 * @param minuend
 * @param subtrahend
 * @returns {string}
 */
module.exports = function (minuend, subtrahend) {
	var difference = minuend.substring(subtrahend.length)

	if (difference.indexOf(path.sep) === 0) {
		difference = difference.substring(path.sep.length)
	}
	return difference
}
