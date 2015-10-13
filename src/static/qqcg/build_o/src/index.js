define(function (require,exports,module){
	var A = require("./a"),B = require("./b"),C = require("./c");
	var Base = require('arale/base/1.1.1/base');
	var Dialog = require('arale/dialog/1.3.1/dialog');
	var Dnd = require('arale/dnd/1.0.0/dnd');
	exports.init = function(){
		//new A();new B();new C();
		var Pig = Base.extend({
		    attrs: {
		        name: ''
		    },
		    talk: function() {
		        alert('我是' + this.get('name'));
		    }
		});
		var example = new Dialog({
	        content: '<div id="test3">test3</div>'
	      });
	    example.render();
	    example.show();
		setTimeout(function(){
	    	example.destroy();
	    },3000);
	    var dnd = new Dnd('.a', {containment: 'footer .container'});
	};
});