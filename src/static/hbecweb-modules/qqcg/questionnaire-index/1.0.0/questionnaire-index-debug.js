define("consumer/questionnaire-index/1.0.0/questionnaire-index-debug", [ "global-debug", "$-debug" ], function(require, exports, module) {
    require("global-debug");
    var $ = require("$-debug"), $radioParent = $("#questionnaireRadios"), $suggestion = $("#suggestionText"), $suggesNum = $("#suggestionNumSpan"), $quesForm = $("#questionnaireForm");
    var radioNames = new Array();
    function initQuestions() {
        $.ajax({
            url: window.contextPath + "/data/questionnaire/radios.json",
            dataType: "json",
            headers: {
                Accept: "application/json; charset=utf-8"
            }
        }).done(function(data, status, xhr) {
            if (data.selects.length > 0 && data.answers) {
                var html = "";
                for (var i = 0; i < data.selects.length; i++) {
                    var obj = data.selects[i];
                    var options = data.selects[i].options;
                    html += '<div class="requiredParent"><div class="paf-box-head"><h3 class="paf-box-head-title"><span>* </span>' + obj.name + "</h3></div>";
                    html += '<div class="paf-box-container"><table><tr>';
                    html += "<th>&nbsp;</th>";
                    for (key in data.answers) {
                        html += "<th>" + data.answers[key] + "</th>";
                    }
                    html += "</tr>";
                    for (k1 in options) {
                        html += "<tr><td class='header w158'>" + options[k1] + "</td>";
                        for (k2 in data.answers) {
                            html += "<td class='w108'><input type='radio' required name=" + k1 + " value=" + k2 + "></input></td>";
                        }
                        html += "</tr>";
                        radioNames.push(k1);
                    }
                    html += "</table></div></div>";
                }
                $radioParent.append(html);
            }
        });
    }
    function initSuggesNum() {
        var l = $suggestion.val().length;
        $suggesNum.html(l);
    }
    function formCheck() {
        $suggestion.on("keyup blur change", function(e) {
            var $t = $(this), max = $t.attr("maxlength"), len = $t.val().length;
            if (len > max) {
                $t.val($t.val().substring(0, max));
            }
            initSuggesNum();
        });
        $("#acctIdInput").on("validate", function(e, vc) {
            var $this = $(this), value = $this.val().trim() || "";
            if (value != "" && !isPhone(value)) {
                vc.reject("请输入真实的手机号");
                return false;
            }
        });
        $("input.captchainput").on("validate", function(e, vc) {
            var $this = $(this), value = $this.val().trim() || "";
            if (value === "") {
                vc.reject("请输入验证码");
                return false;
            }
        });
    }
    function submitForm() {
        $quesForm.on("submit", function(e) {
            var $form = $(this), $yzm = $("input.captchainput"), yzmV = $yzm.val().trim() || "";
            if ($form.hasClass("submitting")) return false;
            if (yzmV === "") {
                $yzm.trigger("blur");
                return false;
            }
            if ($form.find(".help-block.error").length) {
                return false;
            }
            for (var i = 0; i < radioNames.length; i++) {
                var $pT = $("form input[type='radio'][required][name=" + radioNames[i] + "]").parents("div.requiredParent");
                var $pH = $pT.find("h3.paf-box-head-title");
                var l = $("form input[type='radio'][required][name=" + radioNames[i] + "]:checked").length;
                if (l == 0) {
                    var top = $pT.offset().top;
                    $("html").scrollTop(top - 40);
                    $pH.addClass("requireCss");
                    return false;
                } else {
                    $pH.removeClass("requireCss");
                }
            }
            var yzmid = $("#captcha\\.id").val(), data = {
                id: yzmid,
                captchaValue: $("input.captchainput").val()
            }, $inputP = $("input.captchainput").parent().parent(), isRight = false;
            $inputP.find("div.help-block").remove();
            $.ajax({
                dataType: "json",
                url: "/captcha/" + yzmid + "/valid",
                data: data,
                async: false,
                success: function(data) {
                    if (data) {
                        isRight = true;
                    } else {
                        $inputP.append('<div class="help-block">请正确输入验证码</div>');
                    }
                },
                fail: function() {
                    $inputP.append('<div class="help-block">系统异常，验证码验证失效，请稍后刷新页面重</div>');
                }
            });
            if (isRight) {
                $form.addClass("submitting");
                $form.find('input[type="submit"]').val("正在提交，请稍候");
            } else {
                $("a.refresh_captcha").trigger("click");
                return false;
            }
        });
    }
    exports.init = function() {
        initSuggesNum();
        initQuestions();
        formCheck();
        submitForm();
    };
});
