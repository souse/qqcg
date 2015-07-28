/**
 * @author: BruceCham
 */
define("consumer/safecenter-identity/1.0.0/layout-debug", [], function(require, exports, module) {
    var PAF = {};
    PAF.Layout = {
        init: function() {
            $(document).on("click", "#paf_layout_btnClose", function() {
                $("#paf_layout_a").remove();
                PAF.Layout.callback = null;
                return;
            });
            $(document).on("click", "#paf_layout_btnSure", function() {
                $("#paf_layout_a").remove();
                if (PAF.Layout.callback) {
                    PAF.Layout.callback();
                    PAF.Layout.callback = null;
                    return;
                }
                return;
            });
        },
        callback: null,
        layout: function(msg, type, callback) {
            var layoutNode = document.createElement("div");
            layoutNode.id = "paf_layout_a";
            layoutNode.style.cssText = "color: #666;top: 0;left: 0;width: 100%;height: 100%;position: fixed;z-index: 999999;";
            var paf_layout_b = "top: 0;left: 0;width: 100%;height: 100%;position: fixed;z-index: -1;background: #000;opacity: 0.5;filter: alpha(opacity=50);", paf_layout_c = "font-size: 16px;position: absolute;z-index: 102;left: 50%;top: 50%;width: 400px;padding: 0 20px 20px;margin: -150px 0 0 -220px;background: #F7F7F7;border-radius: 4px;overflow: hidden;", layoutHeader = "line-height: 40px;overflow: auto;clear: both;border-bottom: 1px solid #e6e6e6;padding-left: 10px;", paf_layout_close = "float: right;width: 40px;text-align: right;font-size: 28px;cursor: pointer;", layoutInfo = "line-height: 24px;font-size: 14px;padding-left: 10px;margin-top: 10px;margin-bottom: 10px;color: red;", layoutSureBtn = "width: 105px;line-height: 32px;margin: 10px auto 0;text-align: center;color: #fff;cursor: pointer;display: inline-block;background: #ff9137;", layoutCancleBtn = "width: 105px;line-height: 32px;margin: 10px auto 0;text-align: center;color: #fff;cursor: pointer;display: inline-block;background: #A09E9D;";
            var html_a = '<iframe style="' + paf_layout_b + '" allowTransparency="true"></iframe><div style="' + paf_layout_c + '"><div style="' + layoutHeader + '"><span style="display: inline-block;">壹钱包提示</span><span style="' + paf_layout_close + '" id="paf_layout_btnClose">╳</span></div><div style="' + layoutInfo + '">', html_b = msg, html_c = '</div><div style="text-align: center;"><span style="' + layoutCancleBtn + '" id="paf_layout_btnClose">关闭</span></div></div>';
            if (type != undefined && type == "confirm") {
                html_c = '</div><div style="text-align: center;"><span style="' + layoutSureBtn + '" id="paf_layout_btnSure">确定</span><span>&nbsp;&nbsp;</span><span style="' + layoutCancleBtn + '" id="paf_layout_btnClose">取消</span></div></div>';
            }
            layoutNode.innerHTML = html_a + html_b + html_c;
            document.body.appendChild(layoutNode);
        },
        alertt: function(msg) {
            PAF.Layout.callback = null;
            PAF.Layout.layout(msg);
        },
        confirmm: function(msg, callback) {
            PAF.Layout.callback = callback;
            PAF.Layout.layout(msg, "confirm");
        },
        dialog: function(title, html, callback) {
            if (callback) {
                PAF.Layout.callback = callback;
            }
            var layoutNode = document.createElement("div");
            layoutNode.id = "paf_layout_a";
            layoutNode.style.cssText = "color: #666;top: 0;left: 0;width: 100%;height: 100%;position: fixed;z-index: 999999;";
            var paf_layout_b = "top: 0;left: 0;width: 100%;height: 100%;position: fixed;z-index: -1;background: #000;opacity: 0.5;filter: alpha(opacity=50);", paf_layout_c = "font-size: 16px;position: absolute;z-index: 102;left: 50%;top: 50%;width: 660px;padding: 0 20px 42px;margin: -150px 0 0 -350px;background: #F7F7F7;overflow: hidden;", layoutHeader = "line-height: 55px;overflow: auto;clear: both;border-bottom: 1px solid #d2d2d2;padding-left: 10px;", paf_layout_close = "float: right;width: 40px;text-align: right;font-size: 28px;cursor: pointer;", layoutInfo = "line-height: 28px;font-size: 14px;padding-left: 10px;margin-top: 10px;margin-bottom: 10px;position:relative;min-height: 100px;", layoutSureBtn = "width: 150px;line-height: 34px;margin: 10px auto 0;text-align: center;color: #fff;cursor: pointer;display: inline-block;background: #0a77cf;", layoutCancleBtn = "width: 150px;line-height: 34px;margin: 10px auto 0;text-align: center;color: #fff;cursor: pointer;display: inline-block;background: #9a9a9a;";
            var html_a = '<iframe style="' + paf_layout_b + '" allowTransparency="true"></iframe><div style="' + paf_layout_c + '"><div style="' + layoutHeader + '"><span style="display: inline-block;">' + title + '</span><span style="' + paf_layout_close + '" id="paf_layout_btnClose">╳</span></div><div style="' + layoutInfo + '">', html_b = html, html_c = '</div><div><span style="' + layoutSureBtn + ';margin-right: 15px;" id="paf_layout_btnSure">确认</span><span style="' + layoutCancleBtn + '" id="paf_layout_btnClose">取消</span></div></div>';
            layoutNode.innerHTML = html_a + html_b + html_c;
            document.body.appendChild(layoutNode);
        }
    };
    PAF.Layout.init();
    module.exports = PAF.Layout;
});
