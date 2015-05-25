var checkError = require('./checkerror')

module.exports = function(cmd, dir) {
	var exec = require('child_process').exec
	exec(cmd, { cwd: dir || process.cwd() }, function puts(error, stdout, stderr) {
		console.log(stdout)
		checkError(error)
	})
}