var cheese = require("./cheese").Cheese;
var fs =  require("fs");

var flatMap = require("./cheese").Utils.flatMap;

var ch = new cheese();

var filenames = ['./test-cheese1.js', './test-cheese23.js'];

ch.fromArray(filenames)
.then(flatMap(function(name) {
	return fs.createReadStream(name.toString())
}))
.onError(function(e) {
	console.trace(e)
})
.each(function(cnt) {
	console.log("Ch: ", cnt.toString());
});
