var fs = require("fs");

//Map using ECMAScript 6 Promises
function map(list, fn) {

	var promises = [];

	list.forEach(function(i) {
		var p = new Promise(function(resolve, reject) {
			fn(i, function(err, result) {
				if(err) return reject(err);
				resolve(result);
			})
		});
		promises.push(p);
	})
	
	return Promise.all(promises);
}


//Sample code using promis based map function
var filenames = ['file1.txt', 'file2.txt'];
map(filenames, fs.readFile)
	.then(function(content) {
		console.log("------- Content of the files ---------");
		console.log(content.toString());
	})
	.catch(function(err) {
		console.error("There was an error reading your files: ", err);
	})