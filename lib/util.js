var _ = {};

_.extend = function(dest, src){
	for(var key in src){
		if(src.hasOwnProperty(key)){
			dest[key] = src[key];
		}
	}
	return dest;
}

module.exports = _;