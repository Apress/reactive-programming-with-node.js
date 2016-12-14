var cheese = require("./cheese").Cheese;
var _ = require("lodash");

var take = require("./cheese").Utils.take;
var takeUntil = require("./cheese").Utils.takeUntil;
var takeWhile = require("./cheese").Utils.takeWhile;



var ch = new cheese();
var ch1 = new cheese();
var ch2 = new cheese();


ch.fromArray(_.range(100)).then(take(10)).each(function(v) {
	console.log("Ch: ", v.toString());
});

ch1.fromArray(_.range(100)).then(takeWhile(function(v) {
	return +v < 11;
}))
.each(function(v) {
	console.log("Ch1: ", v.toString());
});

ch2.fromArray(_.range(100)).then(takeUntil(function(v) {
	return +v > 10;
}))
.each(function(v) {
	console.log("Ch2: ", v.toString());
})