/*
 * init(btnId,backId,ajaxUrl,data)
 * */
define("consumer/jqbao-open/1.0.0/banklist-debug", [], function(require, exports, module) {
    var banklist = function(obj) {
        if (obj == "undefined") return;
        try {
            bankListInit();
        } catch (e) {
            console.log("前端数据异常：" + e.toString());
        }
        function bankListInit() {
            $("#" + obj.btnId + "").click(function(e) {
                bankLayout();
            });
        }
        //绑定弹出层的按键
        function bankLayout() {
            if ($("#Id_dialogBox")[0]) {
                $("#Id_dialogBox").show();
                return;
            }
            var a_html = '<div class="banklistBox" id="Id_dialogBox"><div class="banklistBoxBlock"></div><div class="banklistBody"><div class="banklistHeader"><span>储蓄卡</span><span class="banklistClose" id="banklistClose">╳</span></div><div class="banklistInfo">请选择自动还款银行卡</div><div class="banklistShowBox" id="Id_banklistBox"><ul class="banks">', b_html = "", c_html = '</ul></div><div class="banklistSureBtn" id="banklistSureBtn">确认</div></div></div>';
            $.ajax({
                dataType: "json",
                type: "GET",
                url: "/fastpaycard?time=" + new Date().getTime()
            }).done(function(data) {
                // 进行响应正确返回的处理
                if (data.code == "000000") {
                    console.log(data.data);
                    var datalist = data.data;
                    if (datalist.length > 0) {
                        for (var i = 0; i < datalist.length; i++) {
                            var _obj = datalist[i];
                            var bankEncNum = _obj.bankEnc, bankEncShort = bankEncNum.substring(bankEncNum.length - 4, bankEncNum.length);
                            if (i == 0) {
                                b_html += '<li class="bank active"><label><input name="bankCode" type="radio" checked="checked"><span class="box-icon"><span class="spanBankName" title="' + _obj.bankName + '" bankenc="' + bankEncNum + '" bankencshort="' + bankEncShort + '">' + _obj.bankName + '</span><span class="spanBankNo">尾号' + bankEncShort + "</span></span></label></li>";
                            } else {
                                b_html += '<li class="bank"><label><input name="bankCode" type="radio"><span class="box-icon"><span class="spanBankName" title="' + _obj.bankName + '" bankenc="' + bankEncNum + '" bankencshort="' + bankEncShort + '">' + _obj.bankName + '</span><span class="spanBankNo">尾号' + bankEncShort + "</span></span></label></li>";
                            }
                        }
                        $("body").append(a_html + b_html + c_html);
                    }
                } else {
                    console.log("提示用户错误信息：" + data.message + ", code:" + data.code);
                }
            }).fail(function() {
                // 进行响应未正确返回的处理
                console.log("error");
            });
            $(document).on("click", "#banklistClose", function() {
                $("#Id_dialogBox").hide();
            });
            $(document).on("click", "#banklistSureBtn", function() {
                var _obj = $("#Id_banklistBox li.active span.spanBankName");
                if (_obj.length > 0) {
                    var bankname = _obj.html(), bankenc = _obj.attr("bankenc"), bankencshort = _obj.attr("bankencshort");
                    $("#" + obj.backBankName + "").attr("title", bankname).html(bankname);
                    $("#" + obj.backBankNumF + "").html("尾号" + bankencshort);
                    if ($("#jqb_bankencform").length > 0) {
                        $("#jqb_bankencform").val(bankenc);
                    }
                    $("#Id_dialogBox").hide();
                } else {
                    $("#Id_dialogBox").hide();
                }
            });
            $(document).on("click", "#Id_banklistBox li.bank", function(e) {
                var T = $(e.currentTarget);
                T.addClass("active").find("input").prop("checked", true);
                $("#Id_banklistBox li.bank").not(T).removeClass("active");
            });
        }
    };
    exports.init = banklist;
});
