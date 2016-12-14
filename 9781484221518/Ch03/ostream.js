var EE = require("events");
var util = require("util");

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

Streamable.prototype.catch = function(errfn) {
	this.error_fn = errfn;
};

Streamable.prototype.then = function(fn) {
	var self = this;
	var newFn = null;
	if(!fn.__type) { //if it's not one of our helper functions...
		if(fn.length > 1) { //we're assuming the second parameter is the done callback here
			newFn = function(val) {
						fn(val, function(err, result) {
							if(err) return self.error_fn(err);
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

module.exports = ObservableStream;

