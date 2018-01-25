var express 		= require('express'),
 	mongoose 		= require('mongoose'),
    methodOverride  = require('method-override'),
 	bodyParser		= require('body-parser'),
    flash 			= require('connect-flash'),
 	multer    		= require( 'multer' ),
 	multerS3  		= require( 'multer-s3' ),
	aws				= require('aws-sdk'),
    passport        = require('passport'), 
    localStrategy   = require('passport-local'), 
	createAdmin		= require('./seeds');
    User            = require('./models/user'),
    path            = require('path'),
 	Photo 			= require('./models/photo'),
 	Gallery 		= require('./models/gallery');

require( 'string.prototype.startswith' );

// define app
var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public')); // tell app to point towards public directory
app.use(methodOverride("_method"));
app.use(flash());


// PASSPORT CONFIG
app.use(require('express-session') ({ // this has to be initialized before the pass.init & pass.sess. If not the req.isAuthenticated() === false always.
    secret: 'cats are never cool.',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate())); // passport.authenticate uses this to authenticate a user.
passport.serializeUser(User.serializeUser());  // encoding the session
passport.deserializeUser(User.deserializeUser()); // decoding the session

// Setup storage properties for multer and define upload
var s3 = new aws.S3();
var bucketName = 'ryanbarnesphotographywebsite';
var toDelete = {Bucket: bucketName, Key: ''};

var destinationFile = './uploads';
var upload = multer({
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

// setup db
mongoose.connect("mongodb://localhost/photoV6");
// create Admin account
// createAdmin();

//// Pass currentUser to each template
app.use(function(req, res, next) {              // Define currentUser for each render call. This middleware function will be called for each render function.
    res.locals.currentUser = req.user;
    res.locals.message = req.flash();                   // add in flash messages to the locals that get passed automatically to each template
    next();
});

//////////////////////////////////////////
////////////   middle ware   ////////////
/////////////////////////////////////////

storePhotos = function(req, res, next) {
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

// auth middleware - you could add a check for a user group here.
isLoggedIn = function(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash('error', 'You must log in first');
	res.redirect('/login');
};

checkGalleryOwnership = function(req, res, next) {
	// user is logged in but does user own gallery?
	Gallery.findById(req.params.gallId, function(err, gallery) {
		if (err || !gallery) {
			req.flash('error', 'Gallery not found');
			res.redirect('back');
		} else {
			if (gallery.author.id.equals(req.user._id)) {
				// user owns gallery
				next();
			} else {
				req.flash('error', "You don't have permission to do that!");
				res.redirect('back');
			}
		}
	});
};

isAdmin = function(req, res, next) {
	// user is logged in but are they admin? If yes continue, if not redirect back and flash message.
	if (req.user.role === 'admin') {
		next();
	} else {
		req.flash('error', "You are not an administrator and do not have permission to do that");
		res.redirect('back');
	}
};

removePhoto = function(photoId) {
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

//////////////////////////////////////////
///////////// Authentication /////////////
//////////////////////////////////////////

// Registration 
app.get('/register', function(req, res) {
	res.render('register');
});

app.post('/register', function(req, res) {
	// create new user using passport register
	var newUser = new User({username: req.body.username, firstname: req.body.firstname, lastname: req.body.lastname});
	User.register(newUser, req.body.password, function(err, user){
		if (err || !user) {
			// flash message here would be good.
			req.flash('error', 'Could not add user');
			return res.render('register');
		}
        passport.authenticate('local')(req, res, function(){
			req.flash('success','Welcome ' + user.firstname);
            res.redirect('/galleries');
        });
	});		

});

// Login
app.get('/login', function(req, res) {
	res.render('login');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/galleries',
    failureRedirect: '/login'
    }),
    function(req, res) {
});

// Logout
app.get('/logout', function(req, res){
    req.logout();
	req.flash("success","Successfully Logged Out."); // pass error message because not logged in.
    res.redirect('/galleries');
});

//////////////////////////////////////////
///////////// Web Routes /////////////
//////////////////////////////////////////

// landing page
app.get('/',function(req,res){
	res.render('landing');
});

// user profile page - I'm not really sure what goes here.
app.get('/profile', isLoggedIn, function(req, res){
	res.render('profile');
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
app.get('/galleries/new', isLoggedIn, isAdmin, function(req, res){
	res.render('./galleries/new'); 
});

// create gallery - when adding photos you can use findByIdAndUpdate to create a gallery if it doesn't already exist. 
// You'll have to do this to work with dropzone
app.post('/galleries', isLoggedIn, isAdmin, function(req, res){
	Gallery.create(req.body.gallery, function(err, gallery){
		if (err) {
			console.error(String(err));
			res.redirect('/galleries');
		} else {
			gallery.author = {username: req.user.username, id: req.user._id};
			res.redirect('/galleries/' + gallery._id);
			gallery.save();
			console.log('Created Gallery');

		}
	});
});

// show gallery
app.get('/galleries/:gallId', function(req, res){
	Gallery.findById(req.params.gallId).populate('photos').exec(function(err, gallery){
		res.render('./galleries/show', {gallery: gallery});
	});
});

// update gallery
app.get('/galleries/:gallId/edit', isLoggedIn, isAdmin, checkGalleryOwnership, function(req, res) {
	Gallery.findById(req.params.gallId, function(err, gallery) {
		res.render('./galleries/edit', {gallery: gallery});
	});
});

app.put('/galleries/:gallId', isLoggedIn, isAdmin, checkGalleryOwnership, function(req, res) {
	Gallery.findById(req.params.gallId, function(err, gallery){
		if (err || !gallery) {
			req.flash('error',"Can't find gallery");
			res.redirect('/galleries');
		} else {
			gallery.title = req.body.gallery.title;
			gallery.save()
			req.flash('success', "Title changed.");
			res.redirect('/galleries/'+gallery._id);
		}
	});
});

// destroy gallery
app.delete('/galleries/:gallId', isLoggedIn, isAdmin, checkGalleryOwnership, function(req, res) {
	Gallery.findByIdAndRemove(req.params.gallId, function(err, gallery) {
		if (err || !gallery) {
			req.flash('error',"Can't remove gallery");
			res.redirect('/galleries');
		} else {
			gallery.photos.forEach( function(photo) {
				removePhoto(photo); // removes photo from both S3 and collection
			});
			req.flash('success','Gallery removed');
			res.redirect('/galleries');
		}
	});
});

// new photo. This should check that the user owns the gallery. Same as with the post route.
app.get('/galleries/:gallId/photos/new', isLoggedIn, isAdmin, checkGalleryOwnership, function(req, res){
	Gallery.findById(req.params.gallId, function(err, gallery){
		if (err) {
			console.error(String(err));
		} else {
			res.render('./photos/new', {gallery: gallery});
		}
	});	
});

app.post('/galleries/:gallId/photos', isLoggedIn, isAdmin, checkGalleryOwnership, upload.any(), storePhotos, function(req, res){
	console.log('photos stored');
});

// update photo
// app.put

// destroy photo user needs to own gallery before they can delete a photo.
app.delete('/galleries/:gallId/photos/:photoId', isLoggedIn, isAdmin, checkGalleryOwnership, function(req, res){
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
	removePhoto(req.params.photoId);
});

// ajax post route for like photo
app.post('/:photoId', function(req, res) {
	// check that there is a user. have to handle a little strangely....
	if (req.user) {
		Photo.findById(req.params.photoId, function(err, photo) {
			if (err || !photo) {
				return res.status(500).send("Can't find photo").end();
			} 
			var index = photo.likes.indexOf(req.user._id);
			if (index > -1) {
				photo.likes.splice(index,1);
			} else {
				photo.likes.push(req.user._id);
			}
			photo.save();
			var response = {loggedIn: 1, numLikes: photo.likes.length, id: photo._id}
			res.send(response);
		});
	} else {
		req.flash('error', 'Please login to like or comment.');
		var response = {loggedIn: 0};
		res.send(response);
	}
});



app.listen(process.env.PORT, process.env.IP, function(){
	console.log('Server up on port ' + process.env.PORT + ' IP ' + process.env.IP);
})