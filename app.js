var express 		= require('express'),
 	mongoose 		= require('mongoose'),
 	bodyParser		= require('body-parser'),
 	multer    		= require( 'multer' ),
 	sizeOf    		= require( 'image-size' ),
    path            = require('path'),
	Jimp			= require('jimp'),
	fs 				= require('fs'),
 	Photo 			= require('./models/photo'),
 	Gallery 		= require('./models/gallery');

require( 'string.prototype.startswith' );

// define app
var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public')); // tell app to point towards public directory

// Setup storage properties for multer and define upload
var destinationFile = './uploads';
var storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, destinationFile);
    },
    filename: function(req, file, callback){
        var name = path.basename(file.originalname) + '-' + Date.now() + path.extname(file.originalname);
        callback(null, name);
    }
});
var upload = multer({
	storage: storage,
})

// setup db
mongoose.connect("mongodb://localhost/photoV2");

// landing page
app.get('/',function(req,res){
	res.render('landing');
});

// home page 
app.get('/galleries', function(req, res){
	// you need to populate galleries and this is not working. You're also going to need to load in a photo of each.
	Gallery.find({}, function(err, galleries){
		if (err) {
			console.error(String(err));
		} else {
			thumbnails = [];
			galleries.forEach(function(gallery, index, array){
				if (gallery.photos && (gallery.photos.length > 0)) {
					thumbnails.push({img:gallery.photos[0], id: gallery._id, title: gallery.title});
				} else {
					thumbnails.push({id: gallery._id, title: gallery.title});
				}
				if (index === (array.length - 1)) { // this is not the best way to do this...
					res.render('./galleries/home',{galleries: thumbnails});			
				}

			});
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
	Gallery.findById(req.params.gallID, function(err, gallery){
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

// create photo because of DZ you don't want to redirect here because this will be called on each photo added...
app.post('/galleries/:gallID/photos', upload.any(), function(req, res){
	console.log(req.files);
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
						photo.image = photoObj.path;// convert to thumbnail. 
						var name = destinationFile + '/' + path.basename(photoObj.originalname) + '-small-' + Date.now() + path.extname(photoObj.originalname);
						Jimp.read(photoObj.path, function(err, image){
							image.cover(256,256);						
							image.write(name, function(err, saved){
								if (index === (array.length - 1)) {
									res.status(200).end();
									console.log('all done');
								}
							});
							console.log('image saved');
						});
						photo.thumbnail = name;
						photo.save();
						gallery.photos.push(photo._id);
						if (index === (array.length - 1)) {
							gallery.save();
						}
					}
				});
			});
		}
	});
});

// show photo
app.get('/galleries/:gallID/photos/:photoId', function(req, res){
	Photo.findById(req.params.photoId, function(err, photo){
		if (err || !photo) {
			res.redirect('/galleries/'+req.params.gallID);
		} else {
			res.render('./photos/show', {photo: photo, galleryId: req.params.gallID});	
			// fs.readFile(photo.image, function(err, file) {
			// 	if (err) {
			// 		console.log(error);
			// 	} else {
			// 		var image = 'data:image/jpeg;base64,' + Buffer.from(file).toString('base64')
			// 		res.render('./photos/show', {photo: photo, galleryId: req.params.gallID, image64: image});	
			// 	}
			// });
		}
	});
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
// app.delete

// ajax requests for photo 
app.get('/:photoType/:photoId', function(req, res) {
	Photo.findById(req.params.photoId, function(err, photo) {
		if (err || !photo) {
			res.status(400).send('photo not found');
		} else {
			if (req.params.photoType === 'thumbnail') {
				var fileName = photo.thumbnail;
			} else if (req.params.photoType === 'image') {
				var fileName = photo.image;
			}
			fs.readFile(fileName, function(err, file) {
				res.send('data:image/jpeg;base64,'+Buffer.from(file).toString('base64'));				
			});
		}
	});
});


app.listen(process.env.PORT, process.env.IP, function(){
	console.log('Server up on port ' + process.env.PORT + ' IP ' + process.env.IP);
})