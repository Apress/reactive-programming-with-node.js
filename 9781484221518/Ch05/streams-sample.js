var mongoose = require("mongoose");
var express = require("express");

// --- db
var Schema = mongoose.Schema;

var UserSchema = Schema({
	full_name: String,
	birthdate: Date,
	username: String,
	password: String,
	timestamp: Number
});

var UserModel = mongoose.model("User", UserSchema);

mongoose.connect('mongodb://localhost/test-streams');
mongoose.set('debug', true);

//--- http server
var app = express();

app.post('/users', handleNewUsers);

app.listen(3000, function() {
	console.log("Ready to roll!");
});

// --- streams

var inherits = require("util").inherits;
var streams = require("stream");
var Transform = streams.Transform;

//Turns the request's body into an object
function GetBody() {
	Transform.call(this, { objectMode: true});
}

inherits(GetBody, Transform)

GetBody.prototype._transform = function(obj, encoding, callback) {
	var str = obj.toString();
	callback(null, JSON.parse(str));
};

//Adds the timestamp value
function AddTimeStamp() {
	Transform.call(this, {objectMode: true});
}

inherits(AddTimeStamp, Transform)

AddTimeStamp.prototype._transform = function(obj, encoding, callback) {
	obj.timestamp = Date.now();
	callback(null, obj);
};

//Turns the object into a string
function ToJSONEncoder() {
	Transform.call(this, {objectMode: true});
}

inherits(ToJSONEncoder, Transform);

ToJSONEncoder.prototype._transform = function(obj, encoding, callback) {
	callback(null, JSON.stringify(obj));
};

//Saves the object into the database
function SaveUserToDB() {
	Transform.call(this, {objectMode: true});
}

inherits(SaveUserToDB, Transform);

SaveUserToDB.prototype._transform = function(obj, encoding, callback) {
	var self = this;
	UserModel.create(obj, function(err, obj) {
		if(err) {
			return callback(err);
		}
		self.push(obj);
		callback();
	});
};

var addTimeStamp = new AddTimeStamp();
var save = new SaveUserToDB();
var getBody = new GetBody();
var toJSON = new ToJSONEncoder();

function handleNewUsers(req, res, next) {
	req
		.pipe(getBody)
		.pipe(addTimeStamp)
		.pipe(save)
		.pipe(toJSON)
		.pipe(res);
}