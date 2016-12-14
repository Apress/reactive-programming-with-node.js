var cheese = require("./cheese").Cheese;

var ch = new cheese();

var source = [1,2,3,4,5,6,7,8,9];

ch.fromArray(source).each(function(n) {
	console.log(+n);
})
