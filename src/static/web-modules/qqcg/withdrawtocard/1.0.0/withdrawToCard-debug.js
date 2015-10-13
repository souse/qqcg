/**
 * @Description: 转出到银行卡页面逻辑初始化
 * @Author: xujia(2014-04-28 19:39)
 * @author susie(2014-07-01)
 */
define("consumer/withdrawtocard/1.0.0/withdrawToCard-debug", [ "$-debug", "tip-debug", "./withdrawLimitTmpl-debug.handlebars", "widthdrawCommon-debug" ], function(require, exports, module) {
    var $ = require("$-debug"), Tip = require("tip-debug"), bankLimitTableTmpl = require("./withdrawLimitTmpl-debug.handlebars"), common = require("widthdrawCommon-debug");
    var doc = document, $form = $("#hqbDrawForm"), $maxCtroAmount = $("#maxCtroAmount"), $drawAmount = $("#drawAmount");
    // 功能：表单银行select
    function initBanksSelect() {
        var $bankSelectBox = $("#bankSelectBox"), $selectHeader = $bankSelectBox.find(".selectHeader"), $selectBody = $bankSelectBox.find(".selectBody");
        $iframe = $bankSelectBox.find("iframe");
        $iframe.height(0);
        $selectHeader.on("click", function() {
            var $header = $(this), offset = $header.offset();
            $iframe.height($selectBody.height());
            $selectBody.toggle();
        });
        $selectBody.on("click", "li", function() {
            var $option = $(this), bankId = $option.data("bankid");
            $selectHeader.find(".selectHeader-content").html($option.html());
            $selectBody.hide();
            $iframe.height(0);
            var oldBankId = $("#bankId").val();
            $("#bankId").val(bankId);
            if (oldBankId != "" && oldBankId != bankId) {
                var limitAmount = $option.attr("data-minLimitAmount");
                $maxCtroAmount.text(limitAmount);
            }
        }).find("li").eq(0).click();
        $(doc).on("click", function(e) {
            var $target = $(e.target);
            if (!$target.closest("#bankSelectBox").length) {
                $selectBody.hide();
                $iframe.height(0);
            }
        });
    }
    function initBankLimitTip() {
        var tmpHtml = bankLimitTableTmpl();
        var t = new Tip({
            trigger: "#bankLimitTrigger",
            content: $(tmpHtml).find("#bankLimitTableTmpl").html(),
            arrowPosition: 7
        });
    }
    exports.init = function() {
        common.init();
        initBanksSelect();
        initBankLimitTip();
    };
});

define("consumer/withdrawtocard/1.0.0/withdrawLimitTmpl-debug.handlebars", [ "gallery/handlebars/1.0.2/runtime-debug" ], function(require, exports, module) {
    var Handlebars = require("gallery/handlebars/1.0.2/runtime-debug");
    var template = Handlebars.template;
    module.exports = template(function(Handlebars, depth0, helpers, partials, data) {
        this.compilerInfo = [ 3, ">= 1.0.0-rc.4" ];
        helpers = helpers || {};
        for (var key in Handlebars.helpers) {
            helpers[key] = helpers[key] || Handlebars.helpers[key];
        }
        data = data || {};
        return '<div>\r\n	<div id="bankLimitTableTmpl">\r\n	    <table class="table table-bordered table-striped table-condensed table-limits">\r\n	        <thead>\r\n	        <tr>\r\n	            <th>活钱宝转出到银行卡限额</th>\r\n	        </tr>\r\n	        </thead>\r\n	        <tbody>\r\n	        	<td>\r\n	        	单日转出上限为20万，每日上限3笔，其中转出到银行卡额度与该银行卡转入转出金额相关，<br/>具体限额以最新版本活钱宝输入金额界面的提示为准。\r\n	        	</td>\r\n	        </tbody>\r\n	    </table>\r\n	    <p>注：单个活钱宝帐户持有金额不限；壹钱包和活钱宝账户之间转账不做限制。</p>\r\n	 </div>\r\n  </div>';
    });
});
