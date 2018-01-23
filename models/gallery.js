var mongoose = require('mongoose');

var gallerySchema = mongoose.Schema({
	title: {
		type: String, 
	},
	cover: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Photo"
	},
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: {
            type: String
        }
    },
	photos: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Photo"
		}
	],
}, {usePushEach: true});

module.exports = mongoose.model('Gallery', gallerySchema);