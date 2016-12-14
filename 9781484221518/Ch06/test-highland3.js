var  _ = require("highland");
var fs = require("fs");


var readFile = _.wrapCallback(fs.readFile);
var filenames = _(['file1.txt', 'file2.txt', 'file3.txt']);

// read from up to 10 files at once
filenames
	.map(readFile)
	.parallel(10)
	.each(function(x) {
		console.log("---");
		console.log(x.toString());
		console.log("---");
	});