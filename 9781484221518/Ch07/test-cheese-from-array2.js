var cheese = require("./cheese").Cheese;

var ch = new cheese();
var split = require("./cheese").Utils.split;

var source = ["hola", "adios", "goodbye", "hello"];

ch.fromArray(source).then(split()).each(function(n) {
	console.log(n);
})
