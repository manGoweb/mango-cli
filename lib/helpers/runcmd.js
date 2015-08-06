var checkError = require('./checkerror')

/**
 * Runs custom commnad
 *
 * @param  {string}   cmd      [description]
 * @param  {string}   dir      [description]
 * @param  {Function} callback [description]
 */
module.exports = function(cmd, dir, callback) {
	var exec = require('child_process').exec
	exec(cmd, { cwd: dir || process.cwd() }, function puts(error, stdout, stderr) {
		console.log(stdout)
		checkError(error)
		if(callback) callback()
	})
}