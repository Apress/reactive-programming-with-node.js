var rx = require("rx");
var rxnode = require("rx-node")

var subscription = rxnode.fromReadableStream(process.stdin);

subscription.filter(function(line) {
	return line.toString().match(/[a]{1}/g).length > 5;
})
.subscribe(function (x) { 
	console.log(x.toString()); 
});


