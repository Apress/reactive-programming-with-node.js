var fs = require("fs");
var functionalUtils = require("./func_utils");
var ObservableStream = require("./ostream");

/*
Utility functions
*/
var filter_unwanted_characters = functionalUtils.curry(functionalUtils.filter, function(c) {
	return /[a-zA-Z0-9 ]/.test(c);
});
var mapToInt = functionalUtils.curry(functionalUtils.map, function(c) {  return c.charCodeAt(0); } );
var addUp = functionalUtils.curry(functionalUtils.reduce, function(x, y) { return x + y; });
var split = function(str) { return str.toString().split(""); };

var concat = function(target) {
	return function(source) {
		target += source;
		return target;
	};
};

//streams setup
var dataStream = new ObservableStream();

dataStream.data
	.then(fs.readFile)
	.then(split)
	.then(filter_unwanted_characters)
	.then(mapToInt)
	.then(addUp)
	.then(console.log)
	.catch(function(error) { //Error handling!
		console.log("There was an error: ", error);
	})

var filenameStream = new ObservableStream();

var filename = "";
filenameStream.data
	.then(concat(filename))
	.then(function(str) {
		if(str.charCodeAt(str.length - 1) == 13) {
			dataStream.add(str.trim());
			filename = "";
		}
	});


var stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.on('data', function(input) {
	var character = input.toString();
	console.log(character);
	if(character.charCodeAt(0) === 27) process.exit(0); //exit with ESC
	filenameStream.add(character);
});

