var express 		= require('express');
var nodemailer		= require('nodemailer');
var router 			= express.Router({mergeParams: true});

// configure node mailer - This needs to go to env
// This doesn't work for heroku. You'll need to reconfigure this.
var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL,
		pass: process.env.PASSWORD 
	}
});

// Contact page
router.get('/contact', function(req, res) {
	res.render('contact');
});

router.post('/contact', function(req, res) {
	var mailOptions = {
		from: process.env.EMAIL,
		to: 'rpbarnes9@gmail.com',
		subject: "Email from " + req.body.name,
		text: "Message from " + req.body.name + ". Saying: " + req.body.message + ". Their email address is: " + req.body.email
	};
	transporter.sendMail(mailOptions, function(err, info) {
		if (err) {
			req.flash('error', String(err));
			res.redirect('/galleries');
		} else {
			req.flash('success', "Thank you for contacting me!");
			res.redirect('/galleries');
		}
	});
});

module.exports = router;