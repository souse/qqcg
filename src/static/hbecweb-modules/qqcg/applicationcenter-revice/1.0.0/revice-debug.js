define("consumer/applicationcenter-revice/1.0.0/revice-debug", [ "jquery/jquery/1.10.2/jquery-debug", "pafweblib/temporary/1.0.0/numeral-debug", "$-debug", "pafweblib/FormValidator/0.2.1/FormValidator-debug" ], function(require, exports, module) {
    var $ = require("jquery/jquery/1.10.2/jquery-debug"), setNumber = require("pafweblib/temporary/1.0.0/numeral-debug"), FormValidator = require("pafweblib/FormValidator/0.2.1/FormValidator-debug");
    var revice = {
        init: function() {
            // 调整 注册支持号段：除 100、110、120外都可支持
            var pattern = /^(1[^012][0-9]{9})$/i;
            var self = this, $payAccount = $("#payAccount"), payMobileVal = $payAccount.val().replace(/\s/g, "");
            $("#payBalance").numeral({
                scale: 2,
                intlen: 12
            });
            $payAccount.numeral();
            $(".textarea-count").each(function() {
                var $t = $(this), $ta = $($t.data("textarea")), $ca = $t.find(".textarea-left");
                function modify() {
                    var max = $ta.prop("maxlength") || 50, count = $ta.val().length;
                    if (count >= max) {
                        $ta.val($ta.val().substring(0, max));
                        $ca.html(0);
                    } else {
                        $ca.html(max - count);
                    }
                }
                $ta.keyup(modify);
                modify();
            });
            self.checkForm();
            if (payMobileVal != "" && pattern.test(payMobileVal)) {
                self.queryName();
            }
        },
        queryName: function() {
            var mobile = $("#payAccount").val();
            $.ajax({
                type: "POST",
                url: window.contextPath + "/applicationCenter/payment/receiving/receiveInfo",
                data: {
                    payAccount: mobile
                },
                dataType: "JSON",
                success: function(json) {
                    $("#payName").val(json.payName);
                },
                error: function() {
                    typeof console != "undefined" && console.log("applicationCenter-payment-receiving-receiveInfo");
                }
            });
            return false;
        },
        checkForm: function() {
            var self = this;
            var validator = new FormValidator("#receiveMoneyForm", {
                rules: {
                    payAccount: "required|phone",
                    payBalance: "required|gtZero"
                },
                messages: {
                    payAccount: {
                        required: "付款方壹钱包账户不能为空",
                        phone: "付款方壹钱包账户为对方手机号码"
                    },
                    payBalance: {
                        required: "收款金额不能为空",
                        gtZero: "收款金额不能低于0元"
                    }
                },
                success: {
                    payAccount: function() {
                        self.queryName();
                    }
                }
            });
            validator.extendRules({
                gtZero: function(fieldName, value) {
                    value = window.parseFloat(value);
                    if (value <= 0) {
                        return false;
                    }
                    return true;
                }
            });
            validator.launched();
        }
    };
    module.exports = revice;
});
