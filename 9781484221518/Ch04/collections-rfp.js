var oStream = require("./ostreams");
var models = require("./models-crud-api");
var fUtils = require("./func_utils");
var _ = require("lodash");
var jwt = require("jsonwebtoken");

var list = new oStream();
var newUsers = new oStream();
var getUser = new oStream();
var updateUser = new oStream();
var deleteUser = new oStream();
var newAddress = new oStream();
var newTokens = new oStream();

var SECRET =  'this is a secret phrase';

var get = fUtils.get;
var map = fUtils.map;
var filter = fUtils.filter;
var isNotEmpty = fUtils.isNotEmpty;


var find = function(where, done) {
	return function() {
		return models.users.find(where, done)
	}
}
var populate = function(what) {
	return function(query) {
		return query.populate(what)
	}
}

var execute = function(query, done) {
	return query.exec(done)
}

var findById = function(id) {
	return models.users.findById(id);
}

var findByIdAndUpdate = function(params, done) {
	return models.users.findByIdAndUpdate(params[0], params[1], {new: true} ,done);
}

var findByIdAndDelete = function(id, done) {
	return models.users.findByIdAndRemove(id, done);
}

var toJSONResponse = function(data) {
	if(!data) {
		return this.customVars.httpResponse.status(401).json({
			msg: 'unauthorized request'
		});
	}
	return this.customVars.httpResponse.json(data)
}

var callErrorHandler = function(err) {
	return this.customVars.next(err);
}

var filterWithMessage = function(opts, fn) {
	var self = this;
	return function(data) {
		var fnFilter = filter(fn)
		if(fnFilter(data) !== null) {
			return data;
		} else {
			return self
					.customVars
					.httpResponse
					.status(opts.code)
					.json({error: true, msg: opts.msg});
		}
	}
}
newUsers.data
	.setVars({'httpResponse': get(1), 'next': get(2)})
	.then(get(0)) //if it's an int, it'll assume parameter is array
	.then(get('body')) //if it's a string, it'll assume parameer is object
	.then(models.users.create.bind(models.users))
	.done(toJSONResponse)
	.catch(callErrorHandler);

list.data 
		.setVars({'httpResponse': get(1), 'next': get(2)})
		.then(get(0))
		.then(filterWithMessage({code: 401, msg: 'no token provided'}, function(req) {
			var token = req.query.token || (req.body && req.body.token);
			return !!token;
		}))
		.then(filterWithMessage({code: 401, msg: 'unauthorized request'}, function(req, done) {
			var token = req.query.token || (req.body && req.body.token);
			jwt.verify(token, SECRET, done)
		}))
		.then(find({}))
		.then(populate('addresses'))
		.then(execute)
		.done(toJSONResponse)
		.catch(callErrorHandler)

getUser.data 
	.setVar('httpResponse', get(1))
	.then(get(0))
	.then(get('params.id'))
	.then(findById)
	.then(execute)
	.done(function(usr) {
		if(!usr) return this.customVars.httpResponse.sendStatus(404);
		return this.customVars.httpResponse.json(usr)
	})
	.catch(function(err) {
		return this.customVars.httpResponse.status(500).json(err);
	})

updateUser.data 
	.setVar('httpResponse', get(1))
	.then(get(0))
	.then(get('params.id', 'body'))
	.then(findByIdAndUpdate)
	.done(toJSONResponse)
	.catch(function(err) {
		return this.customVars.httpResponse.status(500).json(err);
	})

deleteUser.data 
	.setVar('httpResponse', get(1))
	.then(get(0))
	.then(get('params.id'))
	.then(findByIdAndDelete)
	.done(function() {
		return this.customVars.httpResponse.json({success: true})
	})
	.catch(function(err) {
		return this.customVars.status(500).json(err);
	})

newAddress.data 	
	.setVars({'httpResponse': get(1), 'userId': function(args) { return args[0].params.id}})
	.then(get(0))
	.then(get('body'))
	.then(models.addresses.create.bind(models.addresses))
	.then(function(address, done) {
		models.users.findByIdAndUpdate(this.customVars.userId, {$push: {'addresses': address.id}}, {new: true} ,done)
	})
	.then(function(usr, done) {
		models.users.populate(usr, {path: 'addresses'}, done)
	})
	.done(toJSONResponse)
	.catch(callErrorHandler)

newTokens.data
	.setVars({'httpResponse': get(1)})
	.then(get(0))
	.then(map(function(req) {
		return { username: req.body.username, password: req.body.password };
	}))
	.then(models.users.findOne.bind(models.users))
	.then(filterWithMessage({code: 404, msg: 'Invalid credentials'}, isNotEmpty))
	.then(function(usr) {
		return jwt.sign({
			name: usr.first_name,
			birth_date: usr.birth_date
		}, SECRET , {"expiresIn": "1 day"})
	})
	.then(map(function(t) { return { token: t }; }))
	.done(toJSONResponse)
	.catch(callErrorHandler);

var streams = {
	listUsersCollection: list,
	newUsersCollection: newUsers,
	getUserDataColection: getUser,
	updateUserCollection: updateUser,
	deleteUsersCollection: deleteUser,
	newAddressCollection: newAddress,
	newTokensCollection: newTokens
}

module.exports = streams;