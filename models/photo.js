var mongoose = require('mongoose');

var photoSchema = mongoose.Schema({
	image: {	// this is in place of an actual file held on S3		
		type: String,
		default: 'https://static.pexels.com/photos/169677/pexels-photo-169677.jpeg'
	},
	name: {
		type: String,
	}
});

module.exports = mongoose.model('Photo',photoSchema);