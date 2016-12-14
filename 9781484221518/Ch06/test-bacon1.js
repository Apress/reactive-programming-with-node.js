var bacon = require("baconjs");
var fs = require("fs");

process.stdin.resume();
process.stdin.setEncoding('utf8');
var util = require('util');


function readFilenames(sink) {
	process.stdin.on('data', function (text) {
	   sink(text.trim());
	});
}

//Create a new EventStream from a custom function
var filenames = bacon.fromBinder(readFilenames);

filenames.onValue(function(name) { //tap into the stream to know what's going on
	console.log("-- New filename: ", name, " --")
})

var names = filenames.scan([], function(acc, name) { //grab 2 filenames at a time
	return acc.length === 2 ? [] : acc.concat(name);
});

var groupfilenames = names.filter(function(acc) { //once we have 2 move on, otherwise, stop here
	return acc.length === 2;
	})
.flatMap(bacon.fromArray) //turn the new array into a stream

groupfilenames.onValue(function(fnames) {
	console.log('[', fnames, ']');
})

groupfilenames.flatMap(function(name) {
	return bacon.fromNodeCallback(fs.readFile, name);
})
.onValue(function(content) { 
	console.log(content.toString());
});

