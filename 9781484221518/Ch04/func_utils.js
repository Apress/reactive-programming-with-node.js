function getOne(obj, what) {
	if(typeof what == 'number' || what.indexOf(".") === -1) return obj[what]
	if(what.indexOf(".") != -1) {
		var parts = what.split(".");
		var value = obj;
		parts.forEach(function(idx) {
			value = value[idx];
		})
		return value;
	}
}

function get(what) {
	var argWhat = arguments;
	return function(obj) {
		if(argWhat.length > 1) {
			return _.map(argWhat, _.partial(getOne, obj));;
		} else 	{
			return getOne(obj, what)
		}
	}
}


//Helper map function. This is how a curried function looks like:
function map(fn) {
	var curried = function(val) {
		return fn(val);
	}
	curried.__type = 'map'; //custom parameter so our then function knows how to handle us
	return curried;
}

function filter(filterFn) {
	var fn = null;
	if(filterFn.length == 1) {
		fn = function(val) {
			if(filterFn(val)) {
				return val;
			}
			return null;
		};
	} else {
		fn = function(val, done) {
			filterFn(val, function(err) {
				if(err) {
					return done(err);
				}
				return done();
			})
		}
	}
	fn.__type = 'filter';
	return fn;
}

function isNotEmpty(v) {
	if(v === false || v === 0 || v === '') return true;
	return !!v;
}


module.exports = {
	get: get,
	map: map,
	filter: filter,
	isNotEmpty: isNotEmpty
}