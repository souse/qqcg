define("cashier/cashierresult/1.0.0/cashierresult-debug", [ "$-debug" ], function(require, exports, module) {
    var $ = require("$-debug"), orderId = $("#orderId").val(), $isAbcVal = "0", $versionNo = "V2", $addFastpayVal = "0", interval, i = 0;
    if ($("#status").val() === "success") {
        var transId = $("#orderId").val();
        $.ajax({
            type: "GET",
            url: window.contextPath + "/cashier-common/pointShow",
            data: {
                transId: transId
            },
            dataType: "json",
            success: function(data) {
                if (data.points > 0) {
                    if (data.flag) {
                        $(".successP").after('<div class="successDiv">恭喜您获得' + data.points + "积分，将在1天内到账。</div>");
                        if ($(".fontff9138.fontB").length) {
                            $(".o").after('<p class="o2">恭喜您获得' + data.points + "积分，将在1天内到账。</p>");
                            $(".o").css("margin-top", "20px");
                            $(".t a").css({
                                position: "relative",
                                top: "-30px"
                            });
                        }
                    } else {
                        $(".successP").after('<div class="successDiv">恭喜您获得' + data.points + '积分，请登录<a class="as" target="_blank" href="' + "https://www.1qianbao.com/yqb/" + '">手机壹钱包</a>领取。</div>');
                        if ($(".fontff9138.fontB").length) {
                            $(".o").after('<p class="o2">恭喜您获得' + data.points + '积分，请登录<a class="as" target="_blank" href="' + "https://www.1qianbao.com/yqb/" + '">手机壹钱包</a>领取。</p>');
                            $(".o").css("margin-top", "20px");
                            $(".t a").css({
                                position: "relative",
                                top: "-30px"
                            });
                        }
                    }
                }
            }
        });
    }
    if ($("#isAbc").length > 0) {
        $isAbcVal = $("#isAbc").val();
    }
    if ($("#addFastpay").length > 0) {
        $addFastpayVal = $("#addFastpay").val();
    }
    if ($("#inProgress").length > 0 && "1" === $("#inProgress").val()) {
        function success(json) {
            var orderUrl = window.contextPath + "/cashier/" + orderId + "/order?isAbc=" + $isAbcVal + "&addFastpay=" + $addFastpayVal + "&versionNo=" + $versionNo;
            if (false === json.inProgress) {
                clearTimeout(interval);
                window.location.assign(orderUrl);
            } else {
                if (i < 40) {
                    i = i + 1;
                    interval = setTimeout(statusOrderTimer, 3e3);
                }
            }
        }
        function statusOrderTimer() {
            $.ajax({
                type: "GET",
                url: window.contextPath + "/cashier/" + orderId + "/status/inprogress",
                dataType: "json",
                success: success,
                error: function() {}
            });
        }
        statusOrderTimer();
    }
    if ($("#redirectUrl").length > 0 && !($("#merchantLink").length > 0)) {
        setTimeout("location.href='" + $("#redirectUrl").val() + "';", 5e3);
    }
});
