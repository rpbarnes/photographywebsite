var Gallery = require('../models/gallery');
var middlewareObj = {};

// auth middleware - you could add a check for a user group here.
middlewareObj.isLoggedIn = function(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash('error', 'You must log in first');
	res.redirect('/login');
};

middlewareObj.checkGalleryOwnership = function(req, res, next) {
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

middlewareObj.isAdmin = function(req, res, next) {
	// user is logged in but are they admin? If yes continue, if not redirect back and flash message.
	if (req.user.role === 'admin') {
		next();
	} else {
		req.flash('error', "You are not an administrator and do not have permission to do that");
		res.redirect('back');
	}
};


module.exports = middlewareObj;