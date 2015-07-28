define("consumer/safecenter-identity/1.0.0/index-debug", [ "bankinput-debug", "sendotp-debug", "idcard-debug", "paf-debug" ], function(require, exports, module) {
    var isSubmit = true, pwdGrdModule, flagPwd = false, flagOther = false, flagOldotp = false, flagNewotp = false, flagNewMobile = false;
    var SendOTP = "";
    var ErrorMsg = {
        passwordErr: "请输入支付密码",
        identityNumber: "请输入正确的18位身份证号",
        bankNoInfo: "请补全绑定的快捷支付银行卡号（已给出最后4位）",
        bankNo: "银行卡号至少为12位数字，请输入银行卡号",
        phone: "请输入正确的手机号码",
        otpValue: "请输入正确的手机短信验证码"
    };
    var uploaderDatas = [ {
        id: "fileIDA",
        txt: "手持证件照",
        data: {
            attachType: 10
        }
    }, {
        id: "fileIDB",
        txt: "证件正面照",
        data: {
            attachType: 11
        }
    }, {
        id: "fileIDC",
        txt: "证件反面照",
        data: {
            attachType: 12
        }
    }, {
        id: "fileIDD",
        txt: "银行卡正面照",
        data: {
            attachType: 13
        }
    } ];
    function pwdInit() {
        //密码控件初始化
        seajs.use([ "pwdgrd" ], function(PwdGrdModule) {
            var ctrls = [];
            var ctrl1 = {
                id: "payPassword",
                sClass: "PWDsClass pafweblib-pwdGrd",
                iClass: "PWDiClass pafweblib-pwdGrd-customized"
            };
            ctrls.push(ctrl1);
            var preSubmitFunc = function(pgeditorList) {
                if (pgeditorList) {
                    for (var i = 0; i < pgeditorList.length; i++) {
                        var pgeditor = pgeditorList[i];
                        if (0 == pgeditor.pwdLength()) {
                            $("#" + pgeditor.id).focus();
                            $("#PWDerrorMessage").html('<span style="color:red;">请填写您的登录密码</span>');
                            return false;
                        } else {
                            $("#PWDerrorMessage").html("");
                            $("input").not($("#paymentPwd input")).not($("#oldOTP\\.otpValue")).not($("#newOTP\\.otpValue")).blur();
                        }
                    }
                    return true;
                }
            };
            pwdGrdModule = new PwdGrdModule({
                formSelector: "#identityForm",
                ctrls: ctrls,
                preSubmitFunc: preSubmitFunc,
                isMandatory: true,
                rootPath: window.contextPath
            });
        });
    }
    function bankNumInit() {
        //银行卡号回显
        var bankinput = require("bankinput-debug");
        $("#bankNo").bankInput();
    }
    function sendMsgInit() {
        var otp = require("sendotp-debug");
        seajs.use("sendotp", function(sendOTP) {
            SendOTP = sendOTP;
            if ($("#otpSend").length > 0) {
                SendOTP.create({
                    $otpBtn: $("#otpSend"),
                    $otpValue: $("#oldOTP\\.otpValue"),
                    sendData: {
                        mobile: $("#BankMobileInput").val()
                    }
                });
            } else {
                flagOldotp = true;
            }
            $("#otpSendT").click(function() {
                // 调整 注册支持号段：除 100、110、120外都可支持
                var regex = /^(1[^012][0-9]{9})$/i;
                var $newMobile = $.trim($("#newMobile").val());
                if (regex.test($.trim($newMobile))) {} else {
                    $("#newMobile").blur();
                    return;
                }
            });
        });
    }
    function checkFormJs() {
        var idCardValidator = require("idcard-debug");
        if ($("input[name=identityNumber]").length > 0) {
            var $IDObj = $("input[name=identityNumber]"), $IDError = $IDObj.siblings(), identityNumber = $.trim($IDObj.val());
            if (!idCardValidator.check18IdCard(identityNumber)) {
                $IDError.html(ErrorMsg.identityNumber);
                flagOther = false;
                return flagOther;
            } else {
                $IDError.html("");
            }
        }
        //验证图片是否上传
        for (var i = 0; i < uploaderDatas.length; i++) {
            var uploadObj = uploaderDatas[i];
            var $uploadObj = $("#" + uploadObj.id);
            var $uploadObjError = $("#" + uploadObj.id + "error");
            if ($uploadObj.length > 0) {
                if ($uploadObjError.attr("value") == "n") {
                    $uploadObjError.css("color", "red");
                    flagOther = false;
                    return flagOther;
                } else {
                    $uploadObjError.css("color", "#3fa7d2");
                }
            }
        }
        if ($("#bankNo").length > 0) {
            var $bankNoObj = $("#bankNo"), $bankNo = $.trim($bankNoObj.val()), $bankNoError = $bankNoObj.siblings(".help-block");
            if ($bankNo.length < 12 || /\D/g.test($bankNo)) {
                $bankNoError.html('<span style="color:red;">' + ErrorMsg.bankNo + "</span>");
                flagOther = false;
                return flagOther;
            } else {
                var banknum = $bankNo + $("#bankSelectList").html();
                banknum = banknum.replace(/\D/g, "");
                $("#bankCard").val(banknum);
                $bankNoError.html("");
            }
        }
        flagOther = true;
        return flagOther;
    }
    function bindEvent() {
        $("#btnShowImg").mousemove(function() {
            $("#uploadDemoImg").show();
        }).mouseout(function() {
            $("#uploadDemoImg").hide();
        });
        $("input").not($("#paymentPwd input")).not($("#oldOTP\\.otpValue")).not($("#newOTP\\.otpValue")).blur(function() {
            checkFormJs();
        });
        $("#oldOTP\\.otpValue").blur(function() {
            var oldOtp = {
                otpId: $("#oldOTP\\.id").val(),
                otpValue: $("#oldOTP\\.otpValue").val(),
                mobile: $("#BankMobileInput").val(),
                flag: "old"
            };
            if ($("#oldOTP\\.otpValue").val().length != 6) {
                return;
            }
            $.ajax({
                url: window.contextPath + "/safecenter/validOTP",
                type: "get",
                data: oldOtp,
                dataType: "json",
                success: function(data) {
                    if (data.otpFlag) {
                        flagOldotp = true;
                        $("#oldOTP\\.otpValue").attr("disabled", "disabled").siblings(".help-block").css("color", "#3fa7d2").html("短信验证成功");
                        $("#otpSend").hide();
                    } else {
                        flagOldotp = false;
                        $("#oldOTP\\.otpValue").siblings(".help-block").html("短信验证码错误");
                    }
                },
                error: function() {
                    flagOldotp = false;
                    $("#oldOTP\\.otpValue").siblings(".help-block").html("验证失败");
                }
            });
        });
        $("#newOTP\\.otpValue").blur(function() {
            var newOtp = {
                otpId: $("#newOTP\\.id").val(),
                otpValue: $("#newOTP\\.otpValue").val(),
                mobile: $("#newMobile").val(),
                flag: "new"
            };
            if ($("#newOTP\\.otpValue").val().length != 6) {
                return;
            }
            $.ajax({
                url: window.contextPath + "/safecenter/validOTP",
                type: "get",
                data: newOtp,
                dataType: "json",
                success: function(data) {
                    if (data.otpFlag) {
                        flagNewotp = true;
                        $("#newMobile").attr("disabled", "disabled");
                        $("#newMobilenums").val($("#newMobile").val());
                        $("#newOTP\\.otpValue").attr("disabled", "disabled").siblings(".help-block").css("color", "#3fa7d2").html("短信验证成功");
                        $("#otpSendT").hide();
                    } else {
                        flagNewotp = false;
                        $("#newOTP\\.otpValue").siblings(".help-block").html("短信验证码错误");
                    }
                },
                error: function(e) {
                    flagNewotp = false;
                    $("#newOTP\\.otpValue").siblings(".help-block").html("验证失败");
                }
            });
        });
        $("#newMobile").blur(function() {
            // 调整 注册支持号段：除 100、110、120外都可支持
            var regex = /^(1[^012][0-9]{9})$/i;
            var $newMobileObj = $("#newMobile"), $newMobileVal = $newMobileObj.val(), $newMobileError = $newMobileObj.siblings(".help-block");
            if (regex.test($.trim($newMobileVal))) {
                $.ajax({
                    url: window.contextPath + "/safecenter/validMobile",
                    type: "post",
                    data: {
                        newMobile: $newMobileVal
                    },
                    dataType: "json",
                    success: function(data) {
                        if (data.code === undefined) {
                            return false;
                        }
                        if (data.code != "000000") {
                            flagNewMobile = false;
                            var errorMessage = data.message || "";
                            $newMobileError.html(errorMessage);
                        } else {
                            var $newMobile = $.trim($("#newMobile").val());
                            SendOTP.create({
                                $otpBtn: $("#otpSendT"),
                                $otpValue: $("#newOTP\\.otpValue"),
                                sendData: {
                                    mobile: $newMobile
                                }
                            });
                            flagNewMobile = true;
                            $newMobileError.html("");
                        }
                    },
                    error: function(e) {
                        flagNewMobile = false;
                        $newMobileError.html(ErrorMsg.phone);
                    }
                });
            } else {
                flagNewMobile = false;
                $newMobileError.html(ErrorMsg.phone);
                return;
            }
        });
        $("button.paf-btn-primary").click(function() {
            if (isSubmit) {
                var pgeditor = pwdGrdModule.getPgeditorById("payPassword"), pwdMs = pgeditor.pwdResult(), devId = pgeditor.getDevID(), pcInfo = pgeditor.getPcInfo();
                if (pgeditor.pwdLength() === 0) {
                    $("#PWDerrorMessage").html(ErrorMsg.passwordErr);
                    flagPwd = false;
                    return flagPwd;
                } else {
                    $("#PWDerrorMessage").html("");
                    flagPwd = true;
                }
                if (flagPwd && flagOther && flagNewMobile && flagOldotp && flagNewotp) {
                    var pafLayout = require("paf-debug");
                    var mobilenums = $("#newMobile").val();
                    pafLayout.dialog("更改提示", '<p>如果修改成功，新的手机号 <span style="color:#0087e3"> (' + mobilenums + ') </span>将做为您的壹钱包<br>登录账号，原手机号无法继续登录。</p><div style="position:absolute;width:225px;height:130px;background:#d2d2d2;top:0;right:0;line-height:20px"><img src="/static/consumer/safecenter/safecenter-modules/src/login.png" style="width:225px;height:130px;"><span>请使用修改后的手机登录壹钱包</span></div>', function() {
                        isSubmit = false;
                        $("#identityForm").submit();
                    });
                } else if (!flagOther) {
                    checkFormJs();
                } else if (!flagPwd) {
                    $("#PWDerrorMessage").html(ErrorMsg.passwordErr);
                } else if (!flagOldotp) {
                    flagOldotp = false;
                    $("#oldOTP\\.otpValue").siblings(".help-block").html(ErrorMsg.otpValue);
                } else if (!flagNewotp) {
                    flagNewotp = false;
                    $("#newOTP\\.otpValue").siblings(".help-block").html(ErrorMsg.otpValue);
                } else if (!flagNewMobile) {
                    $("#newMobile").siblings(".help-block").html(ErrorMsg.phone);
                }
            }
        });
        $("#reason").keyup(function() {
            var Tthis = $("#reason");
            if (Tthis.length > 0) {
                var str = Tthis.val();
                var lengDstr = parseInt(str.replace(/[^\u4e00-\u9FA5]/g, "").length);
                var lengStr = lengDstr + str.length;
                var lengVal = str.length - lengDstr;
                if (lengStr > 200) {
                    Tthis.val(str.substr(0, str.length - 1));
                }
            }
        });
        $("#reason").blur(function() {
            var Tthis = $("#reason");
            if (Tthis.length > 0) {
                var str = Tthis.val();
                var lengDstr = parseInt(str.replace(/[^\u4e00-\u9FA5]/g, "").length);
                var lengStr = lengDstr + str.length;
                if (lengStr > 200) {
                    Tthis.val("非必填，100个汉字左右");
                }
            }
        });
    }
    function uploadImg() {
        seajs.use("uploader", function(Uploader) {
            function uploadInit(uploaderObj) {
                new Uploader({
                    trigger: "#" + uploaderObj.id,
                    action: "/safecenter/changeMobile/uploadImageFile",
                    fileName: "files",
                    multiple: true,
                    data: uploaderObj.data,
                    accept: "image/jpeg,image/jpg,image/png,image/JPEG,image/JPG,image/PNG"
                }).success(function(data) {
                    if (data.code == "000000") {
                        $("#" + uploaderObj.id + "error").html(uploaderObj.txt + "上传成功").attr("value", "y").css("color", "#3fa7d2");
                    } else {
                        $("#" + uploaderObj.id + "error").html(data.message).attr("value", "n").css("color", "red");
                    }
                }).error(function() {
                    $("#" + uploaderObj.id + "error").html(uploaderObj.txt + "上传失败，请重新上传").attr("value", "n").css("color", "red");
                });
            }
            for (var i = 0; i < uploaderDatas.length; i++) {
                var uploaderObj = uploaderDatas[i];
                var $uploadObj = $("#" + uploaderObj.id);
                if ($uploadObj.length > 0) {
                    uploadInit(uploaderObj);
                }
            }
        });
    }
    function init() {
        bindEvent();
        if ($("#pay_pwds").length > 0) {
            pwdInit();
        } else {
            flagPwd = true;
        }
        if ($("#bank_cards").length > 0) {
            bankNumInit();
        }
        sendMsgInit();
        //手机短信验证初始化
        uploadImg();
    }
    exports.init = function() {
        init();
    };
});
