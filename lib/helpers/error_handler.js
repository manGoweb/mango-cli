var chalk = require('chalk')
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

var printError = function(err) {
	console.log('\n')

	let description = err.messageFormatted || err.message || err.status || err
	if (err.name) {
		description = `${err.name}: ${description}`
	}
	const message = err.plugin ? `(${err.plugin}) ${description}` : description

	console.log(chalk.bold.red(`[!] ${chalk.bold(message)}`))

	if (err.url) {
		console.log(chalk.cyan(err.url))
	}

	// Path and location in the file
	if (err.loc) {
		console.log(`${path.relative(process.cwd(), err.loc.file || err.id )} (${err.loc.line}:${err.loc.column})`)
	} else if(err.line && err.columng && err.file) {
		console.log(`${path.relative(process.cwd(), err.file)} (${err.line}:${err.column})`)
	} else if (err.id) {
		console.log(path.relative(process.cwd(), err.id ))
	}

	// Code
	if(!err.messageFormatted && err.frame) {
		console.log(chalk.dim(err.frame))
	}

	console.log('\n')
}


module.exports = function(){
	var errorLast // Error object from last build
	var errorCurrent // Error object from current build

	return {
		fail: function(error) {
			printError(error)
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
				console.log(chalk.green('/> Error fixed'))
				notify(errorLast.plugin, 'Fixed', 'success')
			}

			errorLast = errorCurrent
			errorCurrent = false // Reset for next build
		}
	}
}
