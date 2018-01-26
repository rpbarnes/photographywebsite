var Gallery 		= require('../models/gallery');
var Photo 			= require('../models/photo');
var aws				= require('aws-sdk');
var multer  		= require('multer');
var multerS3		= require('multer-s3');
var path    		= require('path');
var middlewareObj 	= {};

// Setup storage properties for multer and define upload
var s3 = new aws.S3();
var bucketName = process.env.BUCKET;
var toDelete = {Bucket: bucketName, Key: ''};

middlewareObj.upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: bucketName,
		acl: 'public-read',
		contentType: multerS3.AUTO_CONTENT_TYPE,
		cacheControl: 'max-age=31536000',
		metadata: function(req, file, cb){
			cb(null, {fieldName: file.fieldname});
		},
		key: function(req, file, cb){
			cb(null, Date.now().toString() + '-' + path.basename(file.originalname));
		}
	})
})


middlewareObj.storePhotos = function(req, res, next) {
	Gallery.findById(req.params.gallId, function(err, gallery){
		if (err) {
			console.error(String(err));
		} else {
			req.files.forEach(function(photoObj, index, array) {
				Photo.create({}, function(err, photo){
					if (err) {
						console.error(String(err));
					} else {
						photo.name = path.basename(photoObj.originalname);
						photo.image = photoObj.location;
						photo.key = photoObj.key;
						photo.author = {username: req.user.username, id: req.user._id}
						photo.save();
						gallery.photos.push(photo._id);
						if (index === (array.length - 1)) {
							gallery.save();
							res.status(200).end();
						}
					}
				});
			});
		}
	});
	next();
}

middlewareObj.removePhoto = function(photoId) {
	// remove photo from S3 and photo collection
	Photo.findByIdAndRemove(photoId, function(err, photo) {
		if (err || !photo) {
			console.error(String(err));
		} else {
			toDelete.Key = photo.key;
			s3.deleteObject(toDelete, function(err, data){
				if (err) {
					console.error(String(err));
				} else {
					console.log('photo removed');
				}
			});
		}
	});
}

module.exports = middlewareObj;