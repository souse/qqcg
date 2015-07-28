function NS(name, exec) {
    var names = name.split("."), c = window, l = names.length, i = 0;
    while (i < l) {
        c = c[names[i]] = c[names[i++]] || {};
    }
    //TODO perhaps make this into an extend??
    exec.call(c);
}

if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, "");
    };
}

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement, fromIndex) {
        var i, pivot = fromIndex ? fromIndex : 0, length;
        if (!this) {
            throw new TypeError();
        }
        length = this.length;
        if (length === 0 || pivot >= length) {
            return -1;
        }
        if (pivot < 0) {
            pivot = length - Math.abs(pivot);
        }
        for (i = pivot; i < length; i++) {
            if (this[i] === searchElement) {
                return i;
            }
        }
        return -1;
    };
}

var PINGAN = {};

PINGAN.META = {};

PINGAN.META.custId = $("meta[name=custId]").prop("content");

//格式话金额	
function fmoney(s, n) {
    n = n > 0 && n <= 20 ? n : 2;
    s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
    var l = s.split(".")[0].split("").reverse(), i, r = s.split(".")[1];
    t = "";
    for (i = 0; i < l.length; i++) {
        t += l[i] + ((i + 1) % 3 == 0 && i + 1 != l.length ? "," : "");
    }
    return t.split("").reverse().join("") + "." + r;
}

//还原金额
function rmoney(s) {
    return parseFloat(s.replace(/[^\d\.-]/g, ""));
}

function padFront(toSize, pad, val) {
    for (var i = val.length; i < toSize; ++i) {
        val = pad + val;
    }
    return val;
}

function formatDate(ts) {
    var date = new Date(ts);
    return [ date.getFullYear(), padFront(2, "0", date.getMonth() + 1), padFront(2, "0", date.getDay()) ].join(".");
}

(function($) {
    $(".passwordHolder").each(function() {
        var name = $(this).find(".password-ruled").prop("name");
        $(this).append("<div class='strongShow'><span class='s1'>极弱</span><span class='s2'>弱</span><span class='s3'>中</span><span class='s4'>强</span></div>");
        $(this).append('<input type="hidden" class="strength" name="' + name + 'Strength" value="" />');
    });
    //retrieve all dynData, and store all the values in the respective values
    var dynData = {};
    function getDynData(path, method, cb) {
        var name = method + ":" + path;
        if (dynData[name]) {
            dynData[name].done(cb);
        }
        var deferred = $.Deferred();
        dynData[name] = deferred.promise();
        if (cb) {
            dynData[name].done(cb);
        }
        $.ajax({
            url: path,
            dataType: "text json",
            type: method,
            headers: {
                Accept: "application/json; charset=utf-8"
            }
        }).done(function(data, status, xhr) {
            if (xhr.readyState === 4) {
                deferred.resolve(data, xhr);
            }
        });
    }
    $.fn.dynData = function(cb) {
        var $t = $(this), that = this;
        if ($t.length <= 0) {
            return;
        }
        getDynData($t.data("path"), $t.data("method"), function(data, xhr) {
            cb.call(that, data, xhr);
        });
    };
    $(".dynData").each(function() {
        var $t = $(this);
        getDynData($t.data("path"), $t.data("method"));
    });
    $(".refresh_captcha").click(function() {
        var that = this;
        if (!$(that).attr("clickValid")) {
            $(that).attr("clickValid", true);
            setTimeout(function() {
                $.ajax({
                    url: window.contextPath + "/captcha",
                    dataType: "json",
                    method: "POST"
                }).done(function(data) {
                    var $t = $(that), idEl = $("#" + $t.data("id").replace(/[.]/g, "\\.")), imgEl = $t.parent().find(".captcha");
                    imgEl.prop("src", data.img);
                    idEl.prop("value", data.id);
                });
                $(that).removeAttr("clickValid");
            }, 1e3);
        }
        return false;
    });
    function sendOTPCountdown(el) {
        return function() {
            var counter = el.data("sendOTPCount");
            if (0 >= counter--) {
                $(el).html(el.data("sendOTPOrigHtml")).prop("disabled", null);
                clearInterval(el.data("sendOTPtimeout"));
                sendOTPtimeout = undefined;
            } else {
                $(el).html(counter + "秒");
            }
            el.data("sendOTPCount", counter);
        };
    }
    $(".otpSend").each(function() {
        var $t = $(this);
        $t.click(function() {
            // TODO add in to verify if mobile is valid
            var counter = $t.data("sendOTPCount") || 0;
            var otpPath = $t.data("otp-path") || window.contextPath + "/otp/";
            if ($t.prop("disabled") !== undefined && counter <= 0) {
                var mobileEl, mobile, otpData = {};
                if ($t.data("mobile")) {
                    mobileEl = $($t.data("mobile").replace(/[.]/g, "\\."));
                }
                if (mobileEl && mobileEl.length > 0) {
                    mobile = mobileEl.val();
                    if (!isPhone(mobile)) {
                        $("#moblie-error-tip").html("请输入真实的手机号").show();
                        return false;
                    }
                    otpData.mobile = mobile;
                    otpData.captchaId = $("#captcha\\.id").val();
                    otpData.captchaValue = $("#captcha\\.captchaValue").val();
                }
                $.post(otpPath, otpData, function(data) {
                    if (data.id == undefined) {
                        $("#moblie-error-tip").html("该手机号已经注册过").show();
                        $($t).html($t.data("sendOTPOrigHtml")).prop("disabled", "disabled");
                        $("#captcha\\.captchaValue").val("");
                        if ($t.data("sendOTPtimeout")) {
                            $t.data("sendOTPCount", 0);
                            clearInterval($t.data("sendOTPtimeout"));
                            sendOTPtimeout = undefined;
                        }
                        return false;
                    }
                    $("#moblie-error-tip").html("").hide();
                    $($t.data("id")).val(data.id);
                }, "json").fail(function(xhr, status, error) {
                    if (error) {
                        $t.trigger("error", error);
                    }
                }).done(function() {
                    // while done ,then count down
                    // sendOTP
                    var countdownFn = sendOTPCountdown($t);
                    $t.prop("disabled", "disabled");
                    $t.data("sendOTPCount", 61).data("sendOTPtimeout", setInterval(countdownFn, 1e3));
                    countdownFn();
                });
            }
        }).data("sendOTPOrigHtml", $t.html());
    });
    $(".textarea-count").each(function() {
        var $t = $(this), $ta = $($t.data("textarea")), $ca = $t.find(".textarea-left");
        function modify() {
            var max = $ta.prop("maxlength") || 50, count = $ta.val().length;
            // TODO consider should make this unchangable
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
    function validateIdentCard(el) {
        var $t = $(el), val = $t.val().trim(), $type = $(($t.data("type") || "").replace(/[.]/g, "\\.")), type = $type.val() || "CHINA_IDENTIFICATION_CARD", errors = [];
        clearErrors($t, "user.tooyoung");
        clearErrors($t, "idCard");
        if (val.length <= 0) {
            return;
        }
        if ("CHINA_IDENTIFICATION_CARD" === type) {
            $(".password-ruled").data("bdYear", undefined).data("bdMonth", undefined).data("bdDate", undefined);
            var length = val.length;
            if (length === 18 || length === 15) {
                if (length === 18) {
                    if (/\d{17}[\dxX]/.test(val)) {}
                    var modcmpl = function(m, i, n) {
                        return (i + n - m % i) % i;
                    }, f = function(v, i) {
                        return v * (Math.pow(2, i - 1) % 11);
                    }, s = 0;
                    for (var i = 0; i < 17; i++) {
                        s += f(+val.charAt(i), 18 - i);
                    }
                    var c0 = val.charAt(17), c1 = modcmpl(s, 11, 1);
                    if (c0 - c1 === 0 || c0 === "X" && c1 === 10) {
                        var bd = [ parseInt(val.substring(6, 10)), parseInt(m = val.substring(10, 12)) - 1, parseInt(d = val.substring(12, 14)) ];
                        var now = new Date();
                        var young = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
                        bd = new Date(bd[0], bd[1], bd[2]);
                        if (!(bd > young)) {
                            $(".password-ruled").data("bdYear", bd.getFullYear()).data("bdMonth", bd.getMonth() + 1).data("bdDate", bd.getDate());
                            //				        	$('.password-ruled').each(function(){
                            //validatePassword(this);
                            //				        	});
                            return;
                        }
                        return 2;
                    }
                } else if (15 === length) {
                    var pattern = /[1-9]\d{5}(\d{2})(\d{2})(\d{2})\d{3}/, matches, y, m, d, date;
                    matches = val.match(pattern);
                    /*y = +('19' + matches[1]);
			        m = +matches[2];
			        d = +matches[3];
			        bd = new Date(y, m-1, d);
			        if(bd.getFullYear()===y && bd.getMonth()===m-1 && bd.getDate()===d){
			        	var now = new Date();
			        	var young = new Date(now.getFullYear()-18, now.getMonth(), now.getDate());
			        	if ( !(bd > young) ) {
				        	$('.password-rqewuled')
				        		.data('bdYear', bd.getFullYear())
				        		.data('bdMonth', bd.getMonth()+1)
				        		.data('bdDate', bd.getDate());
//				        	$('.password-ruled').each(function(){
//				        		validatePassword(this);
//				        	});
//			        		return;
			        	}
//			            errors.push(["idCard.user.tooyoung", "用户必须是18岁以上"]);
//			            return errors;
			        	return 1;
			        }*/
                    return 1;
                }
            }
            //errors.push(["idCard.general","请输入正确身份证号"]);
            //return errors;
            return 0;
        }
    }
    var rules = [ [ /(\d)\1\1\1\1\1/, "不可重复同一数字6次以上" ], [ /(\d\d)\1\1/, "不可重复2个数字组合3次以上" ], [ /(\d\d\d)\1/, "不可重复3个数字组合" ] ];
    //	var charGroups = [/[A-Z]/, /[a-z]/,/[0-9]/, /[@#$&%\^\*\(\)\[\]\!]/];
    var charGroups = [ /[A-Za-z]/, /[0-9]/, /[@#$&%\^\*\(\)\[\]\!]/ ], rNum = /[0-9]/, rPNotAllowed = /[^A-Za-z0-9@#$&%\^\*\(\)\[\]\!]/;
    function isNum(i) {
        return i && rNum.test(i);
    }
    function isAllFill(id) {
        //判断是否所有带有required属性的input都已经填充。
        var mark = true;
        if (userAgent() == "msie") {
            $("#" + id + " div").children("input[required][type!=hidden]").each(function() {
                if ($(this).val() == "") {
                    $(this).css("border-color", "#FF0000");
                    if (mark) mark = false;
                }
            });
        }
        return mark;
    }
    function hasError(id) {
        var l = 0;
        $("#" + id + " div.form-group").each(function() {
            if ($(this).hasClass("error")) {
                l += 1;
            }
        });
        if (l > 0) return false;
        return true;
    }
    function loginPayIsSame(id) {
        //判断支付密码和登录密码是否一致
        if (id != "signupForm") {
            return true;
        }
        var loginP = $("#password").val(), payP = $("#paymentPassword").val();
        if (loginP == payP) {
            $("#paymentPassword").parent().children("span#sameTip").css("color", "#ff0000");
            return false;
        }
        $("#paymentPassword").parent().children("span#sameTip").css("color", "#BBBBBB");
        return true;
    }
    function removeAllErrors(el) {
        $(el).find(".form-group.error").removeClass("error").find(".help-block.error").remove();
    }
    /*$('form').on("register.submit", function(){
		// remove all errors first
		
		var Formid = $(this).attr("id");
		removeAllErrors(this);
		if(!isAllFill(Formid))return false;
		var failed = false;
		$(this).find('.idCard').each(function(){
			var that = this;
			var errors;
			if ( (errors = validateIdentCard(that))) {
				addErrors(that, errors);
				displayErrors(that);
				failed = true;
			}
		});
		$(this).find('.password-ruled').each(function(){
			var that = this;
			var errors;
			if ( (errors = validatePassword(that))) {
				addErrors(that, errors);
				displayErrors(that);
				failed = true;
			}
		});
		 $(this).find('[data-matching-group]').each(function(){
			 var name = $(this).data('matchingGroup');
			 if ( !validateMatchingFields($('[data-matching-group="'+name+'"]'), name)) {
				 failed = true;
			 }
		 });
		 
		 $(this).find('[required]').each(function(){
			 if ( !validateRequired(this)) {
				 failed = true;
			 }
		 });
		 
		
		if(!loginPayIsSame(Formid))return false;
		if(!hasError(Formid))return false;
		return true;
	});*/
    function addErrors(el, e) {
        if (!e) {
            return;
        }
        var $t = $(el), errors = $t.data("errors") || {};
        for (var i = 0; i < e.length; i++) {
            errors[e[i][0]] = e[i][1];
        }
        $t.data("errors", errors);
    }
    function displayErrors(el, evenEmpty, focus) {
        var $t = $(el), focus = focus === undefined ? true : focus, errors = $(el).data("errors") || {}, errorBlock = $t.parent().parent().children(".help-block.error");
        errorBlock.children().remove();
        if (errors || evenEmpty) {
            if (0 === errorBlock.length) {
                // this span12 thing has to be determined properly
                errorBlock = $('<div class="help-block error"></div>');
            }
            errorBlock.detach();
            //TODO add detaching of element for faster inserts
            var count = 0;
            for (var name in errors) {
                ++count;
                $('<span class="error-container" style="float:left; clear:both;" data-error-name="' + name + '">' + errors[name] + "</span>").appendTo(errorBlock);
            }
            if (count > 0 || evenEmpty) {
                $t.parents(".form-group").first().addClass("error");
                if (count > 0) {
                    errorBlock.appendTo($t.parent().parent());
                    if (errorBlock.is(":hidden")) {
                        errorBlock.slideDown(100);
                    }
                }
            }
        } else {
            $t.parents(".form-group").first().removeClass("error");
        }
    }
    function clearErrors(el, namespace) {
        var $t = $(el), errors = $t.data("errors") || {}, errorCount = 0;
        if (!namespace) {
            for (var name in errors) {
                $t.parents(".form-group").find(".error-container[data-error-name=" + name + "]");
            }
            errors = {};
            $t.data("errors", {});
        } else {
            errors = $t.data("errors") || {};
            for (var name in errors) {
                if (name.indexOf(namespace) === 0) {
                    $t.parents(".form-group").find('.error-container[data-error-name="' + name + '"]');
                    delete errors[name];
                } else {
                    ++errorCount;
                }
            }
            $t.data("errors", errors);
        }
        if (errorCount <= 0) {
            $t.parents(".form-group").first().removeClass("error");
        }
    }
    PINGAN.utils = PINGAN.utils || {};
    PINGAN.utils.displayErrors = displayErrors;
    PINGAN.utils.clearErrors = clearErrors;
    PINGAN.utils.addErrors = addErrors;
    $('[name="mobile"]').on("validate", function(e, vc) {
        var $this = $(this);
        if ($this.val() === "") {
            vc.reject("请输入您的手机号");
            return false;
        }
        if (!isPhone($this.val())) {
            vc.reject("请输入真实的手机号");
            return false;
        }
    });
    $('[name="name"]').on("validate", function(e, vc) {
        var $this = $(this);
        if ($this.val() === "") {
            vc.reject("请输入您的真实姓名");
            return false;
        }
        if ($this.val().length > 20) {
            vc.reject("姓名不能超过20个字");
            return false;
        }
    });
    $(".idCard").on("validate", function(e, vc) {
        //一账通用户过来注册校验
        var hasExis = $("#changeIdNum").length > 0 && $("#changeIdNum").val() == "0" ? true : false;
        if (!hasExis) {
            if ($(this).val() === "") {
                vc.reject("请输入正确的身份证号");
                return false;
            }
            if (validateIdentCard(this) === 0) {
                vc.reject("请输入正确的身份证号");
                return false;
            }
            if (validateIdentCard(this) === 1) {
                vc.reject("请输入正确的18位数身份证号");
                return false;
            }
            if (validateIdentCard(this) === 2) {
                vc.reject("用户必须是10岁以上");
                return false;
            }
        }
    });
    function validateMatchingFields($els, groupname) {
        if ($els.length <= 1) {
            return;
        }
        var val;
        var names = [], errors = [];
        $els.each(function() {
            $t = $(this);
            clearErrors($t, "matching-fields");
            if (!val) {
                val = $t.val();
            } else {
                if ($t.val() !== val) {
                    errors.push([ "matching-fields", groupname + "不一致" ]);
                }
            }
        });
        if (errors.length) {
            addErrors($els.last(), errors);
        }
        $els.each(function() {
            displayErrors(this, !!errors && !!errors.length);
        });
        return errors.length > 0 ? false : true;
    }
    /*$('[required]').on('validate',function(e, vc){
		 var $this = $(this);
		 if($this.val()===''&&this.type!='hidden'){
			 vc.reject('不能为空');
			 return false;
		 }
	 });*/
    $("[data-matching-group]").each(function() {
        var name = $(this).data("matchingGroup");
        var group = $('[data-matching-group="' + name + '"]');
        var last = group.last();
        last.on("validate", function(e, vc) {
            if (group.length < 2) {
                return;
            }
            var val, valSecond;
            group.each(function() {
                if (!val) {
                    val = $(this).val();
                } else {
                    valSecond = $(this).val();
                    if (val !== valSecond && valSecond !== "") {
                        vc.reject(name + "不一致");
                        return false;
                    }
                }
            });
        });
    });
})(jQuery);

/**
 * 限制输入框只能输入数字(JQuery插件)
 * 
 * @example $("#amount").numeral()
 *
 * @example $("#amount").numeral(4) or $("#amount").numeral({'scale': 4})
 *
 * @example $(".x-amount").numeral()
 **/
$.fn.numeral = function() {
    var args = arguments;
    var json = typeof args[0] == "object";
    var scale = json ? args[0].scale : args[0];
    scale = scale || 0;
    $(this).css("ime-mode", "disabled");
    var keys = new Array(8, 9, 35, 36, 37, 38, 39, 40, 46);
    this.bind("keydown", function(e) {
        e = window.event || e;
        var code = e.which || e.keyCode;
        if (e.shiftKey) {
            return false;
        }
        var idx = Array.indexOf(keys, code);
        if (idx != -1) {
            return true;
        }
        var value = this.value;
        if (code == 190 || code == 110) {
            if (scale == 0 || value.indexOf(".") != -1) {
                return false;
            }
            return true;
        } else {
            if (code >= 48 && code <= 57 || code >= 96 && code <= 105) {
                if (scale > 0 && value.indexOf(".") != -1) {
                    var reg = new RegExp("^[0-9]+(.[0-9]{0," + (scale - 1) + "})?$");
                    var selText = getSelection();
                    if (selText != value && !reg.test(value)) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
    });
    this.bind("blur", function() {
        if (this.value.lastIndexOf(".") == this.value.length - 1) {
            this.value = this.value.substr(0, this.value.length - 1);
        } else if (isNaN(this.value)) {
            this.value = "";
        } else {
            var value = this.value;
            if (scale > 0 && value.indexOf(".") != -1) {
                var reg = new RegExp("^[0-9]+(.[0-9]{0," + scale + "})?$");
                if (!reg.test(value)) {
                    this.value = format(value, scale);
                }
            }
        }
    });
    this.bind("paste", function() {
        var s = window.clipboardData.getData("text");
        if (!/\D/.test(s)) ;
        value = s.replace(/^0*/, "");
        return false;
    });
    this.bind("dragenter", function() {
        return false;
    });
    var format = function(value, scale) {
        return Math.round(value * Math.pow(10, scale)) / Math.pow(10, scale);
    };
    var getSelection = function() {
        if (window.getSelection) {
            return window.getSelection();
        }
        if (document.selection) {
            return document.selection.createRange().text;
        }
        return "";
    };
    Array.indexOf = function(array, value) {
        for (var i = 0; i < array.length; i++) {
            if (value == array[i]) {
                return i;
            }
        }
        return -1;
    };
};

(function($) {
    var renderers = {};
    function basicRender(el, code, data) {
        return $('<span class="error-container" style="float:left; clear:both;" data-error-name="' + code + '">' + code + "</span>");
    }
    function emptyErrors(el) {
        var $el = $(el), errorBlock = $(el).parent().parent().children(".help-block.error"), $fromGroup = $el.closest(".form-group");
        errorBlock.children().remove();
        $fromGroup.removeClass("error");
        $(el).data("validationContext", {});
    }
    function renderErrors(el, validationContext) {
        var $t = $(el), errors = $(el).data("validationContext") || {}, errorBlock = $t.parent().parent().children(".help-block.error");
        $t.parent().parent().children(".help-block").remove();
        errorBlock.children().remove();
        if (errors) {
            if (0 === errorBlock.length) {
                // this span12 thing has to be determined properly
                errorBlock = $('<div class="help-block error"></div>');
            }
            errorBlock.detach();
            //TODO add detaching of element for faster inserts
            var count = 0;
            for (var name in errors) {
                ++count;
                if (name in renderers) {
                    renderers[name](el, name, validationContext.errors[name]).appendTo(errorBlock);
                } else {
                    basicRender(el, name, validationContext.errors[name]).appendTo(errorBlock);
                }
            }
            if (count > 0) {
                $t.closest(".form-group").addClass("error");
                errorBlock.appendTo($t.parent().parent());
                if (errorBlock.is(":hidden")) {
                    errorBlock.slideDown(100);
                }
            } else {}
        } else {
            $t.closest(".form-group").removeClass("error");
        }
    }
    var ValidationContext = function(el) {
        this.errors = {};
        this.hasErrors = false;
        this.el = $(el);
    };
    ValidationContext.prototype.reject = function(errorCode, data) {
        var context = this.el.data("validationContext") || {};
        this.hasErrors = true;
        context[errorCode] = data;
        this.el.data("validationContext", context);
    };
    $("body").on("change blur keyup", "textarea, input ", function(e) {
        var $t = $(this);
        clearTimeout($t.data("validationTimeout"));
        $t.data("validationTimeout", setTimeout(function() {
            $t.trigger("beforeValidate");
            if ($t.data("validationOldValue") === $t.val()) {
                return;
            }
            emptyErrors($t);
            $t.data("validationOldValue", $t.val());
            var validationContext = new ValidationContext($t);
            $t.trigger("validate", validationContext);
            renderErrors($t, validationContext);
            $t.trigger("afterValidate", validationContext);
        }, 500));
    });
    $("form").on("click", "input[type=submit], input[type=button], button", function(e) {
        if ($(this).closest("form").hasClass("submitting")) {
            return e.preventDefault();
        }
    });
    $('form:not(".simpleForm")').on("submit", function(e) {
        var $form = $(this), hasErrors = false;
        if ($form.hasClass("submitting")) {
            return e.preventDefault();
        }
        if ($form.find(".help-block.error").length) {
            hasErrors = true;
        } else {
            $(this).find("textarea, input").each(function() {
                var $t = $(this);
                var validationContext = new ValidationContext($t);
                $t.trigger("validate", validationContext);
                renderErrors($t, validationContext);
                if (validationContext.hasErrors) {
                    hasErrors = true;
                }
                $t.trigger("afterValidate", validationContext);
            });
        }
        $form.trigger("afterValidate", hasErrors);
        if (hasErrors) {
            e.preventDefault();
        } else {
            $form.addClass("submitting");
            $form.find('button[type="submit"]:not(".searchBtn")').text("正在提交，请稍候");
            $form.find('input[type="submit"]').val("正在提交，请稍候");
        }
    });
    $(".password-ruled").on("change blur keyup", function() {
        $(this).trigger("afterValidate");
    });
})(jQuery);

/*统一添加秘密强度div框*/
function isPhone(p) {
    //判断是不是手机号
    var s = p.toString().replace(/\s/g, "");
    // 调整 注册支持号段：除 10、11、12外都可支持
    var pattern = /^(1[^012][0-9]{9})$/i;
    return pattern.test(s);
}

function userAgent() {
    var ua = navigator.userAgent;
    ua = ua.toLowerCase();
    var match = /(webkit)[ \/]([\w.]+)/.exec(ua) || /(opera)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || !/compatible/.test(ua) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec(ua) || [];
    switch (match[1]) {
      case "msie":
        return "msie";
        break;

      case "webkit":
        //safari or chrome
        return "safari_or_chrome";
        break;

      case "opera":
        //opera
        return "opera";
        break;

      case "mozilla":
        //Firefox
        return "Firefox";
        break;

      default:
        return false;
    }
}

if (typeof define === "function") {
    define("global-debug", [], function() {});
}
