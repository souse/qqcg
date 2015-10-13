define("pafweblib/uploader/0.1.0/Uploader-debug", [ "$-debug" ], function(require, exports, module) {
    var $ = require("$-debug");
    var doc = document, iframeCount = 0, noop = $.noop, extend = $.extend, defaultOtps = {
        trigger: "#uploader",
        action: "/upload",
        fileName: "files",
        multiple: false,
        accept: undefined,
        iframe: false,
        data: null,
        change: noop,
        error: noop,
        success: noop
    };
    function Uploader(options) {
        if ($.type(options) === "string") {
            options = {
                trigger: options
            };
        }
        options = extend({}, defaultOtps, options);
        // 支持trigger元素的data数据配置options
        var $trigger = $(options.trigger);
        this.options = extend(options, {
            action: $trigger.data("action"),
            fileName: $trigger.data("filename"),
            multiple: $trigger.data("multiple"),
            accept: $trigger.data("accept") || undefined,
            data: $trigger.data("data"),
            iframe: $trigger.data("iframe") == "true" || undefined
        });
        this.init();
    }
    // initials: create input, form
    Uploader.prototype.init = function() {
        var options = this.options;
        this.$form = createHiddenInputsForm(options);
        this.$input = createFileInput(options);
        this.$form.append(this.$input).appendTo("body");
        this.bindEvent();
        return this;
    };
    // bind events
    Uploader.prototype.bindEvent = function() {
        var self = this, options = self.options, $trigger = $(options.trigger);
        $trigger.mouseenter(function() {
            self.$form.css({
                top: $trigger.offset().top,
                left: $trigger.offset().left,
                width: $trigger.outerWidth(),
                height: $trigger.outerHeight()
            });
        });
        self.bindInputEvent();
    };
    Uploader.prototype.bindInputEvent = function() {
        var self = this, options = self.options;
        self.$input.change(function(e) {
            // ie9 don't support FileList Object
            // http://stackoverflow.com/questions/12830058/ie8-input-type-file-get-files
            self._files = this.files || [ {
                name: e.target.value
            } ];
            var file = self.$input.val();
            if (options.change != noop) {
                options.change.call(self, self._files);
            } else if (file) {
                return self.submit();
            }
        });
    };
    Uploader.prototype.submit = function() {
        var self = this, options = self.options, $iframe, $form = self.$form;
        if (window.FormData && self._files && !options.iframe) {
            // build a FormData
            var formData = new FormData($form.get(0));
            $.ajax({
                url: options.action,
                type: "post",
                processData: false,
                contentType: false,
                data: formData,
                dataType: "json",
                context: self,
                success: options.success,
                error: options.error
            });
            return self;
        } else {
            // iframe upload
            $iframe = newIframe();
            $form.attr("target", $iframe.attr("name"));
            $("body").append($iframe);
            $iframe.one("load", function() {
                try {
                    var doc = this.contentWindow ? this.contentWindow.document : this.contentDocument ? this.contentDocument : this.document, root = doc.documentElement ? doc.documentElement : doc.body, textarea = root.getElementsByTagName("textarea")[0], data = $.parseJSON(textarea.value);
                } catch (e) {}
                // https://github.com/blueimp/jQuery-File-Upload/blob/9.5.6/js/jquery.iframe-transport.js#L102
                // Fix for IE endless progress bar activity bug
                // (happens on form submits to iframe targets):
                $('<iframe src="javascript:false;"></iframe>').appendTo($form).remove();
                $(this).remove();
                if (!data) {
                    if (options.error) {
                        options.error(self._files);
                    }
                } else {
                    if (options.success) {
                        options.success(data);
                    }
                }
            });
            self.$iframe = $iframe;
            $form.submit();
        }
        return this;
    };
    // 支持链式绑定事件
    // ===============
    // handle change event when value in file input changed
    Uploader.prototype.change = function(callback) {
        if (!callback) {
            return this;
        }
        this.options.change = callback;
        return this;
    };
    // handle when upload success
    Uploader.prototype.success = function(callback) {
        if (!callback) {
            return this;
        }
        this.options.success = callback;
        return this;
    };
    // handle when upload error
    Uploader.prototype.error = function(callback) {
        if (!callback) {
            return this;
        }
        this.options.error = callback;
        return this;
    };
    // enable
    Uploader.prototype.enable = function() {
        this.$input.prop("disabled", false);
        this.$input.css("cursor", "pointer");
    };
    // disable
    Uploader.prototype.disable = function() {
        this.$input.prop("disabled", true);
        this.$input.css("cursor", "not-allowed");
    };
    // helper
    // ==========
    function createHiddenInputsForm(options) {
        var $trigger = $(options.trigger), $form = $("<form enctype='multipart/form-data' method='post'></form>").attr({
            action: options.action
        }), data = options.data || {}, funName = "callbak" + new Date().getTime();
        if (window.FormData) {
            window[funName] = Uploader.prototype.uploadCallback;
            extend(data, {
                "X-Requested-With": "IFRAME",
                callback: funName
            });
        }
        $form.append(createInputs(data)).css({
            position: "absolute",
            top: $trigger.offset().top,
            left: $trigger.offset().left,
            overflow: "hidden",
            width: $trigger.outerWidth(),
            height: $trigger.outerHeight(),
            zIndex: findzIndex($trigger) + 10
        });
        return $form;
    }
    function createFileInput(options) {
        var $input = $(doc.createElement("input")), $trigger = $(options.trigger), attrs = {
            type: "file",
            name: options.fileName,
            hidefocus: true
        };
        if (options.accept) {
            attrs.accept = options.accept;
        }
        if (options.multiple) {
            attrs.multiple = true;
        }
        $input.attr(attrs);
        $input.css({
            position: "absolute",
            top: 0,
            right: 0,
            opacity: 0,
            outline: 0,
            cursor: "pointer",
            height: $trigger.outerHeight(),
            fontSize: Math.max(64, $trigger.outerHeight() * 5)
        });
        return $input;
    }
    function createInputs(data) {
        if (!data) return [];
        var inputs = [], i;
        for (var name in data) {
            i = doc.createElement("input");
            i.type = "hidden";
            i.name = name;
            i.value = data[name];
            inputs.push(i);
        }
        return inputs;
    }
    function parse(str) {
        if (!str) return {};
        var ret = {};
        var pairs = str.split("&");
        var unescape = function(s) {
            return decodeURIComponent(s.replace(/\+/g, " "));
        };
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split("=");
            var key = unescape(pair[0]);
            var val = unescape(pair[1]);
            ret[key] = val;
        }
        return ret;
    }
    function newIframe() {
        var iframeName = "iframe-uploader-" + iframeCount;
        var $iframe = $('<iframe name="' + iframeName + '" />').hide();
        iframeCount += 1;
        return $iframe;
    }
    function findzIndex($node) {
        var parents = $node.parentsUntil("body");
        var zIndex = 0;
        for (var i = 0; i < parents.length; i++) {
            var item = parents.eq(i);
            if (item.css("position") !== "static") {
                zIndex = parseInt(item.css("zIndex"), 10) || zIndex;
            }
        }
        return zIndex;
    }
    module.exports = Uploader;
});
