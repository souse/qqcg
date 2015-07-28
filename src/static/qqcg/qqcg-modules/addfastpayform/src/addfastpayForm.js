/**
 * @Description: addfastpayform
 * @Author: xujia(2014-06-27 15:05)
 */
define(function(require, exports, module){
    var $ = require("$"),
        idCardValidator = require('idcard'),
        bankinput = require('bankinput'),
        numeral = require('numeral'),
        FormValidator = require('formValidator'),
        otp = require("sendotp");
    var $bankNo = $('#bankNo'), $bankMobile = $('#bankMobile'), $signTransNo = $('#signTransNo'), $addFastPayForm = $('#addFastPayForm'),
        $selectedCardTypeRadios = $addFastPayForm.find('input.selectedCardTypeRadio'),
        $otpIdInput = $addFastPayForm.find('[name="otp.id"]'), $otpSend = $('#otpSend');
    var otpInstance, otpPath = $otpSend.data('otp-path'), newOtpPath = $otpSend.data('new-otp-path'),
        formValidator = null, isNewSignVersion = false, isCreditBankType = false,
        isAccountNameChecked = false, isCertificateNoChecked = false, isBankNoChecked = false, isBankMobileChecked = false, isSecurityCodeChecked = false;

    exports.init = function(){
        initFormFieldVariableCheck();
        initSelectCardTypeRadioEvent();
        initOtp(getSendOtpParams());
        checkForm();
        echoBankNo();
    }

    function initFormFieldVariableCheck(){
        var trim = $.trim;
        if(trim($('#accountName').val())){
            isAccountNameChecked = true;
        }
        if(trim($('#certificateNo').val())){
            isCertificateNoChecked = true;
        }
        if(trim($bankNo.val())){
            isBankNoChecked = true;
        }
        if(trim($('#bankMobile').val())){
            isBankMobileChecked = true;
        }
        if(trim($('#securityCode').val())){
            isSecurityCodeChecked = true;
        }
    }

    // 银行卡回显
    function echoBankNo(){
        $bankNo.bankInput();
    }

    // 银行卡验证实现
    function checkForm(){
        formValidator = new FormValidator('#addFastPayForm',{
            rules: {
                accountName: "required",
                certificateNo: "required|check18IdCard|checkAge10",
                bankNo: "required|minlength:12",
                bankMobile: "required|phone",
                securityCode: "required|threeNum",
                "otp.otpValue": "hasSendCheck|required"
            },
            messages: {
                accountName : {
                    required: "请输入您的真实姓名"
                },
                certificateNo:{
                    required: "请输入您的身份证号",
                    check18IdCard: "请输入正确的18位身份证号",
                    checkAge10: "用户必须是10岁以上"
                },
                bankNo : {
                    required: "请输入银行卡号",
                    minlength: "银行卡号至少为12位数字"
                },
                bankMobile:{
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
                accountName: function(){
                    isAccountNameChecked = true;
                },
                certificateNo: function(){
                    isCertificateNoChecked = true;
                },
                bankNo : function(feild){
                    var bankNo = $.trim($bankNo.val()),
                        supportCardType = $.trim($('#supportCardType').val()),
                        requestArgs = { bankNo: bankNo, supportCardType: supportCardType};
                    isBankNoChecked = true;
                    requestCardNumberRouter(requestArgs);
                },
                bankMobile: function(){
                    isBankMobileChecked = true;
                    if(checkActiveOtpBtn(isCreditBankType)){
                        $otpSend.prop('disabled', false);
                    }
                    initOtp(getSendOtpParams());
                },
                securityCode: function(){
                    isSecurityCodeChecked = true;
                    if(checkActiveOtpBtn(isCreditBankType)){
                        $otpSend.prop('disabled', false);
                    }
                }
            },
            fail: {
                bankNo: function(){
                    isBankNoChecked = false;
                    clearCardFullName();
                },
                bankMobile: function(){
                    $otpSend.prop('disabled', true);
                    isBankMobileChecked = false;
                },
                securityCode: function(){
                    $otpSend.prop('disabled', true);
                    isSecurityCodeChecked = false;
                }
            }
        });
        formValidator.extendRules({
            threeNum: function(fieldName, value) {
                return /^\d{3}$/.test(value);
            },
            hasSendCheck: function(fieldName, value){
                var $input = $otpIdInput, otpId = $.trim($input.val());
                return isNewSignVersion ? true : otpId.length>8;
            },
            check18IdCard: function(fieldName, value){
                var $input = $('#'+fieldName), idCard = $.trim(value);
                if($input.is(':hidden')){
                    return true;
                }
                return idCardValidator.check18IdCard(idCard);
            },
            checkAge10: function(fieldName, value){
                var $input = $('#'+fieldName), idCard = $.trim(value);
                if($input.is(':hidden')){
                    return true;
                }
                return idCardValidator.checkAge(idCard, 10);
            }
        });

        formValidator.launched();

        $('#addFastPayFormBtn').click(function(){

        });
    }

    function initSelectCardTypeRadioEvent(){
        $('#sctControlGroup').find('input.selectedCardTypeRadio').click(function(){
            var bankType = $(this).val(),
                bankNo = $.trim($bankNo.val()),
                supportCardType = $.trim($('#supportCardType').val()),
                requestArgs = { bankNo: bankNo, supportCardType: supportCardType, selectedCardType: bankType};
            requestCardNumberRouter(requestArgs, true);
        });
    }

    // 短信验证码发送
    function initOtp(sendOtpParams){
        if(otpInstance){
            otpInstance.changeSendData(sendOtpParams);
        }else{
            otpInstance = otp.create({
                $otpBtn: $otpSend,
                $otpValue: $('#otpValue'),
                sendData : sendOtpParams,
                getOtpOk: function(json){
                    var data = json.data;
                    if(json.code == "000000"){
                        $($otpSend.data("id")).val(data.id);
                        if(data.retrySms){
                            $otpSend.data("sendOTPCount", data.retrySms);
                        }
                    }else{
                        FormValidator.errors[$bankMobile.data("id")] = json.message;
                        FormValidator.renderError($bankMobile);
                        otpInstance.getOtpError();
                    }
                }
            });
        }
        $("#otp\\.mobile").val($.trim($bankMobile.val()));
    }

    function getSendOtpParams(){
        var params = null;
        if(!!isNewSignVersion){
            params = $addFastPayForm.serialize();
        }else{
            params = {
                mobile: $.trim($('#bankMobile').val())
            }
        }
        return params;
    }

    function requestCardNumberRouter( args, isDcCombineState ){
        /*var url = !!isDcCombineState ?
                "/static/consumer/consumer-modules/addfastpayform/data/cardnoRouter.json" :
                "/static/consumer/consumer-modules/addfastpayform/data/cardnoRouter.json",*/
        var url = isDcCombineState ?
                "/instruments/canFastPay4OneCard":
                "/instruments/canFastPay4CommonCard",
            error = !!isDcCombineState ?
                "canFastPay后台接口返回有误" :
                "canFastPay4OneCard后台接口返回有误";
        $.ajax({
            type: "POST",
//          url: "/instruments/canFastPay",
            url: url,
            data: args,
            dataType: "json",
            success: function(json){
                if(json.code=="000000"){
                    var data = json.data,
                        isDcCombine = !!(data.dcCombine),
                        bankType = data.bankType || data.cardTypeCode || 'C',
                        cardFullName = isDcCombine ?
                            (data.bankName || "") :
                            ((data.bankName+data.cardTypeName) || "");
                    isNewSignVersion = (data.version||1) == 2; // 设置是否为新快捷签约版本
                    isCreditBankType =  bankType=="C";  // 设置是否为信用卡类型

                    // 清空错误信息，提示银行卡信息
                    formValidator.clearError($bankNo);
                    renderCardFullName(cardFullName);
                    // 切换卡种样式，及设置表单数据
                    toggleSelectBankTypeField(isDcCombine, bankType);
                    toggleCreditCardField(isCreditBankType);
                    toggleOtpPath(isNewSignVersion);
                    setFormField(data);
                    // 设置发送验证码按钮状态
                    if(checkActiveOtpBtn(isCreditBankType)){
                        $otpSend.prop('disabled', false);
                    }else{
                        $otpSend.prop('disabled', true);
                    }
                }else{
                    // 提示信息
                    formValidator.errors[$bankNo.data("id")] = json.message;
                    formValidator.renderError($bankNo);
                    clearCardFullName();
                }
                initOtp(getSendOtpParams());
            },
            fail: function(){
                window.console && console.error(error);
            }
        });
    }

    function renderCardFullName(info){
        var $field = $bankNo, $control = $field.closest(".control");
        var $span = $control.find(".help-inline:not(.help-inline-supportcard)");
        if($span.length==0){
            $span = $("<span/>", {
                "class": "help-inline"
            });
        }
        $control.append($span);
        $span.html(info);
        $control.addClass("hide-txt");
    }

    function clearCardFullName(){
        var $field = $bankNo, $control = $field.closest(".control");
        var $span = $control.find(".help-inline:not(.help-inline-supportcard)");
        if ($span.length != 0) {
            $span.remove();
        }
        $control.removeClass("hide-txt");
    }

    function toggleSelectBankTypeField(isDcCombine, bankType){
        $addFastPayForm.closest('.box-form')[isDcCombine?'addClass':'removeClass']('dcCombine');
        $selectedCardTypeRadios.filter('[value="' + bankType+ '"]').prop('checked', true);
        $('#bankType').val(bankType);
    }

    function toggleCreditCardField(isCredit){
        $addFastPayForm.closest('.box-form')[isCredit?'addClass':'removeClass']('kind-credit');
        $addFastPayForm.find('div.control-group-cvv2 input, div.control-group-period select')
            .attr('disabled', !isCredit);
    }

    function toggleOtpPath(isNewSignVersion){
        isNewSignVersion = !!isNewSignVersion
        if(isNewSignVersion){
            $otpSend.data('otp-path', newOtpPath);
        }else{
            $otpSend.data('otp-path', otpPath);
        }
    }

    function setFormField(data){
        $('#bankShort').val(data.bankShort||data.bankCode||"");
        $('#bankType').val(data.bankType||data.cardTypeCode||"");
        $('#signTransNo').val(data.signTransNo||"");
        $('#protocolLabel')[0].className = data.bankShort||"";
        $('#dcCombine').val(data.dcCombine||"false");
        $('#version').val(data.version||"1");
    }

    function checkActiveOtpBtn(isCredit){
        var sendOtpCount = $otpSend.data("sendOTPCount"),
            isSendOTPCount = (sendOtpCount!="0" && sendOtpCount!="-1"),
            res = true;

        // 走内部短信通道
        if( !isSendOTPCount && !isNewSignVersion){
            if(!(isAccountNameChecked && isCertificateNoChecked && isBankNoChecked && isBankMobileChecked)){
                res = false;
            }
        // 走外部短信
        }else if(isNewSignVersion){
            if(isCredit){
                if(!(isAccountNameChecked && isCertificateNoChecked && isBankNoChecked && isBankMobileChecked && isSecurityCodeChecked)){
                    res = false;
                }
            }else{
                if(!(isAccountNameChecked && isCertificateNoChecked && isBankNoChecked && isBankMobileChecked )){
                    res = false;
                }
            }
        // 已经在倒计时中
        }else{
            res = false;
        }
        return res;
    }

});
