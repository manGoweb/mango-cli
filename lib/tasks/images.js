module.exports = function(gulp, config) {
	var errorHandler = require('../helpers/error_handler')()

	return function(done) {
		if(!config.images) return done()
		var c = require('better-console')
		c.info('~ images')

		var imagemin = require('gulp-imagemin')
		var plumber = require('gulp-plumber')
		var merge = require('merge-stream')
		var sharp = require('sharp')
		var path = require('path')
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
		if (glob.length) {
			task.add(gulp.src(glob, { base: config.src_folder, cwd: config.dir, allowEmpty: true }))
		}

		// Pipe images, which has to be transformed
		for (var i = 0; i < imageObjects.length; i++) {
			(function () {
				var imageObject = imageObjects[i]
				task.add(gulp.src(imageObject.src, { base: config.src_folder, cwd: config.dir, allowEmpty: true })
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
							height: file.imageData.aspectRatio ? Math.ceil(size/file.imageData.aspectRatio) : null,
							options: file.imageData.options || {},
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
					sharp(file.contents).resize(file.imageTransform.width, file.imageTransform.height, { withoutEnlargement: true }).jpeg(file.imageTransform.options).toBuffer(function (err, buffer, info) {
						if(err) console.error(err)
						file.contents = buffer
						callback(null, file)
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
				imagemin.mozjpeg({ progressive: true }),
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
