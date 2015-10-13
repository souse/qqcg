define("consumer/prepaidcard-bindcard/0.1.0/prepaidcard-bindcard-debug", [ "$-debug", "validator-debug", "password-debug" ], function(require, exports, module) {
    var $ = require("$-debug"), validator = require("validator-debug"), password = require("password-debug"), doc = document, doc_body = doc.body, staticFileRoot = window.staticFileRoot;
    var $prepaidCardNo = $("input#prepaidCardNo"), $prepaidHeaderNo = $("span#cardHeaderNoSpan"), $validPrepaidCardNo = $("input#validPrepaidCardNo");
    var $sendPhoneTip = $("#sendPhoneTip"), $submitBtn = $(".addPrepaidBut");
    function addCardSuccess(active) {
        //卡是否激活两种提示：卡是否已经激活,激活：activate为true。
        var ContentDiv = "";
        if (active) {
            //卡已激活
            ContentDiv = $("#addSuccessDiv-active").html();
        } else {
            //卡未激活
            ContentDiv = $("#addSuccessDiv-noActive").html();
        }
        seajs.use([ "confirmDialog" ], function(Dialog) {
            Dialog.create({
                dialogContentTmp: ContentDiv,
                confirmHandler: function() {
                    //点击确定，跳转至预付卡管理页面
                    location.href = $("#activeFlagInput").attr("data-confirmDialogPath");
                }
            });
        });
    }
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
    //校验码获取
    function sendOTPCountdown(el) {
        return function() {
            var counter = el.data("sendOTPCount");
            if (0 >= counter--) {
                //加条件，是否执行去除disabled状态
                $(el).html(el.data("resend"));
                var len = $prepaidCardNo.parents(".control-group").find(".cardTypeTip").length;
                if (len > 0) {
                    $(el).prop("disabled", false);
                }
                clearInterval(el.data("sendOTPtimeout"));
                sendOTPtimeout = undefined;
                $sendPhoneTip.hide();
            } else {
                $(el).html(counter + "秒");
            }
            el.data("sendOTPCount", counter);
        };
    }
    function initAddPrepaidCard() {
        //添加卡成功调用函数
        var $activeFlag = $("#activeFlagInput");
        if ($activeFlag.length > 0) {
            var flag = $activeFlag.val();
            if (flag == "yes") {
                addCardSuccess(true);
            } else {
                addCardSuccess(false);
            }
        }
    }
    function eventHandle() {
        $prepaidCardNo.on("keypress", function(e) {
            var format = /\d/;
            return controlInput(format, e);
        }).on("beforeValidate", function(e) {
            $t = $(this), format = /\d/;
            if (format.test($t.val().trim())) {
                var v0 = $t.val().replace(/\s/g, ""), ns = " ", len = v0.length;
                var v = v0;
                if (len > 12) {
                    v = v0.substr(0, 1) + ns + v0.substr(1, 4) + ns + v0.substr(5, 4) + ns + v0.substr(9, 3);
                } else if (len > 9) {
                    v = v0.substr(0, 1) + ns + v0.substr(1, 4) + ns + v0.substr(5, 4) + ns + v0.substr(9);
                } else if (len > 5) {
                    v = v0.substr(0, 1) + ns + v0.substr(1, 4) + ns + v0.substr(5);
                } else if (len > 1) {
                    v = v0.substr(0, 1) + ns + v0.substr(1);
                } else {
                    v = v0.substr(0, 1);
                }
                $t.val(v);
            }
        }).on("validate", function(e, vc) {
            var $t = $(this), value = $t.val().replace(/\s/g, "") || "";
            var format = /^\d{12}$/;
            if (value === "") {
                vc.reject("请输入卡号");
                $t.parent().find(".inputTip").remove();
                $(".otpSend-prepaidCard").prop("disabled", true);
                return false;
            }
            if (!format.test(value)) {
                vc.reject("请补全剩余12位纯数字卡号");
                $t.parent().find(".inputTip").remove();
                $(".otpSend-prepaidCard").prop("disabled", true);
                return false;
            }
            var v = $prepaidHeaderNo.html().replace(/\s/g, "") + $t.val().replace(/\s/g, "");
            $validPrepaidCardNo.val(v);
            var url = $validPrepaidCardNo.attr("data-validatePath");
            var cardData = {
                cardNo: v
            };
            $.ajax({
                url: url,
                data: cardData,
                async: false,
                success: function(data) {
                    $t.parent().find(".inputTip").remove();
                    if (data.exist) {
                        var html = '<span class="inputTip cardTypeTip">' + data.cardTypeDesc + "</span>";
                        $t.after(html);
                        $(".otpSend-prepaidCard").prop("disabled", false);
                    } else {
                        vc.reject("卡片无法识别");
                        $(".otpSend-prepaidCard").prop("disabled", true);
                    }
                }
            });
        });
        $("input.checkcode").on("validate", function(e, vc) {
            var $this = $(this), value = $this.val().trim() || "";
            if (value === "") {
                vc.reject("请输入校验码");
                return false;
            }
        });
        $("#prepaidCardPwd").on("validate", function(e, vc) {
            var $this = $(this), value = $this.val().trim() || "";
            var format = /^\d{6}$/;
            if (value === "") {
                vc.reject("请输入密码");
                return false;
            }
            if (!format.test(value)) {
                vc.reject("请输入6位纯数字");
                return false;
            }
        });
        $(".otpSend-prepaidCard").each(function() {
            var $t = $(this);
            var $mobile = $($t.data("mobile"));
            $t.on("click", function(e) {
                var counter = $t.data("sendOTPCount") || 0;
                var otpPath = $t.data("otp-path") || window.contextPath + "/otp/";
                if (!$t.prop("disabled") && counter <= 0) {
                    var otpData = {};
                    otpData.mobile = $mobile.val();
                    $.post(otpPath, otpData, function(data) {
                        $sendPhoneTip.show();
                        $($t.data("id")).val(data.id);
                        var countdownFn = sendOTPCountdown($t);
                        $t.prop("disabled", true);
                        $t.data("sendOTPCount", 61).data("sendOTPtimeout", setInterval(countdownFn, 1e3));
                        countdownFn();
                    }, "json").fail(function(xhr, status, error) {
                        if (error) {
                            $t.trigger("error", error);
                        }
                    });
                }
            });
        });
    }
    function submitForm() {
        $("form#addPrepaidCardForm").submit(function() {
            var v = $prepaidHeaderNo.html().replace(/\s/g, "") + $prepaidCardNo.val().replace(/\s/g, "");
            $validPrepaidCardNo.val(v);
        });
    }
    exports.init = function() {
        initAddPrepaidCard();
        eventHandle();
        submitForm();
    };
});
