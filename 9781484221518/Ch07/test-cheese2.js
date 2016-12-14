var cheese = require("./cheese").Cheese;
var fs = require("fs");
var es = require("event-stream");

var _utils = require("./cheese").Utils;
var map 	= _utils.map;
var filter 	= _utils.filter;
var reduce 	= _utils.reduce;

var ch = new cheese();

var chStream = ch.fromStream(fs.createReadStream('./test-cheese1.js').pipe(es.split()));

var upperCased = chStream	
					.then(map(function(c, done) {
						done(null, c.toString().toUpperCase());
					}))
console.log(upperCased._transformations)
upperCased.each(function(l) {
	console.log("-", l, "-");
})

var filtered = upperCased
					.then(filter(function(l, done) {
						done(null, l.indexOf('A') != -1);
					}))

console.log(filtered._transformations)
filtered.each(function(fl) {
	console.log("fl-", fl);
});

var totalSum =	filtered 
					.then(reduce(0, function(accu, line) {
						line = line.toString();
						for(var i = 0; i < line.length; i++) {
							accu += line.charCodeAt(i);
						}
						return accu;
					}))


console.log(totalSum._transformations)
totalSum
	.each(function(v) {
		console.log("*")
		console.log(v);
	})

var doubled = totalSum.then(map(function(v, done) {
	done(null, v * 2)
}))

doubled.each(function(v) {
		console.log("!")
	console.log(v)
})