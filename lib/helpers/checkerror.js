module.exports = function(error) {
	if(error) {
		console.error(error.toString())
		process.exit(1)
	}
}