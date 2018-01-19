var express 		= require('express'),
 	mongoose 		= require('mongoose'),
    methodOverride  = require('method-override'),
 	bodyParser		= require('body-parser'),
 	multer    		= require( 'multer' ),
 	multerS3  		= require( 'multer-s3' ),
	aws				= require('aws-sdk'),
 	sizeOf    		= require( 'image-size' ),
    path            = require('path'),
 	Photo 			= require('./models/photo'),
 	Gallery 		= require('./models/gallery');

require( 'string.prototype.startswith' );

storePhotos = function(req, res, next) {
	Gallery.findById(req.params.gallID, function(err, gallery){
		if (err) {
			console.error(String(err));
		} else {
			req.files.forEach(function(photoObj, index, array) {
				Photo.create({}, function(err, photo){
					if (err) {
						console.error(String(err));
					} else {
						console.log(photoObj);
						photo.name = path.basename(photoObj.originalname);
						photo.image = photoObj.location;
						photo.key = photoObj.key;
						photo.save();
						gallery.photos.push(photo._id);
						if (index === (array.length - 1)) {
							gallery.save();
							res.status(200).end();
							console.log('all done');
						}
					}
				});
			});
		}
	});
	next();
}

// define app
var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public')); // tell app to point towards public directory
app.use(methodOverride("_method"));

// Setup storage properties for multer and define upload
var s3 = new aws.S3();
var bucketName = 'ryanbarnesphotographywebsite';
var toDelete = {Bucket: bucketName, Key: ''};

var destinationFile = './uploads';
// var storage = multer.diskStorage({
//     destination: function(req, file, callback){
//         callback(null, destinationFile);
//     },
//     filename: function(req, file, callback){
//         var name = path.basename(file.originalname) + '-' + Date.now() + path.extname(file.originalname);
//         callback(null, name);
//     }
// });
var upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: bucketName,
		acl: 'public-read',
		contentType: multerS3.AUTO_CONTENT_TYPE,
		metadata: function(req, file, cb){
			cb(null, {fieldName: file.fieldname});
		},
		key: function(req, file, cb){
			cb(null, Date.now().toString() + '-' + path.basename(file.originalname));
		}
	})
})

// setup db
mongoose.connect("mongodb://localhost/photoV4");

// landing page
app.get('/',function(req,res){
	res.render('landing');
});

// home page 
app.get('/galleries', function(req, res){
	// you need to populate galleries and this is not working. You're also going to need to load in a photo of each.
	Gallery.find({}).populate('photos').exec(function(err, galleries){
		if (err) {
			console.error(String(err));
		} else {
			res.render('./galleries/home',{galleries: galleries});			
		}
	});
});

// new gallery 
app.get('/galleries/new', function(req, res){
	res.render('./galleries/new'); 
});

// create gallery - when adding photos you can use findByIdAndUpdate to create a gallery if it doesn't already exist. 
// You'll have to do this to work with dropzone
app.post('/galleries', function(req, res){
	Gallery.create(req.body.gallery, function(err, gallery){
		if (err) {
			console.error(String(err));
			res.redirect('/galleries');
		} else {
			console.log('Created Gallery');
			res.redirect('/galleries/' + gallery._id);
		}
	});
});

// show gallery
app.get('/galleries/:gallID', function(req, res){
	Gallery.findById(req.params.gallID).populate('photos').exec(function(err, gallery){
		res.render('./galleries/show', {gallery: gallery});
	});
});

// update gallery
// app.put

// destroy gallery
// app.delete

// new photo
app.get('/galleries/:gallID/photos/new', function(req, res){
	Gallery.findById(req.params.gallID, function(err, gallery){
		if (err) {
			console.error(String(err));
		} else {
			res.render('./photos/new', {gallery: gallery});
		}
	});	
});

app.post('/galleries/:gallID/photos', upload.any(), storePhotos, function(req, res){
	console.log('photos stored');
});

// edit photo (name, description, photo)
app.get('/galleries/:gallID/photos/:photoId/edit', function(req, res){
	Photo.findById(req.params.photoId, function(err, photo){
		res.render('./photos/edit', {photo: photo});
	});
});

// update photo
// app.put

// destroy photo
app.delete('/galleries/:gallId/photos/:photoId', function(req, res){
	// remove photo from Gallery photos array
	// remove Photo
	// remove photo from S3 storage
	Gallery.findById(req.params.gallId, function(err, gallery){
		if (err || !gallery){
			res.redirect('/galleries/');
		}
		const indexRemove = gallery.photos.indexOf(req.params.photoId);
		if (indexRemove !== -1) {
			gallery.photos.splice(indexRemove, 1);
		}
		gallery.save(function(err){
			if (err) {
				console.error(String(err))
			} else {
				res.redirect('/galleries/'+req.params.gallId);
			}
		});
	});
	Photo.findByIdAndRemove(req.params.photoId, function(err, photo) {
		if (err || !photo) {
			console.error(String(err));
		} else {
			toDelete.Key = photo.key;
			console.log(toDelete);
			s3.deleteObject(toDelete, function(err, data){
				if (err) {
					console.error(String(err));
				} else {
					console.log('photo removed');
				}

			});
		}
	});
});

// ajax requests for photo 
// app.get('/:photoType/:photoId', function(req, res) {
// 	Photo.findById(req.params.photoId, function(err, photo) {
// 		if (err || !photo) {
// 			res.status(400).send('photo not found');
// 		} else {
// 			if (req.params.photoType === 'thumbnail') {
// 				var fileName = photo.thumbnail;
// 			} else if (req.params.photoType === 'image') {
// 				var fileName = photo.image;
// 			}
// 			fs.readFile(fileName, function(err, file) {
// 				res.send('data:image/jpeg;base64,'+Buffer.from(file).toString('base64'));				
// 			});
// 		}
// 	});
// });
//



app.listen(process.env.PORT, process.env.IP, function(){
	console.log('Server up on port ' + process.env.PORT + ' IP ' + process.env.IP);
})