/**
* JQUERY 控件银行帐号输入
* author yangyulei
* updated xujia(2013-12-16 10:35) 修改dispDiv元素插入到body，利于代码中的绝对定位。
**/
define("pafweblib/temporary/1.0.0/bankinput-debug", [ "$-debug" ], function(require) {
    var $ = require("$-debug");
    // 输入框格式化
    var dispDiv = '<div class="bankNoDispDiv" style="left: 231px; top: 169px;background: none repeat scroll 0 0 #FDFFCA;border: 1px solid #F4D269;color: #699C01;font-size: 30px;padding: 0 20px;position: absolute;z-index: 10;display:none">1</div>';
    $.fn.bankInput = function(options) {
        var defaults = {
            type: "input",
            //添加后四位选择select的判断 add by yechunan 2014-03-12
            selectid: "",
            min: 10,
            // 最少输入字数
            max: 25,
            // 最多输入字数
            deimiter: " ",
            // 账号分隔符
            onlyNumber: true
        };
        var opts = $.extend({}, defaults, options);
        var obj = $(this);
        // 绑定高亮显示
        obj.before(dispDiv);
        var displayDiv = obj.data("bankCodeDisplayDiv");
        if (!displayDiv) {
            displayDiv = $(dispDiv);
            displayDiv.appendTo(document.body);
            obj.data("bankCodeDisplayDiv", displayDiv);
        }
        displayDiv.css("left", obj.offset().left);
        displayDiv.css("top", obj.offset().top - displayDiv.innerHeight());
        obj.css({
            imeMode: "Disabled",
            color: "#000",
            fontFamly: "Times New Roman"
        }).attr("maxlength", opts.max);
        //if(obj.val() != '') obj.val( obj.val().replace(/\s/g,'').replace(/(\d{4})(?=\d)/g,"$1"+opts.deimiter) );
        Array.indexOf = function(array, value) {
            for (var i = 0; i < array.length; i++) {
                if (value == array[i]) {
                    return i;
                }
            }
            return -1;
        };
        obj.bind("keydown", function(event) {
            event = window.event || event;
            var keys = new Array(8, 9, 17, 91, 93, 35, 36, 37, 38, 39, 40, 46);
            if (event.shiftKey) {
                return false;
            }
            var idx = Array.indexOf(keys, event.keyCode);
            if (!(event.keyCode >= 48 && event.keyCode <= 57 || event.keyCode >= 96 && event.keyCode <= 105 || idx != -1)) {
                return false;
            }
        }).bind("keyup", function(event) {
            /*if(opts.onlyNumber){
	              if(!(event.keyCode>=48 && event.keyCode<=57)){
	                this.value=this.value.replace(/\D/g,'');
	              }    
	         }*/
            var newValue = this.value.replace(/\s/g, opts.deimiter).replace(/(\d{4})(?=\d)/g, "$1" + opts.deimiter);
            //	         if(this.value != newValue){
            //	        	 this.value = newValue;
            //	         }
            //	         this.value = this.value.replace(/\s/g,opts.deimiter).replace(/(\d{4})(?=\d)/g,"$1"+opts.deimiter);
            //添加后四位选择select的判断 add by yechunan 2014-03-12
            if (opts.type == "input") {
                displayDiv.html(newValue);
            } else if (opts.type == "select") {
                displayDiv.html([ newValue, " ", $(opts.selectid).val().trim() ].join(""));
            }
            displayDiv.css("left", obj.offset().left);
            displayDiv.css("top", obj.offset().top - displayDiv.innerHeight());
            if (newValue.trim().length > 0) {
                displayDiv.show();
            }
        }).bind("dragenter", function() {
            return false;
        }).bind("onpaste", function() {
            return !clipboardData.getData("text").match(/\D/);
        }).bind("blur", function() {
            // 卡号高亮显示层关闭
            displayDiv.hide();
            $("#magnifier").hide();
        }).bind("focus", function() {
            // 卡号高亮显示层开启
            if ($(this).val().trim() !== "") {
                var newValue = $(this).val().replace(/\s/g, opts.deimiter).replace(/(\d{4})(?=\d)/g, "$1" + opts.deimiter);
                //添加后四位选择select的判断 add by yechunan 2014-03-12
                if (opts.type == "input") {
                    displayDiv.html(newValue);
                } else if (opts.type == "select") {
                    displayDiv.html([ newValue, " ", $(opts.selectid).val().trim() ].join(""));
                }
                displayDiv.show();
            }
        });
    };
    // 列表显示格式化
    $.fn.bankList = function(options) {
        var defaults = {
            deimiter: " "
        };
        var opts = $.extend({}, defaults, options);
        return this.each(function() {
            $(this).text($(this).text().replace(/\s/g, "").replace(/(\d{4})(?=\d)/g, "$1" + opts.deimiter));
        });
    };
});
