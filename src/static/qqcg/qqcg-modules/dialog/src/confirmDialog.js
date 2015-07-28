/**
 * @Description: 组件 - confirm dialog
 * Author: xujia(2013-12-22 17:00) 新建文件
 */
define(function(require, exports, modules){
    var doc = document, ArrayProto = Array.prototype, noop = function(){};

    var Dialog = require("./dialog"), DialogProto = Dialog.prototype;

    var ConfirmDialog = function (opts) {
        var options = this.options = extend(confirmDialogProto.defaultOptions, opts);
        this.init(options);
    };

    // Extend Dialog skeleton
    var confirmDialogProto = ConfirmDialog.prototype = extend(DialogProto, {
        defaultOptions: extend(DialogProto.defaultOptions, {
            dialogContentTmp: "",
            confirmHandler: noop,
            cancelHandler: noop
        }),

        // 创建工厂
        create: function (options) {
            return new ConfirmDialog(options);
        },

        init: function(options){
            DialogProto.init.call(this, options);
            this.createDialogContent(options);
        },

        createDialogContent: function(options){
            var tmpl = options.dialogContentTmp ||
                    '<h3>登录中国银行开通快捷支付</h3>\
                        <div class="box">\
                            <p class="line">在银行页面完成相关流程后，请告诉壹钱包最终结果（开通完成前请不要关闭该窗口）：</p>\
                            <div class="btns">\
                                <button id="ConfirmDialogConfirmBtn" class="btn btn-primary btn-confirm">开通成功</button>\
                                <button id="ConfirmDialogCancelBtn" class="btn btn-failure">开通遇到问题</button>\
                            </div>\
                            <p class="line"><a href="javascript:history.go(-1);">返回选择其他银行</a></p>\
                        </div>';

            this.displayDilogContent(tmpl);
            this.bandDialogContentEvents();
        },

        confirmHandler: function(){
            var options = this.options;
            typeof options.confirmHandler !== 'undefined' && options.confirmHandler.call(this);
        },

        cancelHandler: function(){
            var options = this.options;
            typeof options.cancelHandler !== 'undefined' && options.cancelHandler.call(this);
        },

        removeDialog: function(){
            DialogProto.removeDialog.call(this);
            try{
                var confirmBtn = doc.getElementById("ConfirmDialogConfirmBtn"),
                    cancelBtn = doc.getElementById("ConfirmDialogCancelBtn");
                confirmBtn.onclick = null;
                cancelBtn.onclick = null;
            }catch(e){

            }
        },

        bandDialogContentEvents: function(){
            var dialogInstance = this,
                confirmBtn = doc.getElementById("ConfirmDialogConfirmBtn"),
                cancelBtn = doc.getElementById("ConfirmDialogCancelBtn");
            try{
            	 if(confirmBtn){
                     confirmBtn.onclick = function () {
                         var flag=confirmBtn.getAttribute("data-closeDialog");
                         if(flag!=="no"){
                             dialogInstance.removeDialog();
                         }
                         dialogInstance.confirmHandler();
                     };
                 }
                 if(cancelBtn){
                     cancelBtn.onclick = function () {
                         dialogInstance.removeDialog();
                         dialogInstance.cancelHandler();
                     };
                 }
            } catch(e){
            	
            }
           
        },

        displayDilogContent: function(htmlTmpl){
            var dialog = this.dialog,
                loadingBox = doc.getElementById('loadingBox'),
                dialogContent = doc.createElement('div');

            dialogContent.id = "contentBox";
            dialogContent.innerHTML = htmlTmpl;
            loadingBox.style.display = "none";
            dialog.insertBefore(dialogContent, loadingBox);
        }

    });

    exports.create = confirmDialogProto.create;


    /*
     * helper functions
     * */

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

});
