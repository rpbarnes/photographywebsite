var express 		= require('express');
var router 			= express.Router({mergeParams: true});
var Photo 			= require('../models/photo');

// ajax post route for like photo
router.post('/:photoId', function(req, res) {
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

module.exports = router;