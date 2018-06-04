var del = require('del')
var fs = require('fs')
var os = require('os')
var path = require('path')
var should = require('should')

console.log('Preparing temp folder...')
var tmpDir = os.tmpdir() + path.sep
var TEMP = fs.mkdtempSync(tmpDir)
console.log('TEMP:', TEMP)

var cleanup = function() {
	console.log('Clearing temp folder...', TEMP)
	del.sync(TEMP, { force: true })
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

		it('init a template', function(done) {
			this.timeout(15000)
			var pkg = require('../package')
			mango = new Mango(TEMP)
			mango.init(pkg.config.tests_repo, done)
		})

		it('read the configuration file', async function() {
			var config = new Config(TEMP)
			mango = new Mango(TEMP, await config.get())
		})

		it('install dependencies', function(done) {
			this.timeout(60000)
			mango.install(done)
		})

		it('build scripts', function(done) {
			this.timeout(120000)
			mango.build(['scripts'], [], done)
		})

		it('build styles', function(done) {
			this.timeout(120000)
			mango.build(['styles'], [], done)
		})

		it('build static', function(done) {
			this.timeout(120000)
			mango.build(['static'], [], done)
		})

		it('build sprites', function(done) {
			this.timeout(120000)
			mango.build(['static'], [], done)
		})

		it('build templates', function(done) {
			this.timeout(120000)
			mango.build(['templates'], [], done)
		})

		it('build images', function(done) {
			this.timeout(120000)
			mango.build(['images'], [], done)
		})

		it('run the production build tasks', function(done) {
			this.timeout(120000)
			mango.build([], [], done)
		})

		after(cleanup)
	})


})
