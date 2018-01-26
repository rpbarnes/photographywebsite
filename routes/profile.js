var express 		= require('express');
var router 			= express.Router({mergeParams: true});
var authMidWare		= require('../middleware/auth');

// user profile page - I'm not really sure what goes here.
router.get('/profile', authMidWare.isLoggedIn, function(req, res){
	res.render('profile');
});

module.exports = router;