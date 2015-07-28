/**
 * @Description: 组件-网银支付选择弹出窗功能
 * @Author: xujia(2013-12-17 10:26)
 */
define(function(require, exports, modules){
    var doc = document, ArrayProto = Array.prototype;

    var Dialog = require("dialog"), DialogProto = Dialog.prototype;

    var InetPayDialog = function (opts) {
        var options = this.options = extend(InetPayDialogProto.defaultOptions, opts);
        this.init(options);
    };

    var readyState = true,
        ERROR_TMPL = '<div class="box-error">系统异常，请稍后再试</div>';


    // Extend Dialog skeleton
    var InetPayDialogProto = InetPayDialog.prototype = extend(DialogProto, {
        // 创建工厂
        create: function (options) {
            return new InetPayDialog(options);
        },

        init: function(options){
            this.options.bankIconsSpriteUrl && this.bankIconsSpritePreLoad(this.options.bankIconsSpriteUrl);
            DialogProto.init.call(this, options);
            this.createDialogContent(options);
        },

        exportData: {payCardType:"D", bankId:"444", bankCode:"PAB", bankName:"平安银行"},

        // 优先加载银行icon图片，提高性能
        bankIconsSpritePreLoad: function(bankIconsSpriteUrl, callback){
            var img = new Image();
            img.src = bankIconsSpriteUrl;
            if (img.complete) {
                typeof console != "undefined" && console.log("img completed");
                typeof callback != 'undefined' && callback.call(img);
            } else {
                typeof console != "undefined" && console.log("img is loading" + new Date());
                img.onload = function () {
                    typeof console != "undefined" && console.log("img is loaded" + new Date());
                    typeof callback != 'undefined' && callback.call(img);
                    img.onload = null;
                };
            };
        },

        createDialogContent: function(options){
            var dialogInstance = this, dialog = this.dialog;

            _getListData(options.url, function(ajax){
                var loadingBox = doc.getElementById('loadingBox'),
                    dialogHmtl = '<h3><span class="title">选择银行：</span>需跳转银行页面，不享受平安保险保障</h3>',
                    list = eval ("(" + ajax.responseText + ")"),
                    firstPayCard;
                try{
                    firstPayCard = list[0];
                    dialogInstance.exportData.bankId = firstPayCard.bankId;
                    dialogInstance.exportData.payCardType = firstPayCard.dcCardType;
                    dialogInstance.exportData.bankCode = firstPayCard.bankCode;
                    dialogInstance.exportData.bankName = firstPayCard.bankName;
                    dialogHmtl += _concatBankListTmpl(list);
                    dialogHmtl += '\
                            <div class="btns">\
                                <button id="inetBankDialogConfirmBtn" class="btn btn-primary btn-confirm">确定</button>\
                            </div>';
                }catch(e){
                    readyState = false;
                    dialogHmtl = ERROR_TMPL;
                }
                dialogInstance.displayDilogContent(dialogHmtl);
                dialogInstance.bandInetPayDialogEvents();
                dialogInstance.showMoreBankCards();
            }, function(){
                readyState = false;
                dialogInstance.displayDilogContent(ERROR_TMPL);
            });
        },

        confirmHandler: function(){
            if(readyState){
                var options = this.options;
                typeof options.confirmHandler !== 'undefined' && options.confirmHandler.call(this);
            }
        },

        removeDialog: function(){
            DialogProto.removeDialog.call(this);

            try{
                var dialog = this.dialog,
                    bankCodeInputs = dialog.getElementsByTagName('input'),
                    confirmBtn = doc.getElementById("inetBankDialogConfirmBtn");
                for(var i = 0, len = bankCodeInputs.length; i<len; i++){
                    bankCodeInputs[i].onclick = null;
                }
                confirmBtn.onclick = null;
            }catch(e){

            }
        },

        bandInetPayDialogEvents: function(){
            var dialogInstance = this,
                dialog = this.dialog,
                bankCodeInputs = dialog.getElementsByTagName('input'),
                preBankCodeInput = bankCodeInputs[0],
                confirmBtn = doc.getElementById("inetBankDialogConfirmBtn");

            for(var i = 0, len = bankCodeInputs.length; i<len; i++){
                bankCodeInputs[i].onclick = (function(index){
                    return function (){
                        var currBankCodeInput = bankCodeInputs[index];
                        dialogInstance.exportData.bankId = currBankCodeInput.value;
                        dialogInstance.exportData.payCardType = currBankCodeInput.getAttribute('data-paycardtype');
                        dialogInstance.exportData.bankCode = currBankCodeInput.getAttribute('data-bankcode');
                        dialogInstance.exportData.bankName = currBankCodeInput.getAttribute('data-bankName');
                        preBankCodeInput.parentNode.parentNode.className = 'bank';
                        currBankCodeInput.parentNode.parentNode.className = 'bank active';
                        preBankCodeInput = currBankCodeInput;
                    }
                }(i));
            }

            confirmBtn.onclick = function () {
                dialogInstance.confirmHandler();
                dialogInstance.removeDialog();
            };
        },

        displayDilogContent: function(htmlTmpl){
            var dialog = this.dialog,
                loadingBox = doc.getElementById('loadingBox'),
                dialogContent = doc.createElement('div');

            dialogContent.innerHTML = htmlTmpl;
            loadingBox.style.display = "none";
            dialog.insertBefore(dialogContent, loadingBox);
        },
        showMoreBankCards: function(){
        	var showBtn = doc.getElementById('moreInetBankCards');
        	if(showBtn){
        		showBtn.onclick = function(){
            		_removeClassHidden();
            	}
        	}        	
        }
    });

    exports.create = InetPayDialogProto.create;


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

    function _getListData(url, successHandler, failureHandler){
        var ajax = (function(){
                if (window.XMLHttpRequest){
                    xmlhttp=new XMLHttpRequest();
                }else{
                    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
                }
                return xmlhttp;
            }()),
            params = "";
        url = (url.indexOf("?")==-1)? url + '?' +params : url +params;
        ajax.open("GET",url,true);
        ajax.send();
        ajax.onreadystatechange = function(){
            if(ajax.readyState!=4){
                return;
            }else if(ajax.status>=200 && ajax.status<300){
                typeof successHandler == 'function' && successHandler(ajax);
            }else{
                typeof failureHandler == 'function' && failureHandler(ajax);
            }
        };
    }

    function _concatBankListTmpl(list) {
        var listTmpl = '<div class="tab">\
                                <ul id="inetBanks" class="banks">{{liTmpl}}</ul>\
                            </div>',
            liTmpl = '', bank;

        for (var i = 0, len = list.length; i < len; i++) {
            bank = list[i];
            liTmpl += '<li class="'+ (i>19?"hidden":"") +' bank '+ (i==0 ? "active":"") +'">\
                                <label><input name="bankCode" data-paycardtype="'+bank.dcCardType+'" data-bankcode="'+bank.bankCode+'" data-bankName="'+bank.bankName+'" type="radio" '+ (i==0 ? "checked":"") +' value="'+ bank.bankId +'" />&nbsp;&nbsp;\
                                <span class="box-icon"><i class="icon-bank icon-bank-' + (bank.bankCode.toLowerCase()||'pab') + '" >' + bank.bankName + '</i></span></label>\
                            </li>';
            if((i == (len-1)) && len > 20){
            	liTmpl += '<li class="moreCards" id="moreInetBankCards"><a>更多银行卡∨</a></li>';	
            }
        }
        return listTmpl.replace(/{{liTmpl}}/g, liTmpl);
    }
    
    function _removeClassHidden(cardType){
    	var bankCards = doc.getElementById('inetBanks').childNodes;
    	for(var i=0; i<bankCards.length; i++){
    		var currDom = bankCards[i];
    		if(currDom.className.indexOf('hidden') > -1){
    			currDom.className = currDom.className.replace(/hidden/g, "");
    		}
    	}
    	doc.getElementById('moreInetBankCards').className = 'hidden';
    }
});