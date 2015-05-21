var checkError = require('./checkerror')

module.exports = function(cmd) {
	var exec = require('child_process').exec
	exec(cmd, function puts(error, stdout, stderr) {
		console.log(stdout)
		checkError(error)
	})
}