define("consumer/jqbao-open/1.0.0/index-debug", [ "banklist-debug" ], function(require, exports, module) {
    function initBankList() {
        var bankList = require("banklist-debug");
        var bankListData = {
            btnId: "LTtoChangeMyBankCard",
            backBankName: "LTtoShowBankName",
            backBankNumF: "LTtoShowBankNum"
        };
        bankList.init(bankListData);
    }
    function bindEvent() {
        initBankList();
    }
    exports.init = function() {
        bindEvent();
    };
});
