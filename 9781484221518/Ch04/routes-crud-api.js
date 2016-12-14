var router = require("express").Router(),
	models = require("./models-crud-api");

router.get('/', function(req, res, next) {
	models.users.find({})
		.populate('addresses')
			.then(res.json.bind(res))//we make sure the 'this' is correct when the function is called
		.catch(next);
});

router.get('/:id', function(req, res, next) {
	models.users.findById(req.params.id)
		.populate("addresses")
		.then(function(usr) {
			if(!usr) {
				return res.status(404).json({
					error: true,
					msg: 'User not found'
				});
			} 
			return res.json(usr);
		})
		.catch(next)
});

router.post('/', function(req, res, next) {
	models.users.create(req.body)
		.then(function(usr) {
			res.json(usr);
		})
		.catch(next);
});

router.post('/:id/addresses', function(req, res, next){

	models.addresses
		.create(req.body)
		.then(function(address) {
			models.users.findById(req.params.id)
				.then(function(usr) {
					usr.addresses.push(address._id);
					usr.save()
						.then(function() {
							res.json(usr);
						})
						.catch(next);
				})
				.catch(next);
		})
		.catch(next);
});

router.put('/:id', function(req, res, next) {
	models.users
		.findByIdAndUpdate(req.params.id, req.body, {new: true}) //{new: true} makes sure the updated documento is returned
		.then(function(usr) {
			res.json(usr);
		})
		.catch(next);
});

router.delete('/:id', function(req, res, next) {
	models.users
		.findByIdAndRemove(req.params.id)
		.then(function() {
			res.sendStatus(200);
		})
		.catch(next);
});

module.exports = router;