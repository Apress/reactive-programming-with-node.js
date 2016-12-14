
function curry() {
	//We transform the arguments object into an array...
	var arrArguments = [].slice.call(arguments);
	var fn = arrArguments.splice(0, 1)[0];
	var headArgs = arrArguments;
	return function() { //the curried function
		var newArgs = headArgs.concat([].slice.call(arguments));
		return fn.apply(fn, newArgs)
	}
}

function filter(fn, list) {
	var newList = [];
	list.forEach(function(i) {
		if(fn(i)) {
			newList.push(i);
		}
	})
	return newList;
}

function reduce(fn, list, initValue) {
	if(!initValue) { initValue = 0;}
	return list.reduce(fn, initValue)
}


//Helper map function. This is how a curried function looks like:
function map(fn, val) {
	if(Array.isArray(val)) {
		return val.map(fn)
	} else {
		return fn(val);
	}
}


module.exports = {
	curry: curry,
	filter: filter,
	reduce: reduce,
	map: map
};;