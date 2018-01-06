var express 		= require('express');
var mongoose 		= require('mongoose');
var bodyParser		= require('body-parser')
var Photo 			= require('./models/photo');
var Gallery 		= require('./models/gallery');

// define app
var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

// setup db
mongoose.connect("mongodb://localhost/photoV1");

// landing page
app.get('/',function(req,res){
	res.render('landing');
});

// home page 
app.get('/galleries', function(req, res){
	Gallery.find({}, function(err, galleries){
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

// create gallery
app.post('/galleries', function(req, res){
	console.log('submitted')
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
		if (err || !gallery) {
			console.error(String(err));
			res.redirect('/');
		} else {
			res.render('./galleries/show', {gallery: gallery});
		}
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

// create photo
app.post('/galleries/:gallID/photos', function(req, res){
	Gallery.findById(req.params.gallID, function(err, gallery){
		if (err) {
			console.error(String(err));
		} else {
			Photo.create(req.body.photo, function(err, photo){
				if (err) {
					console.error(String(err));
				} else {
					console.log(gallery);
					gallery.photos.push(photo._id);
					gallery.save(function(err, saved){
						if (err) {
							console.log(err);
						} else {
							console.log(saved);
							res.redirect('/galleries/' + req.params.gallID);
						}
					});
					// res.redirect('/galleries/' + req.params.gallID);
				}
			});
		}
	});
});

// show photo
app.get('/galleries/:gallID/photos/:photoId', function(req, res){
	Photo.findById(req.params.photoId, function(err, photo){
		res.render('./photos/show', {photo: photo, galleryId: req.params.gallID});	
	});
});

// update photo
// app.put

// destroy photo
// app.delete


app.listen(process.env.PORT, process.env.IP, function(){
	console.log('Server up on port ' + process.env.PORT + ' IP ' + process.env.IP);
})