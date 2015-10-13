define("consumer/confirmationpopup/1.0.0/confirmationpopup-debug", [ "jquery/jquery/1.10.2/jquery-debug" ], function(require, exports, module) {
    var $ = require("jquery/jquery/1.10.2/jquery-debug"), Conformation;
    Conformation = function(options) {
        this.opts = $.extend(true, Conformation.defaults, options);
        this.mask = null;
        this.$el = null;
        this.el = null;
        this.init();
    };
    Conformation.prototype = {
        init: function() {
            var Confirm = this;
            var opts = this.opts;
            var sHtml = '<div class="confirmation">' + "<h3>" + this.opts.h3 + '<span class="cancel"></span></h3>' + '<div><p id="' + this.opts.pId + '">' + this.opts.p + "</p>" + '<input type="button" class="inputL succeed" value="' + this.opts.inputL + '" />' + '<input type="button" class="inputR failure" value="' + this.opts.inputR + '" />' + '<a class="chooseotherpay" href="' + this.opts.aHref + '">' + this.opts.aText + "</a>" + "</div></div>";
            $("body").append(sHtml);
            Confirm.$el = $(".confirmation");
            Confirm.setMask();
            $(".succeed").on("click", {
                scope: Confirm
            }, Confirm.fnSucceed);
            $(".failure").on("click", {
                scope: Confirm
            }, Confirm.fnFailure);
            $(".cancel").on("click", {
                scope: Confirm
            }, Confirm.fnCancel);
        },
        fn: function() {},
        fnSucceed: function(e) {
            var Confirm = e.data.scope;
            var id = Confirm.opts.uid;
            Confirm.opts.callbacks.fnSucceed && Confirm.opts.callbacks.fnSucceed();
            Confirm.mask.remove();
            Confirm.destroy();
            return false;
        },
        //		fnFailure : function() { var id = this.opts.uid; }, 
        fnFailure: function(e) {
            var Confirm = e.data.scope;
            var id = Confirm.opts.uid;
            Confirm.opts.callbacks.fnFailure && Confirm.opts.callbacks.fnFailure();
            Confirm.mask.remove();
            Confirm.destroy();
            return false;
        },
        fnCancel: function(e) {
            var Confirm = e.data.scope;
            var id = Confirm.opts.uid;
            Confirm.opts.callbacks.fnCancel && Confirm.opts.callbacks.fnCancel();
            Confirm.mask.remove();
            Confirm.destroy();
            return false;
        },
        destroy: function() {
            this.$el.remove();
        },
        setMask: function() {
            var Confirm = this;
            this.mask = $('<div class="mask"></div>').appendTo(Confirm.opts.parent).css({
                height: $(document).height(),
                width: $(Confirm.opts.parent).width()
            });
        }
    };
    Conformation.defaults = {
        parent: "body",
        inputL: "付款成功",
        inputR: "付款不成功",
        h3: "登录网上银行付款",
        p: "在网银页面完成相关流程后，请告诉壹钱包最终结果（付款完成前请不要关闭该窗口）：",
        pId: "pid",
        aText: "返回选择其他支付方式",
        aHref: "#",
        callbacks: {
            fnSucceed: function() {
                window.console && console.log("fnSucceed");
            },
            fnFailure: function() {
                window.console && console.log("fnFailured");
            },
            fnCancel: function() {
                window.console && console.log("fnCancel");
            }
        }
    };
    module.exports = Conformation;
});
