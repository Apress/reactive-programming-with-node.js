var cheese = require("./cheese").Cheese;

var ch = new cheese();
var throttle = require("./cheese").Utils.throttle;

var source = [ 
	{v: "hola", d: 1},
	{v: "adios", d: 3000},
	{v: "goodbye", d: 1000},
	{v: "hello", d: 2000},
	{v: null, d: 1000}];

var lastTimestamp = 0;
var index = 0;
ch.fromFn(function(push) {

	if(Date.now() - lastTimestamp > source[index].d) {
		console.log("Pushing value: ", source[index].v)
		push(source[index].v)
		lastTimestamp = Date.now();
		index++;
	}
	

}).then(throttle(2500)).each(function(n) {
	console.log("::Received value: ", n.toString());
})
