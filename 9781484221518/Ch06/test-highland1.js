var  _ = require("highland");


var source = ['value1', 'value2', 'value3'];

_(source).map(function(v) {
	console.log("Calls++")
	return v.toUpperCase();
}).toArray(function(arr) {
	console.log(arr);
});
