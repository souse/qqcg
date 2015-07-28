define("pafweblib/dialog/1.0.0/dialog-debug", [ "$-debug" ], function(require, exports, module) {
    var $ = require("$-debug");
    var defaults = {
        trigger: null,
        content: "empty",
        mask: true,
        close: true,
        classPrefix: "paf-dialog",
        width: 500,
        height: 300,
        effect: "none"
    };
    var Dialog = function(options) {
        var self = this;
        self.options = $.extend({}, defaults, options);
        if (self.options.trigger) {
            $(self.options.trigger).on("click", function() {
                self.show();
            });
        }
    };
    $.extend(Dialog.prototype, {
        show: function() {
            this.render();
            this.bindEvents();
        },
        close: function() {
            $(".paf-dialog-container").remove();
        },
        render: function() {
            var tmpl = [ '<div class="paf-dialog-container">', "{{mask}}", '<div class="paf-dialog-main" style="width:{{width}}px;height:{{height}}px;margin-left:-{{marginLeft}}px;margin-top:-{{marginTop}}px;">', "{{close}}", '<div class="paf-dialog-content">{{content}}</div>', "</div>", "</div>" ].join("");
            var self = this;
            if (self.options.mask) {
                tmpl = tmpl.replace("{{mask}}", '<div class="paf-dialog-mask"></div>');
            } else {
                tmpl = tmpl.replace("{{mask}}", "");
            }
            if (self.options.close) {
                tmpl = tmpl.replace("{{close}}", '<div class="dialog-close"></div>');
            } else {
                tmpl = tmpl.replace("{{close}}", "");
            }
            var marginLeft = (this.options.width + 10) / 2;
            var marginTop = (this.options.height + 10) / 2;
            tmpl = tmpl.replace("{{width}}", this.options.width).replace("{{height}}", this.options.height).replace("{{marginLeft}}", marginLeft).replace("{{marginTop}}", marginTop).replace("{{content}}", self.options.content);
            $("body").prepend(tmpl);
        },
        bindEvents: function() {
            var self = this;
            $(".paf-dialog-main .dialog-close").on("click", function() {
                self.cancleHandler.call(self);
            });
            $(".paf-dialog-confirm").on("click", function() {
                self.confirmHandler.call(self);
            });
            $(".paf-dialog-cancle").on("click", function() {
                self.cancleHandler.call(self);
            });
        },
        confirmHandler: function() {
            var self = this;
            typeof self.options.confirmHandler !== "undefined" && self.options.confirmHandler.call(this, self);
        },
        cancleHandler: function() {
            var self = this;
            self.close();
            typeof self.options.cancleHandler !== "undefined" && self.options.cancleHandler.call(this, self);
        }
    });
    module.exports = Dialog;
});
