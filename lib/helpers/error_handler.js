module.exports = function(error) {
	var notify = require('gulp-notify')

	console.log(error.__prototype__)

	notify.onError({ sound: 'Beep' })(error)

	this.emit('end')
}
