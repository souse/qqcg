define("consumer/sendotp/1.0.0/sendotp",["jquery/jquery/1.10.2/jquery"],function(a,b,c){var d=a("jquery/jquery/1.10.2/jquery"),e=function(a){this.otps=d.extend({},e.defaults,a),this.init()};e.prototype={init:function(){var a=this.otps,b=this;a.getOtpOk&&(b.getOtpOk=a.getOtpOk),a.getOtpError&&(b.getOtpError=a.getOtpError),b.activeOtp(),b.handleSend()},create:function(a){return new e(a)},handleSend:function(){var a=this.otps,b=this;a.$otpBtn.bind("click",function(){if(a.$otpBtn.data("sendOTPCount")||0,a.$otpBtn.data("resend")||"",a.$otpBtn.prop("disabled"))return!1;var c=b.sendOTPCountdown(a.$otpBtn);a.$otpBtn.prop("disabled",!0),a.$otpBtn.data("sendOTPCount",61).data("sendOTPtimeout",setInterval(c,1e3)),c(),b.getOtp()})},getOtp:function(){var a=this,b=this.otps,c=b.$otpBtn.data("otp-path")||window.contextPath+"/otp/";d.ajax({type:"POST",url:c,data:b.sendData,datatype:"json",success:function(b){a.getOtpOk(b)},error:function(b,c,d){a.getOtpError(d)}})},activeOtp:function(){var a=this.otps;a.$otpBtn.unbind("click"),a.$otpValue.val(""),"INPUT"==a.$otpBtn[0].tagName?a.$otpBtn.val(a.btnText):a.$otpBtn.html(a.btnText),clearInterval(a.$otpBtn.data("sendOTPtimeout")),a.$otpBtn.data("sendOTPCount",0)},getOtpOk:function(a){d(this.otps.$otpBtn.data("id")).val(a.id)},sendOTPCountdown:function(a){return function(){var b=a.data("sendOTPCount");0>=b--?("INPUT"==d(a)[0].tagName?d(a).val(a.data("resend")):d(a).html(a.data("resend")),d(a).prop("disabled",!1),clearInterval(a.data("sendOTPtimeout")),sendOTPtimeout=void 0):"INPUT"==d(a)[0].tagName?d(a).val(b+"秒"):d(a).html(b+"秒"),a.data("sendOTPCount",b)}},getOtpError:function(){var a=this.otps;return"INPUT"==a.$otpBtn.attr("tagName")?a.$otpBtn.val(a.$otpBtn.data("resend")):a.$otpBtn.html(a.$otpBtn.data("resend")),a.$otpBtn.prop("disabled",!1),clearInterval(a.$otpBtn.data("sendOTPtimeout")),a.$otpBtn.data("sendOTPCount",0),!1},changeSendData:function(a){var b=this.otps;a&&(b.sendData=a)}},e.defaults={$otpBtn:d("#otpSend"),$otpValue:d("#otpValue"),btnText:"免费获取",sendData:{}},e.create=e.prototype.create,c.exports=e});