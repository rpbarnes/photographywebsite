var express 		= require('express'),
 	mongoose 		= require('mongoose'),
    methodOverride  = require('method-override'),
 	bodyParser		= require('body-parser'),
    flash 			= require('connect-flash'),
    passport        = require('passport'), 
    localStrategy   = require('passport-local'), 
	createAdmin		= require('./seeds');
    User            = require('./models/user'),

require( 'string.prototype.startswith' );

// Routes
var authRoutes		= require('./routes/auth'),
	contactRoutes 	= require('./routes/contact'),
	ajaxRoutes		= require('./routes/ajax'),
	profileRoutes	= require('./routes/profile'),
	galleryRoutes 	= require('./routes/galleries'),
	photoRoutes		= require('./routes/photo');

// define app
var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public')); // tell app to point towards public directory
app.use(methodOverride("_method"));
app.use(flash());

// Configure passport authentication and authorization
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

// setup db
mongoose.connect(process.env.PHOTODATABASEURL);
// create Admin account
// createAdmin();

//// Pass currentUser to each template
app.use(function(req, res, next) {              // Define currentUser for each render call. This middleware function will be called for each render function.
    res.locals.currentUser = req.user;
    res.locals.message = req.flash();                   // add in flash messages to the locals that get passed automatically to each template
    next();
});

// landing page
app.get('/',function(req,res){
	res.render('landing');
});

// external routes
app.use(photoRoutes);
app.use(galleryRoutes);
app.use(authRoutes);
app.use(ajaxRoutes);
app.use(contactRoutes);
app.use(profileRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
	console.log('Server up on port ' + process.env.PORT + ' IP ' + process.env.IP);
})