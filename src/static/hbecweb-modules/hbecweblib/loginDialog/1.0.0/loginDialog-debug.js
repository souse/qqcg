define("pafweblib/loginDialog/1.0.0/loginDialog-debug", [ "./layout-debug", "$-debug", "./loginDialog-debug.handlebars", "pwdGrd-debug" ], function(require, exports, module) {
    exports.init = function(field) {
        var loginObj = $.extend(true, {}, {
            returnUrl: window.location.href,
            messageTip: ""
        }, field);
        if ($("#paf_layout_A").length > 0) {
            showLoginLayout(loginObj);
        } else {
            layoutLogin(loginObj);
        }
    };
    function showLoginLayout(field) {
        $("#paf_layout_A #loginForm input[name=returnURL]").val(field.returnUrl);
        $("#loginMessageTips").html(field.messageTip);
        $("#paf_layout_A").show();
    }
    function layoutLogin(field) {
        var Layout = require("./layout-debug"), loginHtml = require("./loginDialog-debug.handlebars");
        new Layout({
            contWidth: "800px",
            contHeight: "300px",
            contBackColor: "#fff",
            Html: loginHtml(field),
            callback: function() {
                function initRefreshCaptcha() {
                    var clickValid = true;
                    $("#login_refresh_captcha").click(function() {
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
                function addPWDActive() {
                    var regex = /^(1[^012][0-9]{9})$/i;
                    $("#loginForm").on("submit", function() {
                        if ($("#loginForm #accountName").val() === "" || !regex.test($("#loginForm #accountName").val())) {
                            $("#loginForm #accountName").focus();
                            $("#loginForm #accountNameError").html("请填写正确的壹钱包账户");
                            return false;
                        } else {
                            $("#loginForm #accountNameError").html("");
                        }
                        if ($("#loginForm #pwd").val() === "") {
                            $("#loginForm #pwd").focus();
                            $("#loginForm #errorMessage").text();
                            $("#loginForm #pwdError").html("请填写您的登录密码");
                            return false;
                        } else {
                            $("#loginForm #pwdError").html("");
                        }
                        if ($("#loginCaptcha\\.captchaValue").val() === "") {
                            $("#loginCaptcha\\.captchaValue").focus();
                            $("#loginCaptcha\\.captchaValueError").html("请输入图片验证码");
                            return false;
                        } else {
                            $("#loginCaptcha\\.captchaValueError").html("");
                        }
                    });
                    var ctrls = [];
                    var ctrl1 = {
                        id: "pwd",
                        sClass: "AfterPwdActive pafweblib-pwdGrd",
                        iClass: "BeforePwdActive pafweblib-pwdGrd-customized",
                        nextTabId: "captcha.captchaValue"
                    };
                    ctrls.push(ctrl1);
                    var preSubmitFunc = function(pgeditorList) {
                        if (pgeditorList) {
                            for (var i = 0; i < pgeditorList.length; i++) {
                                var pgeditor = pgeditorList[i];
                                if (0 == pgeditor.pwdLength()) {
                                    $("#loginForm #" + pgeditor.id).focus();
                                    $("#loginForm #pwdError").html("请填写您的登录密码");
                                    return false;
                                }
                            }
                        }
                        return true;
                    };
                    var PwdGrdModule = require("pwdGrd-debug");
                    var pwdGrdModule = new PwdGrdModule({
                        ctrls: ctrls,
                        formSelector: "#loginForm",
                        preSubmitFunc: preSubmitFunc,
                        rootPath: window.contextPath
                    });
                }
                initRefreshCaptcha();
                $("#login_refresh_captcha").click();
                addPWDActive();
            }
        });
    }
});

/*
 * author by zhanglitao at 2014/10/15
 * 参数说明： 
 * {
 * 		contWidth: "文本区Box宽度", 
 * 		contHeight: "文本区Box高度",
 * 		contBackColor: "文本区背景色",
 * 		title: "文本Box标题", 
 * 		Html: "文本要显示的innerHTML内容,建议以handlebars形式书写", 
 * 		callback: "文本区涉及到的业务级函数"
 * }
 * 参考用例：爱心公益 登录功能
 * */
define("pafweblib/loginDialog/1.0.0/layout-debug", [ "$-debug" ], function(require, exports, module) {
    var $ = require("$-debug");
    var Layout = function(opts) {
        this.opts = $.extend(true, {}, Layout.defaults, opts);
        this.contWidth = this.opts.contWidth;
        this.contHeight = this.opts.contHeight;
        this.contBackColor = this.opts.contBackColor;
        this.title = this.opts.title;
        this.Html = this.opts.Html;
        this.callback = this.opts.callback;
        this.init();
    };
    Layout.prototype = {
        init: function() {
            //外层样式字串
            var paf_layout_A = "color: #666;top: 0;left: 0;width: 100%;height: 100%;position: fixed;z-index: 999;", paf_layout_B = "top: 0;left: 0;width: 100%;height: 100%;position: fixed;z-index: -1;background-color: #000;opacity: 0.5;filter: alpha(opacity=50);", paf_layout_C = "position: absolute;z-index: 102;left: 50%;top: 50%;border-radius: 4px;overflow: hidden;", paf_layout_closeBtn = "position: absolute;right: 0px;top:0;z-index: 103;padding: 0px 10px;color: #aaa;font-size: 30px;cursor:pointer;";
            var $this = this, C_style = "width: " + $this.contWidth + ";min-height: " + $this.contHeight + ";background-color:" + $this.contBackColor + ";margin-left: -" + parseInt($this.contWidth) / 2 + "px;margin-top: -" + parseInt($this.contHeight) / 2 + "px";
            var _html = '<div style="' + paf_layout_A + '" id="paf_layout_A">' + '<div style="' + paf_layout_B + '"></div>' + '<div style="' + paf_layout_C + C_style + '">' + '<div id="paf_layout_closeBtn" style="' + paf_layout_closeBtn + '">&#215;</div>' + $this.Html + "</div>" + "</div>";
            $("body").append(_html);
            $this.bindClick();
            $this.callback();
        },
        bindClick: function() {
            $("#paf_layout_closeBtn").click(function() {
                $("#paf_layout_A").hide();
            });
        }
    };
    Layout.defaults = {
        contWidth: "600px",
        contHeight: "300px",
        contBackColor: "#F7F7F7",
        Html: "<div>弹出层文本内容</div>",
        callback: function() {}
    };
    module.exports = Layout;
});

define("pafweblib/loginDialog/1.0.0/loginDialog-debug.handlebars", [ "gallery/handlebars/1.0.2/runtime-debug" ], function(require, exports, module) {
    var Handlebars = require("gallery/handlebars/1.0.2/runtime-debug");
    var template = Handlebars.template;
    module.exports = template(function(Handlebars, depth0, helpers, partials, data) {
        this.compilerInfo = [ 3, ">= 1.0.0-rc.4" ];
        helpers = helpers || {};
        for (var key in Handlebars.helpers) {
            helpers[key] = helpers[key] || Handlebars.helpers[key];
        }
        data = data || {};
        var buffer = "", stack1, functionType = "function", escapeExpression = this.escapeExpression;
        buffer += '<div class="pafweblib-loginDialog">\n	<h1>登录壹钱包</h1>\n	<div class="ContControls">\n				<form method="post" action="/session" class="paf-form" id="loginForm" autocomplete="off">\n					<input type="hidden" name="returnURL" value="';
        if (stack1 = helpers.returnUrl) {
            stack1 = stack1.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.returnUrl;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '"/>\n					<div class="loginMessageTips" id="loginMessageTips">';
        if (stack1 = helpers.messageTip) {
            stack1 = stack1.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.messageTip;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '</div>\n                    <div class="control-group ">\n                        <label for="username" class="control-label ">壹钱包账户：</label>\n                        <div class="controls">\n                            <div class="control">\n    							<input type="text" id="accountName" name="accountName" value="" class="">\n                            </div>\n                            <div id="accountNameError" class="loginFormErrors"></div>\n                        </div>\n                    </div>\n                    <div class="control-group">\n                        <label for="password" class="control-label ">登录密码：</label>\n                        <div class="controls">\n                            <div class="control control-password fn-clear">\n                            	<input type="password" id="pwd" name="pwd" value="" class="plugin-encrypted-password" data-required="true" tabIndex="2" style="visibility: visible;">\n								<span class="help-inline">\n                                	<a href="/users/security/forgetPwd" class="forgetPwd frib">忘记密码？</a>\n                                </span>\n                            </div>\n                            <div id="pwdError" class="loginFormErrors"></div>\n                        </div>\n                    </div>\n                    <div class="control-group ">\n                        <label class="control-label " for="captcha.captchaValue">图片验证码：</label>\n                        <div class="controls">\n                            <div class="control control-captcha">\n    							<input type="hidden" id="loginCaptcha.id" name="captcha.id" value="">\n   	 							<input type="text" id="loginCaptcha.captchaValue" name="captcha.captchaValue" value="" class="captcha-input" autocomplete="off">\n                                <img id="loginCaptchaImg" class="captcha-img" src="">\n                                <span class="help-inline">\n                                	<a id="login_refresh_captcha" href="#" class="refresh_captcha" data-id="loginCaptcha.id" data-captchaimg="loginCaptchaImg">看不清？换一张</a>\n                                </span>\n                            </div>\n                            <div id="loginCaptcha.captchaValueError" class="loginFormErrors"></div>\n                        </div>\n                    </div>\n                    <div class="control-group">\n                        <div class="controls fn-clear">\n                            <button type="submit" class="paf-btn paf-btn-primary paf-login-largeBtn">登录</button>\n                        </div>\n                        <div class="controls fn-clear">\n                        	还没有壹钱包账户？\n                            <a href="/users/new/mobile">立即注册</a>\n                        </div>\n                    </div>\n                </form>\n	</div>\n</div>';
        return buffer;
    });
});
