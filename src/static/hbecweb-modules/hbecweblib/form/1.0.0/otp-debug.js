/**
 * @Description: otp.js
 * @Author: xujia(2014-08-28 20:36)
 */
define("pafweblib/form/1.0.0/otp-debug", [ "$-debug" ], function(require, exports, module) {
    var $ = require("$-debug");
    var OTP = function(options) {
        this.otps = $.extend({}, OTP.defaults, options);
        this.init();
    };
    OTP.prototype = {
        init: function() {
            var otps = this.otps, self = this;
            if (otps.getOtpOk) {
                self.getOtpOk = otps.getOtpOk;
            }
            if (otps.getOtpError) {
                self.getOtpError = otps.getOtpError;
            }
            self.activeOtp();
            self.handleSend();
        },
        create: function(options) {
            return new OTP(options);
        },
        handleSend: function() {
            var otps = this.otps, self = this;
            otps.$otpBtn.bind("click", function() {
                var counter = otps.$otpBtn.data("sendOTPCount") || 0;
                var resend = otps.$otpBtn.data("resend") || "";
                if (otps.$otpBtn.prop("disabled")) {
                    return false;
                }
                var countdownFn = self.sendOTPCountdown(otps.$otpBtn);
                otps.$otpBtn.prop("disabled", true);
                otps.$otpBtn.data("sendOTPCount", 61).data("sendOTPtimeout", setInterval(countdownFn, 1e3));
                countdownFn();
                //发送验证码请求逻辑
                self.getOtp();
            });
        },
        getOtp: function() {
            var self = this, otps = this.otps;
            var otpPath = otps.$otpBtn.data("otp-path") || window.contextPath + "/otp/";
            $.ajax({
                type: "POST",
                url: otpPath,
                //url: './otp.json',
                data: otps.sendData,
                datatype: "json",
                success: function(data) {
                    self.getOtpOk(data);
                },
                error: function(xhr, status, error) {
                    self.getOtpError(error);
                }
            });
        },
        activeOtp: function() {
            var otps = this.otps;
            //先把otpBtn的click事件解绑
            otps.$otpBtn.unbind("click");
            //初始化时otp输入框为空
            otps.$otpValue.val("");
            //按钮文字重置为初始值
            if (otps.$otpBtn[0].tagName == "INPUT") {
                otps.$otpBtn.val(otps.btnText);
            } else {
                otps.$otpBtn.html(otps.btnText);
            }
            clearInterval(otps.$otpBtn.data("sendOTPtimeout"));
            otps.$otpBtn.data("sendOTPCount", 0);
        },
        getOtpOk: function(data) {
            $(this.otps.$otpBtn.data("id")).val(data.id);
        },
        sendOTPCountdown: function(el) {
            return function() {
                var counter = el.data("sendOTPCount");
                if (0 >= counter--) {
                    if ($(el)[0].tagName == "INPUT") {
                        $(el).val(el.data("resend"));
                    } else {
                        $(el).html(el.data("resend"));
                    }
                    $(el).prop("disabled", false);
                    clearInterval(el.data("sendOTPtimeout"));
                    sendOTPtimeout = undefined;
                } else {
                    if ($(el)[0].tagName == "INPUT") {
                        $(el).val(counter + "秒");
                    } else {
                        $(el).html(counter + "秒");
                    }
                }
                el.data("sendOTPCount", counter);
            };
        },
        getOtpError: function(error) {
            var otps = this.otps;
            if (otps.$otpBtn.attr("tagName") == "INPUT") {
                otps.$otpBtn.val(otps.$otpBtn.data("resend"));
            } else {
                otps.$otpBtn.html(otps.$otpBtn.data("resend"));
            }
            otps.$otpBtn.prop("disabled", false);
            clearInterval(otps.$otpBtn.data("sendOTPtimeout"));
            otps.$otpBtn.data("sendOTPCount", 0);
            return false;
        },
        changeSendData: function(data) {
            var otps = this.otps;
            if (data) {
                otps.sendData = data;
            }
        }
    };
    OTP.defaults = {
        $otpBtn: $("#otpSend"),
        //current otp button
        $otpValue: $("#otpValue"),
        //verifycode
        //phoneNumber: '', //mobile number
        btnText: "免费获取",
        sendData: {}
    };
    OTP.create = OTP.prototype.create;
    module.exports = OTP;
});
