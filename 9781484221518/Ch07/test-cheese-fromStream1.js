var cheese = require("./cheese").Cheese;
var fs = require("fs");

var map = require("./cheese").Utils.map;


var ch = new cheese();

var chStream = ch.fromStream(fs.createReadStream('./test-cheese1.js'));

chStream
	.each(function(content) {
		console.log(content.toString());
	});
