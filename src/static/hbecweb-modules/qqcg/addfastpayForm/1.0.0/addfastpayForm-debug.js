/**
 * @Description: addfastpayform
 * @Author: xujia(2014-06-27 15:05)
 */
define("consumer/addfastpayForm/1.0.0/addfastpayForm-debug", [ "jquery/jquery/1.10.2/jquery-debug", "pafweblib/FormValidator/0.2.0/idcard-debug", "pafweblib/temporary/1.0.0/bankinput-debug", "$-debug", "pafweblib/temporary/1.0.0/numeral-debug", "pafweblib/FormValidator/0.2.1/FormValidator-debug", "consumer/sendotp/1.0.0/sendotp-debug" ], function(require, exports, module) {
    var $ = require("jquery/jquery/1.10.2/jquery-debug"), idCardValidator = require("pafweblib/FormValidator/0.2.0/idcard-debug"), bankinput = require("pafweblib/temporary/1.0.0/bankinput-debug"), numeral = require("pafweblib/temporary/1.0.0/numeral-debug"), FormValidator = require("pafweblib/FormValidator/0.2.1/FormValidator-debug"), otp = require("consumer/sendotp/1.0.0/sendotp-debug");
    var currMobile, otpInstance;
    var $bankNo = $("#bankNo"), $addFastPayForm = $("#addFastPayForm"), $otpIdInput = $addFastPayForm.find('[name="otp.id"]'), $otpSend = $("#otpSend");
    exports.init = function() {
        echoBankNo();
        checkForm();
        initOtp($.trim($("#bankMobile").val()));
    };
    // 银行卡回显
    function echoBankNo() {
        $bankNo.bankInput();
    }
    // 银行卡验证实现
    function checkForm() {
        var validator = new FormValidator("#addFastPayForm", {
            rules: {
                accountName: "required",
                certificateNo: "required|check18IdCard|checkAge10",
                bankNo: "required|minlength:12",
                bankMobile: "required|phone",
                securityCode: "required|threeNum",
                "otp.otpValue": "hasSendCheck|required"
            },
            messages: {
                accountName: {
                    required: "请输入您的真实姓名"
                },
                certificateNo: {
                    required: "请输入您的身份证号",
                    check18IdCard: "请输入正确的18位身份证号",
                    checkAge10: "用户必须是10岁以上"
                },
                bankNo: {
                    required: "请输入银行卡号",
                    minlength: "银行卡号至少为12位数字"
                },
                bankMobile: {
                    required: "请输入银行卡预留手机号",
                    phone: "请输入正确的手机号码"
                },
                securityCode: {
                    required: "请输入卡背面末三位数字",
                    threeNum: "请输入正确的三位数字"
                },
                "otp.otpValue": {
                    required: "请输入获取的验证码",
                    hasSendCheck: "请点击获取验证码"
                }
            },
            success: {
                bankNo: function(feild) {
                    var $bankNo = $(feild), bankNo = $.trim($bankNo.val()), supportCardType = $.trim($("#supportCardType").val());
                    $.ajax({
                        type: "POST",
                        url: "/instruments/canFastPay",
                        data: {
                            bankNo: bankNo,
                            supportCardType: supportCardType
                        },
                        dataType: "json",
                        success: function(json) {
                            var data = json.data;
                            if (json.code == "000000") {
                                validator.clearError($bankNo);
                                renderCardFullName(data.cardFullName);
                                setCreditCardField(data.bankType == "C");
                                setFormField(data);
                            } else {
                                validator.errors[$bankNo.data("id")] = json.message;
                                validator.renderError($bankNo);
                                clearCardFullName();
                                setFormField({
                                    bankShort: "",
                                    bankType: ""
                                });
                            }
                        },
                        error: function() {}
                    });
                },
                bankMobile: function(feild) {
                    var $bankMobile = $(feild), mobile = $.trim($bankMobile.val());
                    if (!$otpSend.data("sendOTPCount")) {
                        $otpSend.prop("disabled", false);
                    }
                    initOtp(mobile);
                }
            },
            fail: {
                bankNo: function() {
                    clearCardFullName();
                },
                bankMobile: function() {
                    $otpSend.prop("disabled", true);
                }
            }
        });
        validator.extendRules({
            threeNum: function(fieldName, value) {
                return /^\d{3}$/.test(value);
            },
            hasSendCheck: function(fieldName, value) {
                var $input = $otpIdInput, otpId = $.trim($input.val());
                return otpId.length > 8;
            },
            check18IdCard: function(fieldName, value) {
                var $input = $("#" + fieldName), idCard = $.trim(value);
                if ($input.is(":hidden")) {
                    return true;
                }
                return idCardValidator.check18IdCard(idCard);
            },
            checkAge10: function(fieldName, value) {
                var $input = $("#" + fieldName), idCard = $.trim(value);
                if ($input.is(":hidden")) {
                    return true;
                }
                return idCardValidator.checkAge(idCard, 10);
            }
        });
        validator.launched();
    }
    // 短信验证码发送
    function initOtp(mobileToChange) {
    	$("#otp\\.mobile").val(mobileToChange);
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
    function renderCardFullName(info) {
        var $field = $bankNo, $control = $field.closest(".control");
        var $span = $control.find(".help-inline:not(.help-inline-supportcard)");
        if ($span.length == 0) {
            $span = $("<span/>", {
                "class": "help-inline"
            });
        }
        $control.append($span);
        $span.html(info);
        $control.addClass("hide-txt");
    }
    function clearCardFullName() {
        var $field = $bankNo, $control = $field.closest(".control");
        var $span = $control.find(".help-inline:not(.help-inline-supportcard)");
        if ($span.length != 0) {
            $span.remove();
        }
        $control.removeClass("hide-txt");
    }
    function setCreditCardField(isCredit) {
        $addFastPayForm.closest(".box-form")[isCredit ? "addClass" : "removeClass"]("kind-credit");
        $addFastPayForm.find("div.control-group-cvv2 input, div.control-group-period select").attr("disabled", !isCredit);
    }
    function setFormField(data) {
        $("#bankShort").val(data.bankShort);
        $("#bankType").val(data.bankType);
        $("#protocolLabel")[0].className = data.bankShort;
    }
});
