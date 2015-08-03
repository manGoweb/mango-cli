/**
 * Remove duplicates from an array
 *
 * @param  {Array} array
 * @return {Array}       new array with unique values
 */
module.exports = function(array) {
	return array.reduce(function(accum, current) {
			if (accum.indexOf(current) < 0) {
					accum.push(current)
			}
			return accum
	}, [])
}