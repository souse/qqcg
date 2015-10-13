define("consumer/errorpopup/1.0.0/errorpopup-debug", [ "jquery/jquery/1.10.2/jquery-debug" ], function(require, exports, module) {
    var ErrorPopUp, $ = require("jquery/jquery/1.10.2/jquery-debug");
    ErrorPopUp = function(options) {
        this.opts = $.extend(true, ErrorPopUp.defaults, options);
        this.mask = null;
        this.$el = null;
        this.el = null;
        this.init();
    };
    ErrorPopUp.prototype = {
        init: function() {
            var Confirm = this;
            var opts = this.opts;
            var sHtml = '<div class="errorLayout">' + this.opts.sHtml + "</div>";
            $("body").append(sHtml);
            Confirm.$el = $(".errorLayout");
            Confirm.setMask();
            $("#confirm").on("click", {
                scope: Confirm
            }, Confirm.fnConfirmIng);
            $("#close").on("click", {
                scope: Confirm
            }, Confirm.fnCancle);
        },
        fn: function() {},
        fnConfirmIng: function(e) {
            var Confirm = e.data.scope;
            var hasError = Confirm.opts.callbacks.fnConfirmIng && Confirm.opts.callbacks.fnConfirmIng();
            if (hasError) {
                return false;
            }
            Confirm.mask.remove();
            Confirm.destroy();
            return false;
        },
        fnCancle: function(e) {
            var Confirm = e.data.scope;
            Confirm.opts.callbacks.fnCancle && Confirm.opts.callbacks.fnCancle();
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
    ErrorPopUp.defaults = {
        parent: "body",
        sHtml: '<div class="title-fail"><span id="close" class="cancle"></span></div>' + '<div class="nav-fail">' + '<div class="nav-fail-msg textset">系统异常，请稍后再试。</div>' + '<div class="textset">' + '<input type="button" id="confirm" class="fail-confirm" value="确定">' + "</div>" + "</div>",
        callbacks: {
            fnConfirmIng: function() {
                window.console && console.log("fnConfirmIng");
                return false;
            },
            fnCancle: function() {
                window.console && console.log("fnCancle");
            }
        }
    };
    module.exports = ErrorPopUp;
});
