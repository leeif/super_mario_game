var Utils = Utils || {};

Utils.createCounter = function(){
	var i = 0;

	return {
		add : function(){
			i++;
		},
		clear : function(){
			i = 0;
		},
		get : function(){
			return i;
		}
	};
};

Utils.promisify = function(object, method){
	
	return function(){
		var deferred = Q.defer();
    var args = Array.prototype.slice.call(arguments, 0);
    args.push(deferred.makeNodeResolver());
    method.apply(object, args);
    return deferred.promise;
	};
};

Utils.timer = function(interval, callback){
	return setInterval(callback, interval);
};

Utils.clearTimer = function(timerId){
	clearInterval(timerId);
};