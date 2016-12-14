var  _ = require("highland");
var fs = require("fs");

function getData(fname) {
	return function(push, next) {
		fs.readFile(fname, function(err, data) {
			if(err) push(err);
			else {
				var lines = data.toString().split("\n");
				lines.forEach(function(l) {
					push(null, l);
				});
				push(null, _.nil);//_.nil indicates the end of the stream
				next();
			}
		})
	}
}

_(getData('./file42.txt')).map(function(v) {
	console.log("Calls++")
	return v.toUpperCase();
})
.errors(function(err, push) {
	if(err.code == 'ENOENT') { //If the file is not found, simply return an empty string so the code is not affected
		push(null, '');
	} else {
		push(err);
	}
})
.toArray(function(arr) {
	console.log(arr);
});
