var User = require('./models/user');


function createAdmin(){
	var adminUser = new User({username: 'rpbarnes9@gmail.com', firstname: 'Ryan', lastname: 'Barnes', role: 'admin'})
	var passWrd = process.env.ADMIN;
	User.register(adminUser, passWrd, function(err, user){
		if (err || !user) {
			console.error(String(err));
		} else {
			console.log('User created');
		}
	});
};

module.exports = createAdmin;