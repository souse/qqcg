/**
 * @Description: 组件-银行卡快捷支付选择弹出窗功能
 * Author: xujia(2013-12-16 17:00) 新建文件
 */
define(function(require, exports, modules){
    var doc = document, ArrayProto = Array.prototype;

    var Dialog = require("dialog"), DialogProto = Dialog.prototype;

    var FastPayDialog = function (opts) {
        var options = this.options = extend(FastPayDialogProto.defaultOptions, opts);
        this.init(options);
    };

    var readyState = true,
        ERROR_TMPL = '<div class="box-error">系统异常，请稍后再试</div>';

    // Extend Dialog skeleton
    var FastPayDialogProto = FastPayDialog.prototype = extend(DialogProto, {
        defaultOptions: extend(DialogProto.defaultOptions, {
            payCardTypes:["D","C"]
        }),
        // 创建工厂
        create: function (options) {
            return (dialogInstance = new FastPayDialog(options));
        },

        init: function(options){
            this.options.bankIconsSpriteUrl && this.bankIconsSpritePreLoad(this.options.bankIconsSpriteUrl);
            DialogProto.init.call(this, options);
            this.createDialogContent(options);
        },

        exportData: {payCardType:"D", bankCode:"ICBC", bankId: "333"},

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
            var dialog = this.dialog,
                dialogInstance = this;

            _getListData(options.url, function(ajax){
                var data = eval ("(" + ajax.responseText + ")"),
                	containD = (data.debitList != undefined) && (data.debitList.length > 0) ,
                	containC = (data.creditList != undefined) && (data.creditList.length > 0),
                    dialogHmtl = '\
                        <ul class="tabs-nav">' +
                            (containD ? '<li>储蓄卡</li>' : '')+
                            (containC ? '<li>信用卡</li>' : '') +
                        '</ul>',
                    IS_HIDE = true,
                    firstPayCard;
                try{
                	firstPayCard = containD ? data.debitList[0] : data.creditList[0];
                    dialogInstance.exportData.bankCode = firstPayCard.bankCode;
                    dialogInstance.exportData.payCardType = firstPayCard.payCardType;
                    dialogInstance.exportData.bankId = firstPayCard.bankId;
                    dialogHmtl += (containD ? _concatBankListTmpl(data.debitList, !IS_HIDE, 'D'): '');
                    dialogHmtl += (containC ? _concatBankListTmpl(data.creditList, IS_HIDE, 'C'): '');
                    dialogHmtl += '\
                            <div class="btns">\
                                <button id="bfpDialogConfirmBtn" class="btn btn-primary btn-confirm">确定</button>\
                            </div>';
                }catch(e){
                    readyState = false;
                    dialogHmtl = ERROR_TMPL;
                }
                dialogInstance.displayDilogContent(dialogHmtl);
                dialogInstance.bandFastPayDialogEvents();
                dialogInstance.showMoreBankCards();
            }, function(){
                readyState = false;
                dialogInstance.displayDilogContent(ERROR_TMPL);
            });

            return dialog;
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
                    lists = dialog.getElementsByTagName("ul"),
                    tabNavs = lists[0].getElementsByTagName('li'),
                    bankCodeInputs = dialog.getElementsByTagName('input'),
                    confirmBtn = doc.getElementById("bfpDialogConfirmBtn");
                for(var i= 0, len = tabNavs.length; i<len; i++){
                    tabNavs[i].onclick = null;
                }
                for(var i = 0, len = bankCodeInputs.length; i<len; i++){
                    bankCodeInputs[i].onclick = null;
                }
                confirmBtn.onclick = null;
            }catch(e){

            }

        },

        bandFastPayDialogEvents: function(){
            var dialogInstance = this,
                dialog = this.dialog,
                lists = dialog.getElementsByTagName("ul"),
                tabNavs = lists[0].getElementsByTagName('li'),
                tabs = (function(){
                    var uls = slice(lists, 1), tabs = [];
                    for(var index in uls){
                        tabs.push(uls[index].parentNode);
                    }
                    return tabs;
                }()),
                bankCodeInputs = dialog.getElementsByTagName('input'),
                payCardTypes = ["D", "C"],
                preBankCodeInput = bankCodeInputs[0],
                confirmBtn = doc.getElementById("bfpDialogConfirmBtn");

            for(var i= 0, len = tabNavs.length; i<len; i++){
                tabNavs[i].onclick = (function(index){
                    return function(){
                        var currBankCodeInput = tabs[index].getElementsByTagName('input')[0];
                        hideAllTabs();
                        tabs[index].style.display = 'block';
                        tabNavs[index].className="active";
                        currBankCodeInput.checked = true;
                        dialogInstance.exportData.payCardType = payCardTypes[index];
                        dialogInstance.exportData.bankCode = currBankCodeInput.value;
                        dialogInstance.exportData.bankId = currBankCodeInput.getAttribute('data-bankid');

                        preBankCodeInput.parentNode.parentNode.className = 'bank';
                        currBankCodeInput.parentNode.parentNode.className = 'bank active';
                        preBankCodeInput = currBankCodeInput;
                    };
                }(i));
            }
            tabNavs[0].click();

            for(var i = 0, len = bankCodeInputs.length; i<len; i++){
                bankCodeInputs[i].onclick = (function(index){
                    return function (){
                        var currBankCodeInput = bankCodeInputs[index];
                        dialogInstance.exportData.bankCode = currBankCodeInput.value;
                        dialogInstance.exportData.bankId = currBankCodeInput.getAttribute('data-bankid');

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

            function hideAllTabs(){
                var tbs = tabs, tbNavs = tabNavs;
                for(var i = 0, len = tbs.length; i<len; i++){
                	if ( tbs[i] && tbs[i].style ) {
                		tbs[i].style.display="none";
                		tbNavs[i].className="";
                	}
                }
            }
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
        	var dialog = this.dialog,
        		moreDBankCards = doc.getElementById('moreInetBankCards_D'),
        		moreCBankCards = doc.getElementById('moreInetBankCards_C');
        	if(moreDBankCards){
        		moreDBankCards.onclick = function(){
        			_removeClassHidden('D');
        		};
        	}
        	if(moreCBankCards){
        		moreCBankCards.onclick = function(){
        			_removeClassHidden('C');
        		};
        	}
        }
    });

    exports.create = FastPayDialogProto.create;


    /*
    * helper functions
    * */

    function slice(arr, start, end){
        var el, newArr = [], len = arr.length,  end = end || len ;
        for(var i = start; i < end; i++){
            newArr.push(arr[i]);
        }
        return newArr;
    }

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

    //
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

    function _concatBankListTmpl(list, isHide, cardType) {
        var listTmpl = '<div class="tab"' + (isHide?' style="display:none;"':'') + '>\
                                <p class="line">选择要添加的银行卡</p>\
                                <ul id="more_'+cardType+'" class="banks">{{liTmpl}}</ul>\
                            </div>',
            liTmpl = '', bank;

        for (var i = 0, len = list.length; i < len; i++) {
            bank = list[i];
            liTmpl += '<li class="'+ (i>19?"hidden":"") +' bank '+ (!isHide&&i==0 ? "active":"") +'">\
                                <label><input name="bankCode" type="radio"'+ (!isHide&&i==0 ? "checked":"") +' data-bankid="'+bank.bankId+'"  value="'+ bank.bankCode +'" />&nbsp;&nbsp;\
                                    <span class="box-icon"><i class="icon-bank icon-bank-' + (bank.bankCode.toLowerCase()||'pab') + '" >' + bank.bankName + '</i></span></label>\
                            </li>';
            if((i == (len-1)) && len > 20){
            	liTmpl += '<li class="moreCards" id="moreInetBankCards_'+cardType+'"><a>更多银行卡∨</a></li>';	
            }
        }
        return listTmpl.replace(/{{liTmpl}}/g, liTmpl);
    }
    
    function _removeClassHidden(cardType){
    	var bankCards = doc.getElementById('more_'+cardType).childNodes;
    	for(var i=0; i<bankCards.length; i++){
    		var currDom = bankCards[i];
    		if(currDom.className.indexOf('hidden') > -1){
    			currDom.className = currDom.className.replace(/hidden/g, "");
    		}
    	}
    	doc.getElementById('moreInetBankCards_'+cardType).className = 'hidden';
    }
});