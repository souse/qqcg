/***
*	input框输入手机号高亮显示	
*/
define("pafweblib/temporary/1.0.0/magnify-debug", [ "$-debug" ], function(require) {
    var $ = require("$-debug");
    var dispDiv = '<div id="magnifier" style="left:1; top:1;background: none repeat scroll 0 0 #FDFFCA;border: 1px solid #F4D269;color: #699C01;font-size: 30px;padding: 0 20px;position: absolute;z-index: 10;display:none">1</div>';
    dispDiv = $(dispDiv);
    $(document.body).append(dispDiv);
    $.fn.magnify = function(options) {
        var defaults = {
            delimitator: " ",
            // 账号分隔符
            group: "444"
        };
        var opts = $.extend({}, defaults, options);
        var $t = $(this), that = this;
        this.opts = opts;
        // 绑定高亮显示
        dispDiv.css("left", $t.offset().left);
        dispDiv.css("top", $t.offset().top - dispDiv.innerHeight());
        $t.css({
            imeMode: "Disabled",
            color: "#000",
            fontFamly: "Times New Roman"
        }).attr("maxlength", opts.max);
        function massage(el) {
            var $t = $(el), tVal = $t.val(), divVal, startVal, endVal;
            dispDiv.css("left", $t.offset().left);
            dispDiv.css("top", $t.offset().top - dispDiv.innerHeight());
            if (opts.group.indexOf("3") > -1) {
                if (tVal.length > 3) {
                    divVal = tVal.substring(0, 3) + opts.delimitator + tVal.substring(3).replace(/\s/g, opts.delimitator).replace(/(\d{4})(?=\d)/g, "$1" + opts.delimitator);
                } else {
                    divVal = tVal;
                }
            } else {
                divVal = tVal.replace(/\s/g, opts.delimitator).replace(/(\d{4})(?=\d)/g, "$1" + opts.delimitator);
            }
            dispDiv.html(divVal);
        }
        this.each(function() {
            massage(this);
        });
        $t.on("keypress change", function(event) {
            var that = this, $t = $(that);
            massage(that);
        }).on("keyup", function() {
            var that = this;
            if (that.value.replace(/\s/g, "").length) {
                massage(that);
                dispDiv.show();
            } else {
                dispDiv.hide();
            }
            dispDiv.css("left", $t.offset().left);
            dispDiv.css("top", $t.offset().top - dispDiv.innerHeight());
        }).on("dragenter", function() {
            return false;
        }).on("onpaste", function() {
            return !clipboardData.getData("text").match(/\D/);
        }).on("blur", function() {
            // 卡号高亮显示层关闭
            dispDiv.hide();
        }).on("focus", function() {
            // 卡号高亮显示层开启
            if ($(this).val().replace(/\s/g, "") !== "") {
                massage(this);
                dispDiv.show();
            }
        });
    };
});
