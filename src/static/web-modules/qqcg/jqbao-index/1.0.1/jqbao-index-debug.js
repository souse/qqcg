define("consumer/jqbao-index/1.0.1/jqbao-index-debug", [ "./rpyForm-debug", "jquery/jquery/1.10.2/jquery-debug", "pafweblib/FormValidator/0.2.1/FormValidator-debug", "$-debug", "./billInfo-debug", "gallery/moment/2.0.0/moment-debug", "./billAccountSelectBody-debug.handlebars", "./billAccount-debug.handlebars", "./billDetailTableBody-debug.handlebars", "./banklist-debug" ], function(require, exports, module) {
    var subModulues = {
        rpyForm: require("./rpyForm-debug"),
        billInfo: require("./billInfo-debug"),
        banklist: require("./banklist-debug")
    };
    // 子模块分别初始化
    exports.init = function() {
        for (var module in subModulues) {
            try {
                subModulues[module].init();
            } catch (e) {
                window.console && console.log("jqbao-index 子模块初始化有误：" + module);
            }
        }
    };
});

/**
 * @Description: rpyForm
 * @Author: xujia(2014-06-04 15:01)
 */
define("consumer/jqbao-index/1.0.1/rpyForm-debug", [ "jquery/jquery/1.10.2/jquery-debug", "pafweblib/FormValidator/0.2.1/FormValidator-debug", "$-debug" ], function(require, exports, modules) {
    var $ = require("jquery/jquery/1.10.2/jquery-debug"), FormValidator = require("pafweblib/FormValidator/0.2.1/FormValidator-debug");
    var win = window, $totalNotBillDueAmt = $("#totalNotBillDueAmt"), $totalBillDueAmt = $("#totalBillDueAmt"), totalAmt = win.parseFloat($totalNotBillDueAmt.text().replace(/,/g, "")) + win.parseFloat($totalBillDueAmt.text().replace(/,/g, ""));
    var formValidate = function() {
        var validator = new FormValidator("#jqbaoRpyForm", {
            rules: {
                repaymentAmount: "required|numeric|maxCheck|minCheck|numericTwoDecimalDigit"
            },
            messages: {
                repaymentAmount: {
                    numeric: "请输入有效的还款金额",
                    maxCheck: "还款金额不能超过欠款总额",
                    minCheck: "还款金额不能低于0.01元",
                    numericTwoDecimalDigit: "还款金额不能超过两位小数"
                }
            }
        });
        validator.extendRules({
            numeric: function(field, value) {
                var regex = /^([0-9]+(\.[0-9]+)?)?$/;
                return regex.test(value);
            },
            maxCheck: function(field, value) {
                if (win.parseFloat(value) > totalAmt) {
                    return false;
                }
                return true;
            },
            minCheck: function(field, value) {
                val = win.parseFloat(value);
                if (value >= 0 && value < .01) {
                    return false;
                }
                return true;
            },
            numericTwoDecimalDigit: function(field, value) {
                var regex = /^([0-9]+(\.[0-9]{1,2})?)?$/;
                return regex.test(value);
            }
        });
        validator.launched();
    };
    exports.init = function() {
        formValidate();
    };
});

/**
 * @Description: billInfo
 * @Author: xujia(2014-06-04 15:07)
 */
define("consumer/jqbao-index/1.0.1/billInfo-debug", [ "jquery/jquery/1.10.2/jquery-debug", "gallery/moment/2.0.0/moment-debug" ], function(require, exports, module) {
    var $ = require("jquery/jquery/1.10.2/jquery-debug"), moment = require("gallery/moment/2.0.0/moment-debug");
    var win = window, doc = document, $jqbaoMonthSelect = $("#jqbaoMonthSelect"), $jqbaoMonthRegion = $("#jqbaoMonthRegion"), $jqbaoMonthAccountPanels = $("#jqbaoMonthAccountContainer .paf-box-content"), billAccountList, billDetailList;
    exports.init = getBillList;
    function getBillList() {
        $.ajax({
            dataType: "json",
            type: "get",
            url: "/jqbao/billInfoQuery",
            //            url: "/static/consumer/jqbao/index/data/billInfoList.json",
            cache: false,
            data: {}
        }).done(function(responseJson) {
            // 进行响应正确返回的处理
            if (responseJson.code == "000000") {
                billAccountList = responseJson.data;
                var currAccountMoment, prevAccountMoment, billAccountSelectBodyTmplFun = require("consumer/jqbao-index/1.0.1/billAccountSelectBody-debug.handlebars"), billAccountSelectBodyTmpl;
                $.each(billAccountList, function(index, billAccount) {
                    billAccount.totalDueAmt = (billAccount.duePrincipalAmt || 0) + (billAccount.dueInterestAmt || 0) + (billAccount.dueBofAmt || 0) + (billAccount.dueTrxFee || 0) + (billAccount.dueOverInt || 0);
                    billAccount.totalDueAmt = Math.round(billAccount.totalDueAmt * 100) / 100;
                    billAccount.rpyState = billAccount.totalDueAmt > billAccount.totalRpyAmt;
                    billAccount.restAmt = billAccount.totalDueAmt - billAccount.totalRpyAmt;
                    billAccount.restAmt = Math.round(billAccount.restAmt * 100) / 100;
                    currAccountMoment = moment(billAccount.billCycle + "24", "YYYYMMDD");
                    billAccount.month = currAccountMoment.format("YYYY.MM");
                    billAccount.billCycleRegion = currAccountMoment.format("YYYY.MM.DD");
                    prevAccountMoment = currAccountMoment.subtract("M", 1).add("days", 1);
                    billAccount.billCycleRegion = prevAccountMoment.format("YYYY.MM.DD") + " - " + billAccount.billCycleRegion;
                    // 设置账单概况费用为0时，改为‘无’
                    billAccount.duePrincipalAmt = billAccount.duePrincipalAmt ? parseFloat(billAccount.duePrincipalAmt).toFixed(2) : "无";
                    billAccount.dueInterestAmt = billAccount.dueInterestAmt ? parseFloat(billAccount.dueInterestAmt).toFixed(2) : "无";
                    billAccount.dueBofAmt = billAccount.dueBofAmt ? parseFloat(billAccount.dueBofAmt).toFixed(2) : "无";
                    billAccount.dueTrxFee = billAccount.dueTrxFee ? parseFloat(billAccount.dueTrxFee).toFixed(2) : "无";
                    billAccount.dueOverInt = billAccount.dueOverInt ? parseFloat(billAccount.dueOverInt).toFixed(2) : "无";
                    billAccount.staticFileRoot = window.staticFileRoot;
                });
                billAccountSelectBodyTmpl = billAccountSelectBodyTmplFun({
                    billAccountList: billAccountList,
                    hasNoneMore: billAccountList.length < 6
                });
                $jqbaoMonthSelect.append(billAccountSelectBodyTmpl);
                renderSelect();
            } else {
                window.console && console.error("提示用户错误信息：" + responseJson.message + ", code:" + responseJson.code);
            }
        }).fail(function() {
            // 进行响应未正确返回的处理
            window.console && console.error("/jqbao/billInfoQuery 进行响应未正确返回的处理");
        });
    }
    function renderSelect() {
        var $pafSelect = $jqbaoMonthSelect, $selectHeader = $pafSelect.find(".selectHeader"), $selectBody = $pafSelect.find(".selectBody"), $options = $selectBody.find("li"), $jqbaoTotalAccountPanel = $jqbaoMonthAccountPanels.eq(0), $jqbaoMonthAccountPanel = $jqbaoMonthAccountPanels.eq(1), $jqbaoBillDetailTabItemsContainer = [], $jqbaoBillDetailTabItems;
        var billAccountTmplFun = require("consumer/jqbao-index/1.0.1/billAccount-debug.handlebars"), billAccountTmpl, currIndex = 0;
        $selectHeader.on("click", function() {
            $selectBody.toggle();
            $pafSelect.toggleClass("paf-select-open");
            return false;
        });
        $selectBody.on("click", "li", function() {
            var $option = $(this), index = $options.index(this), MonthIndex = index - 1;
            if ($option.hasClass("option-disabled")) {
                return false;
            }
            $selectHeader.find(".selectHeader-content").html($option.data("content"));
            $selectBody.hide();
            $pafSelect.removeClass("paf-select-open");
            if (currIndex == index) {
                return false;
            }
            $jqbaoMonthAccountPanels.hide();
            if (index == 0) {
                $jqbaoMonthRegion.hide();
                $jqbaoTotalAccountPanel.show(300);
            } else {
                $jqbaoMonthRegion.text(billAccountList[MonthIndex].billCycleRegion).show();
                billAccountTmpl = billAccountTmplFun(billAccountList[MonthIndex]);
                $jqbaoMonthAccountPanel.empty().html(billAccountTmpl).show(300);
            }
            currIndex = index;
            // 渲染账单详情表格数据
            if (currIndex != 0) {
                renderTable($option.data("billcycle"));
            }
            return false;
        });
        $jqbaoMonthAccountPanel.on("click", "#jqbaoBillDetailTabItemsContainer li", function(e) {
            var trxtype = $(e.currentTarget).data("trxtype"), $currItem = $(this).closest("li"), $tabItemsContainer = $jqbaoBillDetailTabItemsContainer, $tabItems = $jqbaoBillDetailTabItems;
            if ($currItem.hasClass("ui-tab-item-current")) {
                return false;
            }
            if ($tabItemsContainer.length === 0) {
                $tabItemsContainer = $currItem.closest("#jqbaoBillDetailTabItemsContainer");
                $tabItems = $tabItemsContainer.find("li");
            }
            $tabItems.removeClass("ui-tab-item-current");
            $currItem.addClass("ui-tab-item-current");
            renderTable($("#billDetailBillCycle").val(), trxtype);
            return false;
        });
        $(doc).on("click", function(e) {
            var $target = $(e.target);
            if (!$target.closest(".paf-select").length) {
                $selectBody.hide();
                $pafSelect.removeClass("paf-select-open");
            }
        });
        $jqbaoMonthAccountPanel.on("click", "#ReturnToTotal", function() {
            $options.eq(0).click();
            return false;
        });
        $jqbaoMonthAccountPanel.on("click", "#refreshMonthBill", function() {
            billAccountTmpl = billAccountTmplFun(billAccountList[currIndex - 1]);
            $jqbaoMonthAccountPanel.empty().html(billAccountTmpl).show(300);
            renderTable($options.eq(currIndex).data("billcycle"));
            return false;
        });
    }
    function renderTable(billCycle, trxType) {
        var billDetailTableBodyTmplFun = require("consumer/jqbao-index/1.0.1/billDetailTableBody-debug.handlebars"), billDetailTableBodyTmpl, $billDetailTableBody = $("#billDetailTableBody");
        var _data;
        if (trxType) {
            _data = {
                billCycle: billCycle,
                trxType: trxType
            };
        } else {
            _data = {
                billCycle: billCycle
            };
        }
        $.ajax({
            dataType: "json",
            type: "get",
            url: "/jqbao/billDetailInfoQuery",
            //            url: "/static/consumer/jqbao/index/data/billDetailInfo.json",
            data: _data
        }).done(function(responseJson) {
            // 进行响应正确返回的处理
            try {
                if (responseJson.code == "000000") {
                    billDetailList = responseJson.data;
                    $.each(billDetailList, function(index, billDetail) {
                        billDetail.trxDateLong = moment(billDetail.trxDate, "YYYYMMDD HHmmss").format("YYYY.MM.DD HH:mm:ss");
                        billDetail.trxRefNoHref = "/deal/showSingleDetail?transId=" + billDetail.trxRefNo;
                        billDetail.trxAmt = billDetail.trxAmt ? parseFloat(billDetail.trxAmt).toFixed(2) : "";
                    });
                    billDetailTableBodyTmpl = billDetailTableBodyTmplFun({
                        billDetailList: billDetailList,
                        billCycle: billCycle
                    });
                    $billDetailTableBody.empty().html(billDetailTableBodyTmpl);
                } else {
                    renderTableErrorInfo();
                    window.console && console.error("billDetailInfoQuery接口返回：" + responseJson.message + ", code:" + responseJson.code);
                }
            } catch (e) {
                renderTableErrorInfo();
                window.console && console.error("billDetailInfoQuery接口返回错误数据格式");
            }
        }).fail(function() {
            // 进行响应未正确返回的处理
            renderTableErrorInfo();
            window.console && console.error("billDetailInfoQuery接口异常");
        });
        function renderTableErrorInfo() {
            billDetailTableBodyTmpl = billDetailTableBodyTmplFun({
                exception: true
            });
            $billDetailTableBody.empty().html(billDetailTableBodyTmpl);
        }
    }
});

define("consumer/jqbao-index/1.0.1/billAccountSelectBody-debug.handlebars", [ "gallery/handlebars/1.0.2/runtime-debug" ], function(require, exports, module) {
    var Handlebars = require("gallery/handlebars/1.0.2/runtime-debug");
    var template = Handlebars.template;
    module.exports = template(function(Handlebars, depth0, helpers, partials, data) {
        this.compilerInfo = [ 3, ">= 1.0.0-rc.4" ];
        helpers = helpers || {};
        for (var key in Handlebars.helpers) {
            helpers[key] = helpers[key] || Handlebars.helpers[key];
        }
        data = data || {};
        var buffer = "", stack1, functionType = "function", escapeExpression = this.escapeExpression, self = this;
        function program1(depth0, data) {
            var buffer = "", stack1;
            buffer += '\n    <li data-content="';
            if (stack1 = helpers.month) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.month;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '" data-billcycle="';
            if (stack1 = helpers.billCycle) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.billCycle;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '" class="option ';
            stack1 = helpers["if"].call(depth0, depth0.rpyState, {
                hash: {},
                inverse: self.noop,
                fn: self.program(2, program2, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += '">\n        <span>';
            if (stack1 = helpers.month) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.month;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + "</span>\n    </li>\n    ";
            return buffer;
        }
        function program2(depth0, data) {
            return "option-owe";
        }
        function program4(depth0, data) {
            return '\n    <li data-content="无更多" class="option option-disabled">\n        <span>无更多</span>\n    </li>\n    ';
        }
        buffer += '<ul class="selectBody">\n    <li data-content="总账单" class="option">\n        <span>总账单</span>\n    </li>\n    ';
        stack1 = helpers.each.call(depth0, depth0.billAccountList, {
            hash: {},
            inverse: self.noop,
            fn: self.program(1, program1, data),
            data: data
        });
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += "\n    ";
        stack1 = helpers["if"].call(depth0, depth0.hasNoneMore, {
            hash: {},
            inverse: self.noop,
            fn: self.program(4, program4, data),
            data: data
        });
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += "\n</ul>";
        return buffer;
    });
});

define("consumer/jqbao-index/1.0.1/billAccount-debug.handlebars", [ "gallery/handlebars/1.0.2/runtime-debug" ], function(require, exports, module) {
    var Handlebars = require("gallery/handlebars/1.0.2/runtime-debug");
    var template = Handlebars.template;
    module.exports = template(function(Handlebars, depth0, helpers, partials, data) {
        this.compilerInfo = [ 3, ">= 1.0.0-rc.4" ];
        helpers = helpers || {};
        for (var key in Handlebars.helpers) {
            helpers[key] = helpers[key] || Handlebars.helpers[key];
        }
        data = data || {};
        var buffer = "", stack1, functionType = "function", escapeExpression = this.escapeExpression, self = this;
        function program1(depth0, data) {
            var buffer = "", stack1;
            buffer += '\n<div class="jqbao-formula">\n<a href="#" id="ReturnToTotal" class="fn-link">去还款</a>\n<span>本月已出账单金额</span>\n<span class="formula"><span class="var" title="总欠款">';
            if (stack1 = helpers.totalDueAmt) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.totalDueAmt;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '</span>-<span class="var" title="已还欠款">';
            if (stack1 = helpers.totalRpyAmt) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.totalRpyAmt;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '</span>=<var class="em">';
            if (stack1 = helpers.restAmt) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.restAmt;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + "</var><em>元</em></span>\n</div>\n";
            return buffer;
        }
        function program3(depth0, data) {
            return '\n<div class="jqbao-state">\n<span class="icon-settingstate-on"></span><var>已还款</var>\n</div>\n';
        }
        buffer += '\n<table class="paf-table paf-table-bordered paf-table-fixed paf-table-break jqbao-billaccounttable">\n    <thead>\n    <tr>\n        <th class="c1">本金（元）</th>\n        <th class="c2">利息（元）</th>\n        <th class="c3">违约金（元）</th>\n        <th class="c4">逾期利息（元）</th>\n        <th class="c5">服务费（元）</th>\n    </tr>\n    </thead>\n    <tbody>\n    <tr>\n        <td><span>';
        if (stack1 = helpers.duePrincipalAmt) {
            stack1 = stack1.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.duePrincipalAmt;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + "</span></td>\n        <td><span>";
        if (stack1 = helpers.dueInterestAmt) {
            stack1 = stack1.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.dueInterestAmt;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + "</span></td>\n        <td><span>";
        if (stack1 = helpers.dueBofAmt) {
            stack1 = stack1.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.dueBofAmt;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + "</span></td>\n        <td><span>";
        if (stack1 = helpers.dueOverInt) {
            stack1 = stack1.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.dueOverInt;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + "</span></td>\n        <td><span>";
        if (stack1 = helpers.dueTrxFee) {
            stack1 = stack1.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.dueTrxFee;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + "</span></td>\n    </tr>\n    </tbody>\n</table>\n\n" + "\n";
        stack1 = helpers["if"].call(depth0, depth0.rpyState, {
            hash: {},
            inverse: self.program(3, program3, data),
            fn: self.program(1, program1, data),
            data: data
        });
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += "\n\n" + '\n<div id="jqbaoBillDetailTab" class="jqbao-billdetailtab">\n    <div class="ui-tab fn-clear">\n        <ul id="jqbaoBillDetailTabItemsContainer" class="ui-tab-items">\n            <li class="ui-tab-item ui-tab-item-current" data-trxType="">\n                <a href="javascript:;" class="active">全部明细</a>\n            </li>\n            <li class="ui-tab-item" data-trxType="CS">\n                <a href="javascript:;">消费</a>\n            </li>\n            <li class="ui-tab-item" data-trxType="R1:R2">\n                <a href="javascript:;">还款</a>\n            </li>\n            <li class="ui-tab-item" data-trxType="RF:WA:WR">\n                <a href="javascript:;">其它</a>\n            </li>\n        </ul>\n    </div>\n    <ul class="panels">\n        <table class="paf-table paf-table-striped paf-table-hover paf-table-condensed paf-table-fixed jqbao-billdetailtable">\n            <thead>\n            <tr>\n                <th>日期</th>\n                <th>金额（元）</th>\n                <th>订单名称</th>\n            </tr>\n            </thead>\n            <tbody id="billDetailTableBody">\n            <tr>\n                <td colspan="3">\n                    <div class="loading">\n                        <img src="';
        if (stack1 = helpers.staticFileRoot) {
            stack1 = stack1.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.staticFileRoot;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '/img/loading.gif" alt="加载中..."/>\n                    </div>\n                </td>\n            </tr>\n            </tbody>\n        </table>\n    </ul>\n</div>\n';
        return buffer;
    });
});

define("consumer/jqbao-index/1.0.1/billDetailTableBody-debug.handlebars", [ "gallery/handlebars/1.0.2/runtime-debug" ], function(require, exports, module) {
    var Handlebars = require("gallery/handlebars/1.0.2/runtime-debug");
    var template = Handlebars.template;
    module.exports = template(function(Handlebars, depth0, helpers, partials, data) {
        this.compilerInfo = [ 3, ">= 1.0.0-rc.4" ];
        helpers = helpers || {};
        for (var key in Handlebars.helpers) {
            helpers[key] = helpers[key] || Handlebars.helpers[key];
        }
        data = data || {};
        var buffer = "", stack1, options, functionType = "function", escapeExpression = this.escapeExpression, self = this, blockHelperMissing = helpers.blockHelperMissing;
        function program1(depth0, data) {
            var buffer = "", stack1;
            buffer += '\n    <tr>\n        <td class="date">';
            if (stack1 = helpers.trxDateLong) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.trxDateLong;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '</td>\n        <td class="money">';
            if (stack1 = helpers.trxAmt) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.trxAmt;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '</td>\n        <td class="object">';
            if (stack1 = helpers.trxTypeDes) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.trxTypeDes;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + "</td>\n    </tr>\n";
            return buffer;
        }
        function program3(depth0, data) {
            return '\n    <tr>\n        <td colspan="3" class="info">没有相关账单</td>\n    </tr>\n';
        }
        function program5(depth0, data) {
            return '\n    <tr>\n        <td colspan="3" class="info">很抱歉，系统异常，请稍后<a id="refreshMonthBill" href="#">点此刷新</a>！</td>\n    </tr>\n';
        }
        options = {
            hash: {},
            inverse: self.program(3, program3, data),
            fn: self.program(1, program1, data),
            data: data
        };
        if (stack1 = helpers.billDetailList) {
            stack1 = stack1.call(depth0, options);
        } else {
            stack1 = depth0.billDetailList;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        if (!helpers.billDetailList) {
            stack1 = blockHelperMissing.call(depth0, stack1, options);
        }
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += "\n";
        stack1 = helpers["if"].call(depth0, depth0.exception, {
            hash: {},
            inverse: self.noop,
            fn: self.program(5, program5, data),
            data: data
        });
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += '\n<input type="hidden" id="billDetailBillCycle" value="';
        if (stack1 = helpers.billCycle) {
            stack1 = stack1.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.billCycle;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '">\n';
        return buffer;
    });
});

/*
 * init(btnId,backId,ajaxUrl,data)
 * */
define("consumer/jqbao-index/1.0.1/banklist-debug", [], function(require, exports, module) {
    function banklist(obj) {
        if (obj == "undefined") return;
        try {
            bankListInit();
        } catch (e) {}
        function bankListInit() {
            $("#" + obj.btnId + "").click(function(e) {
                bankLayout();
            });
        }
        //绑定弹出层的按键
        function bankLayout() {
            if ($("#Id_dialogBox")[0]) {
                $("#Id_dialogBox").show();
                return;
            }
            var sessionId = $("#LTtoChangeMyBankCard").val() ? $("#LTtoChangeMyBankCard").val() : "";
            var a_html = '<div class="banklistBox" id="Id_dialogBox"><div class="banklistBoxBlock"></div><div class="banklistBody"><div class="banklistHeader"><span>储蓄卡</span><span class="banklistClose" id="banklistClose">╳</span></div><div class="banklistInfo">请选择自动还款银行卡</div><div class="banklistShowBox" id="Id_banklistBox"><ul class="banks">', b_html = "", c_html = '<li class="bank" style="text-align: center;"><a href="/instruments/addFastPay?returnURL=/jqbao&supportCardType=D"><span class="box-icon">+&nbsp;添加银行卡</span></a><li><input type="hidden" name="jqbaoToken" value="' + sessionId + '"></form></ul></div><div id="LTtosubmitform" class="banklistSureBtn">确认</div></div></div>';
            $.ajax({
                dataType: "json",
                type: "GET",
                url: "/fastpaycard?time=" + new Date().getTime()
            }).done(function(data) {
                // 进行响应正确返回的处理
                if (data.code == "000000") {
                    var datalist = data.data;
                    if (datalist.length > 0) {
                        for (var i = 0; i < datalist.length; i++) {
                            var _obj = datalist[i];
                            var bankEncNum = _obj.bankEnc, bankEncShort = bankEncNum.substring(bankEncNum.length - 4, bankEncNum.length);
                            if (i == 0) {
                                b_html += '<form action="/jqbao/changeRpBankCard" method="post" name="bankform"><input type="hidden" name="bankCard" value="' + bankEncNum + '" id="jqb_bankencform"/><li class="bank active"><label><input name="bankCode" type="radio" checked="checked"><span class="box-icon"><span class="spanBankName" title="' + _obj.bankName + '" bankenc="' + bankEncNum + '" bankencshort="' + bankEncShort + '">' + _obj.bankName + '</span><span class="spanBankNo">尾号' + bankEncShort + "</span></span></label></li>";
                            } else {
                                b_html += '<li class="bank"><label><input name="bankCode" type="radio"><span class="box-icon"><span class="spanBankName" title="' + _obj.bankName + '" bankenc="' + bankEncNum + '" bankencshort="' + bankEncShort + '">' + _obj.bankName + '</span><span class="spanBankNo">尾号' + bankEncShort + "</span></span></label></li>";
                            }
                        }
                        $("body").append(a_html + b_html + c_html);
                    }
                } else {}
            }).fail(function() {});
            $(document).on("click", "#banklistClose", function() {
                $("#Id_dialogBox").hide();
            });
            $(document).on("click", "#LTtosubmitform", function() {
                if ($("#Id_banklistBox input[name=jqbaoToken]").val() != $("#jqb_bankencform").val()) {
                    document.bankform.submit();
                } else {
                    $("#Id_dialogBox").hide();
                }
            });
            $(document).on("click", "#Id_banklistBox li.bank", function(e) {
                var T = $(e.currentTarget);
                var bankenc = T.find("span.spanBankName").attr("bankenc");
                $("#jqb_bankencform").val(bankenc);
                T.addClass("active").find("input").prop("checked", true);
                $("#Id_banklistBox li.bank").not(T).removeClass("active");
            });
        }
    }
    exports.init = function() {
        try {
            var bankListData = {
                btnId: "LTtoChangeMyBankCard",
                backBankName: "LTtoShowBankName",
                backBankNumF: "LTtoShowBankNum"
            };
            banklist(bankListData);
        } catch (e) {}
    };
});
