define("consumer/deposit/1.0.0/deposit-debug", [ "$-debug", "tip-debug", "pafweblib/temporary/1.0.0/numeral-debug", "FormValidator-debug", "./depositeLimitTmpl-debug.handlebars" ], function(require, exports, module) {
    var $ = require("$-debug"), Tip = require("tip-debug"), numeral = require("pafweblib/temporary/1.0.0/numeral-debug"), FormValidator = require("FormValidator-debug"), depositeLimitTmpl = require("./depositeLimitTmpl-debug.handlebars");
    function initDeposit() {
        //        var $form = $('#switchIn'), $depositAmount = $('#depositAmount'),
        //            $thresholdAmt = $('#thresholdAmt'), $payPwd = $('#payPwd');
        var $isZqBaoUser = $("#isZqBaoUser").val(), $depositAmount = $("#depositAmount");
        // 转出金额必须是数字
        $depositAmount.numeral({
            scale: 2
        });
        var validator = new FormValidator(".paf-form");
        validator.on("validate", function(e, field, errors) {
            var $field = $(field);
            if ($field.attr("name") === "depositAmount") {
                if ($field.val() === "") {
                    errors("请输入金额");
                } else if ($field.val() < .01 && $isZqBaoUser === "false") {
                    errors("首次转入金额必须大于等于0.01元");
                } else if ($field.val() < .01 && $isZqBaoUser === "true") {
                    errors("转入金额必须大于等于0.01元");
                }
            }
        });
        validator.launched();
    }
    function initTips() {
        // bank limit tip
        var tmplHtml = depositeLimitTmpl();
        new Tip({
            trigger: "#bankLimitTrigger",
            content: $(tmplHtml).find("#depositLimitTableTmpl").html(),
            arrowPosition: 11
        });
        // profit tip
        new Tip({
            trigger: "#profitTrigger",
            content: $(tmplHtml).find("#profitTmpl").html(),
            arrowPosition: 7
        });
    }
    exports.init = function() {
        initDeposit();
        initTips();
    };
});

define("consumer/deposit/1.0.0/depositeLimitTmpl-debug.handlebars", [ "gallery/handlebars/1.0.2/runtime-debug" ], function(require, exports, module) {
    var Handlebars = require("gallery/handlebars/1.0.2/runtime-debug");
    var template = Handlebars.template;
    module.exports = template(function(Handlebars, depth0, helpers, partials, data) {
        this.compilerInfo = [ 3, ">= 1.0.0-rc.4" ];
        helpers = helpers || {};
        for (var key in Handlebars.helpers) {
            helpers[key] = helpers[key] || Handlebars.helpers[key];
        }
        data = data || {};
        return '<div>\r\n	<div id="depositLimitTableTmpl">\r\n		<table class="table table-bordered table-striped table-condensed table-limits">\r\n	        <thead>\r\n	        <tr>\r\n	            <th>借记卡银行</th>\r\n	            <th>转入限额</th>\r\n	        </tr>\r\n	        </thead>\r\n	        <tbody>\r\n	            <tr>\r\n	                <td>工商银行</td>\r\n	                <td>单笔单日5,000</td>\r\n	            </tr>\r\n	            <tr>\r\n	                <td>建设银行</td>\r\n	                <td>单笔单日5万</td>\r\n	            </tr>\r\n	            <tr>\r\n	                <td>中国银行</td>\r\n	                <td>单笔单日5万</td>\r\n	            </tr>\r\n	            <tr>\r\n	                <td>交通银行</td>\r\n	                <td>单笔5,000，单日10,000</td>\r\n	            </tr>\r\n	            <tr>\r\n	                <td>平安银行</td>\r\n	                <td>单笔单日5万</td>\r\n	            </tr>\r\n	            <tr>\r\n	                <td>光大银行</td>\r\n	                <td>单笔单日5,000</td>\r\n	            </tr>\r\n	            <tr>\r\n	                <td>其他银行</td>\r\n	                <td>单笔5,000，单日10,000</td>\r\n	            </tr>\r\n	        </tbody>\r\n	    </table>\r\n	    <p>注1：单个活钱宝帐户持有金额不限，壹钱包和活钱宝账户之间转账不做限制。</p>\r\n	</div>\r\n	\r\n	<div id="profitTmpl">\r\n		    <div class="profit-container">\r\n	        <h3>收益规则</h3>\r\n	        <p>购买的基金，第二个工作日开始计算收益，遇到假日顺延。计算公式：当日收益=（活钱宝账户资金/10000）*基金公司公布的万份收益。例如：</p>\r\n	        <ul>\r\n	            <li>\r\n	                周一15：00前转入，周二开始计算收益，周三凌晨可以看到收益。\r\n	            </li>\r\n	            <li>\r\n	                周一15：00-周二15：00转入，周三开始计算收益，周四凌晨可以看到收益。\r\n	            </li>\r\n	            <li>\r\n	                周四15：00-周五15：00转入，下周一开始计算收益，下周二凌晨可看到收益。\r\n	            </li>\r\n	            <li>\r\n	                周五15：00-下周一15：00转入，下周二开始计算收益，下周三凌晨可看到收益。\r\n	            </li>\r\n	         </ul>\r\n	    	</div>\r\n	</div>\r\n</div>';
    });
});
