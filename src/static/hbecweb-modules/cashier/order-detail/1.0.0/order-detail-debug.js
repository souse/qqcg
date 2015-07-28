define("cashier/order-detail/1.0.0/order-detail-debug", [ "$-debug", "helper-debug", "./order-detail-debug.handlebars", "Formatter-debug" ], function(require, exports, module) {
    var $ = require("$-debug"), helper = require("helper-debug"), orderDetailTmpl = require("./order-detail-debug.handlebars"), format = require("Formatter-debug");
    var methods = {
        setActualAmount: function(money) {
            if (!money || money < 0) money = 0;
            $(".actualAmount").html(format.formatMoney(money / 1e6, 2));
        }
    };
    var OrderDetail = function(data) {
        var deferred = $.Deferred();
        data = data || {};
        $.ajax({
            dataType: "JSON",
            type: "GET",
            //            url: ['/cashier-common/order-details/00030003201312270000000000013943'].join('')
            url: [ "/cashier-common/order-details/", data.transId ].join("")
        }).done(function(response) {
            if (response.code == "000000") {
                if (response.data.cashierPayTypeV3) {
                    response.data.isCoupon = true;
                    response.data.shortName = response.data.cashierPayTypeV3.discountName;
                    response.data.balance = response.data.cashierPayTypeV3.discountAmount;
                    response.data.description = response.data.cashierPayTypeV3.discountDescription;
                    response.data.actualAmount = response.data.orderAmt - response.data.cashierPayTypeV3.discountAmount;
                } else {
                    response.data.actualAmount = response.data.orderAmt;
                }
                var orderDetailHtml = orderDetailTmpl(response.data);
                if (data.el) {
                    $(data.el).html(orderDetailHtml);
                }
                deferred.resolve(methods, response.data, orderDetailHtml);
            } else {
                deferred.reject(response);
                var errorMsg = [ "错误码:", response.code, ",错误消息为:", response.message ].join("");
                console && console.debug(errorMsg);
            }
        }).fail(function(response) {
            deferred.reject(response);
            var errorMsg = [ "错误码:", response.status, ",错误消息为:", response.statusText ].join("");
            console && console.debug(errorMsg);
        });
        return deferred.promise();
    };
    module.exports = OrderDetail;
});

define("cashier/order-detail/1.0.0/order-detail-debug.handlebars", [ "gallery/handlebars/1.0.2/runtime-debug" ], function(require, exports, module) {
    var Handlebars = require("gallery/handlebars/1.0.2/runtime-debug");
    var template = Handlebars.template;
    module.exports = template(function(Handlebars, depth0, helpers, partials, data) {
        this.compilerInfo = [ 3, ">= 1.0.0-rc.4" ];
        helpers = helpers || {};
        for (var key in Handlebars.helpers) {
            helpers[key] = helpers[key] || Handlebars.helpers[key];
        }
        data = data || {};
        var buffer = "", stack1, stack2, options, functionType = "function", escapeExpression = this.escapeExpression, helperMissing = helpers.helperMissing, self = this;
        function program1(depth0, data) {
            var buffer = "", stack1, stack2, options;
            buffer += '\n                <div class="detail-order-row">\n                    <span id="toggleCoupon" class="text">';
            if (stack1 = helpers.shortName) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.shortName;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '<img src="/static/cashier/largeamount/src/arrow-down.png" alt="展开详细"></span>\n                    <span class="money">- ';
            options = {
                hash: {},
                data: data
            };
            buffer += escapeExpression((stack1 = helpers.money, stack1 ? stack1.call(depth0, depth0.balance, options) : helperMissing.call(depth0, "money", depth0.balance, options))) + '<small>元</small></span>\n                </div>\n                <div id="targetCoupon" class="detail-expand fn-hide">\n                    <span class="row">';
            if (stack2 = helpers.description) {
                stack2 = stack2.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack2 = depth0.description;
                stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2;
            }
            buffer += escapeExpression(stack2) + "</span>\n                </div>\n            ";
            return buffer;
        }
        buffer += '<div class="cashier-order-detail">\n    <div class="container">\n        <div class="detail-order-row">\n            <span id="toggleDetail" class="text">';
        if (stack1 = helpers.orderDetailName) {
            stack1 = stack1.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.orderDetailName;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '<img src="/static/cashier/largeamount/src/arrow-down.png" alt="展开详细"></span>\n            <span class="money">';
        options = {
            hash: {},
            data: data
        };
        buffer += escapeExpression((stack1 = helpers.money, stack1 ? stack1.call(depth0, depth0.orderAmt, options) : helperMissing.call(depth0, "money", depth0.orderAmt, options))) + '<small>元</small></span>\n        </div>\n        <div id="targetDetail" class="detail-expand fn-hide">\n            <span class="row"><label>商户号:</label>';
        options = {
            hash: {},
            data: data
        };
        buffer += escapeExpression((stack1 = helpers["default"], stack1 ? stack1.call(depth0, depth0.merchantId, "-", options) : helperMissing.call(depth0, "default", depth0.merchantId, "-", options))) + '</span>\n            <span class="row"><label>订单号:</label>';
        options = {
            hash: {},
            data: data
        };
        buffer += escapeExpression((stack1 = helpers["default"], stack1 ? stack1.call(depth0, depth0.merchantOrderNo, "-", options) : helperMissing.call(depth0, "default", depth0.merchantOrderNo, "-", options))) + '</span>\n            <span class="row"><label>交易时间:</label>';
        options = {
            hash: {},
            data: data
        };
        buffer += escapeExpression((stack1 = helpers["default"], stack1 ? stack1.call(depth0, depth0.createTime, "-", options) : helperMissing.call(depth0, "default", depth0.createTime, "-", options))) + '</span>\n            <span class="row"><label>交易类型:</label>';
        options = {
            hash: {},
            data: data
        };
        buffer += escapeExpression((stack1 = helpers["default"], stack1 ? stack1.call(depth0, depth0.txType, "-", options) : helperMissing.call(depth0, "default", depth0.txType, "-", options))) + '</span>\n        </div>\n        <div id="coupon">\n            ';
        stack2 = helpers["if"].call(depth0, depth0.isCoupon, {
            hash: {},
            inverse: self.noop,
            fn: self.program(1, program1, data),
            data: data
        });
        if (stack2 || stack2 === 0) {
            buffer += stack2;
        }
        buffer += '\n        </div>\n        <div class="detail-order-row last">\n            <span class="text">应付总额</span>\n            <span class="money"><em class="actualAmount">';
        options = {
            hash: {},
            data: data
        };
        buffer += escapeExpression((stack1 = helpers.money, stack1 ? stack1.call(depth0, depth0.actualAmount, options) : helperMissing.call(depth0, "money", depth0.actualAmount, options))) + "</em><small>元</small></span>\n        </div>\n    </div>\n</div>";
        return buffer;
    });
});
