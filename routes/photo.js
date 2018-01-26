var express 		= require('express');
var router 			= express.Router({mergeParams: true});
var authMidWare		= require('../middleware/auth');
var photoMidWare	= require('../middleware/photo');
var Gallery			= require('../models/gallery');


// new photo. This should check that the user owns the gallery. Same as with the post route.
router.get('/galleries/:gallId/photos/new', authMidWare.isLoggedIn, authMidWare.isAdmin, authMidWare.checkGalleryOwnership, function(req, res){
	Gallery.findById(req.params.gallId, function(err, gallery){
		if (err) {
			console.error(String(err));
		} else {
			res.render('./photos/new', {gallery: gallery});
		}
	});	
});

router.post('/galleries/:gallId/photos', authMidWare.isLoggedIn, authMidWare.isAdmin, authMidWare.checkGalleryOwnership, photoMidWare.upload.any(), photoMidWare.storePhotos, function(req, res){
	console.log('photos stored');
});

// destroy photo user needs to own gallery before they can delete a photo.
router.delete('/galleries/:gallId/photos/:photoId', authMidWare.isLoggedIn, authMidWare.isAdmin, authMidWare.checkGalleryOwnership, function(req, res){
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
	photoMidWare.removePhoto(req.params.photoId);
});

module.exports = router;