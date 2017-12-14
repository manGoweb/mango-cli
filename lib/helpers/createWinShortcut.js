var os = require('os')
var pkg = require('../../package.json')

if(os.type() == 'Windows_NT') {
	console.log('Creating an app shortcut for notifications to work')
	var win_shortcut = require('node-win-shortcut')
	win_shortcut.createShortcut(process.execPath, 'node', pkg.config.appId)
	console.log('Shortcut successfully created')
}