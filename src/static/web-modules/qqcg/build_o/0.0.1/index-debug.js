define("qqcg/build_o/0.0.1/index-debug", [ "./a-debug", "./b-debug", "./c-debug" ], function(require, exports, module) {
    var A = require("./a-debug");
    var B = require("./b-debug");
    var C = require("./c-debug");
    exports.init = function() {
        new A();
        new B();
        new C();
    };
});

define("qqcg/build_o/0.0.1/a-debug", [], function(require, exports, module) {
    module.exports = function() {
        console.log("i'm a ----");
    };
});

define("qqcg/build_o/0.0.1/b-debug", [], function(require, exports, module) {
    module.exports = function() {
        console.log("i'm b ----");
    };
});

define("qqcg/build_o/0.0.1/c-debug", [], function(require, exports, module) {
    module.exports = function() {
        console.log("i'm c ----");
    };
});
