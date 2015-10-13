define("consumer/applicationcenter-payment/1.0.0/payment-debug", [ "jquery/jquery/1.10.2/jquery-debug", "pafweblib/temporary/1.0.0/numeral-debug", "$-debug", "pafweblib/FormValidator/0.2.1/FormValidator-debug" ], function(require, exports, module) {
    var $ = require("jquery/jquery/1.10.2/jquery-debug"), setNumber = require("pafweblib/temporary/1.0.0/numeral-debug"), FormValidator = require("pafweblib/FormValidator/0.2.1/FormValidator-debug");
    var payment = {
        init: function() {
            // 调整 注册支持号段：除 100、110、120外都可支持
            var pattern = /^(1[^012][0-9]{9})$/i;
            var self = this, $receiverAccount = $("#receiverAccount"), $amount = $("#amount"), receiverIdVal = $receiverAccount.val().replace(/\s/g, "");
            $receiverAccount.numeral();
            $amount.numeral({
                scale: 2,
                intlen: 12
            });
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
            if (receiverIdVal != "" && pattern.test(receiverIdVal)) {
                self.getUserData();
            }
        },
        getUserData: function() {
            var val = $("#receiverAccount").val();
            $.ajax({
                type: "POST",
                dataType: "JSON",
                data: {},
                url: window.contextPath + "/users/" + val,
                success: function(data) {
                    //如果用户为非实名
                    if ("D" === data.level) {
                        //$('#receiverNameTips').text("该用户未实名,请务必输入正确的姓名");
                        $("#receiverName").val("");
                    } else {
                        $("#receiverName").val(data.name);
                    }
                },
                error: function() {
                    typeof console != "undefined" && console.log("applicationCenter-payment-payment-paymentInfo");
                }
            });
        },
        checkForm: function() {
            var self = this;
            var validator = new FormValidator("#paymentForm", {
                rules: {
                    receiverAccount: "required|phone",
                    amount: "required|gtZero",
                    receiverName: "required"
                },
                messages: {
                    receiverAccount: {
                        required: "收款方壹钱包账户不能为空",
                        phone: "收款方壹钱包账户为对方手机号码"
                    },
                    amount: {
                        required: "付款金额不能为空",
                        gtZero: "付款金额必须高于0元"
                    },
                    receiverName: {
                        required: "收款方姓名不能为空"
                    }
                },
                success: {
                    receiverAccount: function() {
                        self.getUserData();
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
    module.exports = payment;
});
