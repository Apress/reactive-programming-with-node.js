var fs = require("fs");
var zlib  = require("zlib");

var r = fs.createReadStream('package.json');
var z = zlib.createGzip();
var w = fs.createWriteStream('package.gz');
r.pipe(z).pipe(w);


var r2 = fs.createReadStream('package.json');
var z2 = zlib.createGzip();
var w2 = fs.createWriteStream('package2.gz');

w2.on('open', function() {
	r2.on('data', function(chunk) {
		console.log("data chunk: ", chunk);
		z2.write(chunk);
	});

	z2.on('data', function(data) {
		console.log("-- gzip chunk --");
		w2.write(data)
	});

	r2.on('end', function() {
		z2.end();
	});

	z2.on('end', function (){
		w2.end();
	})	
});
