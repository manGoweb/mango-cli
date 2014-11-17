var fs = require('fs')
var log = require('better-console')

// var duo = require('duo')
// var gulp = require('duo-gulp')


var Mango = function(){
	
}

Mango.prototype.init = function(folder, name) {
	var git = require('gift')
	
	this._initRepo(git, folder, function(){
		
	})
	
	
}

Mango.prototype._initRepo = function(git, folder, callback){
	log.info('Initializing an empty git repository in ' + folder)
	
	if(!fs.existsSync(folder)){
		log.log('Creating folder first')
		fs.mkdirSync(folder)
	}
	
	git.init(folder, function(err, repo){
		if(err) return log.error('Failed to initialize repository', err)
		log.log('Repository initialized')
		callback()
	})
}





module.exports = Mango