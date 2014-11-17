var fs = require('fs')
var log = require('better-console')

// var duo = require('duo')
// var gulp = require('duo-gulp')


var Mango = function(){
	
}

Mango.prototype.init = function(folder, name, forkTemplate) {
	var git = require('gift')
	
	this._forkRepo(git, forkTemplate, folder, function(repo){
		
	})
	
}

Mango.prototype._forkRepo = function(git, remote, folder, callback){
	log.info('Forking a git repository ' + remote + ' to ' + folder)
	
	git.clone(remote, folder, function(err, repo){
		if(err) return log.error('Failed to clone a template repository', err)
		
		repo.remote_remove('origin', function(err){
			if(err) return log.error('Failed to remove the remote origin', err)
			log.log('Repository forked')
			callback(repo)
		})
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
		callback(repo)
	})
}




module.exports = Mango