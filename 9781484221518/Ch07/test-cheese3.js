var cheese = require("./cheese").Cheese;
var fs = require("fs");
var es = require("event-stream");

var _utils = require("./cheese").Utils;
var merge = _utils.merge;

var ch = new cheese();

var stream = fs.createReadStream('./test-cheese1.js').pipe(es.split());
var stream2 = fs.createReadStream('./test-cheese2.js').pipe(es.split());

ch.fromStream(stream).merge(stream2).each(function(l) {
	console.log(l.toString());
})




