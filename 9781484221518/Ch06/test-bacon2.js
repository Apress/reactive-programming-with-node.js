var fs = require("fs");
var bacon = require("baconjs");

var freadStream = fs.createReadStream("file3.txt");


function readFile(sink) {
	freadStream.on('data', function(chunk) { 
		sink(chunk);
	});
}

var fstream = bacon.fromBinder(readFile);

var charStream = fstream.map(function(chunk) {
	return chunk.toString().split("");
}).flatMap(bacon.fromArray);


var onlyNumbers = charStream.filter(function(v) {
	return !isNaN(+v);
})
var onlyChars = charStream.filter(function(v) {
	return isNaN(+v);
})

var all = onlyNumbers.merge(onlyChars);
var endedStreams = 0;

onlyNumbers
.onValue(function(n) {
	console.log("#", n);
});

onlyChars
.onValue(function(c) {
	console.log("'", c, "'");
})

all
.scan([], function(acc, c) {
 	return acc.concat(c)
})
.onValue(function(a) {
	console.log("-", a, "-");
});

