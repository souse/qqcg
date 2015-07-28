/**
 * 组件-银行卡快捷支付选择弹出窗功能
 * Author: xujia(2013-12-16 10:00) 新建文件
 */
define(function (require, exports, modules) {
    var doc = document, body = doc.body, ArrayProto = Array.prototype, noop = function () {
    };

    var Dialog = function (opts) {
        var options = this.options = extend(Dialog.prototype.defaultOptions, opts);
        this.init(options);
    };

    Dialog.prototype = {
        defaultOptions: {
            dialogClass: "",
            layerClass: "dialog-shadow",
            cancelHandler: noop
        },

        // 创建工厂
        create: function (options) {
            return new Dialog(options);
        },

        // 初始化
        init: function (options) {
            body.appendChild(this.layer = this.createLayer());
            body.appendChild(this.dialog = this.createDialog(options));
            this.bandDialogEvents();
        },

        // create dialog skeleton
        createDialog: function (options) {
            var dialog = doc.createElement('div');
            dialog.className = "dialog-skeleton " + options.dialogClass;
            dialog.innerHTML = '<a id="bfpDialogCloseBtn" class="close btn-close" href="#">&#215;</a>\
                                <iframe style="position:absolute;width:100%;height:100%;z-index:-1;left:0;top:0;background:none;" frameborder="no" border="0"></iframe>\
                               <div id="loadingBox" class="box-loading">&nbsp;</div>';
            return dialog;
        },

        // 创建遮罩layer层
        createLayer: function () {
            var layer = document.createElement('div');
            layer.className = this.options.layerClass;
            return layer;
        },

        // 清除窗体及layer层，并解绑事件，避免内存泄漏
        removeDialog: function () {
            var dialog = this.dialog,
                closeBtn = doc.getElementById('bfpDialogCloseBtn');
            body.removeChild(dialog);
            body.removeChild(this.layer);
            closeBtn.onclick = null;
        },

        cancelHandler: function () {
            var options = this.options;
            typeof options.cancelHandler !== 'undefined' && options.cancelHandler.call(this);
        },

        bandDialogEvents: function () {
            var dialogInstance = this,
                closeBtn = doc.getElementById('bfpDialogCloseBtn');
            closeBtn.onclick = function (eve) {
                eve = eve || window.event;
                preventDefault(eve);
                dialogInstance.cancelHandler();
                dialogInstance.removeDialog();
            };
        }
    };

    modules.exports = Dialog;

    function extend(obj) {
        var sources = ArrayProto.slice.call(arguments, 0), source, retObj = {};
        for (var i = 0, len = sources.length; i < len; i++) {
            source = sources[i];
            if (source) {
                for (var prop in source) {
                    retObj[prop] = source[prop];
                }
            }
        }
        return retObj;
    }

    function preventDefault(eve) {
        try {
            eve.preventDefault();
        } catch (e) {
            eve.returnValue = false;
        }
    }

});