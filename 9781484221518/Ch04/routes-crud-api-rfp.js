var collections = require("./collections-rfp"),
	router = require("express").Router(),
	_ = require("lodash");

var mapping = {
	'/': {
		'get': collections.listUsersCollection,
		'post': collections.newUsersCollection
	},
	'/:id': {
		'get': collections.getUserDataColection,
		'put': collections.updateUserCollection,
		'delete': collections.deleteUsersCollection
	},
	'/:id/addresses': {
		'post': collections.newAddressCollection
	},
	'/tokens': {
		'post': collections.newTokensCollection
	}
};

//we setup the urls
_.each(mapping, function (actions, url) {
	_.each(actions, function(collection, method) {
		router[method](url, function() { //this is the code that every route will actually execute
			collection.add(arguments) //we pass the arguments object because we want to have access to all three parameters in one
		});
	});
});

module.exports = router;