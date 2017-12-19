var notifier = require('node-notifier')
var path = require('path')
var pkg = require('../../package.json')

var notify = function(title, message, type) {
	notifier.notify({
		appName: pkg.config.appId,
		icon: path.join(__dirname, 'icons', type+'.png'),
		message: message,
		sound: type==='failure',
		title: title || 'mango-cli',
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
				notify(error.plugin, error.message, 'failure') // New error found
			} else {
				notify(error.plugin, error.message, 'warning') // Still not fixed
			}

			this.emit('end')
		},
		done: function() {
			if (errorLast && !errorCurrent) { // Notify error fixed
				console.log('Error fixed')
				notify(errorLast.plugin, 'Fixed', 'success')
			}

			errorLast = errorCurrent
			errorCurrent = false // Reset for next build
		}
	}
}
