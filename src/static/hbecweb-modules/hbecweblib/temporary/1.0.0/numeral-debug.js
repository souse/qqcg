define("hbeclib/temporary/1.0.0/numeral-debug", [ "$-debug" ], function(require, exports, module) {
    //注释
    var $ = require("$-debug");
    /**
     * 限制输入框只能输入数字(JQuery插件)
     *
     * @example $("#amount").numeral()
     *
     * @example $("#amount").numeral(4) or $("#amount").numeral({'scale': 4})
     *
     * @example $(".x-amount").numeral()
     **/
    $.fn.numeral = function() {
        var args = arguments;
        var json = typeof args[0] == "object";
        var scale = json ? args[0].scale : args[0];
        var intlen = json ? args[0].intlen : args[0];
        scale = scale || 0;
        intlen = intlen || 0;
        var keys = new Array(8, 9, 35, 36, 37, 38, 39, 40, 46);
        this.bind("keydown", function(e) {
            e = window.event || e;
            var code = e.which || e.keyCode;
            if (e.shiftKey) {
                return false;
            }
            var idx = Array.indexOf(keys, code);
            if (idx != -1) {
                return true;
            }
            var value = this.value;
            var intVal = parseInt(value || 0);
            if (code == 190 || code == 110) {
                if (scale == 0 || value.indexOf(".") != -1) {}
                return true;
            } else {
                if (code >= 48 && code <= 57 || code >= 96 && code <= 105) {
                    if (scale > 0 && value.indexOf(".") != -1) {
                        var reg = new RegExp("^[0-9]+(.[0-9]{0," + (scale - 1) + "})?$");
                        var selText = getSelection();
                        if (selText != value && !reg.test(value)) {}
                    }
                    return true;
                }
                return false;
            }
        });
        this.bind("keyup", function(e) {
            var value = this.value;
            var valArr = value.split(".");
            var intVal = valArr.length <= 1 ? value : valArr[0];
            var floatVal = valArr.length <= 1 ? null : valArr[1];
            e = window.event || e;
            var code = e.which || e.keyCode;
            if (code >= 48 && code <= 57 || code >= 96 && code <= 105) {
                if (intVal && intlen && intVal.toString() >= intlen) {
                    intVal = intVal.substring(0, intlen);
                }
                if (floatVal && floatVal.toString() >= scale) {
                    floatVal = floatVal.substring(0, scale);
                }
                // console.log(intVal, floatVal);
                if (floatVal || floatVal == "") {
                    this.value = intVal + "." + floatVal;
                } else {
                    this.value = intVal;
                }
            }
        });
        this.bind("blur", function() {
            if (this.value.lastIndexOf(".") == this.value.length - 1) {
                this.value = this.value.substr(0, this.value.length - 1);
            } else if (isNaN(this.value)) {
                this.value = "";
            } else {
                var value = this.value;
                if (scale > 0 && value.indexOf(".") != -1) {
                    var reg = new RegExp("^[0-9]+(.[0-9]{0," + scale + "})?$");
                    if (!reg.test(value)) {
                        this.value = format(value, scale);
                    }
                }
            }
        });
        this.bind("paste", function() {
            if (window.clipboardData == undefined) return true;
            var s = window.clipboardData.getData("text");
            if (!/\D/.test(s)) ;
            value = s.replace(/^0*/, "");
        });
        this.bind("dragenter", function() {
            return false;
        });
        var format = function(value, scale) {
            return Math.round(value * Math.pow(10, scale)) / Math.pow(10, scale);
        };
        var getSelection = function() {
            if (window.getSelection) {
                return window.getSelection();
            }
            if (document.selection) {
                return document.selection.createRange().text;
            }
            return "";
        };
        Array.indexOf = function(array, value) {
            for (var i = 0; i < array.length; i++) {
                if (value == array[i]) {
                    return i;
                }
            }
            return -1;
        };
    };
});
