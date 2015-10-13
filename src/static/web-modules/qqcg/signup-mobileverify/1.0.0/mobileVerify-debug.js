define("consumer/signup-mobileverify/1.0.0/mobileVerify-debug", [ "$-debug", "FormValidator-debug", "sendotp-debug" ], function(require, exports, module) {
    var $ = require("$-debug"), FormValidator = require("FormValidator-debug"), otp = require("sendotp-debug");
    var otpInstance;
    var $mobileVerifyForm = $("#mobileVerifyForm"), isOtpMobileRight = false, isOtpCaptchaRight = false, $mobile = $("#mobile"), $otpIdInput = $("#otp\\.id"), $otpSend = $("#otpSend"), $captchaId = $("#captcha\\.id"), $captchaValue = $("#captcha\\.captchaValue");
    exports.init = function() {
        checkForm();
        initOtp($.trim($mobile.val()));
        initRefreshCaptcha();
        initCheckOtpDisabled();
    };
    // 银行卡验证实现
    function checkForm() {
        var validator = new FormValidator($mobileVerifyForm, {
            rules: {
                mobile: "required|phone",
                "captcha.captchaValue": "required|minlength:4",
                "otp.otpValue": "required"
            },
            messages: {
                mobile: {
                    required: "请输入正确的手机号码",
                    phone: "请输入正确的手机号码"
                },
                "captcha.captchaValue": {
                    required: "请输入正确的图片验证码",
                    minlength: "请输入正确的图片验证码"
                },
                "otp.otpValue": {
                    required: "请输入获取的手机校验码",
                    hasSendCheck: "请点击获取手机校验码"
                }
            },
            success: {
                mobile: function(feild) {
                    var $bankMobile = $(feild), mobile = $.trim($bankMobile.val());
                    isOtpMobileRight = true;
                    if (!$otpSend.data("sendOTPCount") && isOtpMobileRight && isOtpCaptchaRight) {
                        $otpSend.prop("disabled", false);
                    }
                    $("#mobileVerifyId").val(mobile);
                    initOtp({
                        mobile: mobile,
                        captchaId: $captchaId.val(),
                        captchaValue: $captchaValue.val()
                    });
                },
                "captcha.captchaValue": function(feild) {
                    var $captchaValue = $(feild);
                    sendCaptcha(function success() {
                        isOtpCaptchaRight = true;
                        if (isOtpMobileRight && isOtpCaptchaRight) {
                            $otpSend.prop("disabled", false);
                        }
                        initOtp({
                            mobile: $mobile.val(),
                            captchaId: $captchaId.val(),
                            captchaValue: $captchaValue.val()
                        });
                    }, function fail(data) {
                        validator.errors[$captchaValue.data("id")] = data.message;
                        validator.renderError($captchaValue);
                        isOtpCaptchaRight = false;
                        $otpSend.prop("disabled", true);
                    });
                }
            },
            fail: {
                mobile: function() {
                    isOtpMobileRight = false;
                    $otpSend.prop("disabled", true);
                },
                "captcha.captchaValue": function() {
                    isOtpCaptchaRight = false;
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
    //call the captcha verification
    function sendCaptcha(success, fail) {
        var id = $("#captcha\\.id").val(), data = {
            id: id,
            captchaValue: $("#captcha\\.captchaValue").val()
        };
        $.ajax({
            dataType: "json",
            url: "/captcha/" + id + "/valid",
            data: data,
            success: function(data) {
                if (data) {
                    typeof success == "function" && success();
                } else {
                    typeof fail == "function" && fail({
                        message: "请正确输入验证码"
                    });
                }
            },
            fail: function() {
                typeof fail == "function" && fail({
                    message: "系统异常，验证码验证失效，请稍后刷新页面重试"
                });
            }
        });
    }
    // 短信验证码发送
    function initOtp(sendData) {
        if (otpInstance) {
            otpInstance.changeSendData(sendData);
        } else {
            otpInstance = otp.create({
                $otpBtn: $otpSend,
                $otpValue: $("#otp\\.otpValue"),
                sendData: sendData
            });
        }
    }
    function initCheckOtpDisabled() {
        //use $mobile.focus() here instead of using $mobile.blur(), because otp.create has conflict with some method in global.js which may cause otp wrong message disappear when input wrong otp code
        $mobile.focus();
        if ($captchaValue.val()) {
            $captchaValue.blur();
        }
    }
    function initRefreshCaptcha() {
        var clickValid = true;
        $("#refresh_captcha").click(function() {
            var that = this;
            if (clickValid) {
                clickValid = false;
                setTimeout(function() {
                    $.ajax({
                        url: "/captcha",
                        dataType: "json",
                        method: "POST"
                    }).done(function(data) {
                        var $t = $(that), idEl = $("#" + $t.data("id").replace(/[.]/g, "\\.")), imgEl = $("#" + $t.data("captchaimg"));
                        imgEl.prop("src", data.img);
                        idEl.prop("value", data.id);
                    }).always(function() {
                        clickValid = true;
                    });
                }, 300);
            }
            return false;
        });
    }
});
