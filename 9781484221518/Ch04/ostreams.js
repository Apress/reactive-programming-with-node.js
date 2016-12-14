var EE = require("events");
var util = require("util");
var _ = require("lodash");

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
		stream.emit('trigger', v)
	})

	return stream;
}

function Streamable() {
	this.events = []
	this.idx = 0;
	this.customVars = {};
	this.error_fn = null;
	this.done_fn = function() {};
}

Streamable.prototype.start = function(val) {
	this.idx = 0;
	this.next(val);
}

Streamable.prototype.next = function(val, result) {
	if(this.idx >= this.events.length) return false;
	var currentFn = this.events[this.idx];

	this.idx++;
	currentFn(val);
};


Streamable.prototype.catch = function(errfn) {
	this.error_fn = errfn;
};

Streamable.prototype.setVars = function(map) {
	var self = this;
	var fn = function(args) {
		_.each(map,  function(value, key) {
			self.customVars[key] = typeof value == 'function' ? value(args) : value;
		})
		self.next(args);
	}

	this.events.push(fn);
	return this;
};
Streamable.prototype.setVar = function(name, value) {
	var self = this;
	var fn = function(args) {
		self.customVars[name] = typeof value == 'function' ? value(args) : value;
		self.next(args);
	}

	this.events.push(fn);
	return this;
};

Streamable.prototype.getVar = function(name) {
	return this.customVars[name];
}

Streamable.prototype.done = function(fn) {
	this.done_fn = fn;
	return this.then(fn);
}

Streamable.prototype.then = function(fn) {
	var self = this;
	var newFn = null;
	if(!fn.__type) { //if it's not one of our helper functions...

		if(fn.length > 1 ) { // checking the number of arguments a function receives. If it's higher than 1, we're assuming the second parameter is the done callback
			newFn = function(val) {
			 	var newThis = _.extend(self, fn)
				fn.bind(newThis)(val, function(err, result) {
					if(err) return self.error_fn(err);
					self.next(result);
				})
			};
		} else {
			newFn = function(val) {

				 	var newThis = _.extend(fn, self)
					self.next(fn.bind(newThis)(val));
				};
		}
	} else { //if it is...
		if(fn.__type === 'map') {
			newFn = function(val) {
					self.next(fn(val))
				};
		}
		if(fn.__type === 'filter') {
			newFn = function(val) {
				 	var newThis = _.extend(fn, self)
					if(fn.length == 1) { //simple filter
						var result = fn.bind(newThis)(val);
						if(result) {
							self.next(result)
						} else {
							self.done_fn(null);
						}
					} else { //asynch filter
						fn.bind(newThis)(val, function(err, result) {
							if(err) return self.done_fn(err);
							self.next(result);
						})
					}
				};
		}
	}
	if(newFn)
		this.events.push(newFn);
	return this;  // we return the object, so we 
}


module.exports = ObservableStream;
