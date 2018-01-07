var mongoose = require('mongoose');

var photoSchema = mongoose.Schema({
	image: {	// this is in place of an actual file held on S3		
		type: String,
	},
	thumbnail: { // filename placeholder for thumbnail file
		type: String,
	},
	name: {
		type: String,
	}
});

module.exports = mongoose.model('Photo',photoSchema);