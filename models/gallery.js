var mongoose = require('mongoose');

var gallerySchema = mongoose.Schema({
	title: {
		type: String, 
	},
	cover: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Photo"
	},
	photos: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Photo"
		}
	],
}, {usePushEach: true});

module.exports = mongoose.model('Gallery', gallerySchema);