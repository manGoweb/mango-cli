var os = require('os')

if(os.type() == 'Windows_NT') {
	console.log('Creating an app shortcut for notifications to work')

	var path = require('path')
	var pkg = require('../../package.json')
	var win_shortcut = require('node-win-shortcut')

	var toasterPath = path.join(__dirname, '../../node_modules/node-notifier/vendor/snoreToast/SnoreToast.exe')

	win_shortcut.createShortcut(toasterPath, 'mango-cli notifications', pkg.config.appId)
	console.log('Shortcut successfully created')
}