var list_of_lists = [ [1, 2, 3], [ 4, 5 ] , [6, 7, 8] ];
var flattened = list_of_lists.reduce(function(newList, item) {
	return newList.concat(item);
	}, []);
console.log(flattened);