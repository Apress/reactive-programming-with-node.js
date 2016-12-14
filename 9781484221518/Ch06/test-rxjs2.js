var rx = require("rx");
var noderx = require("rx-node")
var fs = require("fs");

var stream = noderx.fromStream(fs.createReadStream('./test-rxjs2.js'));

stream
	.flatMap(function(s){ return s.toString().split(" ") })
	.map(function(str) {
		return str.toUpperCase();
	})
	.subscribe(function(b) {
		console.log(b.toString() + "\n")
	});
