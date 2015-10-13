define("consumer/safecenter-changemobile/1.0.0/index-debug", [], function(require, exports, module) {
    function init() {
        seajs.use([ "pwdgrd" ], function(PwdGrdModule) {
            var ctrls = [];
            var ctrl1 = {
                id: "pwd",
                sClass: "span2 pafweblib-pwdGrd",
                iClass: "span22 pafweblib-pwdGrd-customized",
                nextTabId: "captcha.captchaValue"
            };
            ctrls.push(ctrl1);
            var pwdGrdModule = new PwdGrdModule({
                ctrls: ctrls,
                rootPath: window.contextPath
            });
            setTimeout(function() {
                $("#pwdOcx_down a").click();
            }, 300);
        });
    }
    exports.init = function() {
        init();
    };
});
