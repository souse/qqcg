define("pafweblib/Validator/0.1.0/Validator-debug", [ "$-debug" ], function(require, exports, module) {
    "use strict";
    //使用严格模式
    var $ = require("$-debug");
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
    //为兼容b门户form.js 的validate事件处理；
    ValidationContext.prototype.setError = function(str) {
        this.hasErrors = true;
        this.el.data("errorTipInfo", str);
    };
    function clearError($field) {
        var $helpBlock = $field.closest("div.controls").children("div.help-block"), $controlGroup = $field.closest("div.control-group");
        $controlGroup.removeClass("control-group-error");
        if ($helpBlock.length !== 0) {
            $helpBlock.remove();
        }
        $field.data("validationContext", {});
    }
    function renderError($field, validationContext) {
        var errors = $field.data("validationContext") || {}, $helpBlock = $field.closest("div.controls").children("div.help-block"), $controlGroup = $field.closest("div.control-group");
        if (errors) {
            if ($helpBlock.length === 0) {
                $helpBlock = $("<div/>", {
                    "class": "help-block"
                });
                $field.closest("div.controls").children(":last").after($helpBlock);
            }
            var count = 0;
            for (var name in errors) {
                ++count;
                $helpBlock.html(name);
            }
            if (count > 0) {
                $controlGroup.addClass("control-group-error");
            }
        } else {
            clearError($field);
        }
    }
    $("body").on("change blur keyup", "textarea, input ", function(e) {
        var $filed = $(this);
        clearTimeout($filed.data("validationTimeout"));
        $filed.data("validationTimeout", setTimeout(function() {
            $filed.trigger("beforeValidate");
            if ($filed.data("validationOldValue") === $filed.val()) {
                return;
            }
            clearError($filed);
            $filed.data("validationOldValue", $filed.val());
            var validationContext = new ValidationContext($filed);
            $filed.trigger("validate", validationContext);
            renderError($filed, validationContext);
            $filed.trigger("afterValidate", validationContext);
        }, 500));
    });
    $("form").on("click", "input[type=submit], input[type=button], button", function(e) {
        if ($(this).closest("form").hasClass("submitting")) {
            return e.preventDefault();
        }
    });
    var $pafForm = $(".paf-form");
    $pafForm.on("submit", function(e) {
        var $form = $pafForm, hasErrors = false;
        if ($form.hasClass("submitting")) {
            return e.preventDefault();
        }
        $form.find("textarea, input").each(function() {
            var $field = $(this);
            var validationContext = new ValidationContext($field);
            $field.trigger("validate", validationContext);
            renderError($field, validationContext);
            if (validationContext.hasErrors) {
                hasErrors = true;
            }
            $field.trigger("afterValidate", validationContext);
        });
        $form.trigger("afterValidate", hasErrors);
        if (hasErrors) {
            return false;
        } else {
            $form.addClass("submitting");
            $form.find('button[type="submit"]').text("正在提交，请稍候");
            $form.find('input[type="submit"]').val("正在提交，请稍候");
        }
    });
    module.exports = function(form, options) {};
    module.exports.clearError = clearError;
    module.exports.renderError = renderError;
});
