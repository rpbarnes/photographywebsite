var express 		= require('express');
var passport 		= require('passport');
var router 			= express.Router({mergeParams: true});
var User 			= require('../models/user');

// Registration 
router.get('/register', function(req, res) {
	res.render('register');
});

router.post('/register', function(req, res) {
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
router.get('/login', function(req, res) {
	res.render('login');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/galleries',
    failureRedirect: '/login',
	failureFlash: 'Invalid username or password.'
    }),
    function(req, res) {
});

// Logout
router.get('/logout', function(req, res){
    req.logout();
	req.flash("success","Successfully Logged Out."); // pass error message because not logged in.
    res.redirect('/galleries');
});

module.exports = router;