var router = require("express").Router();
var jwt = require("jsonwebtoken");
var models = require("./models-crud-api")


var SECRET =  'this is a secret phrase';

router.post('/tokens', function(req, res, next) {

	models.users.findOne({
		username: req.body.username,
		password: req.body.password
	})
	.then(function(usr) {
		if(!usr) {
			return next({error: true, msg: 'User not valid'})
		}
		var token = jwt.sign({
			name: usr.first_name,
			birth_date: usr.birth_date
		}, SECRET , {"expiresIn": "1 day"})
		res.json({
			token: token
		})
	})
	.catch(next);
})


function check_token(req, res, next) {

	var token = req.query.token || req.headers.token;

	//we make sure the url required for requesting a token is not protected
	if(req.url.indexOf("/tokens") !== -1) return next(); 

	if(!token) {
		return next('No token provided');
	}

	jwt.verify(token, SECRET, function(err, decoded) {
		if(err) {
			return next(err);
		}
		next();
	});
}

module.exports = {
	router: router,
	check_token: check_token
};
