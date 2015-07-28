/**
 * Passguard moudle for pingan-1qiaobao website
 * @description
 * PwdGrdModule is a common password security plugin which covers all password relative common business logic of pinganfuweb.
 * This plugin standands on PassGuardCtrl which is provided by 微通新成
 * 
 * @dependency jquery-ui-1.10.4.custom.min.js, base64.js, PassGuardCtrl.js
 * 
 * @param ctrls {id: 'pwdInputId', sClass: 'defaultClass', iClass:'toInstallClass', hasPlaceHolder:'has placeholder or not', nextTabId:'nextTabId', charTypeNum: charTypeNum, showStrengthFunc: showStrengthFunc, minLength: 0}//password control array
 * @param formSelector //jquery selector for form which is to be sumbit
 * @param enableElmSelector //jquery selector for element to be enabled when password has been input
 * @param preSubmitFunc //customized callback function before sumbit form
 * @param isMandatory: //is mandatory or not to use password guard control
 * @param unmatchMsg: //new password, confirm password unmatched warning message
 * @param rootPath: //static file root path
 * @param errorClass: //error message style
 * 
 * @API
 * 
 * @useCase
 * see WEB-INF/pages/ftl/pages/index.html
 * 
 * @author trsun
 * @since 20140513
 * @version 1.0.0
 */
define("pafweblib/pwdGrd/1.0.1/pc-b-pwdGrd-debug", [ "jquery/jquery-ui/1.10.4/jquery-ui-debug", "./pc-b-password-debug", "./encryptor-debug", "./password-rule-debug" ], function(require, exports, module) {
    require("jquery/jquery-ui/1.10.4/jquery-ui-debug");
    var passwordModule = require("./pc-b-password-debug");
    var ArrayProto = Array.prototype;
    //constants->
    //default style(installed)
    var SCLASS_DEFAULT = "pafweblib-pwdGrd";
    //to install style
    var ICLASS_DEFAULT = "pafweblib-pwdGrd";
    //regular expression when inputing
    var PGE_EREG1_DEFAULT = "[A-Za-z0-9~!@#$%^&*();<>.?_/\\-`\\\\]*";
    //regular expression when submit, be care, if not using API pwdValid(), please leave [\\s\\S]*, otherwise, the password value could not be submit to backend in Mac System
    var PGE_EREG2_DEFAULT = "[\\s\\S]*";
    //
    var NEXT_TAB_ID_DEFAULT = "input2";
    //grey words here are exactly the same as what it is in password.js
    var K1 = "30818902818100B7DAFE1EAF146393E160EC4EB5EA9C830AB0B6948AC365864F83B5EEF60BBE4300BA531D4A25DE03AF7079A1842F3676FAAEABC7C349AD3BB7864B9C85F4515C9BBB1C4442FCCCEB5C82C3E9B0BC49A89151CC040E188716E6C2C8312C63C7209D9D85A9924595103EEB032E4221E24836E1D3DCDC30BC4BD9908ABDD8AADAD70203010001";
    var K2 = "30818902818100a3da0dd5e9589c86ba812ae3dcf3091b9f8f51e889f89fd55eb2de54c917d8b54261db1d2d7458eceafa0cb6e128d94afa329ea58663c167f86e62fae3b77cfca59801aa5561b45de16e16884d738a90bd9d23d76623503d0c70a9366db0e4d7c87400f52dc9c236cb4353dd180bdd64dd7e2c17baa35cf14b0a516f8e87b3410203010001";
    var K3 = "30818902818100B7DAFE1EAF146393E160EC4EB5EA9C830AB0B6948AC365864F83B5EEF60BBE4300BA531D4A25DE03AF7079A1842F3676FAAEABC7C349AD3BB7864B9C85F4515C9BBB1C4442FCCCEB5C82C3E9B0BC49A89151CC040E188716E6C2C8312C63C7209D9D85A9924595103EEB032E4221E24836E1D3DCDC30BC4BD9908ABDD8AADAD70203010001";
    var ROOT_PATH = "/static/pinganfuweb-modules/pafweblib/pwdGrd/1.0.1";
    var DOWNLOAD_DIALOG = "pwdGrdDlg";
    //<-constants
    var PwdGrdModule = function(opts) {
        var options = this.options = extend(PwdGrdModule.prototype.defaultOptions, opts);
        this.pgeditorMap = {};
        var timer = null;
        var module = this;
        //TODO now there is dependency of PassEncryptor from password.js
        var lazyLoadFunc = function() {
            if (PassEncryptor) {
                module.init(options);
                clearInterval(timer);
            }
        };
        timer = setInterval(lazyLoadFunc, 200);
    };
    PwdGrdModule.prototype = {
        defaultOptions: {
            ctrls: [],
            formSelector: "form",
            preSubmitFunc: null,
            isMandatory: false,
            unmatchMsg: "支付密码不一致",
            errorClass: ""
        },
        // Initialization
        init: function(options) {
            var isInstalled = false;
            var needShowStrength = false;
            var baseEditor = null, confirmEditor = null;
            var pgeditorList = [];
            var unmatchMsg = options.unmatchMsg;
            var isMandatory = options.isMandatory;
            var formSelector = options.formSelector;
            var enableElmSelector = options.enableElmSelector;
            var errorClass = options.errorClass;
            var ctrls = options.ctrls;
            var downloadPath = "";
            var rootPath = options.rootPath ? options.rootPath + "/" + ROOT_PATH : ROOT_PATH;
            //TODO this part depends on PassEncryptor in password.js, ugly code, to be refactoring
            var data = PassEncryptor.getData();
            K1 = data.hPK || K1;
            K2 = data.aPK || K2;
            K3 = data.hPK || K3;
            var ts = data.ts;
            if (ctrls && ctrls.length > 0) {
                for (var i = 0; i < ctrls.length; i++) {
                    var ctrl = ctrls[i];
                    ctrl.sClass = ctrl.sClass || SCLASS_DEFAULT;
                    ctrl.iClass = ctrl.iClass || ICLASS_DEFAULT;
                    ctrl.pgeEreg1 = ctrl.pgeEreg1 || PGE_EREG1_DEFAULT;
                    ctrl.pgeEreg2 = ctrl.pgeEreg2 || PGE_EREG2_DEFAULT;
                    ctrl.hasPlaceHolder = ctrl.hasPlaceHolder || false;
                    ctrl.nextTabId = ctrl.nextTabId || NEXT_TAB_ID_DEFAULT;
                    ctrl.minLength = ctrl.minLength || 0;
                    ctrl.tabIdx = $("#" + ctrl.id).attr("tabindex") || 2;
                    var pgeditor = new $.pge({
                        //ctrl file path
                        pgePath: rootPath + "/exe/",
                        //ctrl id
                        pgeId: ctrl.id + "Ocx",
                        //type[0: *,1: actual input text]
                        pgeEdittype: 0,
                        //character validation when inputting
                        pgeEreg1: ctrl.pgeEreg1,
                        //character validation after input
                        pgeEreg2: ctrl.pgeEreg2,
                        //max length
                        pgeMaxlength: 16,
                        //tab index
                        pgeTabindex: ctrl.tabIdx,
                        //style
                        pgeClass: ctrl.sClass,
                        //install style
                        pgeInstallClass: ctrl.iClass,
                        //uppercase callback
                        pgeCapsLKOn: "XPASSGUARD.capslkon()",
                        //lowercase callback
                        pgeCapsLKOff: "XPASSGUARD.capslkoff()",
                        //return callback
                        pgeOnkeydown: "XPASSGUARD.doSubmit()",
                        //tab callback in firefox
                        tabCallback: ctrl.nextTabId,
                        k1: K1,
                        k2: K2,
                        k3: K3,
                        ts: ts
                    });
                    //if operation system or browser doesn't support this passguard control, then return
                    if (!pgeditor.isSupport()) {
                        return;
                    }
                    //register pgeditor in pgeditorMap
                    this.pgeditorMap[ctrl.id] = pgeditor;
                    //register baseEditor, confirmEditor for password matching
                    if (PwdGrdModule.MATCH_TYPE.BASE == ctrl.matchType) {
                        baseEditor = pgeditor;
                    } else if (PwdGrdModule.MATCH_TYPE.CONFIRM == ctrl.matchType) {
                        confirmEditor = pgeditor;
                    }
                    pgeditorList.push(pgeditor);
                    if (!needShowStrength && ctrl.showStrengthFunc) {
                        needShowStrength = true;
                    }
                    //password guard control
                    var pgCtrl = $(pgeditor.load());
                    //old password input
                    var anchor = $("#" + ctrl.id);
                    var needRemove = false;
                    if (pgeditor.isInstalled) {
                        //move to far away
                        if (ctrl.hasPlaceHolder) {
                            pgCtrl.addClass("pwdGrd-far-away");
                        }
                        isInstalled = true;
                        pgCtrl.width(anchor.outerWidth() - 2);
                        pgCtrl.height(anchor.outerHeight() - 2).css("line-height", anchor.outerHeight() - 2 + "px");
                        if ("password" == anchor.attr("type")) {
                            //if anchor is password input, replace it with passguard ctrl
                            needRemove = true;
                        }
                    } else {
                        if (isMandatory) {
                            pgCtrl.width(anchor.outerWidth() - 2);
                            pgCtrl.height(anchor.outerHeight() - 2).css("line-height", anchor.outerHeight() - 2 + "px");
                            if ("password" == anchor.attr("type")) {
                                //if anchor is password input, replace it with passguard ctrl
                                needRemove = true;
                            }
                        } else {
                            //remove default style
                            pgCtrl.removeAttr("style");
                        }
                    }
                    pgCtrl.insertAfter("#" + ctrl.id);
                    if (needRemove) {
                        if (!isInstalled || !ctrl.hasPlaceHolder) {
                            anchor.remove();
                        }
                    }
                    //This function is required to initialize control in IE
                    pgeditor.pgInitialize();
                    if (ctrl.hasPlaceHolder && isInstalled) {
                        $("#" + ctrl.id).on("focus", function(e) {
                            pgCtrl.removeClass("pwdGrd-far-away");
                            anchor.remove();
                            setTimeout(function() {
                                pgCtrl.focus();
                            }, 100);
                        });
                    }
                    if ($("#" + ctrl.id).is(":hidden")) {
                        anchor.width(0);
                        anchor.height(0);
                        pgCtrl.addClass("pwdGrd-far-away");
                        $("#" + pgeditor.id + "_down").hide();
                    } else {
                        //reset download link
                        var downloadLnk = $("#" + pgeditor.id + "_down a");
                        downloadPath = downloadLnk.attr("href");
                        downloadLnk.attr("href", "javascript:void(0)");
                        downloadLnk.click(this._showDownloadBubble);
                    }
                }
                //new live checking func list
                var liveCheckingFuncList = [];
                //password strength scoring
                var updatePasswordStrengthFunc = function() {
                    for (var i = 0; i < ctrls.length; i++) {
                        var ctrl = ctrls[i];
                        var showStrengthFunc = ctrl.showStrengthFunc;
                        if (showStrengthFunc) {
                            var pgeditor = pgeditorList[i];
                            if (pgeditor.pwdLength() > 0) {
                                //has password, show strength
                                var patternCode = pgeditor.getPatternCode();
                                var score = passwordModule.entropyScoreByPatternLength(patternCode, pgeditor.pwdLength());
                                var strengthLevel = 0;
                                if (isNaN(score) || pgeditor.isInBlackList()) {
                                    strengthLevel = 0;
                                } else if (score <= 30) {
                                    strengthLevel = 1;
                                } else if (score <= 60) {
                                    strengthLevel = 2;
                                } else {
                                    strengthLevel = 3;
                                }
                                showStrengthFunc(strengthLevel, score);
                            } else {
                                //blank password, clear strength
                                showStrengthFunc(-1);
                            }
                        }
                    }
                    return true;
                };
                //check char type number
                var checkCharTypeNumFunc = function() {
                    for (var i = 0; i < ctrls.length; i++) {
                        var ctrl = ctrls[i];
                        var charTypeNum = ctrl.charTypeNum;
                        if (charTypeNum) {
                            var pgeditor = pgeditorList[i];
                            var pgeCtrlId = pgeditor.id;
                            //clear warning
                            PwdGrdModule.emptyErrors("#" + pgeCtrlId, PwdGrdModule.WARNING_TYPE.CHAR_TYPE);
                            var actualCharTypeNum = pgeditor.charsNum();
                            if (pgeditor.pwdLength() > 0) {
                                if (actualCharTypeNum < charTypeNum) {
                                    var error = {
                                        name: "大写字母、小写字母、数字、特殊字符至少包含" + charTypeNum + "种"
                                    };
                                    PwdGrdModule.renderErrors("#" + pgeCtrlId, error, errorClass + " " + PwdGrdModule.WARNING_TYPE.CHAR_TYPE);
                                    return false;
                                }
                            }
                        }
                    }
                    return true;
                };
                //register char type num checking in live checking
                liveCheckingFuncList.push(checkCharTypeNumFunc);
                //check password matching
                if (baseEditor && confirmEditor) {
                    var passwordMatchFunc = function() {
                        PwdGrdModule.emptyErrors("#" + confirmEditor.id, PwdGrdModule.WARNING_TYPE.UNMATCH);
                        if (confirmEditor.pwdLength() > 0) {
                            var md5Base = baseEditor.pwdHash();
                            var md5Confirm = confirmEditor.pwdHash();
                            if (md5Base != md5Confirm) {
                                var pgeCtrlId = confirmEditor.id;
                                var error = {
                                    name: unmatchMsg
                                };
                                PwdGrdModule.renderErrors("#" + pgeCtrlId, error, errorClass + " " + PwdGrdModule.WARNING_TYPE.UNMATCH);
                                return false;
                            }
                        }
                        return true;
                    };
                    //register password matching in live checking
                    liveCheckingFuncList.push(passwordMatchFunc);
                }
                //live checking when inputing
                var validationFunc = function() {
                    var hasEmptyPassword = false;
                    //do strength checking first
                    if (needShowStrength) {
                        updatePasswordStrengthFunc();
                    }
                    //if no empty, remove required warning
                    for (var i = 0; i < pgeditorList.length; i++) {
                        var pgeditor = pgeditorList[i];
                        var pgeCtrlId = pgeditor.id;
                        if (pgeditor.pwdLength() > 0) {
                            PwdGrdModule.emptyErrors("#" + pgeCtrlId, PwdGrdModule.WARNING_TYPE.REQUIRED);
                        } else {
                            //there is empty password
                            hasEmptyPassword = true;
                        }
                        var ctrl = ctrls[i];
                        if (ctrl) {
                            PwdGrdModule.emptyErrors("#" + pgeCtrlId, PwdGrdModule.WARNING_TYPE.LENGTH);
                            PwdGrdModule.emptyErrors("#" + pgeCtrlId, PwdGrdModule.WARNING_TYPE.CHAR_TYPE);
                            PwdGrdModule.emptyErrors("#" + pgeCtrlId, PwdGrdModule.WARNING_TYPE.TOO_EASY);
                            //check length
                            var minLength = ctrl.minLength;
                            if (minLength) {
                                if (pgeditor.pwdLength() > 0 && pgeditor.pwdLength() < minLength) {
                                    var error = {
                                        name: "密码长度需要是" + minLength + "位以上"
                                    };
                                    PwdGrdModule.renderErrors("#" + pgeCtrlId, error, errorClass + " " + PwdGrdModule.WARNING_TYPE.LENGTH);
                                    if (enableElmSelector) {
                                        //disable dependency element
                                        $(enableElmSelector).prop("disabled", true);
                                    }
                                    return false;
                                }
                            }
                            //check black list
                            if (PwdGrdModule.MATCH_TYPE.BASE == ctrl.matchType) {
                                if (pgeditor.isInBlackList()) {
                                    var error = {
                                        name: "您设置的密码太简单啦^_^"
                                    };
                                    PwdGrdModule.renderErrors("#" + pgeCtrlId, error, errorClass + " " + PwdGrdModule.WARNING_TYPE.TOO_EASY);
                                    if (enableElmSelector) {
                                        //disable dependency element
                                        $(enableElmSelector).prop("disabled", true);
                                    }
                                    return false;
                                }
                            }
                        }
                    }
                    //if there are dependency elements
                    if (enableElmSelector) {
                        if (!hasEmptyPassword) {
                            var count = $(enableElmSelector).data("sendOTPCount");
                            if (!count || count <= 0) {
                                //enable dependency element
                                $(enableElmSelector).prop("disabled", null);
                            }
                        } else {
                            //disable dependency element
                            $(enableElmSelector).prop("disabled", true);
                        }
                    }
                    for (var i = 0; i < liveCheckingFuncList.length; i++) {
                        var liveCheckingFunc = liveCheckingFuncList[i];
                        var isValid = liveCheckingFunc();
                        if (!isValid) {
                            //stop on first invalid
                            return false;
                        }
                    }
                    return true;
                };
                if (isInstalled) {
                    window.setInterval(validationFunc, 800);
                }
                //register callback function when submit       
                XPASSGUARD = {};
                XPASSGUARD.capslkon = function() {};
                XPASSGUARD.capslkoff = function() {};
                XPASSGUARD.postTab = function(nextTabId) {
                    if (document.body.style.WebkitBoxShadow == undefined) {
                        document.getElementById(nextTabId).focus();
                    }
                };
                XPASSGUARD.doSubmit = function() {
                    var $form = $(formSelector);
                    if ($form.hasClass("submitting-pwdgrd")) {
                        return false;
                    }
                    var preSubmitFunc = options.preSubmitFunc || function() {
                        return true;
                    };
                    if (preSubmitFunc(pgeditorList) && validationFunc()) {
                        var firstPgeditor = null;
                        var firstPwdInput = null;
                        var form = null;
                        //set enctryt password
                        for (var i = 0; i < pgeditorList.length; i++) {
                            var pgeditor = pgeditorList[i];
                            var ctrl = ctrls[i];
                            var pwdInput = $("input[name=" + ctrl.id + "]");
                            if (i == 0) {
                                firstPgeditor = pgeditor;
                                firstPwdInput = pwdInput;
                                form = firstPwdInput.closest("form");
                            }
                            if (pwdInput.size() == 0) {
                                //if input hidden is not there, append one
                                form.append("<input type='hidden' name='" + ctrl.id + "' value='" + pgeditor.pwdResult() + "'></input>");
                            } else {
                                //set encryt password to hidden input
                                pwdInput.val(pgeditor.pwdResult());
                            }
                        }
                        //set pcInfo
                        form.find('input[name="pcInfo"]').remove();
                        form.append("<input type='hidden' name='pcInfo' value='" + firstPgeditor.getPcInfo() + "'></input>");
                        //set devId
                        form.find('input[name="devId"]').remove();
                        form.append("<input type='hidden' name='devId' value='" + firstPgeditor.getDevID() + "'></input>");
                        $form.addClass("submitting-pwdgrd");
                        return true;
                    } else {
                        return false;
                    }
                };
                if (isInstalled) {
                    var $form = $(formSelector);
                    if ($form.length > 0) {
                        //interceptor original sumbit event
                        var submitEventObjs = null;
                        if ($._data($form[0], "events")) {
                            submitEventObjs = $._data($form[0], "events")["submit"];
                        }
                        var submitEventsHandlers = [];
                        if (submitEventObjs) {
                            for (var i = 0; i < submitEventObjs.length; i++) {
                                var submitEventObj = submitEventObjs[i];
                                if (submitEventObj) {
                                    submitEventsHandlers.push(submitEventObj.handler);
                                }
                            }
                        }
                        var newSubmitFunc = function() {
                            var submitBtnVal = null;
                            var submitBtn = $form.find('button[type="submit"]');
                            if (submitBtn.length > 0) {
                                submitBtnVal = submitBtn.text();
                            } else {
                                submitBtn = $form.find('input[type="submit"]');
                                if (submitBtn.length > 0) {
                                    submitBtnVal = submitBtn.val();
                                }
                            }
                            var ret = false;
                            for (var i = 0; i < submitEventsHandlers.length; i++) {
                                var submitEventHandler = submitEventsHandlers[i];
                                if (submitEventHandler) {
                                    ret = submitEventHandler();
                                    if (false === ret) {
                                        if (submitBtnVal) {
                                            $form.removeClass("submitting");
                                            if (submitBtn[0].tagName == "BUTTON") {
                                                submitBtn.text(submitBtnVal);
                                            } else {
                                                submitBtn.val(submitBtnVal);
                                            }
                                        }
                                        return ret;
                                    }
                                }
                            }
                            ret = XPASSGUARD.doSubmit();
                            if (ret == false) {
                                if (submitBtnVal) {
                                    $form.removeClass("submitting");
                                    if (submitBtn[0].tagName == "BUTTON") {
                                        submitBtn.text(submitBtnVal);
                                    } else {
                                        submitBtn.val(submitBtnVal);
                                    }
                                }
                            }
                            return ret;
                        };
                        $form.unbind("submit");
                        $form.submit(newSubmitFunc);
                    }
                } else {
                    var pwdGrdTips = $("#pwdGrdTips");
                    pwdGrdTips.closest("form").click(function() {
                        pwdGrdTips.remove();
                    });
                    $("body").click(function() {
                        pwdGrdTips.remove();
                    });
                    //add control download bubble
                    this._addDownloadBubble(downloadPath);
                }
            }
        },
        getPgeditorById: function(id) {
            return this.pgeditorMap[id];
        },
        //show download bubble
        _showDownloadBubble: function() {
            $("#" + DOWNLOAD_DIALOG).dialog({
                width: 600,
                height: 380,
                modal: true,
                dialogClass: "pwdGrd-Dlg",
                title: "安全控件提示",
                closeText: "关闭",
                resizable: false,
                draggable: false,
                open: function(event, ui) {
                    var widget = this;
                    var customizedCloseBtn = $('<a href="javascript:void(0)" class="pwdGrd-Dlg-close"><s></s><em>关闭</em></a>');
                    customizedCloseBtn.click(function() {
                        $(widget).dialog("close");
                    });
                    customizedCloseBtn.insertAfter(".ui-dialog-titlebar-close");
                    $(widget).parent().find(".ui-dialog-titlebar-close").remove();
                }
            });
        },
        //create download dialog dom onto body
        _addDownloadBubble: function(ctrlPath) {
            if ($("#" + DOWNLOAD_DIALOG).size() > 0) {
                return;
            }
            var html = [];
            html.push('<div id="' + DOWNLOAD_DIALOG + '" style="display:none">');
            html.push('<div style="height:230px">');
            html.push('<div style="text-align:center;height:60px;margin-top:40px">安装控件，可以对您输入的信息（密码、金额等）进行加密保护，提高账户安全。</div>');
            html.push('<div style="text-align:center"><p class="pwdGrd-Dlg-memo">控件安装完成后，<a style="color:#0087e3;" href="javascript:location.reload();">请刷新</a> </p></div>');
            html.push('<div style="margin-top: 25px;text-align:center">');
            html.push('<a style="position:absolute;left:-20px;" href="javascript:void(0)">a</a><a class="pwdGrd-Dlg-btn" target="_blank" href="' + ctrlPath + '">立即安装</a>');
            html.push("</div>");
            html.push("</div>");
            if (this._getBrowserName() === "Chrome") {
                html.push('<div class="pwdGrd-Dlg-foot"><div style="padding-top: 10px;"><img src="/static/pinganfuweb-modules/pafweblib/pwdGrd/1.0.1/img/chrome.png" style="padding-top: 5px;width: 14px;height: 14px;margin-right: 5px;"> ' + this._getBrowserName() + " 用户,请点击右上角允许使用控件</span><a style='float: right;color:#0087e3;' href=\"/helpcenter/question?anchor=pwdgrd\">帮助?</a></div>");
            } else {
                html.push('<div class="pwdGrd-Dlg-foot"><div style="padding-top: 10px;">' + this._getBrowserName() + " 用户,请点击右上角允许使用控件</span><a style='float: right;color:#0087e3;' href=\"/helpcenter/question?anchor=pwdgrd\">帮助?</a></div>");
            }
            html.push("</div>");
            var pwdGrdDlg = $(html.join(""));
            $("body").append(pwdGrdDlg);
        },
        //get operation system name
        _getOsName: function() {
            var sUserAgent = navigator.userAgent;
            var osName = "Other";
            var isWin = navigator.platform == "Win32" || navigator.platform == "Windows";
            var isMac = navigator.platform == "Mac68K" || navigator.platform == "MacPPC" || navigator.platform == "Macintosh" || navigator.platform == "MacIntel";
            if (isMac) osName = "Mac";
            var isUnix = navigator.platform == "X11" && !isWin && !isMac;
            if (isUnix) osName = "Unix";
            var isLinux = String(navigator.platform).indexOf("Linux") > -1;
            var bIsAndroid = sUserAgent.toLowerCase().match(/android/i) == "android";
            if (isLinux) {
                if (bIsAndroid) osName = "Android"; else osName = "Linux";
            }
            if (isWin) {
                var isWin2K = sUserAgent.indexOf("Windows NT 5.0") > -1 || sUserAgent.indexOf("Windows 2000") > -1;
                if (isWin2K) osName = "Windows 2000";
                var isWinXP = sUserAgent.indexOf("Windows NT 5.1") > -1 || sUserAgent.indexOf("Windows XP") > -1;
                if (isWinXP) osName = "Windows XP";
                var isWin2003 = sUserAgent.indexOf("Windows NT 5.2") > -1 || sUserAgent.indexOf("Windows 2003") > -1;
                if (isWin2003) osName = "Windows 2003";
                var isWinVista = sUserAgent.indexOf("Windows NT 6.0") > -1 || sUserAgent.indexOf("Windows Vista") > -1;
                if (isWinVista) osName = "Windows Vista";
                var isWin7 = sUserAgent.indexOf("Windows NT 6.1") > -1 || sUserAgent.indexOf("Windows 7") > -1;
                if (isWin7) osName = "Windows 7";
                var isWin8 = sUserAgent.indexOf("Windows NT 6.2") > -1 || sUserAgent.indexOf("Windows NT 6.3") > -1 || sUserAgent.indexOf("Windows 8") > -1;
                if (isWin8) osName = "Windows 8";
            }
            return osName;
        },
        //get browser name
        _getBrowserName: function() {
            var win = window;
            var doc = win.document;
            var userAgent = win.navigator.userAgent.toLowerCase();
            var browserName = "Other";
            function _mime(where, value, name, nameReg) {
                var mimeTypes = win.navigator.mimeTypes, i;
                if (mimeTypes && mimeTypes.length > 0) {
                    for (i in mimeTypes) {
                        if (mimeTypes[i][where] == value) {
                            if (name !== undefined && nameReg.test(mimeTypes[i][name])) return true; else if (name === undefined) return true;
                        }
                    }
                }
                return false;
            }
            function _getChromiumType() {
                if (win.scrollMaxX !== undefined) return "";
                var isOriginalChrome = _mime("type", "application/vnd.chromium.remoting-viewer");
                // 原始 chrome
                if (isOriginalChrome) {
                    return "chrome";
                } else if (!!win.chrome) {
                    var _track = "track" in doc.createElement("track"), _style = "scoped" in doc.createElement("style"), _v8locale = "v8Locale" in win;
                    //sougou
                    if (!!win.external && !!win.external.SEVersion && !!win.external.Sogou404) return "sougou";
                    //liebao
                    if (!!win.external && !!win.external.LiebaoAutoFill_CopyToClipboard) return "liebao";
                    //360ee
                    if (_track && !_style && !_v8locale) return "360ee";
                    //360se
                    if (_track && _style && _v8locale) return "360se";
                    return "other chrome";
                }
                return "";
            }
            var chromiumType = _getChromiumType();
            if (userAgent.indexOf("opera") >= 0 || userAgent.indexOf("opr") >= 0) {
                //Opera
                browserName = "Opera";
            } else if (userAgent.indexOf("qqbrowser") >= 0 || userAgent.indexOf("tencenttraveler") >= 0) {
                //QQ Browser
                browserName = "QQ";
            } else if (win.scrollMaxX !== undefined) {
                //firefox 
                browserName = "Firefox";
            } else if ("360ee" === chromiumType || "360se" === chromiumType) {
                //360
                browserName = "360";
            } else if ("chrome" === chromiumType) {
                //Chrome
                browserName = "Chrome";
            } else if ("sougou" === chromiumType) {
                //sougou
                browserName = "搜狗";
            } else if ("liebao" === chromiumType) {
                //liebao
                browserName = "猎豹";
            } else if (userAgent.indexOf("safari") >= 0) {
                //Safari
                browserName = "Safari";
            } else if (userAgent.indexOf("msie") >= 0 || !!userAgent.match(/trident\/7\./)) {
                //ie
                browserName = "IE";
            }
            return browserName;
        }
    };
    //matching password input type
    //0 - password input to be matched with
    //1 - comfirm input
    PwdGrdModule.MATCH_TYPE = {
        BASE: 0,
        CONFIRM: 1
    };
    //warning type
    PwdGrdModule.WARNING_TYPE = {
        REQUIRED: "pwdgrd_required",
        LENGTH: "pwdgrd_length",
        UNMATCH: "pwdgrd_unmatch",
        CHAR_TYPE: "pwdgrd_char_type",
        TOO_EASY: "pwdgrd_too_easy"
    };
    //check if is installed
    PwdGrdModule.isInstalled = function() {
        var pgeditor = new $.pge({});
        return pgeditor.isInstalled;
    };
    //clear current input warning
    PwdGrdModule.emptyErrors = function(el, typeClass) {
        var $t = $(el);
        var selector = ".help-block";
        if (typeClass) {
            selector = ".help-block." + typeClass;
        }
        var $formGroup = $t.closest(".form-group");
        if ($formGroup.length == 0) $formGroup = $t.closest(".control-group");
        $formGroup.find(selector).remove();
        //if tip, show the tip
        if (0 == $formGroup.find(".help-block").size()) {
            $formGroup.find(".tip").show();
        }
    };
    //clear all warnings in the from
    PwdGrdModule.emptyAllErrors = function(el) {
        var $t = $(el);
        var $form = $t.closest("form");
        $form.find(".help-block").remove();
        //if tip, show the tip
        $form.find(".tip").show();
    };
    //pre rendering errors
    PwdGrdModule.preRenderErrors = function(el) {};
    //register common error handle function for PwdGrdModule
    PwdGrdModule.renderErrors = function(el, errors, typeClass) {
        PwdGrdModule.preRenderErrors(el);
        var $t = $(el);
        var $formGroup = $t.closest(".form-group");
        if ($formGroup.length == 0) $formGroup = $t.closest(".control-group");
        if (errors) {
            if (!typeClass) typeClass = "";
            var errorBlock = $('<div class="help-block error ' + typeClass + '"></div>');
            errorBlock.detach();
            //TODO add detaching of element for faster inserts
            var count = 0;
            for (var name in errors) {
                ++count;
                $('<span class="error-container" style="float:left; clear:both;" data-error-name="' + name + '">' + errors[name] + "</span>").appendTo(errorBlock);
            }
            if (count > 0) {
                $formGroup.addClass("control-group-error");
                var $formControl = $formGroup.find(".controls");
                if ($formControl.size() > 0) {
                    errorBlock.appendTo($formControl);
                } else {
                    errorBlock.appendTo($formGroup);
                }
                if (errorBlock.is(":hidden")) {
                    errorBlock.slideDown(100);
                }
                //hide tip
                $formGroup.find(".tip").hide();
            }
        } else {
            $formGroup.removeClass("control-group-error");
        }
    };
    module.exports = PwdGrdModule;
    function extend(obj) {
        var sources = ArrayProto.slice.call(arguments, 0), source, retObj = {};
        for (var i = 0, len = sources.length; i < len; i++) {
            source = sources[i];
            if (source) {
                for (var prop in source) {
                    retObj[prop] = source[prop];
                }
            }
        }
        return retObj;
    }
    //base64
    var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
    // 编码的方法
    function base64encode(str) {
        var out, i, len;
        var c1, c2, c3;
        len = str.length;
        i = 0;
        out = "";
        while (i < len) {
            c1 = str.charCodeAt(i++) & 255;
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt((c1 & 3) << 4);
                out += "==";
                break;
            }
            c2 = str.charCodeAt(i++);
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt((c1 & 3) << 4 | (c2 & 240) >> 4);
                out += base64EncodeChars.charAt((c2 & 15) << 2);
                out += "=";
                break;
            }
            c3 = str.charCodeAt(i++);
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt((c1 & 3) << 4 | (c2 & 240) >> 4);
            out += base64EncodeChars.charAt((c2 & 15) << 2 | (c3 & 192) >> 6);
            out += base64EncodeChars.charAt(c3 & 63);
        }
        return out;
    }
    // 解码的方法
    function base64decode(str) {
        var c1, c2, c3, c4;
        var i, len, out;
        len = str.length;
        i = 0;
        out = "";
        while (i < len) {
            do {
                c1 = base64DecodeChars[str.charCodeAt(i++) & 255];
            } while (i < len && c1 == -1);
            if (c1 == -1) break;
            do {
                c2 = base64DecodeChars[str.charCodeAt(i++) & 255];
            } while (i < len && c2 == -1);
            if (c2 == -1) break;
            out += String.fromCharCode(c1 << 2 | (c2 & 48) >> 4);
            do {
                c3 = str.charCodeAt(i++) & 255;
                if (c3 == 61) return out;
                c3 = base64DecodeChars[c3];
            } while (i < len && c3 == -1);
            if (c3 == -1) break;
            out += String.fromCharCode((c2 & 15) << 4 | (c3 & 60) >> 2);
            do {
                c4 = str.charCodeAt(i++) & 255;
                if (c4 == 61) return out;
                c4 = base64DecodeChars[c4];
            } while (i < len && c4 == -1);
            if (c4 == -1) break;
            out += String.fromCharCode((c3 & 3) << 6 | c4);
        }
        return out;
    }
    function utf16to8(str) {
        var out, i, len, c;
        out = "";
        len = str.length;
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if (c >= 1 && c <= 127) {
                out += str.charAt(i);
            } else if (c > 2047) {
                out += String.fromCharCode(224 | c >> 12 & 15);
                out += String.fromCharCode(128 | c >> 6 & 63);
                out += String.fromCharCode(128 | c >> 0 & 63);
            } else {
                out += String.fromCharCode(192 | c >> 6 & 31);
                out += String.fromCharCode(128 | c >> 0 & 63);
            }
        }
        return out;
    }
    function utf8to16(str) {
        var out, i, len, c;
        var char2, char3;
        out = "";
        len = str.length;
        i = 0;
        while (i < len) {
            c = str.charCodeAt(i++);
            switch (c >> 4) {
              case 0:
              case 1:
              case 2:
              case 3:
              case 4:
              case 5:
              case 6:
              case 7:
                // 0xxxxxxx
                out += str.charAt(i - 1);
                break;

              case 12:
              case 13:
                // 110x xxxx 10xx xxxx
                char2 = str.charCodeAt(i++);
                out += String.fromCharCode((c & 31) << 6 | char2 & 63);
                break;

              case 14:
                // 1110 xxxx 10xx xxxx 10xx xxxx
                char2 = str.charCodeAt(i++);
                char3 = str.charCodeAt(i++);
                out += String.fromCharCode((c & 15) << 12 | (char2 & 63) << 6 | (char3 & 63) << 0);
                break;
            }
        }
        return out;
    }
    //PassGuardCtrl
    var PGEdit_IE32_CLASSID = "B406D90D-BF27-4F1A-8730-D4564AFFE06E";
    var PGEdit_IE32_CAB = "";
    //PingAnPaySecurity.cab#version=1,0,0,1
    var PGEdit_IE32_EXE = "PingAnPaySecurity.exe";
    var PGEdit_IE_VERSION = "1,0,0,2";
    var PGEdit_IE64_CLASSID = "B406D90D-BF27-4F1A-8730-D4564AFFE06E";
    var PGEdit_IE64_CAB = "";
    //PingAnPaySecurityX64.cab#version=1,0,0,1
    var PGEdit_IE64_EXE = "PingAnPaySecurity.exe";
    var PGEdit_FF = "PingAnPaySecurity.exe";
    var PGEdit_Linux32 = "";
    var PGEdit_Linux64 = "";
    var PGEdit_FF_VERSION = "1.0.0.2";
    var PGEdit_Linux_VERSION = "";
    var PGEdit_MacOs = "PingAnPaySecurity.pkg";
    var PGEdit_MacOs_VERSION = "1.0.0.4";
    var PGEdit_MacOs_Safari = "PingAnPaySecurity.pkg";
    var PGEdit_MacOs_Safari_VERSION = "1.0.0.4";
    var greyWordList = "112233,123123,123321,abcabc,abc123,a1b2c3,aaa111,123qwe,qwerty,qweasd,admin,password,p@ssword,passwd,iloveyou,5201314,12345qwert,12345QWERT,1qaz2wsx,password,qwerty,monkey,letmein,trustno1,dragon,baseball,111111,iloveyou,master,sunshine,ashley,bailey,passw0rd,shadow,superman,qazwsx,michael,football";
    //.split(",");
    var UPEdit_Update = "1";
    //非IE控件是否强制升级 1强制升级,0不强制升级
    var PGECert = "";
    if (navigator.userAgent.indexOf("MSIE") < 0) {
        navigator.plugins.refresh();
    }
    (function($) {
        $.pge = function(options) {
            this.settings = $.extend(true, {}, $.pge.defaults, options);
            this.init();
        };
        $.extend($.pge, {
            defaults: {
                pgePath: "./ocx/",
                pgeId: "",
                pgeEdittype: 0,
                pgeEreg1: "",
                k1: "",
                k2: "",
                k3: "",
                ts: "",
                pgeEreg2: "",
                pgeCert: "",
                pgeMaxlength: 12,
                pgeTabindex: 2,
                pgeClass: "ocx_style",
                pgeInstallClass: "ocx_style",
                pgeOnkeydown: "",
                pgeFontName: "",
                pgeFontSize: "",
                pgeOnblur: "",
                pgeOnfocus: "",
                tabCallback: "",
                pgeBackColor: "",
                pgeForeColor: "",
                pgeCapsLKOn: "",
                pgeCapsLKOff: ""
            },
            prototype: {
                init: function() {
                    this.id = this.settings.pgeId;
                    this.pgeDownText = "请点此安装控件";
                    this.osBrowser = this.checkOsBrowser();
                    this.pgeVersion = this.getVersion();
                    this.isInstalled = this.checkInstall();
                    if (this.settings.pgeCert == "") this.settings.pgeCert = PGECert;
                },
                checkOsBrowser: function() {
                    var userosbrowser;
                    if (navigator.platform == "Win32" || navigator.platform == "Windows") {
                        if (navigator.userAgent.indexOf("MSIE") > 0 || navigator.userAgent.indexOf("msie") > 0 || navigator.userAgent.indexOf("Trident") > 0 || navigator.userAgent.indexOf("trident") > 0) {
                            if (navigator.userAgent.indexOf("ARM") > 0) {
                                userosbrowser = 9;
                                //win8 RAM Touch
                                this.pgeditIEExe = "";
                            } else {
                                userosbrowser = 1;
                                //windows32ie32
                                this.pgeditIEClassid = PGEdit_IE32_CLASSID;
                                this.pgeditIECab = PGEdit_IE32_CAB;
                                this.pgeditIEExe = PGEdit_IE32_EXE;
                            }
                        } else {
                            userosbrowser = 2;
                            //windowsff
                            this.pgeditFFExe = PGEdit_FF;
                        }
                    } else if (navigator.platform == "Win64") {
                        if (navigator.userAgent.indexOf("Windows NT 6.2") > 0 || navigator.userAgent.indexOf("windows nt 6.2") > 0) {
                            userosbrowser = 1;
                            //windows32ie32
                            this.pgeditIEClassid = PGEdit_IE32_CLASSID;
                            this.pgeditIECab = PGEdit_IE32_CAB;
                            this.pgeditIEExe = PGEdit_IE32_EXE;
                        } else if (navigator.userAgent.indexOf("MSIE") > 0 || navigator.userAgent.indexOf("msie") > 0 || navigator.userAgent.indexOf("Trident") > 0 || navigator.userAgent.indexOf("trident") > 0) {
                            userosbrowser = 3;
                            //windows64ie64
                            this.pgeditIEClassid = PGEdit_IE64_CLASSID;
                            this.pgeditIECab = PGEdit_IE64_CAB;
                            this.pgeditIEExe = PGEdit_IE64_EXE;
                        } else {
                            userosbrowser = 2;
                            //windowsff
                            this.pgeditFFExe = PGEdit_FF;
                        }
                    } else if (navigator.userAgent.indexOf("Linux") > 0) {
                        if (navigator.userAgent.indexOf("_64") > 0) {
                            userosbrowser = 4;
                            //linux64
                            this.pgeditFFExe = PGEdit_Linux64;
                        } else {
                            userosbrowser = 5;
                            //linux32
                            this.pgeditFFExe = PGEdit_Linux32;
                        }
                        if (navigator.userAgent.indexOf("Android") > 0) {
                            userosbrowser = 7;
                        }
                    } else if (navigator.userAgent.indexOf("Macintosh") > 0) {
                        if (navigator.userAgent.indexOf("Safari") > 0 && (navigator.userAgent.indexOf("Version/5.1") > 0 || navigator.userAgent.indexOf("Version/5.2") > 0 || navigator.userAgent.indexOf("Version/6") > 0)) {
                            userosbrowser = 8;
                            //macos Safari 5.1 more
                            this.pgeditFFExe = PGEdit_MacOs_Safari;
                        } else if (navigator.userAgent.indexOf("Firefox") > 0 || navigator.userAgent.indexOf("Chrome") > 0) {
                            userosbrowser = 6;
                            //macos
                            this.pgeditFFExe = PGEdit_MacOs;
                        } else if (navigator.userAgent.indexOf("Opera") >= 0) {
                            userosbrowser = 6;
                            //macos
                            this.pgeditFFExe = PGEdit_MacOs;
                        } else if (navigator.userAgent.indexOf("Safari") >= 0) {
                            userosbrowser = 6;
                            //macos
                            this.pgeditFFExe = PGEdit_MacOs;
                        } else {
                            userosbrowser = 0;
                            //macos
                            this.pgeditFFExe = "";
                        }
                    }
                    return userosbrowser;
                },
                //added by trsun 20140515->
                getTipHtml: function() {
                    var html = [];
                    if ($("#pwdGrdTips").size() == 0) {
                        html.push('<div style="position:relative;width:0px;height:0px;overflow:visible"><div class="pafweblib-pwdGrd-tips" id="pwdGrdTips">');
                        html.push('<span class="pafweblib-pwdGrd-tips-text">控件可保护您输入信息的安全</span>');
                        html.push('<div class="pafweblib-pwdGrd-tips-angle"></div>');
                        html.push("</div></div>");
                    }
                    return html.join("");
                },
                //<-added by trsun 20140515
                getpgeHtml: function() {
                    if (this.osBrowser == 1 || this.osBrowser == 3) {
                        var pgeOcx = '<OBJECT align="middle" ID="' + this.settings.pgeId + '" CLASSID="CLSID:' + this.pgeditIEClassid + '" style="display:none" codebase="' + this.settings.pgePath + this.pgeditIECab + '"';
                        if (this.settings.pgeOnkeydown != undefined && this.settings.pgeOnkeydown != "") pgeOcx += ' onkeydown="if(13==event.keyCode || 27==event.keyCode)' + this.settings.pgeOnkeydown + ';"';
                        if (this.settings.pgeOnblur != undefined && this.settings.pgeOnblur != "") pgeOcx += ' onblur="' + this.settings.pgeOnblur + '"';
                        if (this.settings.pgeOnfocus != undefined && this.settings.pgeOnfocus != "") pgeOcx += ' onfocus="' + this.settings.pgeOnfocus + '"';
                        if (this.settings.pgeTabindex != undefined && this.settings.pgeTabindex != "") pgeOcx += ' tabindex="' + this.settings.pgeTabindex + '" ';
                        if (this.settings.pgeClass != undefined && this.settings.pgeClass != "") pgeOcx += ' class="' + this.settings.pgeClass + '"';
                        pgeOcx += ">";
                        if (this.settings.pgeEdittype != undefined && this.settings.pgeEdittype != "") pgeOcx += '<param name="edittype" value="' + this.settings.pgeEdittype + '">';
                        if (this.settings.pgeMaxlength != undefined && this.settings.pgeMaxlength != "") pgeOcx += '<param name="maxlength" value="' + this.settings.pgeMaxlength + '">';
                        if (this.settings.pgeEreg1 != undefined && this.settings.pgeEreg1 != "") pgeOcx += '<param name="input2" value="' + this.settings.pgeEreg1 + '">';
                        if (this.settings.pgeEreg2 != undefined && this.settings.pgeEreg2 != "") pgeOcx += '<param name="input3" value="' + this.settings.pgeEreg2 + '">';
                        if (this.settings.pgeCapsLKOn != undefined && this.settings.pgeCapsLKOn != "") pgeOcx += '<param name="input52" value="' + this.settings.pgeCapsLKOn + '">';
                        if (this.settings.pgeCapsLKOff != undefined && this.settings.pgeCapsLKOff != "") pgeOcx += '<param name="input53" value="' + this.settings.pgeCapsLKOff + '">';
                        pgeOcx += "</OBJECT>";
                        pgeOcx += '<span id="' + this.settings.pgeId + '_down" class="' + this.settings.pgeInstallClass + '" style="text-align:center;display:none;">' + this.getTipHtml() + '<a href="' + this.settings.pgePath + this.pgeditIEExe + '">' + this.pgeDownText + "</a></span>";
                        return pgeOcx;
                    } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                        var pgeOcx = '<embed align="absmiddle" ID="' + this.settings.pgeId + '"  maxlength="' + this.settings.pgeMaxlength + '" input_2="' + this.settings.pgeEreg1 + '" input_3="' + this.settings.pgeEreg2 + '" edittype="' + this.settings.pgeEdittype + '" type="application/pinganfu-edit" tabindex="' + this.settings.pgeTabindex + '" class="' + this.settings.pgeClass + '" ';
                        if (this.settings.pgeOnblur != undefined && this.settings.pgeOnblur != "") pgeOcx += ' onblur="' + this.settings.pgeOnblur + '"';
                        if (this.settings.pgeOnkeydown != undefined && this.settings.pgeOnkeydown != "") pgeOcx += ' input_1013="' + this.settings.pgeOnkeydown + '"';
                        if (this.settings.tabCallback != undefined && this.settings.tabCallback != "") pgeOcx += " input_1009=\"XPASSGUARD.postTab('" + this.settings.tabCallback + "')\"";
                        if (this.settings.pgeOnfocus != undefined && this.settings.pgeOnfocus != "") pgeOcx += ' onfocus="' + this.settings.pgeOnfocus + '"';
                        if (this.settings.pgeFontName != undefined && this.settings.pgeFontName != "") pgeOcx += ' FontName="' + this.settings.pgeFontName + '"';
                        if (this.settings.pgeFontSize != undefined && this.settings.pgeFontSize != "") pgeOcx += " FontSize=" + Number(this.settings.pgeFontSize) + "";
                        if (this.settings.pgeCapsLKOn != undefined && this.settings.pgeCapsLKOn != "") pgeOcx += " input_1020=" + this.settings.pgeCapsLKOn + "";
                        if (this.settings.pgeCapsLKOff != undefined && this.settings.pgeCapsLKOff != "") pgeOcx += " input_1016=" + this.settings.pgeCapsLKOff + "";
                        pgeOcx += " >";
                        return pgeOcx;
                    } else if (this.osBrowser == 6) {
                        return '<embed align="absmiddle" ID="' + this.settings.pgeId + '" input2="' + this.settings.pgeEreg1 + '" input3="' + this.settings.pgeEreg2 + '" input4="' + Number(this.settings.pgeMaxlength) + '" input0="' + Number(this.settings.pgeEdittype) + '" type="application/pingan-pay" version="' + PGEdit_MacOs_VERSION + '" tabindex="' + this.settings.pgeTabindex + '" class="' + this.settings.pgeClass + '">';
                    } else if (this.osBrowser == 8) {
                        return '<embed align="absmiddle" ID="' + this.settings.pgeId + '" input2="' + this.settings.pgeEreg1 + '" input3="' + this.settings.pgeEreg2 + '" input4="' + Number(this.settings.pgeMaxlength) + '" input0="' + Number(this.settings.pgeEdittype) + '" type="application/pingan-pay" version="' + PGEdit_MacOs_Safari_VERSION + '" tabindex="' + this.settings.pgeTabindex + '" class="' + this.settings.pgeClass + '">';
                    } else {
                        return '<div id="' + this.settings.pgeId + '_down" class="' + this.settings.pgeInstallClass + '" style="text-align:center;">暂不支持此浏览器</div>';
                    }
                },
                getDownHtml: function() {
                    if (this.osBrowser == 1 || this.osBrowser == 3) {
                        return '<div id="' + this.settings.pgeId + '_down" class="' + this.settings.pgeInstallClass + '" style="text-align:center;">' + this.getTipHtml() + '<a href="' + this.settings.pgePath + this.pgeditIEExe + '">' + this.pgeDownText + " </a></div>";
                    } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5 || this.osBrowser == 6 || this.osBrowser == 8) {
                        return '<div id="' + this.settings.pgeId + '_down" class="' + this.settings.pgeInstallClass + '" style="text-align:center;">' + this.getTipHtml() + '<a href="' + this.settings.pgePath + this.pgeditFFExe + '">' + this.pgeDownText + "</a></div>";
                    } else {
                        return '<div id="' + this.settings.pgeId + '_down" class="' + this.settings.pgeInstallClass + '" style="text-align:center;">暂不支持此浏览器</div>';
                    }
                },
                load: function() {
                    if (!this.checkInstall()) {
                        return this.getDownHtml();
                    } else {
                        if (this.osBrowser == 2) {
                            if (this.pgeVersion != PGEdit_FF_VERSION && UPEdit_Update == 1) {
                                this.setDownText();
                                return this.getDownHtml();
                            }
                        } else if (this.osBrowser == 4 || this.osBrowser == 5) {
                            if (this.pgeVersion != PGEdit_Linux_VERSION && UPEdit_Update == 1) {
                                this.setDownText();
                                return this.getDownHtml();
                            }
                        } else if (this.osBrowser == 6) {
                            if (this.pgeVersion != PGEdit_MacOs_VERSION && UPEdit_Update == 1) {
                                this.setDownText();
                                return this.getDownHtml();
                            }
                        } else if (this.osBrowser == 8) {
                            if (this.pgeVersion != PGEdit_MacOs_Safari_VERSION && UPEdit_Update == 1) {
                                this.setDownText();
                                return this.getDownHtml();
                            }
                        }
                        return this.getpgeHtml();
                    }
                },
                generate: function() {
                    if (this.osBrowser == 2) {
                        if (this.isInstalled == false) {
                            return document.write(this.getDownHtml());
                        } else if (this.convertVersion(this.pgeVersion) < this.convertVersion(PGEdit_FF_VERSION) && UPEdit_Update == 1) {
                            this.setDownText();
                            return document.write(this.getDownHtml());
                        }
                    } else if (this.osBrowser == 4 || this.osBrowser == 5) {
                        if (this.isInstalled == false) {
                            return document.write(this.getDownHtml());
                        } else if (this.convertVersion(this.pgeVersion) < this.convertVersion(PGEdit_Linux_VERSION) && UPEdit_Update == 1) {
                            this.setDownText();
                            return document.write(this.getDownHtml());
                        }
                    } else if (this.osBrowser == 6) {
                        if (this.isInstalled == false) {
                            return document.write(this.getDownHtml());
                        } else if (this.convertVersion(this.pgeVersion) < this.convertVersion(PGEdit_MacOs_VERSION) && UPEdit_Update == 1) {
                            this.setDownText();
                            return document.write(this.getDownHtml());
                        }
                    } else if (this.osBrowser == 8) {
                        if (this.isInstalled == false) {
                            return document.write(this.getDownHtml());
                        } else if (this.convertVersion(this.pgeVersion) < this.convertVersion(PGEdit_MacOs_Safari_VERSION) && UPEdit_Update == 1) {
                            this.setDownText();
                            return document.write(this.getDownHtml());
                        }
                    }
                    return document.write(this.getpgeHtml());
                },
                pwdclear: function() {
                    if (this.checkInstall()) {
                        var control = document.getElementById(this.settings.pgeId);
                        if (control) {
                            control.ClearSeCtrl();
                        }
                    }
                },
                pwdSetSk: function(s) {
                    if (this.checkInstall()) {
                        try {
                            var control = document.getElementById(this.settings.pgeId);
                            if (this.osBrowser == 1 || this.osBrowser == 3 || this.osBrowser == 6 || this.osBrowser == 8) {
                                control.input1 = s;
                            } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                                control.input(1, s);
                            }
                        } catch (err) {}
                    }
                },
                pwdResultHash: function() {
                    var code = "";
                    if (!this.checkInstall()) {
                        code = "01";
                    } else {
                        try {
                            var control = document.getElementById(this.settings.pgeId);
                            if (this.osBrowser == 1 || this.osBrowser == 3) {
                                code = control.output;
                            } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                                code = control.output(7);
                            } else if (this.osBrowser == 6 || this.osBrowser == 8) {}
                        } catch (err) {
                            code = "02";
                        }
                    }
                    //alert(code);
                    return code;
                },
                pwdResult: function() {
                    var code = "";
                    if (!this.checkInstall()) {
                        code = "01";
                    } else {
                        try {
                            var control = document.getElementById(this.settings.pgeId);
                            if (this.osBrowser == 1 || this.osBrowser == 3) {
                                control.input1 = this.settings.ts;
                                control.input9 = this.settings.k1;
                                control.input10 = this.settings.k2;
                                code = control.output29;
                            } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                                control.input(900, this.settings.ts);
                                control.input(901, this.settings.k1);
                                control.input(902, this.settings.k2);
                                code = control.output(900);
                            } else if (this.osBrowser == 6 || this.osBrowser == 8) {
                                control.input1 = this.settings.ts;
                                control.input14 = this.settings.k1;
                                control.input15 = this.settings.k2;
                                code = control.get_output23();
                            }
                        } catch (err) {
                            code = "02";
                        }
                    }
                    //alert(code);
                    return code;
                },
                //当前浏览器是否支持密码控件
                isSupport: function() {
                    if (this.osBrowser == 1 || this.osBrowser == 3 || this.osBrowser == 2 || this.osBrowser == 6 || this.osBrowser == 8) {
                        return true;
                    } else {
                        return false;
                    }
                },
                //获得pc_info串
                getPcInfo: function() {
                    var pcinfo = "";
                    if (!this.checkInstall()) {
                        pcinfo = "01";
                    } else {
                        try {
                            var control = document.getElementById(this.settings.pgeId);
                            if (this.osBrowser == 1 || this.osBrowser == 3) {
                                var v = control.output28;
                                pcinfo = utf8to16(base64decode(v));
                            } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                                control.input(904, this.settings.k3);
                                var v = control.output(904);
                                pcinfo = v;
                            } else if (this.osBrowser == 6 || this.osBrowser == 8) {
                                var v = control.get_output20();
                                pcinfo = utf8to16(base64decode(v));
                            }
                        } catch (err) {
                            pcinfo = "02";
                        }
                    }
                    //alert(code);
                    return pcinfo;
                },
                //获得mac列表
                getMacList: function() {
                    var maclist = "";
                    if (!this.checkInstall()) {
                        maclist = "01";
                    } else {
                        try {
                            var control = document.getElementById(this.settings.pgeId);
                            if (this.osBrowser == 1 || this.osBrowser == 3) {
                                var v = control.output38;
                                maclist = utf8to16(base64decode(v));
                            } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                                var v = control.output(903);
                                maclist = v;
                            } else if (this.osBrowser == 6 || this.osBrowser == 8) {
                                var v = control.get_output21();
                                maclist = utf8to16(base64decode(v));
                            }
                        } catch (err) {
                            maclist = "02";
                        }
                    }
                    return maclist;
                },
                //获得设备指纹
                getDevID: function() {
                    var devid = "";
                    if (!this.checkInstall()) {
                        devid = "01";
                    } else {
                        try {
                            var control = document.getElementById(this.settings.pgeId);
                            if (this.osBrowser == 1 || this.osBrowser == 3) {
                                var v = control.output39;
                                devid = utf8to16(base64decode(v));
                            } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                                var v = control.output(902);
                                devid = v;
                            } else if (this.osBrowser == 6 || this.osBrowser == 8) {
                                var v = control.get_output22();
                                devid = utf8to16(base64decode(v));
                            }
                        } catch (err) {
                            devid = "02";
                        }
                    }
                    return devid;
                },
                //包含几种字符
                charsNum: function() {
                    var chnum = "";
                    if (!this.checkInstall()) {
                        chnum = "01";
                    } else {
                        try {
                            var control = document.getElementById(this.settings.pgeId);
                            if (this.osBrowser == 1 || this.osBrowser == 3) {
                                var v = control.output54;
                                if (v == 1 || v == 2 || v == 4 || v == 8) {
                                    v = 1;
                                } else if (v == 3 || v == 5 || v == 6 || v == 9 || v == 10 || v == 12) {
                                    v = 2;
                                } else if (v == 7 || v == 11 || v == 13 || v == 14) {
                                    v = 3;
                                } else if (v == 15) {
                                    v = 4;
                                }
                                chnum = v;
                            } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                                var v = control.output(4, 1);
                                var o = 0;
                                if (v & 1) o++;
                                if (v & 2) o++;
                                if (v & 4) o++;
                                if (v & 8) o++;
                                chnum = o;
                            } else if (this.osBrowser == 6 || this.osBrowser == 8) {
                                var v = control.get_output16();
                                var o = 0;
                                if (v & 1) o++;
                                if (v & 2) o++;
                                if (v & 4) o++;
                                if (v & 8) o++;
                                chnum = o;
                            }
                        } catch (err) {
                            chnum = "02";
                        }
                    }
                    return chnum;
                },
                //是否属于灰名单
                isInBlackList: function() {
                    var isgrey = "";
                    if (!this.checkInstall()) {
                        isgrey = "01";
                    } else {
                        try {
                            var control = document.getElementById(this.settings.pgeId);
                            if (this.osBrowser == 1 || this.osBrowser == 3) {
                                var val = control.output44;
                                if (val == 2) {
                                    isgrey = true;
                                } else {
                                    isgrey = false;
                                }
                            } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                                control.input(903, greyWordList);
                                isgrey = control.output(901) == "true";
                            } else if (this.osBrowser == 6 || this.osBrowser == 8) {
                                var val = control.get_output12();
                                if (val == 2) {
                                    isgrey = true;
                                } else {
                                    isgrey = false;
                                }
                            }
                        } catch (err) {
                            isgrey = "02";
                        }
                    }
                    return isgrey;
                },
                getPatternCode: function() {
                    var patternCode = -1;
                    if (this.checkInstall()) {
                        try {
                            var control = document.getElementById(this.settings.pgeId);
                            if (this.osBrowser == 1 || this.osBrowser == 3) {
                                patternCode = control.output54;
                            } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                                patternCode = control.output(4, 1);
                            } else if (this.osBrowser == 6 || this.osBrowser == 8) {
                                patternCode = control.get_output16();
                            }
                        } catch (err) {}
                    }
                    return patternCode;
                },
                //评分
                entropyScore: function() {
                    var score = "";
                    if (!this.checkInstall()) {
                        score = "01";
                    } else {
                        try {
                            var control = document.getElementById(this.settings.pgeId);
                            if (this.osBrowser == 1 || this.osBrowser == 3) {
                                var v = control.output54;
                                var o = 0;
                                if (v & 1) o += 10;
                                if (v & 2) o += 26;
                                if (v & 4) o += 26;
                                if (v & 8) o += 21;
                                score = Math.log(o) / Math.LN2 * control.output3 / (Math.log(83) / Math.LN2 * 10) * 60;
                            } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                                var v = control.output(4, 1);
                                var o = 0;
                                if (v & 1) o += 10;
                                if (v & 2) o += 26;
                                if (v & 4) o += 26;
                                if (v & 8) o += 21;
                                score = Math.log(o) / Math.LN2 * control.output(3) / (Math.log(83) / Math.LN2 * 10) * 60;
                            } else if (this.osBrowser == 6 || this.osBrowser == 8) {
                                var v = control.get_output16();
                                var o = 0;
                                if (v & 1) o += 10;
                                if (v & 2) o += 26;
                                if (v & 4) o += 26;
                                if (v & 8) o += 21;
                                score = Math.log(o) / Math.LN2 * control.get_output3() / (Math.log(83) / Math.LN2 * 10) * 60;
                            }
                        } catch (err) {
                            code = "02";
                        }
                    }
                    return score;
                },
                //评分2
                entropyScore2: function() {
                    var score = "";
                    if (!this.checkInstall()) {
                        score = "01";
                    } else {
                        try {
                            var control = document.getElementById(this.settings.pgeId);
                            if (this.osBrowser == 1 || this.osBrowser == 3) {
                                var v = control.output4;
                                score = v;
                            } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                                var v = control.output(4, 1);
                                var o = 0;
                                if (v & 1) o += 10;
                                if (v & 2) o += 26;
                                if (v & 4) o += 26;
                                if (v & 8) o += 21;
                                score = Math.log(o) / Math.LN2 * control.output(3) / (Math.log(83) / Math.LN2 * 10) * 60;
                            } else if (this.osBrowser == 6 || this.osBrowser == 8) {
                                var v = control.get_output4();
                                score = v;
                            }
                        } catch (err) {
                            code = "02";
                        }
                    }
                    return score;
                },
                machineNetwork: function() {
                    var code = "";
                    if (!this.checkInstall()) {
                        code = "01";
                    } else {
                        try {
                            var control = document.getElementById(this.settings.pgeId);
                            if (this.osBrowser == 1 || this.osBrowser == 3) {
                                code = control.GetIPMacList();
                            } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                                control.package = 0;
                                code = control.output(9);
                            } else if (this.osBrowser == 6 || this.osBrowser == 8) {
                                code = control.get_output7(0);
                            }
                        } catch (err) {
                            code = "02";
                        }
                    }
                    return code;
                },
                machineDisk: function() {
                    var code = "";
                    if (!this.checkInstall()) {
                        code = "01";
                    } else {
                        try {
                            var control = document.getElementById(this.settings.pgeId);
                            if (this.osBrowser == 1 || this.osBrowser == 3) {
                                code = control.GetNicPhAddr(1);
                            } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                                control.package = 0;
                                code = control.output(11);
                            } else if (this.osBrowser == 6 || this.osBrowser == 8) {
                                code = control.get_output7(2);
                            }
                        } catch (err) {
                            code = "02";
                        }
                    }
                    return code;
                },
                machineCPU: function() {
                    var code = "";
                    if (!this.checkInstall()) {
                        code = "01";
                    } else {
                        try {
                            var control = document.getElementById(this.settings.pgeId);
                            if (this.osBrowser == 1 || this.osBrowser == 3) {
                                code = control.GetNicPhAddr(2);
                            } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                                control.package = 0;
                                code = control.output(10);
                            } else if (this.osBrowser == 6 || this.osBrowser == 8) {
                                code = control.get_output7(1);
                            }
                        } catch (err) {
                            code = "02";
                        }
                    }
                    return code;
                },
                pwdSimple: function() {
                    var code = "";
                    if (!this.checkInstall()) {
                        code = "";
                    } else {
                        try {
                            var control = document.getElementById(this.settings.pgeId);
                            if (this.osBrowser == 1 || this.osBrowser == 3) {
                                code = control.output44;
                            } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                                code = control.output(13);
                            } else if (this.osBrowser == 6 || this.osBrowser == 8) {
                                code = control.get_output10();
                            }
                        } catch (err) {
                            code = "";
                        }
                    }
                    return code;
                },
                pwdValid: function() {
                    var code = "";
                    if (!this.checkInstall()) {
                        code = 1;
                    } else {
                        try {
                            var control = document.getElementById(this.settings.pgeId);
                            if (this.osBrowser == 1 || this.osBrowser == 3) {
                                if (control.output1) code = control.output5;
                            } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                                code = control.output(5);
                            } else if (this.osBrowser == 6 || this.osBrowser == 8) {
                                code = control.get_output5();
                            }
                        } catch (err) {
                            code = 1;
                        }
                    }
                    return code;
                },
                pwdHash: function() {
                    var code = "";
                    if (!this.checkInstall()) {
                        code = 0;
                    } else {
                        try {
                            var control = document.getElementById(this.settings.pgeId);
                            if (this.osBrowser == 1 || this.osBrowser == 3) {
                                code = control.output2;
                            } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                                code = control.output(2);
                            } else if (this.osBrowser == 6 || this.osBrowser == 8) {
                                code = control.get_output2();
                            }
                        } catch (err) {
                            code = 0;
                        }
                    }
                    return code;
                },
                pwdLength: function() {
                    var code = "";
                    if (!this.checkInstall()) {
                        code = 0;
                    } else {
                        try {
                            var control = document.getElementById(this.settings.pgeId);
                            if (this.osBrowser == 1 || this.osBrowser == 3) {
                                code = control.output3;
                            } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                                code = control.output(3);
                            } else if (this.osBrowser == 6 || this.osBrowser == 8) {
                                code = control.get_output3();
                            }
                        } catch (err) {
                            code = 0;
                        }
                    }
                    return code;
                },
                pwdStrength: function() {
                    var code = 0;
                    if (!this.checkInstall()) {
                        code = 0;
                    } else {
                        try {
                            var control = document.getElementById(this.settings.pgeId);
                            if (this.osBrowser == 1 || this.osBrowser == 3) {
                                var l = control.output3;
                                var n = control.output4;
                                var z = control.output54;
                            } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                                var l = control.output(3);
                                var n = control.output(4);
                                var z = control.output(4, 1);
                            } else if (this.osBrowser == 6 || this.osBrowser == 8) {
                                var l = control.get_output3();
                                var n = control.get_output4();
                                var z = control.get_output16();
                            }
                            if (l == 0) {
                                code = 0;
                            } else {
                                if (l >= 6 && n == 1) {
                                    code = 1;
                                } else if (l >= 6 && n == 2) {
                                    code = 2;
                                } else if (l >= 6 && n == 3) {
                                    code = 3;
                                }
                            }
                        } catch (err) {
                            code = 0;
                        }
                    }
                    return code;
                },
                checkInstall: function() {
                    try {
                        if (this.osBrowser == 1) {
                            var comActiveX = new ActiveXObject("PingAnPay.PassGuard.1");
                            if (this.convertIEVersion(comActiveX.output35) < this.convertIEVersion(PGEdit_IE_VERSION)) {
                                this.pgeDownText = "请点此升级控件";
                                return false;
                            }
                        } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5 || this.osBrowser == 6 || this.osBrowser == 8) {
                            var arr = new Array();
                            if (this.osBrowser == 6) {
                                var pge_info = navigator.plugins["pinganpay 1G"].description;
                            } else if (this.osBrowser == 8) {
                                var pge_info = navigator.plugins["pinganpay 1G"].description;
                            } else {
                                var pge_info = navigator.plugins["PingAnFuEdit"].description;
                            }
                            if (pge_info.indexOf(":") > 0) {
                                arr = pge_info.split(":");
                                var pge_version = arr[1];
                            } else {
                                var pge_version = "";
                            }
                            var toUpgradeVersion = "";
                            if (this.osBrowser == 2) {
                                toUpgradeVersion = PGEdit_FF_VERSION;
                            } else if (this.osBrowser == 4 || this.osBrowser == 5) {
                                toUpgradeVersion = PGEdit_Linux_VERSION;
                            } else if (this.osBrowser == 6) {
                                toUpgradeVersion = PGEdit_MacOs_VERSION;
                            } else if (this.osBrowser == 8) {
                                toUpgradeVersion = PGEdit_MacOs_Safari_VERSION;
                            }
                            if (this.convertVersion(pge_version) < this.convertVersion(toUpgradeVersion)) {
                                this.setDownText();
                                return false;
                            }
                        } else if (this.osBrowser == 3) {
                            var comActiveX = new ActiveXObject("PingAnPay.PassGuard.1");
                            if (this.convertIEVersion(comActiveX.output35) < this.convertIEVersion(PGEdit_IE_VERSION)) {
                                this.pgeDownText = "请点此升级控件";
                                return false;
                            }
                        }
                    } catch (e) {
                        return false;
                    }
                    return true;
                },
                getVersion: function() {
                    try {
                        if (navigator.userAgent.indexOf("MSIE") < 0) {
                            var arr = new Array();
                            if (this.osBrowser == 6) {
                                var pge_info = navigator.plugins["pinganpay 1G"].description;
                            } else if (this.osBrowser == 8) {
                                var pge_info = navigator.plugins["pinganpay 1G"].description;
                            } else {
                                var pge_info = navigator.plugins["PingAnFuEdit"].description;
                            }
                            if (pge_info.indexOf(":") > 0) {
                                arr = pge_info.split(":");
                                var pge_version = arr[1];
                            } else {
                                var pge_version = "";
                            }
                        }
                        return pge_version;
                    } catch (e) {
                        return "";
                    }
                },
                setColor: function() {
                    var code = "";
                    if (!this.checkInstall()) {
                        code = "";
                    } else {
                        try {
                            var control = document.getElementById(this.settings.pgeId);
                            if (this.settings.pgeBackColor != undefined && this.settings.pgeBackColor != "") control.BackColor = this.settings.pgeBackColor;
                            if (this.settings.pgeForeColor != undefined && this.settings.pgeForeColor != "") control.ForeColor = this.settings.pgeForeColor;
                        } catch (err) {
                            code = "";
                        }
                    }
                },
                convertIEVersion: function(version) {
                    if (version != "") {
                        var m = version.split(",");
                        var v = parseInt(m[0] * 1e3) + parseInt(m[1] * 100) + parseInt(m[2] * 10) + parseInt(m[3]);
                        return v;
                    } else {
                        return "";
                    }
                },
                convertVersion: function(version) {
                    if (version != "") {
                        var m = version.split(".");
                        var v = parseInt(m[0] * 1e3) + parseInt(m[1] * 100) + parseInt(m[2] * 10) + parseInt(m[3]);
                        return v;
                    } else {
                        return "";
                    }
                },
                setDownText: function() {
                    if (this.pgeVersion != undefined && this.pgeVersion != "") {
                        this.pgeDownText = "请点此升级控件";
                    }
                },
                pgInitialize: function() {
                    if (this.checkInstall()) {
                        if (this.osBrowser == 1 || this.osBrowser == 3) {
                            $("#" + this.settings.pgeId).show();
                        }
                        var control = document.getElementById(this.settings.pgeId);
                        if (this.settings.pgeBackColor != undefined && this.settings.pgeBackColor != "") control.BackColor = this.settings.pgeBackColor;
                        if (this.settings.pgeForeColor != undefined && this.settings.pgeForeColor != "") control.ForeColor = this.settings.pgeForeColor;
                        control.input11 = greyWordList;
                        control.input12 = this.settings.k3;
                        control.input16 = greyWordList;
                        control.input10 = this.settings.k3;
                    } else {
                        if (this.osBrowser == 1 || this.osBrowser == 3) {
                            $("#" + this.settings.pgeId + "_down").show();
                        }
                    }
                }
            }
        });
    })(jQuery);
});

// 依赖encryptor.js
// 依赖password-rule.js
define("pafweblib/pwdGrd/1.0.1/pc-b-password-debug", [ "pafweblib/pwdGrd/1.0.1/encryptor-debug", "pafweblib/pwdGrd/1.0.1/password-rule-debug" ], function(require, exports, module) {
    var encryptorPassword = require("pafweblib/pwdGrd/1.0.1/encryptor-debug");
    var passwordRules = require("pafweblib/pwdGrd/1.0.1/password-rule-debug");
    var $iptPassword = $(".password-ruled"), passwordHolder = ".passwordHolder";
    // 把密码加密的执行方法
    function run() {
        // 把加密的密码填入到对应的字段
        $("form").submit(function() {
            $("form").find(".encrypted-password, .plugin-encrypted-password").each(function() {
                var $el = $(this), holder = $("#" + $el.prop("id") + "_");
                var $elValue = $.trim($el.val());
                if ($elValue && $elValue.length > 0) {
                    holder.val(encryptorPassword($elValue));
                }
            });
        });
        // 移除密码输入框的name属性；并增加隐藏域
        $(".encrypted-password, .plugin-encrypted-password").each(function() {
            var $el = $(this);
            $("<input type='hidden' name='" + $el.prop("name") + "' id='" + $el.prop("id") + "_" + "'/>").appendTo($el.closest("form"));
            var el = $el.css("visibility", "visible")[0];
            el.removeAttribute("disabled");
            el.removeAttribute("name");
        });
        // 密码一致性验证
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
    }
    // 密码校验绑定
    function handleEvent() {
        //校验触发的行为
        $iptPassword.on("validate", function(e, vc) {
            var $password = $(this), val = $password.val();
            if (val == null || $.trim(val).length == 0) {
                $(this).trigger("displayStrength", [ -1 ]);
                vc.reject("密码不能为空");
                return false;
            }
            if (!passwordRules.validCharSet(val)) {
                $(this).trigger("displayStrength", [ -1 ]);
                vc.reject("密码不可用");
                return false;
            }
            if (passwordRules.isInBlackList(val)) {
                $(this).trigger("displayStrength", [ -1 ]);
                vc.reject("您设置的密码太简单啦^_^");
                return false;
            }
            if ($password.hasClass("password-min-6")) {
                if (passwordRules.lessLength(val, 6)) {
                    $(this).trigger("displayStrength", [ -1 ]);
                    vc.reject("密码长度需要是6位以上");
                    return false;
                }
            } else if (passwordRules.lessLength(val, 8)) {
                $(this).trigger("displayStrength", [ -1 ]);
                vc.reject("密码长度需要是8位以上");
                return false;
            }
            if (passwordRules.moreLength(val)) {
                $(this).trigger("displayStrength", [ -1 ]);
                vc.reject("密码长度需要是16位以下");
                return false;
            }
            //
            if (!$password.hasClass("password-min-6")) {
                if (!passwordRules.validCharSetGroup(val)) {
                    $(this).trigger("displayStrength", [ -1 ]);
                    vc.reject("大写字母、小写字母、数字、特殊字符至少包含2种");
                    return false;
                }
            }
        });
        //校验后的处理逻辑，主要是触发密码强度的显示
        $iptPassword.on("afterValidate", function(e, vc) {
            var val = $(this).val();
            var score = passwordRules.entropyScore(val), mark = 0;
            if (val == "" || !passwordRules.validCharSet(val)) {
                $(this).trigger("displayStrength", [ -1 ]);
                return;
            }
            if (passwordRules.isInBlackList(val)) {
                $(this).trigger("displayStrength", [ 0, score, true ]);
                return;
            }
            if (isNaN(score)) {
                mark = 0;
            } else if (score <= 30) {
                mark = 1;
            } else if (score <= 60) {
                mark = 2;
            } else {
                mark = 3;
            }
            $(this).parents(passwordHolder).trigger("displayStrength", [ mark, score ]);
        });
        $("body").on("displayStrength", passwordHolder, function(e, mark, score, greyList) {
            // TODO 这里的行为pc和mobile不一致，需要重构
            var str = [ "invalid", "weak", "medium", "strong" ];
            for (var i = 0; i < str.length; i++) {
                $(this).removeClass(str[i]);
            }
            $(this).addClass(str[mark]);
            // TODO pc端灰名单提示，移动端没有
            $(this).find("input.strength").val(mark);
            if (greyList) {} else {
                $(this).children(".greyListTip").hide();
            }
        });
    }
    function renderPasswordHolder() {
        $(".passwordHolder").each(function() {
            var name = $(this).find(".password-ruled").prop("name");
            $(this).append("<div class='strongShow'><span class='s2'>弱</span><span class='s3'>中</span><span class='s4'>强</span></div>");
            $(this).append('<input type="hidden" class="strength" name="' + name + 'Strength" value="" />');
        });
    }
    function init() {
        renderPasswordHolder();
        run();
        handleEvent();
    }
    init();
    exports.entropyScoreByPatternLength = passwordRules.entropyScoreByPatternLength;
});

define("pafweblib/pwdGrd/1.0.1/encryptor-debug", [], function(require, exports, module) {
    // 加密函数压缩
    function hex2int8array(Os1) {
        var zoAbYGhvL2 = "0123456789abcdef";
        var yswGz3 = [ Os1["length"] / 2 ];
        var fqhNCq4 = new window["Array"]();
        for (i = 0; i < yswGz3; i++) {
            fqhNCq4[i] = zoAbYGhvL2["indexOf"](Os1["charAt"](i * 2 + 0)) * 16 + zoAbYGhvL2["indexOf"](Os1["charAt"](i * 2 + 1));
        }
        return fqhNCq4;
    }
    function int8array2hex(P5) {
        var SZnSBGORl6 = "0123456789abcdef";
        var JjujsKHif7 = "";
        for (i = 0; i < P5["length"]; i++) {
            var oYOBiJ8 = P5[i] % 16;
            var $eivcif9 = P5[i] - P5[i] % 16;
            $eivcif9 = $eivcif9 / 16;
            JjujsKHif7 += SZnSBGORl6["substring"]($eivcif9, $eivcif9 + 1) + "" + SZnSBGORl6["substring"](oYOBiJ8, oYOBiJ8 + 1);
        }
        return JjujsKHif7;
    }
    function rc4() {}
    rc4["prototype"]["rc4crypt"] = function(skey, DyrWZSt10) {
        key = hex2int8array(skey);
        pt = hex2int8array(DyrWZSt10);
        s = new window["Array"]();
        for (var nBMHVDWBH11 = 0; nBMHVDWBH11 < 256; nBMHVDWBH11++) {
            s[nBMHVDWBH11] = nBMHVDWBH11;
        }
        var c12 = 0;
        var G13;
        for (nBMHVDWBH11 = 0; nBMHVDWBH11 < 256; nBMHVDWBH11++) {
            c12 = (c12 + s[nBMHVDWBH11] + key[nBMHVDWBH11 % key["length"]]) % 256;
            G13 = s[nBMHVDWBH11];
            s[nBMHVDWBH11] = s[c12];
            s[c12] = G13;
        }
        nBMHVDWBH11 = 0;
        c12 = 0;
        ct = new window["Array"]();
        for (var CQsZn14 = 0; CQsZn14 < pt["length"]; CQsZn14++) {
            nBMHVDWBH11 = (nBMHVDWBH11 + 1) % 256;
            c12 = (c12 + s[nBMHVDWBH11]) % 256;
            G13 = s[nBMHVDWBH11];
            s[nBMHVDWBH11] = s[c12];
            s[c12] = G13;
            ct[CQsZn14] = pt[CQsZn14] ^ s[(s[nBMHVDWBH11] + s[c12]) % 256];
        }
        return int8array2hex(ct);
    };
    rc4["prototype"]["init"] = function(skey) {
        key = hex2int8array(skey);
        s = new window["Array"]();
        for (var N15 = 0; N15 < 256; N15++) {
            s[N15] = N15;
        }
        var LJpzFKb16 = 0;
        var hg17;
        for (N15 = 0; N15 < 256; N15++) {
            LJpzFKb16 = (LJpzFKb16 + s[N15] + key[N15 % key["length"]]) % 256;
            hg17 = s[N15];
            s[N15] = s[LJpzFKb16];
            s[LJpzFKb16] = hg17;
        }
        this["i"] = 0;
        this["j"] = 0;
        this["s"] = s;
    };
    rc4["prototype"]["crypt"] = function(spt) {
        pt = hex2int8array(spt);
        s = this["s"];
        i = this["i"];
        j = this["j"];
        ct = new window["Array"]();
        for (var wOGSpaQ18 = 0; wOGSpaQ18 < pt["length"]; wOGSpaQ18++) {
            i = (i + 1) % 256;
            j = (j + s[i]) % 256;
            x = s[i];
            s[i] = s[j];
            s[j] = x;
            ct[wOGSpaQ18] = pt[wOGSpaQ18] ^ s[(s[i] + s[j]) % 256];
        }
        this["s"] = s;
        this["i"] = i;
        this["j"] = j;
        return int8array2hex(ct);
    };
    var AsUDZpPM1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var hwR2 = "=";
    function hex2b64(VaKtDYI3) {
        var j4;
        var MIgFBkw5;
        var HJ6 = "";
        for (j4 = 0; j4 + 3 <= VaKtDYI3["length"]; j4 += 3) {
            MIgFBkw5 = window["parseInt"](VaKtDYI3["substring"](j4, j4 + 3), 16);
            HJ6 += AsUDZpPM1["charAt"](MIgFBkw5 >> 6) + AsUDZpPM1["charAt"](MIgFBkw5 & 63);
        }
        if (j4 + 1 == VaKtDYI3["length"]) {
            MIgFBkw5 = window["parseInt"](VaKtDYI3["substring"](j4, j4 + 1), 16);
            HJ6 += AsUDZpPM1["charAt"](MIgFBkw5 << 2);
        } else if (j4 + 2 == VaKtDYI3["length"]) {
            MIgFBkw5 = window["parseInt"](VaKtDYI3["substring"](j4, j4 + 2), 16);
            HJ6 += AsUDZpPM1["charAt"](MIgFBkw5 >> 2) + AsUDZpPM1["charAt"]((MIgFBkw5 & 3) << 4);
        }
        while ((HJ6["length"] & 3) > 0) HJ6 += hwR2;
        return HJ6;
    }
    function b64tohex(mNqvsSZgU7) {
        var rmTRUlu8 = "";
        var VZCL_kjE9;
        var AsOWTEK10 = 0;
        var r11;
        for (VZCL_kjE9 = 0; VZCL_kjE9 < mNqvsSZgU7["length"]; ++VZCL_kjE9) {
            if (mNqvsSZgU7["charAt"](VZCL_kjE9) == hwR2) break;
            v = AsUDZpPM1["indexOf"](mNqvsSZgU7["charAt"](VZCL_kjE9));
            if (v < 0) continue;
            if (AsOWTEK10 == 0) {
                rmTRUlu8 += int2char(v >> 2);
                r11 = v & 3;
                AsOWTEK10 = 1;
            } else if (AsOWTEK10 == 1) {
                rmTRUlu8 += int2char(r11 << 2 | v >> 4);
                r11 = v & 15;
                AsOWTEK10 = 2;
            } else if (AsOWTEK10 == 2) {
                rmTRUlu8 += int2char(r11);
                rmTRUlu8 += int2char(v >> 2);
                r11 = v & 3;
                AsOWTEK10 = 3;
            } else {
                rmTRUlu8 += int2char(r11 << 2 | v >> 4);
                rmTRUlu8 += int2char(v & 15);
                AsOWTEK10 = 0;
            }
        }
        if (AsOWTEK10 == 1) rmTRUlu8 += int2char(r11 << 2);
        return rmTRUlu8;
    }
    function b64toBA(f12) {
        var WL13 = b64tohex(f12);
        var JEsaJ14;
        var CuviGJs15 = new window["Array"]();
        for (JEsaJ14 = 0; 2 * JEsaJ14 < WL13["length"]; ++JEsaJ14) {
            CuviGJs15[JEsaJ14] = window["parseInt"](WL13["substring"](2 * JEsaJ14, 2 * JEsaJ14 + 2), 16);
        }
        return CuviGJs15;
    }
    var dbits;
    var canary = 0xdeadbeefcafe;
    var j_lm = (canary & 16777215) == 15715070;
    function BigInteger(a, b, c) {
        if (a != null) if ("number" == typeof a) this.fromNumber(a, b, c); else if (b == null && "string" != typeof a) this.fromString(a, 256); else this.fromString(a, b);
    }
    function nbi() {
        return new BigInteger(null);
    }
    function am1(i, x, w, j, c, n) {
        while (--n >= 0) {
            var v = x * this[i++] + w[j] + c;
            c = Math.floor(v / 67108864);
            w[j++] = v & 67108863;
        }
        return c;
    }
    function am2(i, x, w, j, c, n) {
        var xl = x & 32767, xh = x >> 15;
        while (--n >= 0) {
            var l = this[i] & 32767;
            var h = this[i++] >> 15;
            var m = xh * l + h * xl;
            l = xl * l + ((m & 32767) << 15) + w[j] + (c & 1073741823);
            c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
            w[j++] = l & 1073741823;
        }
        return c;
    }
    function am3(i, x, w, j, c, n) {
        var xl = x & 16383, xh = x >> 14;
        while (--n >= 0) {
            var l = this[i] & 16383;
            var h = this[i++] >> 14;
            var m = xh * l + h * xl;
            l = xl * l + ((m & 16383) << 14) + w[j] + c;
            c = (l >> 28) + (m >> 14) + xh * h;
            w[j++] = l & 268435455;
        }
        return c;
    }
    if (j_lm && navigator.appName == "Microsoft Internet Explorer") {
        BigInteger.prototype.am = am2;
        dbits = 30;
    } else if (j_lm && navigator.appName != "Netscape") {
        BigInteger.prototype.am = am1;
        dbits = 26;
    } else {
        BigInteger.prototype.am = am3;
        dbits = 28;
    }
    BigInteger.prototype.DB = dbits;
    BigInteger.prototype.DM = (1 << dbits) - 1;
    BigInteger.prototype.DV = 1 << dbits;
    var BI_FP = 52;
    BigInteger.prototype.FV = Math.pow(2, BI_FP);
    BigInteger.prototype.F1 = BI_FP - dbits;
    BigInteger.prototype.F2 = 2 * dbits - BI_FP;
    var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
    var BI_RC = new Array();
    var rr, vv;
    rr = "0".charCodeAt(0);
    for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
    rr = "a".charCodeAt(0);
    for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
    rr = "A".charCodeAt(0);
    for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
    function int2char(n) {
        return BI_RM.charAt(n);
    }
    function intAt(s, i) {
        var c = BI_RC[s.charCodeAt(i)];
        return c == null ? -1 : c;
    }
    function bnpCopyTo(r) {
        for (var i = this.t - 1; i >= 0; --i) r[i] = this[i];
        r.t = this.t;
        r.s = this.s;
    }
    function bnpFromInt(x) {
        this.t = 1;
        this.s = x < 0 ? -1 : 0;
        if (x > 0) this[0] = x; else if (x < -1) this[0] = x + DV; else this.t = 0;
    }
    function nbv(i) {
        var r = nbi();
        r.fromInt(i);
        return r;
    }
    function bnpFromString(s, b) {
        var k;
        if (b == 16) k = 4; else if (b == 8) k = 3; else if (b == 256) k = 8; else if (b == 2) k = 1; else if (b == 32) k = 5; else if (b == 4) k = 2; else {
            this.fromRadix(s, b);
            return;
        }
        this.t = 0;
        this.s = 0;
        var i = s.length, mi = false, sh = 0;
        while (--i >= 0) {
            var x = k == 8 ? s[i] & 255 : intAt(s, i);
            if (x < 0) {
                if (s.charAt(i) == "-") mi = true;
                continue;
            }
            mi = false;
            if (sh == 0) this[this.t++] = x; else if (sh + k > this.DB) {
                this[this.t - 1] |= (x & (1 << this.DB - sh) - 1) << sh;
                this[this.t++] = x >> this.DB - sh;
            } else this[this.t - 1] |= x << sh;
            sh += k;
            if (sh >= this.DB) sh -= this.DB;
        }
        if (k == 8 && (s[0] & 128) != 0) {
            this.s = -1;
            if (sh > 0) this[this.t - 1] |= (1 << this.DB - sh) - 1 << sh;
        }
        this.clamp();
        if (mi) BigInteger.ZERO.subTo(this, this);
    }
    function bnpClamp() {
        var c = this.s & this.DM;
        while (this.t > 0 && this[this.t - 1] == c) --this.t;
    }
    function bnToString(b) {
        if (this.s < 0) return "-" + this.negate().toString(b);
        var k;
        if (b == 16) k = 4; else if (b == 8) k = 3; else if (b == 2) k = 1; else if (b == 32) k = 5; else if (b == 4) k = 2; else return this.toRadix(b);
        var km = (1 << k) - 1, d, m = false, r = "", i = this.t;
        var p = this.DB - i * this.DB % k;
        if (i-- > 0) {
            if (p < this.DB && (d = this[i] >> p) > 0) {
                m = true;
                r = int2char(d);
            }
            while (i >= 0) {
                if (p < k) {
                    d = (this[i] & (1 << p) - 1) << k - p;
                    d |= this[--i] >> (p += this.DB - k);
                } else {
                    d = this[i] >> (p -= k) & km;
                    if (p <= 0) {
                        p += this.DB;
                        --i;
                    }
                }
                if (d > 0) m = true;
                if (m) r += int2char(d);
            }
        }
        return m ? r : "0";
    }
    function bnNegate() {
        var r = nbi();
        BigInteger.ZERO.subTo(this, r);
        return r;
    }
    function bnAbs() {
        return this.s < 0 ? this.negate() : this;
    }
    function bnCompareTo(a) {
        var r = this.s - a.s;
        if (r != 0) return r;
        var i = this.t;
        r = i - a.t;
        if (r != 0) return r;
        while (--i >= 0) if ((r = this[i] - a[i]) != 0) return r;
        return 0;
    }
    function nbits(x) {
        var r = 1, t;
        if ((t = x >>> 16) != 0) {
            x = t;
            r += 16;
        }
        if ((t = x >> 8) != 0) {
            x = t;
            r += 8;
        }
        if ((t = x >> 4) != 0) {
            x = t;
            r += 4;
        }
        if ((t = x >> 2) != 0) {
            x = t;
            r += 2;
        }
        if ((t = x >> 1) != 0) {
            x = t;
            r += 1;
        }
        return r;
    }
    function bnBitLength() {
        if (this.t <= 0) return 0;
        return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ this.s & this.DM);
    }
    function bnpDLShiftTo(n, r) {
        var i;
        for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
        for (i = n - 1; i >= 0; --i) r[i] = 0;
        r.t = this.t + n;
        r.s = this.s;
    }
    function bnpDRShiftTo(n, r) {
        for (var i = n; i < this.t; ++i) r[i - n] = this[i];
        r.t = Math.max(this.t - n, 0);
        r.s = this.s;
    }
    function bnpLShiftTo(n, r) {
        var bs = n % this.DB;
        var cbs = this.DB - bs;
        var bm = (1 << cbs) - 1;
        var ds = Math.floor(n / this.DB), c = this.s << bs & this.DM, i;
        for (i = this.t - 1; i >= 0; --i) {
            r[i + ds + 1] = this[i] >> cbs | c;
            c = (this[i] & bm) << bs;
        }
        for (i = ds - 1; i >= 0; --i) r[i] = 0;
        r[ds] = c;
        r.t = this.t + ds + 1;
        r.s = this.s;
        r.clamp();
    }
    function bnpRShiftTo(n, r) {
        r.s = this.s;
        var ds = Math.floor(n / this.DB);
        if (ds >= this.t) {
            r.t = 0;
            return;
        }
        var bs = n % this.DB;
        var cbs = this.DB - bs;
        var bm = (1 << bs) - 1;
        r[0] = this[ds] >> bs;
        for (var i = ds + 1; i < this.t; ++i) {
            r[i - ds - 1] |= (this[i] & bm) << cbs;
            r[i - ds] = this[i] >> bs;
        }
        if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs;
        r.t = this.t - ds;
        r.clamp();
    }
    function bnpSubTo(a, r) {
        var i = 0, c = 0, m = Math.min(a.t, this.t);
        while (i < m) {
            c += this[i] - a[i];
            r[i++] = c & this.DM;
            c >>= this.DB;
        }
        if (a.t < this.t) {
            c -= a.s;
            while (i < this.t) {
                c += this[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            c += this.s;
        } else {
            c += this.s;
            while (i < a.t) {
                c -= a[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            c -= a.s;
        }
        r.s = c < 0 ? -1 : 0;
        if (c < -1) r[i++] = this.DV + c; else if (c > 0) r[i++] = c;
        r.t = i;
        r.clamp();
    }
    function bnpMultiplyTo(a, r) {
        var x = this.abs(), y = a.abs();
        var i = x.t;
        r.t = i + y.t;
        while (--i >= 0) r[i] = 0;
        for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
        r.s = 0;
        r.clamp();
        if (this.s != a.s) BigInteger.ZERO.subTo(r, r);
    }
    function bnpSquareTo(r) {
        var x = this.abs();
        var i = r.t = 2 * x.t;
        while (--i >= 0) r[i] = 0;
        for (i = 0; i < x.t - 1; ++i) {
            var c = x.am(i, x[i], r, 2 * i, 0, 1);
            if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
                r[i + x.t] -= x.DV;
                r[i + x.t + 1] = 1;
            }
        }
        if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
        r.s = 0;
        r.clamp();
    }
    function bnpDivRemTo(m, q, r) {
        var pm = m.abs();
        if (pm.t <= 0) return;
        var pt = this.abs();
        if (pt.t < pm.t) {
            if (q != null) q.fromInt(0);
            if (r != null) this.copyTo(r);
            return;
        }
        if (r == null) r = nbi();
        var y = nbi(), ts = this.s, ms = m.s;
        var nsh = this.DB - nbits(pm[pm.t - 1]);
        if (nsh > 0) {
            pm.lShiftTo(nsh, y);
            pt.lShiftTo(nsh, r);
        } else {
            pm.copyTo(y);
            pt.copyTo(r);
        }
        var ys = y.t;
        var y0 = y[ys - 1];
        if (y0 == 0) return;
        var yt = y0 * (1 << this.F1) + (ys > 1 ? y[ys - 2] >> this.F2 : 0);
        var d1 = this.FV / yt, d2 = (1 << this.F1) / yt, e = 1 << this.F2;
        var i = r.t, j = i - ys, t = q == null ? nbi() : q;
        y.dlShiftTo(j, t);
        if (r.compareTo(t) >= 0) {
            r[r.t++] = 1;
            r.subTo(t, r);
        }
        BigInteger.ONE.dlShiftTo(ys, t);
        t.subTo(y, y);
        while (y.t < ys) y[y.t++] = 0;
        while (--j >= 0) {
            var qd = r[--i] == y0 ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
            if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) {
                y.dlShiftTo(j, t);
                r.subTo(t, r);
                while (r[i] < --qd) r.subTo(t, r);
            }
        }
        if (q != null) {
            r.drShiftTo(ys, q);
            if (ts != ms) BigInteger.ZERO.subTo(q, q);
        }
        r.t = ys;
        r.clamp();
        if (nsh > 0) r.rShiftTo(nsh, r);
        if (ts < 0) BigInteger.ZERO.subTo(r, r);
    }
    function bnMod(a) {
        var r = nbi();
        this.abs().divRemTo(a, null, r);
        if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r);
        return r;
    }
    function Classic(m) {
        this.m = m;
    }
    function cConvert(x) {
        if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m); else return x;
    }
    function cRevert(x) {
        return x;
    }
    function cReduce(x) {
        x.divRemTo(this.m, null, x);
    }
    function cMulTo(x, y, r) {
        x.multiplyTo(y, r);
        this.reduce(r);
    }
    function cSqrTo(x, r) {
        x.squareTo(r);
        this.reduce(r);
    }
    Classic.prototype.convert = cConvert;
    Classic.prototype.revert = cRevert;
    Classic.prototype.reduce = cReduce;
    Classic.prototype.mulTo = cMulTo;
    Classic.prototype.sqrTo = cSqrTo;
    function bnpInvDigit() {
        if (this.t < 1) return 0;
        var x = this[0];
        if ((x & 1) == 0) return 0;
        var y = x & 3;
        y = y * (2 - (x & 15) * y) & 15;
        y = y * (2 - (x & 255) * y) & 255;
        y = y * (2 - ((x & 65535) * y & 65535)) & 65535;
        y = y * (2 - x * y % this.DV) % this.DV;
        return y > 0 ? this.DV - y : -y;
    }
    function Montgomery(m) {
        this.m = m;
        this.mp = m.invDigit();
        this.mpl = this.mp & 32767;
        this.mph = this.mp >> 15;
        this.um = (1 << m.DB - 15) - 1;
        this.mt2 = 2 * m.t;
    }
    function montConvert(x) {
        var r = nbi();
        x.abs().dlShiftTo(this.m.t, r);
        r.divRemTo(this.m, null, r);
        if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r);
        return r;
    }
    function montRevert(x) {
        var r = nbi();
        x.copyTo(r);
        this.reduce(r);
        return r;
    }
    function montReduce(x) {
        while (x.t <= this.mt2) x[x.t++] = 0;
        for (var i = 0; i < this.m.t; ++i) {
            var j = x[i] & 32767;
            var u0 = j * this.mpl + ((j * this.mph + (x[i] >> 15) * this.mpl & this.um) << 15) & x.DM;
            j = i + this.m.t;
            x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
            while (x[j] >= x.DV) {
                x[j] -= x.DV;
                x[++j]++;
            }
        }
        x.clamp();
        x.drShiftTo(this.m.t, x);
        if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
    }
    function montSqrTo(x, r) {
        x.squareTo(r);
        this.reduce(r);
    }
    function montMulTo(x, y, r) {
        x.multiplyTo(y, r);
        this.reduce(r);
    }
    Montgomery.prototype.convert = montConvert;
    Montgomery.prototype.revert = montRevert;
    Montgomery.prototype.reduce = montReduce;
    Montgomery.prototype.mulTo = montMulTo;
    Montgomery.prototype.sqrTo = montSqrTo;
    function bnpIsEven() {
        return (this.t > 0 ? this[0] & 1 : this.s) == 0;
    }
    function bnpExp(e, z) {
        if (e > 4294967295 || e < 1) return BigInteger.ONE;
        var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e) - 1;
        g.copyTo(r);
        while (--i >= 0) {
            z.sqrTo(r, r2);
            if ((e & 1 << i) > 0) z.mulTo(r2, g, r); else {
                var t = r;
                r = r2;
                r2 = t;
            }
        }
        return z.revert(r);
    }
    function bnModPowInt(e, m) {
        var z;
        if (e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
        return this.exp(e, z);
    }
    BigInteger.prototype.copyTo = bnpCopyTo;
    BigInteger.prototype.fromInt = bnpFromInt;
    BigInteger.prototype.fromString = bnpFromString;
    BigInteger.prototype.clamp = bnpClamp;
    BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
    BigInteger.prototype.drShiftTo = bnpDRShiftTo;
    BigInteger.prototype.lShiftTo = bnpLShiftTo;
    BigInteger.prototype.rShiftTo = bnpRShiftTo;
    BigInteger.prototype.subTo = bnpSubTo;
    BigInteger.prototype.multiplyTo = bnpMultiplyTo;
    BigInteger.prototype.squareTo = bnpSquareTo;
    BigInteger.prototype.divRemTo = bnpDivRemTo;
    BigInteger.prototype.invDigit = bnpInvDigit;
    BigInteger.prototype.isEven = bnpIsEven;
    BigInteger.prototype.exp = bnpExp;
    BigInteger.prototype.toString = bnToString;
    BigInteger.prototype.negate = bnNegate;
    BigInteger.prototype.abs = bnAbs;
    BigInteger.prototype.compareTo = bnCompareTo;
    BigInteger.prototype.bitLength = bnBitLength;
    BigInteger.prototype.mod = bnMod;
    BigInteger.prototype.modPowInt = bnModPowInt;
    BigInteger.ZERO = nbv(0);
    BigInteger.ONE = nbv(1);
    function Arcfour() {
        this["i"] = 0;
        this["j"] = 0;
        this["S"] = new window["Array"]();
    }
    function ARC4init(oDo$k_On1) {
        var Mlky2, GvVyFu3, kSjL4;
        for (Mlky2 = 0; Mlky2 < 256; ++Mlky2) this["S"][Mlky2] = Mlky2;
        GvVyFu3 = 0;
        for (Mlky2 = 0; Mlky2 < 256; ++Mlky2) {
            GvVyFu3 = GvVyFu3 + this["S"][Mlky2] + oDo$k_On1[Mlky2 % oDo$k_On1["length"]] & 255;
            kSjL4 = this["S"][Mlky2];
            this["S"][Mlky2] = this["S"][GvVyFu3];
            this["S"][GvVyFu3] = kSjL4;
        }
        this["i"] = 0;
        this["j"] = 0;
    }
    function ARC4next() {
        var W_Ag_5;
        this["i"] = this["i"] + 1 & 255;
        this["j"] = this["j"] + this["S"][this["i"]] & 255;
        W_Ag_5 = this["S"][this["i"]];
        this["S"][this["i"]] = this["S"][this["j"]];
        this["S"][this["j"]] = W_Ag_5;
        return this["S"][W_Ag_5 + this["S"][this["i"]] & 255];
    }
    Arcfour["prototype"]["init"] = ARC4init;
    Arcfour["prototype"]["next"] = ARC4next;
    function prng_newstate() {
        return new Arcfour();
    }
    var DUbmKf6 = 256;
    var cHzO7;
    var Ph8;
    var atVbSn9;
    function rng_seed_int(kzMO_M10) {
        Ph8[atVbSn9++] ^= kzMO_M10 & 255;
        Ph8[atVbSn9++] ^= kzMO_M10 >> 8 & 255;
        Ph8[atVbSn9++] ^= kzMO_M10 >> 16 & 255;
        Ph8[atVbSn9++] ^= kzMO_M10 >> 24 & 255;
        if (atVbSn9 >= DUbmKf6) atVbSn9 -= DUbmKf6;
    }
    function rng_seed_time() {
        rng_seed_int(new window["Date"]()["getTime"]());
    }
    if (Ph8 == null) {
        Ph8 = new window["Array"]();
        atVbSn9 = 0;
        var G11;
        if (navigator["appName"] == "Netscape" && navigator["appVersion"] < "5" && window["crypto"]) {
            var RE12 = window["crypto"]["random"](32);
            for (G11 = 0; G11 < RE12["length"]; ++G11) Ph8[atVbSn9++] = RE12["charCodeAt"](G11) & 255;
        }
        while (atVbSn9 < DUbmKf6) {
            G11 = window["Math"]["floor"](65536 * window["Math"]["random"]());
            Ph8[atVbSn9++] = G11 >>> 8;
            Ph8[atVbSn9++] = G11 & 255;
        }
        atVbSn9 = 0;
        rng_seed_time();
    }
    function rng_get_byte() {
        if (cHzO7 == null) {
            rng_seed_time();
            cHzO7 = prng_newstate();
            cHzO7["init"](Ph8);
            for (atVbSn9 = 0; atVbSn9 < Ph8["length"]; ++atVbSn9) Ph8[atVbSn9] = 0;
            atVbSn9 = 0;
        }
        return cHzO7["next"]();
    }
    function rng_get_bytes(KNA13) {
        var Xqv14;
        for (Xqv14 = 0; Xqv14 < KNA13["length"]; ++Xqv14) KNA13[Xqv14] = rng_get_byte();
    }
    function SecureRandom() {}
    SecureRandom["prototype"]["nextBytes"] = rng_get_bytes;
    function parseBigInt(C$eRYSX1, ClifR2) {
        return new BigInteger(C$eRYSX1, ClifR2);
    }
    function linebrk(sQU3, wttK4) {
        var iRbA5 = "";
        var az_uWW6 = 0;
        while (az_uWW6 + wttK4 < sQU3["length"]) {
            iRbA5 += sQU3["substring"](az_uWW6, az_uWW6 + wttK4) + "\n";
            az_uWW6 += wttK4;
        }
        return iRbA5 + sQU3["substring"](az_uWW6, sQU3["length"]);
    }
    function byte2Hex(MNDMTFNWw7) {
        if (MNDMTFNWw7 < 16) return "0" + MNDMTFNWw7["toString"](16); else return MNDMTFNWw7["toString"](16);
    }
    function pkcs1pad2(k8, VSMs9) {
        if (VSMs9 < k8["length"] + 11) {
            window["alert"]("Message too long for RSA");
            return null;
        }
        var hebGofbtJ10 = new window["Array"]();
        var t11 = k8["length"] - 1;
        while (t11 >= 0 && VSMs9 > 0) {
            var Lss12 = k8["charCodeAt"](t11--);
            if (Lss12 < 128) {
                hebGofbtJ10[--VSMs9] = Lss12;
            } else if (Lss12 > 127 && Lss12 < 2048) {
                hebGofbtJ10[--VSMs9] = Lss12 & 63 | 128;
                hebGofbtJ10[--VSMs9] = Lss12 >> 6 | 192;
            } else {
                hebGofbtJ10[--VSMs9] = Lss12 & 63 | 128;
                hebGofbtJ10[--VSMs9] = Lss12 >> 6 & 63 | 128;
                hebGofbtJ10[--VSMs9] = Lss12 >> 12 | 224;
            }
        }
        hebGofbtJ10[--VSMs9] = 0;
        var uHp13 = new SecureRandom();
        var $s14 = new window["Array"]();
        while (VSMs9 > 2) {
            $s14[0] = 0;
            while ($s14[0] == 0) uHp13["nextBytes"]($s14);
            hebGofbtJ10[--VSMs9] = $s14[0];
        }
        hebGofbtJ10[--VSMs9] = 2;
        hebGofbtJ10[--VSMs9] = 0;
        var $zSl15 = new BigInteger(hebGofbtJ10);
        return $zSl15;
    }
    function RSAKey() {
        this["n"] = null;
        this["e"] = 0;
        this["d"] = null;
        this["p"] = null;
        this["q"] = null;
        this["dmp1"] = null;
        this["dmq1"] = null;
        this["coeff"] = null;
    }
    function RSASetPublic(jozJa16, yNYrzbQ17) {
        if (jozJa16 != null && yNYrzbQ17 != null && jozJa16["length"] > 0 && yNYrzbQ17["length"] > 0) {
            this["n"] = parseBigInt(jozJa16, 16);
            this["e"] = window["parseInt"](yNYrzbQ17, 16);
        } else window["alert"]("Invalid RSA public key");
    }
    function RSADoPublic(ZI18) {
        return ZI18["modPowInt"](this["e"], this["n"]);
    }
    function RSAEncrypt(lo19) {
        var AzUf$ZYv20 = pkcs1pad2(lo19, this["n"]["bitLength"]() + 7 >> 3);
        if (AzUf$ZYv20 == null) return null;
        var AZFak21 = this["doPublic"](AzUf$ZYv20);
        if (AZFak21 == null) return null;
        var AGhEbYyE22 = AZFak21["toString"](16);
        var TXm23 = AGhEbYyE22;
        if ((AGhEbYyE22["length"] & 1) != 0) TXm23 = "0" + TXm23;
        return TXm23;
    }
    RSAKey["prototype"]["doPublic"] = RSADoPublic;
    RSAKey["prototype"]["setPublic"] = RSASetPublic;
    RSAKey["prototype"]["encrypt"] = RSAEncrypt;
    function str2hex(QqaAsD1) {
        var iZIm2 = "0123456789abcdef";
        var D3 = "";
        for (i = 0; i < QqaAsD1["length"]; i++) {
            var bR_vmVWZ4 = QqaAsD1["charCodeAt"](i);
            var s$TLUH5 = bR_vmVWZ4 % 16;
            var qXfsmm_6 = bR_vmVWZ4 - s$TLUH5;
            qXfsmm_6 = qXfsmm_6 / 16;
            D3 += iZIm2["substring"](qXfsmm_6, qXfsmm_6 + 1) + "" + iZIm2["substring"](s$TLUH5, s$TLUH5 + 1);
        }
        return D3;
    }
    function hex2str(XJzsQZ7) {
        var ezmE8 = "";
        var hVKDssBA9 = "0123456789abcdef";
        var hlPV$Xc10 = [ XJzsQZ7["length"] / 2 ];
        for (i = 0; i < hlPV$Xc10; i++) {
            _char = hVKDssBA9["indexOf"](XJzsQZ7["charAt"](i * 2 + 0)) * 16 + hVKDssBA9["indexOf"](XJzsQZ7["charAt"](i * 2 + 1));
            ezmE8 += window["String"]["fromCharCode"](_char);
        }
        return ezmE8;
    }
    function hex_rand(UaiV1) {
        var DPlBs2 = new SecureRandom();
        var s$myJnIJs3 = new window["Array"]();
        for (var ZA4 = 0; ZA4 < UaiV1 + 1; ZA4++) s$myJnIJs3[ZA4] = 0;
        DPlBs2["nextBytes"](s$myJnIJs3);
        s$myJnIJs3[0] = 0;
        var TGIcZv5 = new BigInteger(s$myJnIJs3)["toString"](16);
        while (TGIcZv5["length"] < 16) TGIcZv5 = "0" + TGIcZv5;
        while (TGIcZv5["length"] < UaiV1 * 2) TGIcZv5 = "0" + TGIcZv5;
        return TGIcZv5;
    }
    function cryptk(pwd, ts, pk1, pk2) {
        var hQOCddg1 = pwd;
        var u$ssEDv2 = ts;
        var jfBH3 = pk1;
        var rMgt4 = pk2;
        var pA$jNr5 = "", jCf6 = "";
        var mESkLcJ7 = "", I8 = 0, shuGwr9 = 0;
        mESkLcJ7 = jfBH3;
        I8 = mESkLcJ7["indexOf"]("30818902818100");
        shuGwr9 = mESkLcJ7["lastIndexOf"]("0203010001");
        if (shuGwr9 > 0) {
            mESkLcJ7 = mESkLcJ7["substring"](0, shuGwr9);
            if (I8 == 0) {
                pA$jNr5 = mESkLcJ7["substring"](13);
            }
        }
        mESkLcJ7 = rMgt4;
        I8 = mESkLcJ7["indexOf"]("30818902818100");
        shuGwr9 = mESkLcJ7["lastIndexOf"]("0203010001");
        if (shuGwr9 > 0) {
            mESkLcJ7 = mESkLcJ7["substring"](0, shuGwr9);
            if (I8 == 0) {
                jCf6 = mESkLcJ7["substring"](13);
            }
        }
        var S10 = new RSAKey();
        S10["setPublic"](pA$jNr5, "010001");
        EK1 = S10["encrypt"](hQOCddg1);
        var s$dEDpQKP11 = "" + u$ssEDv2 + ":" + EK1;
        var a12 = str2hex(s$dEDpQKP11);
        var $EnALkOC13 = new SecureRandom();
        var dqo14 = new window["Array"]();
        for (var I8 = 0; I8 < 9; I8++) dqo14[I8] = 0;
        $EnALkOC13["nextBytes"](dqo14);
        dqo14[0] = 0;
        var QIOY16 = hex_rand(8);
        var BnnWnpI17 = new rc4();
        BnnWnpI17["init"](str2hex(QIOY16));
        tmp = "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
        BnnWnpI17["crypt"](tmp);
        var eDUJofbg18 = BnnWnpI17["crypt"](a12);
        S10["setPublic"](jCf6, "010001");
        cipher_sk = S10["encrypt"](QIOY16);
        var OkGhwnc19 = "";
        for (var I8 = 0; I8 < cipher_sk["length"]; I8 = I8 + 2) {
            OkGhwnc19 = cipher_sk["substring"](I8, I8 + 2) + OkGhwnc19;
        }
        var nZno21 = function(l) {
            var N22 = str2hex(l + "");
            while (N22["length"] < 16) N22 += "00";
            return N22;
        };
        var m23 = "000000000000000000000000";
        m23 = hex_rand(12);
        var IwIH_Wb24 = m23 + OkGhwnc19 + "00";
        IwIH_Wb24 = nZno21(IwIH_Wb24["length"] / 2) + IwIH_Wb24;
        var goP25 = eDUJofbg18;
        goP25 = nZno21(goP25["length"] / 2) + goP25;
        var zQqhBmvrf26 = IwIH_Wb24 + goP25;
        zQqhBmvrf26 = hex2b64(zQqhBmvrf26);
        return zQqhBmvrf26;
    }
    // TODO 这个是用于获取ts、aPK、hPK，以后获取方式可能需要修改
    function getEncryptorData() {
        var metas = document.getElementsByTagName("meta");
        var metasData = {};
        for (var i = metas.length - 1; i >= 0; i--) {
            metasData[metas[i].getAttribute("property")] = metas[i].getAttribute("content");
        }
        return {
            ts: metasData["_eTs"],
            aPK: metasData["_ePk1"],
            hPK: metasData["_ePk2"]
        };
    }
    // TODO，保持原始的写法，把 这个方法全局化， 兼容pwdGrd依赖这个方法的
    window.PassEncryptor = {
        getData: getEncryptorData
    };
    //真正用于加密的方法，password为用户输入的原始值
    function encryptorPassword(password) {
        var data = getEncryptorData();
        var strippedPK = data.hPK.substr(0, data.hPK.length - 10).substr(14);
        var rsa = new RSAKey();
        rsa.setPublic(strippedPK, "10001");
        return cryptk(password, data.ts, data.hPK, data.aPK);
    }
    //方法全局化
    window.encryptorPassword = encryptorPassword;
    return encryptorPassword;
});

/**
 * Password rule module for pingan-1qiaobao website
 * @description
 * Common password rule module for password strength scoring and password validation rule
 * 
 * @dependency 
 * 
 * @param
 * 
 * @API
 * entropyScore
 * isInBlackList
 * validCharSet
 * validCharSetGroup
 * lessLength
 * moreLength
 * 
 * @useCase
 * 
 * @author trsun
 * @since 20140723
 * @version 1.0.0
 */
define("pafweblib/pwdGrd/1.0.1/password-rule-debug", [], function(require, exports, module) {
    //pattern types
    //0001
    var PATTERN_DIGITAL = 1;
    //0010
    var PATTERN_LOWERCASE = 2;
    //0100
    var PATTERN_UPPERCASE = 4;
    //1000
    var PATTERN_SPECIALCHAR = 8;
    //regx map
    var REGX_MAP = {};
    REGX_MAP[PATTERN_DIGITAL] = "0-9";
    REGX_MAP[PATTERN_LOWERCASE] = "a-z";
    REGX_MAP[PATTERN_UPPERCASE] = "A-Z";
    REGX_MAP[PATTERN_SPECIALCHAR] = "~!@#$%^&*();<>.?_/\\-`";
    //strength score map
    var SCORE_MAP = {};
    SCORE_MAP[PATTERN_DIGITAL] = {
        "1~11": 30,
        "12~16": 60,
        "17~99": 90
    };
    SCORE_MAP[PATTERN_SPECIALCHAR] = {
        "1~8": 30,
        "9~14": 60,
        "15~99": 90
    };
    SCORE_MAP[PATTERN_LOWERCASE] = {
        "1~7": 30,
        "8~13": 60,
        "14~99": 90
    };
    SCORE_MAP[PATTERN_UPPERCASE] = {
        "1~7": 30,
        "8~13": 60,
        "14~99": 90
    };
    SCORE_MAP[PATTERN_DIGITAL | PATTERN_SPECIALCHAR] = {
        "1~7": 30,
        "8~12": 60,
        "13~99": 90
    };
    SCORE_MAP[PATTERN_DIGITAL | PATTERN_LOWERCASE] = {
        "1~7": 30,
        "8~12": 60,
        "13~99": 90
    };
    SCORE_MAP[PATTERN_DIGITAL | PATTERN_UPPERCASE] = {
        "1~7": 30,
        "8~12": 60,
        "13~99": 90
    };
    SCORE_MAP[PATTERN_SPECIALCHAR | PATTERN_LOWERCASE] = {
        "1~6": 30,
        "7~11": 60,
        "12~99": 90
    };
    SCORE_MAP[PATTERN_SPECIALCHAR | PATTERN_UPPERCASE] = {
        "1~6": 30,
        "7~11": 60,
        "12~99": 90
    };
    SCORE_MAP[PATTERN_LOWERCASE | PATTERN_UPPERCASE] = {
        "1~6": 30,
        "7~11": 60,
        "12~99": 90
    };
    SCORE_MAP[PATTERN_DIGITAL | PATTERN_LOWERCASE | PATTERN_SPECIALCHAR] = {
        "1~6": 30,
        "7~10": 60,
        "11~99": 90
    };
    SCORE_MAP[PATTERN_DIGITAL | PATTERN_UPPERCASE | PATTERN_SPECIALCHAR] = {
        "1~6": 30,
        "7~10": 60,
        "11~99": 90
    };
    SCORE_MAP[PATTERN_DIGITAL | PATTERN_LOWERCASE | PATTERN_UPPERCASE] = {
        "1~6": 30,
        "7~10": 60,
        "11~99": 90
    };
    SCORE_MAP[PATTERN_SPECIALCHAR | PATTERN_LOWERCASE | PATTERN_UPPERCASE] = {
        "1~6": 30,
        "7~10": 60,
        "11~99": 90
    };
    SCORE_MAP[PATTERN_DIGITAL | PATTERN_SPECIALCHAR | PATTERN_LOWERCASE | PATTERN_UPPERCASE] = {
        "1~5": 30,
        "6~9": 60,
        "10~99": 90
    };
    //
    function getRegxByPatternCode(patternCode) {
        var regxArray = [];
        if ((patternCode & PATTERN_DIGITAL) === PATTERN_DIGITAL) {
            regxArray.push(REGX_MAP["" + PATTERN_DIGITAL]);
        }
        if ((patternCode & PATTERN_LOWERCASE) === PATTERN_LOWERCASE) {
            regxArray.push(REGX_MAP["" + PATTERN_LOWERCASE]);
        }
        if ((patternCode & PATTERN_UPPERCASE) === PATTERN_UPPERCASE) {
            regxArray.push(REGX_MAP["" + PATTERN_UPPERCASE]);
        }
        if ((patternCode & PATTERN_SPECIALCHAR) === PATTERN_SPECIALCHAR) {
            regxArray.push(REGX_MAP["" + PATTERN_SPECIALCHAR]);
        }
        return new RegExp("^[" + regxArray.join("") + "]+$");
    }
    //get password feature code by password value
    function getPasswordPatternCode(value) {
        var featureCode = -1;
        var patternList = [];
        //digital
        patternList.push(PATTERN_DIGITAL);
        //lowercase
        patternList.push(PATTERN_LOWERCASE);
        //digital || lowercase
        patternList.push(PATTERN_DIGITAL | PATTERN_LOWERCASE);
        //uppercase
        patternList.push(PATTERN_UPPERCASE);
        //digital || uppercase
        patternList.push(PATTERN_DIGITAL | PATTERN_UPPERCASE);
        //lowercase || uppercase
        patternList.push(PATTERN_LOWERCASE | PATTERN_UPPERCASE);
        //digital || lowercase || uppercase
        patternList.push(PATTERN_DIGITAL | PATTERN_LOWERCASE | PATTERN_UPPERCASE);
        //special char
        patternList.push(PATTERN_SPECIALCHAR);
        //digital || special char
        patternList.push(PATTERN_DIGITAL | PATTERN_SPECIALCHAR);
        //lowercase || special char
        patternList.push(PATTERN_LOWERCASE | PATTERN_SPECIALCHAR);
        //digital || lowercase || special char
        patternList.push(PATTERN_DIGITAL | PATTERN_LOWERCASE | PATTERN_SPECIALCHAR);
        //uppercase || special char
        patternList.push(PATTERN_UPPERCASE | PATTERN_SPECIALCHAR);
        //digital || uppercase || special char
        patternList.push(PATTERN_DIGITAL | PATTERN_UPPERCASE | PATTERN_SPECIALCHAR);
        //lowercase || uppercase || special char
        patternList.push(PATTERN_LOWERCASE | PATTERN_UPPERCASE | PATTERN_SPECIALCHAR);
        //digital || lowercase || uppercase || special char
        patternList.push(PATTERN_DIGITAL | PATTERN_LOWERCASE | PATTERN_UPPERCASE | PATTERN_SPECIALCHAR);
        if (!value || "" === value) {
            featureCode = 0;
        }
        for (var i = 0; i < patternList.length; i++) {
            var patternCode = patternList[i];
            if (getRegxByPatternCode(patternCode).test(value)) {
                featureCode = patternCode;
                break;
            }
        }
        return featureCode;
    }
    function getStrengthScoreByPatten(patternCode, len) {
        var score = -1;
        if (patternCode && len) {
            var scoreLengthMap = SCORE_MAP[patternCode];
            for (var lengthRangeKey in scoreLengthMap) {
                lengthRangeArray = lengthRangeKey.split("~");
                if (lengthRangeArray.length == 2) {
                    var startRange = lengthRangeArray[0];
                    var endRange = lengthRangeArray[1];
                    if (len >= startRange && len <= endRange) {
                        score = scoreLengthMap[lengthRangeKey];
                        break;
                    }
                }
            }
        }
        return score;
    }
    function getStrengthScoreByValue(value) {
        var score = -1;
        if (!value || "" === value) {
            return score;
        }
        var patternCode = getPasswordPatternCode(value);
        var len = value.length;
        return getStrengthScoreByPatten(patternCode, len);
    }
    //get combination pattern number
    function getPatternNumber(value) {
        var patternNumber = 0;
        for (var patternKey in REGX_MAP) {
            var regx = REGX_MAP[patternKey];
            if (eval("/[" + regx + "]/.test('" + value + "')")) {
                patternNumber += 1;
            }
        }
        return patternNumber;
    }
    var VALID_PASSWORD_REGX = getRegxByPatternCode(PATTERN_DIGITAL | PATTERN_LOWERCASE | PATTERN_UPPERCASE | PATTERN_SPECIALCHAR);
    //black list
    var BLACKLIST = "112233,123123,123321,abcabc,abc123,a1b2c3,aaa111,123qwe,qwerty,qweasd,admin,password,p@ssword,passwd,iloveyou,5201314,12345qwert,12345QWERT,1qaz2wsx,password,qwerty,monkey,letmein,trustno1,dragon,baseball,111111,iloveyou,master,sunshine,ashley,bailey,passw0rd,shadow,superman,qazwsx,michael,football".split(",");
    //passwordRules
    var passwordRules = {
        entropyScore: function(value) {
            if (this.isInBlackList(value)) {
                return -1;
            } else {
                return getStrengthScoreByValue(value);
            }
        },
        entropyScoreByPatternLength: function(pattern, len) {
            return getStrengthScoreByPatten(pattern, len);
        },
        isInBlackList: function(v) {
            for (var i = 0; i < BLACKLIST.length; i++) {
                if (v === BLACKLIST[i]) {
                    return true;
                }
            }
            return false;
        },
        //valid password could only contains digital || lowercase || uppercase || special char
        validCharSet: function(value) {
            return VALID_PASSWORD_REGX.test(value);
        },
        //only accept 2-char-types more and also based on validCharSet
        validCharSetGroup: function(value) {
            return this.validCharSet(value) && getPatternNumber(value) >= 2;
        },
        lessLength: function(v, num) {
            var value = v || "", num = num || 6;
            return value.length < num;
        },
        moreLength: function(v) {
            var value = v || "";
            return value.length > 16;
        }
    };
    return passwordRules;
});
