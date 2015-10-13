define("pafweblib/loading/1.0.0/loading-debug", [ "jquery/jquery/1.10.2/jquery-debug" ], function(require, exports, module) {
    var $ = require("jquery/jquery/1.10.2/jquery-debug");
    var defaults = {
        el: "body",
        text: "loading....",
        show: true
    };
    var loading = function(options) {
        this.options = $.extend({}, defaults, options);
        this.$box = this.options.el;
        this.loading = null;
        this.text = this.options.text;
        if (this.options.show) {
            this.show();
        }
    };
    loading.prototype = {
        show: function() {
            var sHtm = '<div class="loading-container">' + '<div class="loading-mask"></div>' + '<div class="loading-content">' + '<div class="icon"></div>' + '<div class="loading-text">' + this.options.text + "</div>" + "</div>" + "</div>";
            this.loading = $(sHtm).appendTo($(this.$box));
        },
        hide: function() {
            this.loading.remove();
        }
    };
    module.exports = loading;
});
