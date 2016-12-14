var cheese = require("./cheese").Cheese;

var flatMap = require("./cheese").Utils.flatMap;
var split = require("./cheese").Utils.split;

var ch = new cheese();

var words = ["test", "goodbye"];

ch.fromArray(words)
.then(split())
.then(flatMap(function(arr) {
	return arr
}))
.onError(function(e) {
	console.trace(e)
})
.each(function(cnt) {
	console.log("Ch: ", cnt.toString());
});
