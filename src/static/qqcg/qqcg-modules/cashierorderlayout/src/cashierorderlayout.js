define(function(require, exports, module) {
	
	var cashierorderlayout, transId, $ = require('$');
	
	function initFun(){
		$('#cashierOrder').on('click', '#show-order-detail', function(){
			$orderDetail = $('.orderdetail');
			if((($orderDetail.attr('class')).indexOf('hidden')) > -1){
				$orderDetail.removeClass('hidden');
				$(this).find('.pic').html('∧');
			}else{
				$orderDetail.addClass('hidden');
				$(this).find('.pic').html('∨');
			}
		});
		
		$('#cashierOrder').on('click', '.preferential-msg', function(){
			$preferentialMsg = $('.preferentialmsg');
			if((($preferentialMsg.attr('class')).indexOf('hidden')) > -1){
				$preferentialMsg.removeClass('hidden');
				$(this).find('span').html('∧');
			}else{
				$preferentialMsg.addClass('hidden');
				$(this).find('span').html('∨');
			}
		});
	}
	
	function showOrderMsg(){
		var $cashierOrderBody = $('#cashierOrder'), tmpl = "";
		transId = getTransId();
		$('#transId').val(transId);
		$.ajax({
			dataType: 'JSON',
		    type: 'POST',
		    async: false,
		    url: window.contextPath + '/cashier-v2/order-details?transId='+transId
		})
		.done(function(responseJson) {
		    if(responseJson.code=="000000"){
		    	var orderCashierDetail = responseJson.data, orderAmt = (fmoney(orderCashierDetail.orderAmt/1000000, 2)).split('\.');
		    	$('#accountName').html(orderCashierDetail.accountName);
		    	$('#mobileNumber').html(orderCashierDetail.custMobileNumber);
		    	if(orderCashierDetail.commodityInfo != '' && orderCashierDetail.commodityInfo != null){
		    		$('#merchantName').html('商品名称： '+orderCashierDetail.commodityInfo);
		    	}else{
		    		$('.merchantname').hide();
		    	}
		    	$('#orderAmt').val(orderCashierDetail.orderAmt);
		    	$('#orderYuan').html(orderAmt[0]); $('.pointer').removeClass('hidden');
		    	$('#orderFen').html(orderAmt[1] + '<span class="yang">￥</span>');
		    	if(orderCashierDetail.merchantId != '' && orderCashierDetail.merchantId != null){
		    		$('#merchantId').html('商户号： ' + orderCashierDetail.merchantId);
		    	}else{
		    		$('#merchantId').html('商户号： -');
		    	}
		    	if(orderCashierDetail.merchantOrderNo != '' && orderCashierDetail.merchantOrderNo != null){
		    		$('#merchantOrderNo').html('订单号： ' + orderCashierDetail.merchantOrderNo);
		    	}else{
		    		$('#merchantOrderNo').html('订单号： -');
		    	}
		    	if(orderCashierDetail.createTime != '' && orderCashierDetail.createTime != null){
		    		$('#createTime').html('交易时间： ' + orderCashierDetail.createTime);
		    	}
		    	if(orderCashierDetail.txType != '' && orderCashierDetail.txType != null){
		    		$('#txType').html('交易类型： ' + orderCashierDetail.txType);
		    	}
		    	$('#show-order-detail').html('<span class="orderdetailname">'+orderCashierDetail.orderDetailName+'</span><span class="pic">∨</span>');
                if(orderCashierDetail.showPhoneRechargeLink) {
                    $('.mobileTopup').css('display','inline-block');
                }

                tmpl = $('#cashierOrderTmpl').html();
		     }else{
		    	tmpl = '<div style="height: 30px; line-height: 30px; width: 950px; margin: 0 auto; color: red;">'+responseJson.message+'</div>';
		    }
            $cashierOrderBody.empty().html(tmpl);
        })
		.fail(function() {
			$cashierOrderBody.empty().html('<div style="height: 30px; line-height: 30px; width: 950px; margin: 0 auto; color: red;">系统异常</div>');
		});
	}
	
	function getTransId(){
		var localUrl = location.href, tId;
		if(localUrl.indexOf('?') > -1){
			localUrl = (localUrl.split('?'))[0];
			localUrl = localUrl.split('/');
		}else{
			localUrl = localUrl.split('/');
		}
		for(var i = 0; i < localUrl.length; i++){
			if(localUrl[i] == 'cashier'){
				tId = localUrl[i+1];
				break;
			}
		}
		return tId;
	}
	
	cashierorderlayout = function(){
		showOrderMsg();
		initFun();
	}
	
	module.exports.cashierorderlayout = cashierorderlayout;
	module.exports.getTransId = getTransId;
});
