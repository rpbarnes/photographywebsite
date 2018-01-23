var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
	firstname: {
		type: String,
	},
	lastname: {
		type: String,
	},
    username: { // this is an email.
        type: String,
        required: true
    },
    password: {
        type: String
    }
}); 
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);