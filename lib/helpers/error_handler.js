module.exports = function(error) {
	console.error(error.toString())

	var notifier = require('node-notifier')

	notifier.notify({
	  title: error.plugin || 'mango-cli',
	  message: error.message || 'compilation error',
	  sound: true
	})

	this.emit('end')
}
