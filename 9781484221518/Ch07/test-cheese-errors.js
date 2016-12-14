var cheese = require("./cheese").Cheese;
var map = require("./cheese").Utils.map;

var ch = new cheese();

var source = [1]; //,2,3,4,5,6,7,8,9];

ch
	.fromArray(source)
	.then(map(function(v, done) {
		done("Error while doing map");
	}))
	.onError(function(err) {
		console.log("-----This is an error----------")
		console.log(err.toString());
		console.log(err.stack)
		console.log("-----/This is an error----------")
		return err;
	})
	.onError(function(err) {
		console.log("===============UpperCased error===================")
		console.log(err.toString().toUpperCase());
		console.log("===============/UpperCased error===================")
	})
	.each(function(n) {
		console.log(+n);
	})
