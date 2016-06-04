var _ = {};

_.extend = function(dest, src){
	for(var key in src){
		if(src.hasOwnProperty(key)){
			dest[key] = src[key];
		}
	}
	return dest;
}
_.each = function(arr, fn){
	for(var i = 0 , len = arr.length ; i < len; i++){
		fn(arr[i], i);
	}
}

module.exports = _;