var should = require('should')
var del = require('del')

var TEMP = 'test/temp'
var EXAMPLE = 'example/frontbase/dist'

var cleanup = function() {
	del.sync([TEMP, EXAMPLE])
}

describe('Mango class', function() {
	var Mango = require('../lib/mango')

	describe('should create a new instance', function() {

		it('with no arguments', function() {
			new Mango()
		})

		it('with only the folder argument', function() {
			new Mango(process.cwd)
		})

		it('with a folder argument and an empty object as the config parameter', function() {
			new Mango(process.cwd, {})
		})

	})

	describe('should in a temp directory', function() {

		before(cleanup)

		it('init a template', function(done) {
			this.timeout(15000)
			var pkg = require('../package')
			var mango2 = new Mango(TEMP, require('../example/frontbase/mango'))
			mango2.init(pkg.config.default_fork_repo, done)
		})

		after(cleanup)
	})

	describe('should in the example directory', function() {
		var mango

		before(cleanup)

		it('read the configuration file', function() {
			mango = new Mango('example/frontbase', require('../example/frontbase/mango'))
		})

		it('install dependencies', function(done) {
			this.timeout(15000)
			mango.install(done)
		})

		it('run the production build task', function(done) {
			this.timeout(15000)
			mango.build([], done)
		})


		// it('run development mode task', function() {
		// 	mango.dev()
		// })

		after(cleanup)
	})


})