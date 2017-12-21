var del = require('del')
var fs = require('fs')
var os = require('os')
var path = require('path')
var should = require('should')

console.log('Preparing temp folder...')
var tmpDir = fs.realpathSync(os.tmpdir()) + path.sep
var TEMP = fs.mkdtempSync(tmpDir)
console.log('TEMP:', TEMP)

var cleanup = function() {
	console.log('Clearing temp folder...', tmpDir)
	console.log(del.sync(tmpDir, { force: true }))
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

		it('run build scripts', function(done) {
			this.timeout(120000)
			mango.build(['scripts'], [], done)
		})

		it('run build styles', function(done) {
			this.timeout(120000)
			mango.build(['styles'], [], done)
		})

		it('run build static', function(done) {
			this.timeout(120000)
			mango.build(['static'], [], done)
		})

		it('run build sprites', function(done) {
			this.timeout(120000)
			mango.build(['static'], [], done)
		})

		it('run build templates', function(done) {
			this.timeout(120000)
			mango.build(['templates'], [], done)
		})

		it('run build images', function(done) {
			this.timeout(120000)
			mango.build(['images'], [], done)
		})

		it('run build buildstamp', function(done) {
			this.timeout(120000)
			mango.build(['buildstamp'], [], done)
		})

		it('run the production default build tasks', function(done) {
			this.timeout(120000)
			mango.build([], [], done)
		})

		after(cleanup)
	})


})
