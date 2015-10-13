define("cashier/helper/1.0.0/helper-debug", [ "$-debug", "handlebars-debug", "Formatter-debug" ], function(require, exports, module) {
    var $ = require("$-debug"), Handlebars = require("handlebars-debug"), format = require("Formatter-debug");
    Handlebars.registerHelper("money", function(money) {
        if (!money || money < 0) money = 0;
        return format.formatMoney(money / 1e6, 2);
    });
    Handlebars.registerHelper("actual-money", function(money) {
        if (!money || money < 0) money = 0;
        var amount = format.formatMoney(money / 1e6, 2), html = "";
        if (money > 0) {
            html = [ "<small>还需</small> ", amount ].join("");
        } else {
            html = "<em>已够付</em>";
        }
        return new Handlebars.SafeString(html);
    });
    Handlebars.registerHelper("default", function(value, defaultValue) {
        if (!value) value = defaultValue;
        return value;
    });
    Handlebars.registerHelper("phone", function(value) {
        if (value) {
            value = format.formatMobile(value);
        }
        return value;
    });
    Handlebars.registerHelper("lowercase", function(value) {
        if (value && value !== "") return value.toLowerCase();
    });
    Handlebars.registerHelper("cardtype", function(cardType) {
        if (cardType == "D") return "cxk"; else return "xyk";
    });
    Handlebars.registerHelper("selectOne", function(banks) {
        if (banks && banks.length > 0) {
            return banks[0].cardType;
        } else {
            return "";
        }
    });
    Handlebars.registerHelper("more", function(cards) {
        if (cards && cards.length > 0) {
            if (cards.length < 9) return "hidden"; else return "more";
        } else {
            return "";
        }
    });
    Handlebars.registerHelper("cardlist", function(context, options) {
        var fn = options.fn, inverse = options.inverse;
        var i = 0, ret = "", data;
        if (options.data) {
            data = Handlebars.createFrame(options.data);
        }
        for (var j = context.length; i < j; i++) {
            if (data) {
                data.index = i;
            }
            if (data.index < 9) context[i].showClass = ""; else context[i].showClass = "fn-hide";
            ret = ret + fn(context[i], {
                data: data
            });
        }
        if (i === 0) {
            ret = inverse(this);
        }
        return ret;
    });
});
