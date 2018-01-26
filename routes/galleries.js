var express 		= require('express');
var router 			= express.Router({mergeParams: true});
var authMidWare		= require('../middleware/auth');
var photoMidWare	= require('../middleware/photo');
var Gallery			= require('../models/gallery');

// home page 
router.get('/galleries', function(req, res){
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
router.get('/galleries/new', authMidWare.isLoggedIn, authMidWare.isAdmin, function(req, res){
	res.render('./galleries/new'); 
});

// create gallery 
router.post('/galleries', authMidWare.isLoggedIn, authMidWare.isAdmin, function(req, res){
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
router.get('/galleries/:gallId', function(req, res){
	Gallery.findById(req.params.gallId).populate('photos').exec(function(err, gallery){
		res.render('./galleries/show', {gallery: gallery});
	});
});

// update gallery
router.get('/galleries/:gallId/edit', authMidWare.isLoggedIn, authMidWare.isAdmin, authMidWare.checkGalleryOwnership, function(req, res) {
	Gallery.findById(req.params.gallId, function(err, gallery) {
		res.render('./galleries/edit', {gallery: gallery});
	});
});

router.put('/galleries/:gallId', authMidWare.isLoggedIn, authMidWare.isAdmin, authMidWare.checkGalleryOwnership, function(req, res) {
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
router.delete('/galleries/:gallId', authMidWare.isLoggedIn, authMidWare.isAdmin, authMidWare.checkGalleryOwnership, function(req, res) {
	Gallery.findByIdAndRemove(req.params.gallId, function(err, gallery) {
		if (err || !gallery) {
			req.flash('error',"Can't remove gallery");
			res.redirect('/galleries');
		} else {
			gallery.photos.forEach( function(photo) {
				photoMidWare.removePhoto(photo); // removes photo from both S3 and collection
			});
			req.flash('success','Gallery removed');
			res.redirect('/galleries');
		}
	});
});

module.exports = router;