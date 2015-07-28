define("consumer/bankcard-openfastpay/1.0.0/bankcard-openfastpay-debug", [ "./openfastpayForm-debug", "jquery/jquery/1.10.2/jquery-debug", "pafweblib/FormValidator/0.2.1/FormValidator-debug", "$-debug", "consumer/sendotp/1.0.0/sendotp-debug" ], function(require, exports, module) {
    var subModulues = {
        openfastpayForm: require("./openfastpayForm-debug")
    };
    // 子模块分别初始化
    exports.init = function() {
        for (var module in subModulues) {
            try {
                subModulues[module].init();
            } catch (e) {
                window.console && console.error("bankcard-openfastpay 子模块初始化有误：" + module);
            }
        }
    };
});

/**
 * @Description: openFastPayForm
 * @Author: xujia(2014-07-21 13:20)
 */
define("consumer/bankcard-openfastpay/1.0.0/openfastpayForm-debug", [ "jquery/jquery/1.10.2/jquery-debug", "pafweblib/FormValidator/0.2.1/FormValidator-debug", "$-debug", "consumer/sendotp/1.0.0/sendotp-debug" ], function(require, exports, module) {
    var $ = require("jquery/jquery/1.10.2/jquery-debug"), FormValidator = require("pafweblib/FormValidator/0.2.1/FormValidator-debug"), otp = require("consumer/sendotp/1.0.0/sendotp-debug");
    var currMobile, otpInstance;
    var $openFastPayForm = $("#openFastPayForm"), $otpIdInput = $openFastPayForm.find('[name="otp.id"]'), $otpSend = $("#otpSend");
    exports.init = function() {
        checkForm();
        initOtp($.trim($("#bankMobile").val()));
    };
    // 银行卡验证实现
    function checkForm() {
        var validator = new FormValidator("#openFastPayForm", {
            rules: {
                bankMobile: "required|phone",
                "otp.otpValue": "hasSendCheck|required"
            },
            messages: {
                bankMobile: {
                    required: "请输入银行卡预留手机号",
                    phone: "请输入正确的手机号码"
                },
                "otp.otpValue": {
                    required: "请输入获取的验证码",
                    hasSendCheck: "请点击获取验证码"
                }
            },
            success: {
                bankMobile: function(feild) {
                    var $bankMobile = $(feild), mobile = $.trim($bankMobile.val());
                    if (!$otpSend.data("sendOTPCount")) {
                        $otpSend.prop("disabled", false);
                    }
                    initOtp(mobile);
                }
            },
            fail: {
                bankMobile: function() {
                    $otpSend.prop("disabled", true);
                }
            }
        });
        validator.extendRules({
            hasSendCheck: function(fieldName, value) {
                var $input = $otpIdInput, otpId = $.trim($input.val());
                return otpId.length > 8;
            }
        });
        validator.launched();
    }
    // 短信验证码发送
    function initOtp(mobileToChange) {
        if ($("#otp\\.mobile").length > 0) {
            $("#otp\\.mobile").val(mobileToChange);
        }
        if (currMobile) {
            otpInstance.changeSendData({
                mobile: mobileToChange
            });
        } else if (mobileToChange) {
            otpInstance = otp.create({
                $otpBtn: $otpSend,
                $otpValue: $("#otpValue"),
                sendData: {
                    mobile: mobileToChange
                }
            });
        }
        currMobile = mobileToChange;
    }
});
