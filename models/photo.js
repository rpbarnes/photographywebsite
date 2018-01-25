var mongoose = require('mongoose');

var photoSchema = mongoose.Schema({
	image: { type: String },

	thumbnail: { type: String },

	key: { type: String },

	date: { type: Date, default: Date.now },

	name: { type: String },

	likes: [
		{ type: mongoose.Schema.Types.ObjectId, ref: "User" }
	],	

	comments: [
		{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }
	],

    author: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

        username: { type: String }
    }
});

module.exports = mongoose.model('Photo',photoSchema);