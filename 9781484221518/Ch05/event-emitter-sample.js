var EventEmittter = require("events"),
	request = require("request"),
	async = require("async");


function myAsyncEmitter() {}

myAsyncEmitter.prototype = new EventEmittter();

myAsyncEmitter.prototype.process = function() {
	var self = this;
	var doneRequests = 0;

	var urls = [
		"http://www.google.com",
		"http://www.youtube.com",
		"http://www.facebook.com"
	];

	async.map(urls, function(url, done) {
		request.get(url, function(err, data) {
			doneRequests++;
			self.emit('progress', (doneRequests / urls.length));
			done(err, data.body);
		})
	}, function(err, results) {
		self.emit('done', results);
	})
};


var AE = new myAsyncEmitter();

AE.on('progress', function(percentage) {
	console.log("Percentage done: ", percentage, "%");
});

AE.once('done', function(data) {
	console.log("Process over, this is the data: ", data);
});


AE.process();


