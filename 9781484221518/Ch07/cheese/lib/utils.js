var _streams = require("stream");
var Cheese = require("./cheese");

/*
- helper methods exported
	* map - 
	* filter - 
	* reduce - 
	* take - 
	* take until - 
	* take while - 
	* split - 
	* debounce - 
	* flatMap  - 
	* throttle - 
*/

function flatMap(fn) {
	var _fn;
	var observable;
	var newStream = null;

	function setEachEvent(stream, observable, error_transforms, done) {
		if(Array.isArray(observable)) {
			stream.fromArray(observable)
		} else if(typeof observable === 'function') {
			stream.fromFn(observable);
		} else if(observable instanceof _streams) {
			stream.fromStream(observable);
		}
		error_transforms.forEach(function(et) {
			stream.onError(et);
		})
		
	
		//for each item emitted by newStream
		//insert it into the original stream 
		//**at the right place**	
		stream.each(function(v) {
			done(null, v);
		});
	}

	if(fn.length == 1) {
		_fn = function(value, error_transforms, done) { 
			newStream = new Cheese();
			try {
				observable = fn(value);
			} catch (e) {
				return done(e);
			}
			setEachEvent(newStream, observable, error_transforms, done);
		};
	} else {
		_fn = function(value, error_transforms, done) { 
			newStream = new Cheese();
			fn(value, function(err, observable) {
				if(err) {
					return done(err);
				}
				setEachEvent(newStream, observable, error_transforms, done);
			});
		};
	}
	_fn.__fn_type = 'flatMap';
	_fn.newInstance = function() {
		return flatMap(fn);
	}
	return _fn;
}

function map(fn) {
	var _fn = function(value, done ){
		fn(value, done);	
	};
	_fn.__fn_type = 'map';
	_fn.newInstance = function() {
		return map(fn);
	};
	return _fn;
}

function filter(fn) {
	var _fn = function(value, done) {
		fn(value, done);
	};
	_fn.newInstance = function() {
		return filter(fn);
	};
	_fn.__fn_type = 'filter';
	return _fn;
}

function reduce(init, fn) {
	var accu = init;
	var listenerSet = false;

	var _fn = function(stream, value, done) {
		accu = fn(accu , value);
		if(!listenerSet) {
			stream.on('end', function() {
				done(accu );
			});
			listenerSet = true;
		}
	};
	_fn.__fn_type = 'reduce';
	_fn.newInstance = function() {
		return reduce(init, fn);
	};
	return _fn;
}

function split(separator) {
	var _fn = function(value) {
		return value.toString().split(separator || "");
	}

	_fn.newInstance = function() {
		return _fn;
	}
	_fn.__fn_type = 'split';
	return _fn;
}

function take(number) {

	var counter = 0;
	var max = number;

	var _fn = function(stream, value, done) {
		counter++;
		if(counter == max) {
			stream.end();
		}
		return done(null, value);
	};

	_fn.__fn_type = 'take';
	_fn.newInstance = function() {
		return take(number);
	};
	return _fn;
}


function takeUntil(condition) {

	var _fn = function(stream, value, done) {
		if(condition.length === 1) {
			if(condition(value)) {
				return stream.end();
			}
			return done(null, value);
		} else {
			condition(value, function(err, resp) {
				if(!!resp === true) {
					return stream.end();
				}
				return done(err, value);
			});
		}

	};

	_fn.__fn_type = 'take';
	_fn.newInstance = function() {
		return takeUntil(condition);
	};
	return _fn;
}

function takeWhile(condition) {

	var _fn = function(stream, value, done) {
		if(condition.length === 1) {
			if(!condition(value)) {
				return stream.end();
			}
			return done(null, value);
		} else {
			condition(value, function(err, resp) {
				if(!!resp === false) {
					return stream.end();
				}
				return done(err, value);
			});
		}

	};

	_fn.__fn_type = 'take';
	_fn.newInstance = function() {
		return takeWhile(condition);
	};
	return _fn;
}


function debounce(delay) {

	var lastTimestamp = null;
	var debounced = false;
	var listeners = [];

	var _fn = function(cheese, value, index, handler, transforms, done) {
		var now = null;

		if(debounced) {
			return done(cheese._outputStream);
		}
		/*
		Remove all active listeners on outgoing stream
		*/
		listeners = cheese._outputStream.listeners('data');
		listeners.map(function(fn) {
			cheese._outputStream.removeListener('data', fn);
		});
		/*
		Overwrite the main listener for the 'data' event on the outgoing stream.
		This way we can control when to actually start the transformations and when to 
		ignore the data
		*/
		cheese._outputStream.on('data', function(v) {
			now = Date.now();
			if(!lastTimestamp) {
				lastTimestamp = Date.now();
			}
			if(now - lastTimestamp > delay) {
				cheese._execute(index, v, handler, transforms);
			}
			lastTimestamp = now;
		});

		debounced = true;
		return done(cheese._outputStream);
	};
	_fn.__fn_type = 'debounce';
	_fn.newInstance = function() {
		return debounce(delay);
	};
	return _fn;

}

function throttle(delay) {

	var throttled = false;
	var listeners = [];
	var bufferedValue = null;
	var interval = null;

	var _fn = function(cheese, value, index, handler, transforms, done) {
		if(throttled) {
			return done(cheese._outputStream);
		}
		listeners = cheese._outputStream.listeners('data');
		listeners.forEach(function(fn) {
			cheese._outputStream.removeListener('data', fn);
		});
		bufferedValue = value; 
		//buffer the last value emitted by  the stream until the moment is right to pass it along
		cheese._outputStream.on('data', function(v) {
			bufferedValue = v;
		});
		if(!interval) { //we start the interval when the first event arrives
				interval =  setInterval(function() {
					if(bufferedValue !== null) {
						cheese._execute(index, bufferedValue, handler, transforms);
						bufferedValue = null;
					}
				}, delay);
			}

		//make sure we clear the active interval when we're done
		cheese._outputStream.on('finish', function() {
			clearInterval(interval);
		})

		throttled = true;
	};
	_fn.__fn_type = 'throttle';
	_fn.newInstance = function() {
		return throttle(delay);
	};
	return _fn;

}

module.exports = {
	map: map,
	filter :filter,
	reduce: reduce,
	split: split,
	take: take,
	takeUntil: takeUntil,
	takeWhile: takeWhile,
	debounce: debounce,
	throttle: throttle,
	flatMap: flatMap
};