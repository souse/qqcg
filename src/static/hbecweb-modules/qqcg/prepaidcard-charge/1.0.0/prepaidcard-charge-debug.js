define("consumer/prepaidcard-charge/1.0.0/prepaidcard-charge-debug", [ "$-debug", "Validator-debug" ], function(require, exports, module) {
    var $ = require("$-debug"), staticFileRoot = window.staticFileRoot, doc = document, doc_body = doc.body;
    var fnDisable = function() {
        $(".js_submit").prop("disabled", true);
        $(".js_submit").addClass("submitting");
    };
    var fnEnable = function() {
        $(".js_submit").removeAttr("disabled");
        $(".js_submit").removeClass("submitting");
    };
    require("Validator-debug");
    function controlInput(format, e) {
        //传正则进去
        if (e.charCode != undefined) {
            if (e.charCode != 0 && !format.test(String.fromCharCode(e.charCode))) {
                e.preventDefault();
                return false;
            }
        } else {
            if (e.keyCode != 0 && !format.test(String.fromCharCode(e.keyCode))) {
                e.preventDefault();
                return false;
            }
        }
        return true;
    }
    var prepaidcardCharge = function() {
        try {
            //验证form表单元素
            var value;
            var $this = $(this);
            $("#chargeAmount").on("keypress", function(e) {
                var format = /\d|\./;
                return controlInput(format, e);
            }).on("keyup", function(e) {
                var $this = $(this);
                var available = $(".maxAccountAmt").val();
                var v = $this.val();
                if (!/\d|\./g.test(v)) {
                    // no chinese and other symbols
                    $this.val(v.substr(0, v.length - 1).replace(/[\u4e00-\u9fa5]/g, "").replace(/\D/g, ""));
                    return false;
                }
                if (v.replace(/\d|\./g, "").length > 0) {
                    $this.val(v.replace(/[^\d|^\.]/g, ""));
                    $(this).closest("span").siblings(".help-block").remove();
                    $(this).closest(".controls").append('<div class="help-block">请输入正确的金额!</div>');
                    $(this).closest(".controls").parent().addClass("control-group-error");
                    fnDisable();
                    return false;
                } else {
                    $(this).closest("span").siblings(".help-block").remove();
                    $(this).closest(".controls").removeClass("control-group-error");
                }
                $this.val(value = $this.val().replace(/\s/g, "").replace(/[\u4e00-\u9fa5]/g, ""));
                //0. no blank;no chinese
                var arr = value.split("."), len = arr.length;
                var h = "";
                if (len == 2 && arr[1] && arr[1].length > 2) {
                    //3. 小数点后四舍五入保留两位
                    h = arr[1].substr(-1);
                    arr[1] = arr[1].substr(0, 2);
                    var str = arr.join(".");
                    if (h > 4) {
                        str = parseFloat(str) + .01;
                    }
                    $(this).val(parseFloat(str).toFixed(2));
                    fnDisable();
                    $(this).closest("span").siblings(".help-block").remove();
                    $(this).closest(".controls").append('<div class="help-block">小数点后四舍五入保留两位!</div>');
                    $(this).closest(".controls").parent().addClass("control-group-error");
                } else {
                    $(this).closest("span").siblings(".help-block").remove();
                }
                if (parseFloat(available) < parseFloat(value) * 1e6) {
                    //7. 输入数字应小于额度
                    //    			vc.reject("你的卡要充爆了,请重新输入!");
                    $(this).closest("form").find(".formError").remove();
                    $(this).closest("form").prepend('<div class="formError"><span class="errorIcon">&nbsp;</span>你的卡要充爆了,请重新输入.</div>');
                    $this.val("");
                    fnDisable();
                    return;
                } else {
                    $(this).closest("form").find(".formError").remove();
                    fnEnable();
                    return true;
                }
            }).on("validate", function(e, vc) {
                var $this = $(this);
                var available = $(".maxAccountAmt").val();
                $this.val(value = $this.val().replace(/\s/g, ""));
                //0. 不能输入空格
                //	            		$(this).val(value.replace(/[a-zA-Z]/,''));					//1. 替换掉字母
                if (value === "" || value == 0 && !/[^\.]/g.test(value)) {
                    //2. 不能为空
                    vc.reject("请输入金额!");
                    fnDisable();
                    $(this).val("");
                    return false;
                }
                var arr = value.split("."), len = arr.length;
                var h = "";
                if (len > 2) {
                    //4. 不能输入两个小数点
                    $(this).val((arr.length = 2) && arr.join("."));
                    fnDisable();
                    vc.reject("输入数字不能有两个小数点!");
                    return;
                }
                if (/^[0]{2,}/g.test(value)) {
                    //5. 不能输入两个小数点
                    $(this).val("");
                    vc.reject("数字输入开头不能有两个0!");
                    fnDisable();
                    return;
                }
                if (/^[0]+[1-9]/.test(value)) {
                    //6. 去掉数字前面的0
                    $(this).val(value.substr(1));
                }
                if (value.length > 0) {
                    $(this).val(value.replace(/[^\d|^\.]/g, ""));
                    return;
                }
            }).on("blur", function(e, vc) {
                var $this = $(this);
                if (parseFloat($this.val()) * 1e6 <= parseFloat($(".maxAccountAmt").val())) {
                    $(this).closest("span").siblings(".help-block").remove();
                    $(this).val(parseFloat(value));
                    fnEnable();
                }
            });
            //form表单提交
            $("form#chargeForm").submit(function() {
                if ($(".js_submit").hasClass("submitting")) {
                    return false;
                } else {
                    $(".js_submit").addClass("submitting");
                }
            });
        } catch (e) {
            window.console && console.log("Initialize charge module error！");
        }
    };
    module.exports = prepaidcardCharge();
});
