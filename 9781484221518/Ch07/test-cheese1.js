var cheese = require("./cheese").Cheese;
var fs = require("fs");

var map = require("./cheese").Utils.map;


var ch = new cheese();

var chStream = ch.fromStream(fs.createReadStream('./test-cheese1.js'));

var upperCased = chStream
					.then(map(function(c, done) {
						done(null, c.toString().toUpperCase());
					}));
var lowerCased = chStream
					.then(map(function(c, done) {
						done(null, c.toString().toLowerCase());
					}));

upperCased
	.each(function(c) {
		console.log("UUUUUUUUUUU")
		console.log(c);
		console.log("UUUUUUUUUUU")
	})


lowerCased
	.each(function(c) {
		console.log("llllllllllllll")
		console.log(c);
		console.log("llllllllllllll")
	})
