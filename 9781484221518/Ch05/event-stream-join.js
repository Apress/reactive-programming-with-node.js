var es = require("event-stream");
var fs = require("fs");

var writer = fs.createWriteStream('./output-join.txt');
fs.createReadStream('./event-stream-join.js')
	.pipe(es.split(" "))
	.pipe(es.map(function(str, done) {
		done(null, str.toUpperCase());
	}))
	.pipe(es.join("\n"))
	.pipe(writer);
