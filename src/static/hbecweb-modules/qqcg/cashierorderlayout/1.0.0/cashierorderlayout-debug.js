define("consumer/cashierorderlayout/1.0.0/cashierorderlayout-debug", [ "jquery/jquery/1.10.2/jquery-debug" ], function(require, exports, module) {
    var cashierorderlayout, transId, $ = require("jquery/jquery/1.10.2/jquery-debug");
    function initFun() {
        $("#show-order-detail").on("click", function() {
            $orderDetail = $(".orderdetail");
            if ($orderDetail.attr("class").indexOf("hidden") > -1) {
                $orderDetail.removeClass("hidden");
                $(this).find("span").html("∧");
            } else {
                $orderDetail.addClass("hidden");
                $(this).find("span").html("∨");
            }
        });
        $(".preferential-msg").on("click", function() {
            $preferentialMsg = $(".preferentialmsg");
            if ($preferentialMsg.attr("class").indexOf("hidden") > -1) {
                $preferentialMsg.removeClass("hidden");
                $(this).find("span").html("∧");
            } else {
                $preferentialMsg.addClass("hidden");
                $(this).find("span").html("∨");
            }
        });
    }
    function showOrderMsg() {
        transId = getTransId();
        $("#transId").val(transId);
        $.ajax({
            dataType: "JSON",
            type: "GET",
            async: false,
            url: "/cashier-v2/" + transId + "/order-details"
        }).done(function(responseJson) {
            if (responseJson.code == "000000") {
                var orderCashierDetail = responseJson.data, orderAmt = fmoney(orderCashierDetail.orderAmt / 1e6, 2).split(".");
                $("#orderCustName").html(orderCashierDetail.orderCustName);
                $("#mobileNumber").html(orderCashierDetail.custMobileNumber);
                $("#merchantName").html("商品名称： " + orderCashierDetail.commodityInfo);
                $("#orderAmt").val(orderCashierDetail.orderAmt);
                $("#orderYuan").html(orderAmt[0]);
                $(".pointer").removeClass("hidden");
                $("#orderFen").html(orderAmt[1] + '<span class="yang">￥</span>');
                $("#merchantId").html("商户号： " + orderCashierDetail.merchantId);
                $("#merchantOrderNo").html("订单号： " + orderCashierDetail.merchantOrderNo);
                $("#createTime").html("交易时间： " + orderCashierDetail.createTime);
                $("#txType").html("交易类型： " + orderCashierDetail.txType);
                $("#show-order-detail").html(orderCashierDetail.merchantName + '消费<span class="pic">∨</span>');
            } else {
                $(".cashier-order").html("系统异常");
            }
        }).fail(function() {
            $(".cashier-order").html('<div style="height: 30px; line-height: 30px; width: 960px; margin: 0 auto; color: red;">系统异常</div>');
        });
    }
    function getTransId() {
        var localUrl = location.href.split("/"), tId;
        for (var i = 0; i < localUrl.length; i++) {
            if (localUrl[i] == "cashier") {
                tId = localUrl[i + 1];
                break;
            }
        }
        return tId;
    }
    cashierorderlayout = function() {
        showOrderMsg();
        initFun();
    };
    module.exports = cashierorderlayout;
});
