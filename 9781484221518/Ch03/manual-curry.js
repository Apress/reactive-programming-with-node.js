


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


function sum(a, b) {
	return a + b;
}

var sum10 = curry(sum, 10)

console.log(sum10(1));

function filter(fn, list) {
	var newList = [];
	list.forEach(function(i) {
		if(fn(i)) {
			newList.push(i);
		}
	})
	return newList;
}

var only_odd_numbers = curry(filter, function(nmbr) { 
		return nmbr % 2 == 0; 
	});
var list1 = [1,2,3,4,5,6,7,8,9,0];
var list2 = [-1, -4, -6, 23, 10];
var list3 = ['string', 'word', 4, 2, Date()];
 // now we can do
console.log(only_odd_numbers(list1));
console.log(only_odd_numbers(list2));
console.log(only_odd_numbers(list3));