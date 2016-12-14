var fs = require("fs");

//Map using regular callbacks
function map(list, fn, done) {

	var results = [];
	var counter = 0;

	list.forEach(function(i) {
		fn(i, function(err, result) {
			if(err) return done(err);
			results.push(result)
			counter++;
			if( counter == list.length ) {
				done(null, results)
			}
		});
	});
}


//Sample code using promis based map function
var filenames = ['file1.txt', 'file2.txt'];
map(filenames, fs.readFile, function(err, content) {
	if(err) {
		console.error("There was an error reading your files: ", err);
	} else {
		console.log("------- Content of the files ---------");
		console.log(content.toString());
	}
});
