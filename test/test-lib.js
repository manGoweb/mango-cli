var del = require('del')
var fs = require('fs')
var os = require('os')
var path = require('path')
var should = require('should')

var tmpDir = `${os.tmpdir()}${path.sep}`

var TEMP = fs.mkdtempSync(tmpDir)

var cleanup = function() {
	del.sync([TEMP], { force: true })
}

describe('Mango class', function() {
	var Mango = require('../lib/mango')
	var Config = require('../lib/helpers/config')

	describe('should create a new instance', function() {

		it('with no arguments', function() {
			new Mango()
		})

		it('with only the folder argument', function() {
			new Mango(process.cwd())
		})

		it('with a folder argument and an empty object as the config parameter', function() {
			new Mango(process.cwd(), {})
		})

	})

	describe('should in a temp directory', function() {
		var mango

		before(cleanup)

		it('init a template', function(done) {
			this.timeout(15000)
			var pkg = require('../package')
			mango = new Mango(TEMP)
			mango.init(pkg.config.default_fork_repo, done)
		})

		it('read the configuration file', function() {
			var config = new Config(TEMP)
			mango = new Mango(TEMP, config.get())
		})

		it('install dependencies', function(done) {
			this.timeout(60000)
			mango.install(done)
		})

		it('run the production build task', function(done) {
			this.timeout(120000)
			mango.build([], [], done)
		})

		after(cleanup)
	})


})