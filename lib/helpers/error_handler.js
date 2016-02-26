var notifier = require('node-notifier')
var notify = function(title, message, type) {
	notifier.notify({
		title: title || 'mango-cli',
		message: message,
		sound: type==='fail' // Sound only on error
	})
}

module.exports = function(){
	var errorLast // Error object from last build
	var errorCurrent // Error object from current build

	return {
		fail: function(error) {
			console.error('\n'+error.toString()+'\n')
			errorCurrent = error

			if (JSON.stringify(error) !== JSON.stringify(errorLast)) {
				notify(error.plugin, error.message, 'fail') // New error found
			} else {
				notify(error.plugin, error.message, 'warn') // Still not fixed
			}

			this.emit('end')
		},
		done: function() {
			if (errorLast && !errorCurrent) { // Notify error fixed
				console.log('Error fixed')
				notify(errorLast.plugin, 'Error fixed', 'success')
			}

			errorLast = errorCurrent
			errorCurrent = false // Reset for next build
		}
	}
}