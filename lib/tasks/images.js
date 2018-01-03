module.exports = function(gulp, config) {
	var errorHandler = require('../helpers/error_handler')()

	return function(done) {
		if(!config.images) return done()
		var c = require('better-console')
		c.info('~ images')

		var imagemin = require('gulp-imagemin')
		var jimp = require('jimp')
		var merge = require('merge-stream')
		var path = require('path')
		var plumber = require('gulp-plumber')
		var stream = require('stream')

		var task = merge()

		// Divide config to simple input and with options
		var imageObjects = [] // resizing
		var glob = [] // nothing
		for (var i = 0; i < config.images.length; i++) {
			var image = config.images[i]
			if(typeof image == 'object' && typeof image.src == 'string') {
				imageObjects.push(image)
			} else if (typeof image == "string") {
				glob.push(image)
			} else {
				c.error('Images: Unrecognised type of input')
			}
		}

		// Pipe images, with no transform
		task.add(gulp.src(glob, { base: config.src_folder, cwd: config.dir }))
		// Pipe images, which has to be transformed
		for (var i = 0; i < imageObjects.length; i++) {
			(function () {
				var imageObject = imageObjects[i]
				task.add(gulp.src(imageObject.src, { base: config.src_folder, cwd: config.dir })
					.pipe(function () {
						var transformStream = new stream.Transform({objectMode: true})
						transformStream._transform =  function (file, enc, callback) {
							file.imageData = imageObject
							callback(null, file)
						}
						return transformStream
					}())
				)
			})()
		}


		// Init plumber in devmode
		if(config.devmode){
			task = task.pipe(plumber({ errorHandler: errorHandler.fail }))
		}

		// Multiply and rename images for transform
		task = task.pipe(function () {
			var transformStream = new stream.Transform({objectMode: true});
			transformStream._transform = function (file, encoding, callback) {
				if(file.imageData) {
					for (var i = 0; i < file.imageData.sizes.length; i++) {
						var size = file.imageData.sizes[i]
						var fileClone = file.clone()
						var name = path.parse(fileClone.path)
						fileClone.path = path.join(name.dir, name.name + '-' + size + name.ext)
						fileClone.imageTransform = {
							width: size,
							height: file.imageData.aspectRatio ? Math.ceil(size/file.imageData.aspectRatio) : jimp.AUTO,
							quality: file.imageData.quality || 90,
						}
						this.push(fileClone)
					}
					callback()
				} else {
					callback(null, file)
				}
			}
			return transformStream
		}())


		// Transform images
		task = task.pipe(function () {
			var transformStream = new stream.Transform({objectMode: true});
			transformStream._transform = function (file, encoding, callback) {
				if(file.imageTransform) {
					jimp
						.read(file.contents)
						.then(function(image) {
							image
								.resize(file.imageTransform.width, file.imageTransform.height)
								.quality(file.imageTransform.quality)
								.getBuffer(jimp.AUTO, function(err, buffer) {
									if(err) console.error(err)
									file.contents = buffer
									callback(null, file)
								})
						})
						.catch(function(err) {
							console.error(err)
						})
				} else {
					callback(null, file)
				}
			}
			return transformStream
		}())

		if(!config.devmode) {
			task = task.pipe(imagemin([
				imagemin.gifsicle(),
				imagemin.jpegtran({ progressive: true }),
				imagemin.optipng(),
				imagemin.svgo({ plugins: [{ removeViewBox: false }] })
			]))
		}

		if(config.devmode){
			task.on('end', function() {
				errorHandler.done()
			})
		}

		return task.pipe(gulp.dest(config.dist_persistent_folder))
	}
}
