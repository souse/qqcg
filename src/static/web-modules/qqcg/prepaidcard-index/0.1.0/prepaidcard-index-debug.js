define("consumer/prepaidcard-index/0.1.0/prepaidcard-index-debug", [ "$-debug", "pwdgrd-debug" ], function(require, exports, module) {
    var $ = require("$-debug"), PwdGrdModule = require("pwdgrd-debug"), doc = document, doc_body = doc.body, staticFileRoot = window.staticFileRoot;
    var $addPrepaidCardA = $("a#addPrepaidCardA");
    function eventHandle() {
        if ($addPrepaidCardA.length > 0) {
            //预付卡管理页面，“添加预付卡”处理
            $addPrepaidCardA.on("click", function(e) {
                $t = $(this), url = $t.attr("data-getCardNumPath");
                $.get(url, function(data) {
                    //data.isEnough,是否卡满
                    if (data.totalSize >= 10) {
                        //卡满，不可以再添加
                        var html = $("#getPrepaidCardNum").html();
                        seajs.use([ "confirmDialog" ], function(Dialog) {
                            Dialog.create({
                                dialogContentTmp: html,
                                confirmHandler: function() {
                                    location.reload();
                                }
                            });
                        });
                    } else {
                        //还可以添加预付卡,添加预付卡页面地址，window.contextPath+""
                        location.href = $t.attr("data-addCardPath");
                    }
                }).fail(function() {
                    $("#delPrepaidCardError").html("网络错误，请稍后重试").show();
                });
            });
        }
        //var pwdGrdModule = null;
        //删除预付卡
        $("a.delPrepaidCardA").on("click", function(e) {
            //获取删除卡的id号
            $t = $(this);
            var id = $t.parent().children("input[name='cardId']").val();
            $("#prepaidCardId").val(id);
            var ContentDiv = $("#delPrepaidCardDiv").html().replace("{{prepaidCardNo}}", $t.parent().siblings("td.cardNo").html().trim()).replace("{{prepaidCardName}}", $t.parent().siblings("td.cardName").html().trim());
            seajs.use([ "confirmDialog" ], function(Dialog) {
                Dialog.create({
                    dialogContentTmp: ContentDiv,
                    confirmHandler: function() {
                        $("#delPrepaidCardError").next(".errorCode").html("");
                        $("#delPrepaidCardError").hide();
                        var url = $t.attr("data-deletePath");
                        var passwordVal = "", devId = "", pcInfo = "", pgeditor = null;
                        if (pwdGrdModule) {
                            pgeditor = pwdGrdModule.getPgeditorById("payPwd");
                            passwordVal = pgeditor.pwdResult();
                            devId = pgeditor.getDevID();
                            pcInfo = pgeditor.getPcInfo();
                        }
                        //是否输入了支付密码
                        if (pgeditor && pgeditor.pwdLength() >= 6) {
                            var exportData = {
                                payPwd: passwordVal,
                                devId: devId,
                                pcInfo: pcInfo,
                                cardId: $("#prepaidCardId").val()
                            };
                            $.post(url, exportData, function(data) {
                                if (data.success) {
                                    location.reload();
                                } else {
                                    $("#delPrepaidCardError").html(data.errorMsg).show();
                                    $("#delPrepaidCardError").next(".errorCode").html("[" + data.errorCode + "]");
                                }
                            }).fail(function() {
                                $("#delPrepaidCardError").html("网络错误，请稍后重试").show();
                            });
                        } else {
                            $("#delPrepaidCardError").html("支付密码长度必须大于或等于6位！").show();
                        }
                    }
                });
            });
            var loadPwdCtrl = function() {
                var ctrls = [];
                var ctrl1 = {
                    id: "payPwd",
                    sClass: "pafweblib-pwdGrd pafweblib-pwdGrd-middle",
                    iClass: "pafweblib-pwdGrd pafweblib-pwdGrd-inline"
                };
                ctrls.push(ctrl1);
                //init passguard Ctrl
                pwdGrdModule = new PwdGrdModule({
                    ctrls: ctrls,
                    formSelector: "#delPrepaidCardForm",
                    isMandatory: true,
                    rootPath: staticFileRoot
                });
            };
            var timer = null;
            var lazyLoadFunc = function() {
                if ($("#payPwd").length > 0) {
                    loadPwdCtrl();
                    clearInterval(timer);
                }
            };
            timer = setInterval(lazyLoadFunc, 200);
        });
    }
    exports.init = function() {
        eventHandle();
    };
});
