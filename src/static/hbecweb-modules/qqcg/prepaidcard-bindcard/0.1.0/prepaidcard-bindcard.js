define("consumer/prepaidcard-bindcard/0.1.0/prepaidcard-bindcard",["$","validator","password"],function(a,b){function c(a){var b="";b=a?i("#addSuccessDiv-active").html():i("#addSuccessDiv-noActive").html(),seajs.use(["confirmDialog"],function(a){a.create({dialogContentTmp:b,confirmHandler:function(){location.href=i("#activeFlagInput").attr("data-confirmDialogPath")}})})}function d(a,b){if(void 0!=b.charCode){if(0!=b.charCode&&!a.test(String.fromCharCode(b.charCode)))return b.preventDefault(),!1}else if(0!=b.keyCode&&!a.test(String.fromCharCode(b.keyCode)))return b.preventDefault(),!1;return!0}function e(a){return function(){var b=a.data("sendOTPCount");if(0>=b--){i(a).html(a.data("resend"));var c=k.parents(".control-group").find(".cardTypeTip").length;c>0&&i(a).prop("disabled",!1),clearInterval(a.data("sendOTPtimeout")),sendOTPtimeout=void 0,n.hide()}else i(a).html(b+"秒");a.data("sendOTPCount",b)}}function f(){var a=i("#activeFlagInput");if(a.length>0){var b=a.val();"yes"==b?c(!0):c(!1)}}function g(){k.on("keypress",function(a){var b=/\d/;return d(b,a)}).on("beforeValidate",function(){if($t=i(this),format=/\d/,format.test($t.val().trim())){var a=$t.val().replace(/\s/g,""),b=" ",c=a.length,d=a;d=c>12?a.substr(0,1)+b+a.substr(1,4)+b+a.substr(5,4)+b+a.substr(9,3):c>9?a.substr(0,1)+b+a.substr(1,4)+b+a.substr(5,4)+b+a.substr(9):c>5?a.substr(0,1)+b+a.substr(1,4)+b+a.substr(5):c>1?a.substr(0,1)+b+a.substr(1):a.substr(0,1),$t.val(d)}}).on("validate",function(a,b){var c=i(this),d=c.val().replace(/\s/g,"")||"",e=/^\d{12}$/;if(""===d)return b.reject("请输入卡号"),c.parent().find(".inputTip").remove(),i(".otpSend-prepaidCard").prop("disabled",!0),!1;if(!e.test(d))return b.reject("请补全剩余12位纯数字卡号"),c.parent().find(".inputTip").remove(),i(".otpSend-prepaidCard").prop("disabled",!0),!1;var f=l.html().replace(/\s/g,"")+c.val().replace(/\s/g,"");m.val(f);var g=m.attr("data-validatePath"),h={cardNo:f};i.ajax({url:g,data:h,async:!1,success:function(a){if(c.parent().find(".inputTip").remove(),a.exist){var d='<span class="inputTip cardTypeTip">'+a.cardTypeDesc+"</span>";c.after(d),i(".otpSend-prepaidCard").prop("disabled",!1)}else b.reject("卡片无法识别"),i(".otpSend-prepaidCard").prop("disabled",!0)}})}),i("input.checkcode").on("validate",function(a,b){var c=i(this),d=c.val().trim()||"";return""===d?(b.reject("请输入校验码"),!1):void 0}),i("#prepaidCardPwd").on("validate",function(a,b){var c=i(this),d=c.val().trim()||"",e=/^\d{6}$/;return""===d?(b.reject("请输入密码"),!1):e.test(d)?void 0:(b.reject("请输入6位纯数字"),!1)}),i(".otpSend-prepaidCard").each(function(){var a=i(this),b=i(a.data("mobile"));a.on("click",function(){var c=a.data("sendOTPCount")||0,d=a.data("otp-path")||window.contextPath+"/otp/";if(!a.prop("disabled")&&0>=c){var f={};f.mobile=b.val(),i.post(d,f,function(b){n.show(),i(a.data("id")).val(b.id);var c=e(a);a.prop("disabled",!0),a.data("sendOTPCount",61).data("sendOTPtimeout",setInterval(c,1e3)),c()},"json").fail(function(b,c,d){d&&a.trigger("error",d)})}})})}function h(){i("form#addPrepaidCardForm").submit(function(){var a=l.html().replace(/\s/g,"")+k.val().replace(/\s/g,"");m.val(a)})}var i=a("$"),j=(a("validator"),a("password"),document);j.body,window.staticFileRoot;var k=i("input#prepaidCardNo"),l=i("span#cardHeaderNoSpan"),m=i("input#validPrepaidCardNo"),n=i("#sendPhoneTip");i(".addPrepaidBut"),b.init=function(){f(),g(),h()}});
