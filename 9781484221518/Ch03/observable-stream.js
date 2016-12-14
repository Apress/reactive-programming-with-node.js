var EE = require("events");
var util = require("util");
var fs = require("fs");

function ObservableStream() {
	this.values = [];
	EE.call(this);
	Object.defineProperty(this, 'data', {
		get: function() { //getValues' old code
			var self = this;
			var stream = new Streamable();

			self.on('data', function(v) {
				stream.start(v)
			})
			return stream;		
		}
	});
}
}

util.inherits(ObservableStream, EE);

ObservableStream.prototype.add = function(value) {
	this.values.push(value);
	this.emit('data', value);
};

ObservableStream.prototype.getValues = function(){ 
	var self = this;
	var stream = new Streamable();

	self.on('data', function(v) {
		stream.start(v)
	})

	return stream;
}

function Streamable(triggerCode) {
	this.events = []
	this.idx = 0;
}

Streamable.prototype.start = function(val) {
	this.idx = 0;
	this.next(val);
}

Streamable.prototype.next = function(val, result) {
	if(this.idx >= this.events.length) return false;
	var currentFn = this.events[this.idx]

	this.idx++;
	currentFn(val);
};


Streamable.prototype.then = function(fn) {
	var self = this;
	var newFn = null;
	if(!fn.__type) { //if it's not one of our helper functions...
		if(fn.length > 1) { //we're assuming the second parameter is the done callback here
			newFn = function(val) {
						fn(val, function(err, result) {
							self.next(result);
						})
					};
		} else {
			newFn = function(val) {
						self.next(fn(val));
					};
		}
	} else { //if it is...
		if(fn.__type === 'map') {
			newFn = function(val) {
					self.next(fn(val))
				};
		}
	}
	if(newFn)
		this.events.push(newFn);
	return this;
}


var dataStream = new ObservableStream();

dataStream.data
	.then(map(function(x) {
		return 'filename_' + x + '.txt';
	}))
	.then(fs.readFile)
	.then(map(function(x) {
		return '' + x;
	}))
	.then(console.log)

var stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.on('data', function(input) {
	var str = input.toString();
	dataStream.add(str)
	if(str == 'x') {
		process.exit();
	}
})

//Helper map function. This is how a curried function looks like:
function map(fn) {
	var curried = function(val) {
		return fn(val);
	}
	curried.__type = 'map'; //custom parameter so our then function knows how to handle us
	return curried;
}

