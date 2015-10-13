/**
 * @Description: 转出共用js处理逻辑
 * @author susie(2014-07-13)
 */
define("consumer/hqb-modules/1.0.0/withdrawCommon-debug", [ "$-debug", "pafweblib/Validator/0.1.0/Validator-debug", "pafweblib/temporary/1.0.0/numeral-debug", "PwdGrdModule-debug" ], function(require, exports, module) {
    var $ = require("$-debug"), validator = require("pafweblib/Validator/0.1.0/Validator-debug.js"), numberal = require("pafweblib/temporary/1.0.0/numeral-debug"), PwdGrdModule = require("PwdGrdModule-debug");
    var doc = document, $form = $("#hqbDrawForm"), $maxCtroAmount = $("#maxCtroAmount"), $drawAmount = $("#drawAmount");
    if (!String.prototype.trim) {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, "");
        };
    }
    function setError($t, errorMsg) {
        var $controlGroup = $t.closest("div.control-group");
        $controlGroup.addClass("control-group-error");
        $t.closest("div.controls").children("div.help-block").html(errorMsg);
    }
    var common = {
        init: function() {
            this.eventHandle();
            this.pwdHandle();
        },
        eventHandle: function() {
            // 金额的数字验证
            $drawAmount.numeral({
                scale: 2,
                intlen: 6
            });
            $drawAmount.on("validate", function(e, vc) {
                var $input = $(this), inputV = $input.val().trim();
                var limitMaxAmount = parseFloat($input.attr("data-limitMaxAmount").trim());
                if (inputV === "") {
                    vc.reject("请输入金额");
                    return false;
                }
                inputV = parseFloat(inputV);
                if (inputV <= 0) {
                    vc.reject("转出金额应高于0元");
                    return false;
                }
                if (inputV >= limitMaxAmount) {
                    vc.reject("转出金额应低于" + limitMaxAmount + "元");
                    return false;
                }
            });
            $drawAmount.on("blur", function(e) {
                var $input = $(this), value = $input.val().trim();
                if (value != "") {
                    $input.val(parseFloat(value));
                }
            });
            // 支付密码验证
            var $payPwd = $("#payPwd");
            $payPwd.on("validate", function(e, vc) {
                var $input = $(this);
                if ($input.val().replace(/^\s*|\s*$/g, "").length < 6) {
                    vc.reject("请输入6位以上的密码");
                }
            });
        },
        pwdHandle: function() {
            //prepare options for PwdGrdModule
            var ctrls = [];
            var ctrl1 = {
                id: "payPwd",
                sClass: "pafweblib-pwdGrd pafweblib-pwdGrd-middle",
                iClass: "pafweblib-pwdGrd pafweblib-pwdGrd-inline"
            };
            ctrls.push(ctrl1);
            var preSubmitFunc = function(pgeditorList) {
                $("#formError").hide();
                var accountV = $drawAmount.val().trim(), $controlGroup = $drawAmount.closest("div.control-group");
                var limitMaxAmount = parseFloat($drawAmount.attr("data-limitMaxAmount").trim());
                $controlGroup.removeClass("control-group-error");
                if ($drawAmount.closest("div.controls").children("div.help-block").length == 0) {
                    var $helpBlock = $("<div class='help-block'></div>");
                    $drawAmount.closest("div.controls").children(":last").after($helpBlock);
                }
                if (accountV === "") {
                    setError($drawAmount, "请输入金额");
                    return false;
                }
                accountV = parseFloat(accountV);
                if (accountV <= 0) {
                    setError($drawAmount, "转出金额应高于0元");
                    return false;
                }
                if (accountV >= limitMaxAmount) {
                    setError($drawAmount, "转出金额应低于" + limitMaxAmount + "元");
                    return false;
                }
                if (pgeditorList) {
                    for (var i = 0; i < pgeditorList.length; i++) {
                        var pgeditor = pgeditorList[i];
                        var pgeCtrlId = pgeditor.id;
                        $("#" + pgeCtrlId).closest(".control-group").removeClass("control-group-error");
                        if (i == 0) {
                            //clear warnings
                            PwdGrdModule.emptyErrors("#" + pgeCtrlId);
                        }
                        //blank validation
                        if (0 == pgeditor.pwdLength()) {
                            $("#" + pgeCtrlId).focus();
                            var error = {
                                name: "请输入支付密码"
                            };
                            $("#" + pgeCtrlId).closest(".control-group").addClass("control-group-error");
                            PwdGrdModule.renderErrors("#" + pgeCtrlId, error, PwdGrdModule.WARNING_TYPE.REQUIRED);
                            return false;
                        }
                    }
                }
                return true;
            };
            //init passguard Ctrl
            var pwdGrdModule = new PwdGrdModule({
                ctrls: ctrls,
                formSelector: "#hqbDrawForm",
                preSubmitFunc: preSubmitFunc,
                isMandatory: true,
                rootPath: window.staticFileRoot
            });
        }
    };
    module.exports = common;
});
