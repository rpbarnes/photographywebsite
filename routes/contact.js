var express 		= require('express');
var router 			= express.Router({mergeParams: true});
var helper 			= require('sendgrid').mail;
var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);

var fromEmail = new helper.Email('contact@ryanbarnesphoto.com');
var toEmail = new helper.Email('rpbarnes9@gmail.com');



// Contact page
router.get('/contact', function(req, res) {
	res.render('contact');
});

router.post('/contact', function(req, res) {
	var subject = 'Mail from ' + req.body.name;
	var content = new helper.Content('text/plain', req.body.message + " Email: " + req.body.email);
	var mail = new helper.Mail(fromEmail, subject, toEmail, content);
	var request = sg.emptyRequest({
		method: 'POST',
		path: '/v3/mail/send', // wtf is this???
		body: mail.toJSON(),
	});
	sg.API(request, function(err, response) {
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