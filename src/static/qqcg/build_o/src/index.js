define(function (require,exports,module){
	var A = require("./a");
	var B = require("./b");
	var C = require("./c");
	exports.init = function(){
		new A();
		new B();
		new C();
	};
});