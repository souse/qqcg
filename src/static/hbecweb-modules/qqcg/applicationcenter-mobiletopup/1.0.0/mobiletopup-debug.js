define("consumer/applicationcenter-mobiletopup/1.0.0/mobiletopup-debug", [ "jquery/jquery/1.10.2/jquery-debug", "pafweblib/temporary/1.0.0/numeral-debug", "$-debug", "pafweblib/temporary/1.0.0/magnify-debug", "pafweblib/FormValidator/0.2.1/FormValidator-debug" ], function(require, exports, module) {
    var $ = require("jquery/jquery/1.10.2/jquery-debug"), setNumber = require("pafweblib/temporary/1.0.0/numeral-debug"), magnify = require("pafweblib/temporary/1.0.0/magnify-debug"), FormValidator = require("pafweblib/FormValidator/0.2.1/FormValidator-debug");
    var userDataTimeout, oldval, oldchecked;
    exports.init = function() {
        var $mobileNo = $("#mobileNo");
        $mobileNo.magnify({
            group: "344"
        });
        $mobileNo.numeral();
        vocation.showDefaultAmt();
        vocation.getUserData();
        $mobileNo.keyup(function() {
            vocation.timeoutData();
        }).blur(function() {
            vocation.getData();
        });
        vocation.checkForm();
        $("#radioGrp span.box").on("click", function() {
            var $this = $(this), $parent = $this.parent(), $prev = $this.prev();
            $prev.prop("checked", true);
            $parent.addClass("active");
            $parent.siblings().removeClass("active");
            vocation.getUserData();
        });
    };
    var vocation = {
        showDefaultAmt: function() {
            $("#radioGrp input").each(function() {
                var $this = $(this), $parent = $this.parent(), $prev = $this.prev(), isThisChecked = $this.prop("checked");
                if (isThisChecked) {
                    $parent.addClass("active");
                    $parent.siblings().removeClass("active");
                }
            });
        },
        checkForm: function() {
            var self = this;
            var validator = new FormValidator("#mobileTopupForm", {
                rules: {
                    mobileNo: "required|phone"
                },
                messages: {
                    mobileNo: {
                        required: "手机号码不能为空",
                        phone: "请输入正确的11位手机号码"
                    }
                }
            });
            validator.launched();
        },
        timeoutData: function() {
            var self = this;
            if (userDataTimeout) {
                clearTimeout(userDataTimeout);
                userDataTimeout = undefined;
            }
            userDataTimeout = setTimeout(self.getUserData, 300);
        },
        getData: function() {
            var self = this;
            clearTimeout(userDataTimeout);
            self.getUserData();
        },
        getUserData: function() {
            // 调整 注册支持号段：除 100、110、120外都可支持
            var pattern = /^(1[^012][0-9]{9})$/i;
            var $checked = $("input:radio[name=amount]:checked"), $mobileNo = $("#mobileNo"), val = $mobileNo.val().replace(/\s*/g, ""), price = $checked.val(), range = $checked.data("range");
            if ($checked.length < 1) {
                return;
            }
            if (!pattern.test(val)) {
                $mobileNo.next(".help-inline.result").fadeOut("fast");
                $("#price-holder").html(range);
                return;
            }
            if (oldval == val && oldchecked == price) {
                return;
            }
            oldval = val;
            oldchecked = price;
            $("#price-holder").fadeOut(50);
            var timeout = setTimeout(function() {
                $("#price-container").addClass("loading");
            }, 100);
            $.getJSON(window.contextPath + val + "/summary", {
                amt: price
            }, function(data) {
                var result = $mobileNo.next(".help-inline.result");
                if (!result.length) {
                    result = $('<span class="help-inline result"></span>').insertAfter($mobileNo);
                }
                result.removeClass("failed").removeClass("success");
                if (data.error) {
                    result.addClass("failed").html("暂不支持该手机号码充值");
                } else {
                    result.addClass("success").fadeIn("fast").html(data.area + data.provider);
                    $("#price-holder").data("value", data.price);
                }
            }).complete(function() {
                clearTimeout(timeout);
                $("#price-container").removeClass("loading");
                $("#price-holder").html($("#price-holder").data("value"));
            }).fail(function() {
                var result = $mobileNo.next(".help-inline.result");
                if (!result.length) {
                    result = $('<span class="help-inline result"></span>').insertAfter($mobileNo);
                }
                result.removeClass("success").addClass("failed").fadeIn("fast").html("该面值产品正在维护中，请稍后再试");
            }).success(function() {
                $("#price-holder").fadeIn("fast");
            });
        }
    };
});
