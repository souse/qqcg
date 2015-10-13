// 翻页
// author: xujia624@pingan.com.cn
define("pafweblib/pagination/1.0.0/pagination-debug", [ "$-debug", "./pagination-debug.handlebars" ], function(require, exports, module) {
    var $ = require("$-debug"), noop = $.noop;
    var paginationFun = require("./pagination-debug.handlebars");
    var defaultOptions = {
        curr: 1,
        total: 10,
        type: "default",
        // ["default", "simple"]
        onRender: noop
    };
    var pagination = function(pagination, options) {
        this.pagination = $(pagination);
        this.options = $.extend({}, defaultOptions, options);
        this.render(this.options.curr, this.options.total);
        this.initEvent();
    };
    pagination.prototype = {
        /*
         *   渲染 pagination dom 结构
         *   @param  curr        index of page from 1
         *   @param  total       total page number from 1
         */
        render: function(curr, total) {
            var options = this.options, pageElems = [], simplePageElems = [], pre, next;
            curr = curr < 1 ? 1 : curr;
            total = total < 1 ? 1 : total;
            curr = curr > total ? total : curr;
            if (curr == 1) {
                pageElems.push({
                    isPrevBtn: true,
                    disabledClass: "disabled",
                    prePageItem: 0
                }, {
                    isPageItem: true,
                    activeClass: "paf-pagination-active",
                    pageItem: 1
                });
            } else {
                pageElems.push({
                    isPrevBtn: true,
                    disabledClass: "",
                    prePageItem: curr - 1
                }, {
                    isPageItem: true,
                    activeClass: "",
                    pageItem: 1
                });
            }
            simplePageElems.push(pageElems[0]);
            if (total > 1) {
                if (curr > 3 && total > 5) {
                    pageElems.push({
                        isEllipsis: true
                    });
                }
                if (curr < 2) {
                    pre = 0;
                    next = 3;
                    if (curr + next > total) next = total - curr;
                } else if (curr == 2) {
                    pre = 0;
                    next = 2;
                    if (curr + next > total) next = total - curr;
                } else if (curr < total - 1) {
                    pre = 1;
                    next = 1;
                } else if (curr < total) {
                    pre = 2;
                    next = 0;
                    if (total < 5) pre = total - 3;
                } else {
                    pre = 3;
                    next = 0;
                    if (total < 5) pre = total - 2;
                }
                for (var i = pre; 0 < i; i--) {
                    pageElems.push({
                        isPageItem: true,
                        activeClass: "",
                        pageItem: curr - i
                    });
                }
                if (curr > 1) {
                    pageElems.push({
                        isPageItem: true,
                        activeClass: "paf-pagination-active",
                        pageItem: curr
                    });
                }
                for (var i = 1; i < next + 1; i++) {
                    pageElems.push({
                        isPageItem: true,
                        activeClass: "",
                        pageItem: curr + i
                    });
                }
                if (curr + next < total - 1) {
                    pageElems.push({
                        isEllipsis: true
                    }, {
                        isPageItem: true,
                        activeClass: "",
                        pageItem: total
                    });
                }
                if (curr + next == total - 1) {
                    pageElems.push({
                        isPageItem: true,
                        activeClass: "",
                        pageItem: total
                    });
                }
            }
            if (curr == total) {
                pageElems.push({
                    isNextBtn: true,
                    disabledClass: "disabled",
                    nextPageItem: 0
                });
            } else {
                pageElems.push({
                    isNextBtn: true,
                    disabledClass: "",
                    nextPageItem: curr + 1
                });
            }
            simplePageElems.push(pageElems[pageElems.length - 1]);
            // isPageInfo
            pageElems.push({
                isPageInfo: true,
                curr: curr,
                total: total
            });
            simplePageElems.push(pageElems[pageElems.length - 1]);
            if (options.type == "simple") {
                this.pagination.html(paginationFun({
                    pageElems: simplePageElems
                }));
            } else {
                this.pagination.html(paginationFun({
                    pageElems: pageElems
                }));
            }
            //            window.console && console.log(paginationFun({pageElems:pageElems}));
            //trigger onRender
            if (options.onRender) {
                options.onRender.call(this, curr, total);
            }
        },
        initEvent: function() {
            var self = this, total = this.options.total;
            this.pagination.on("click", "a", function() {
                var $link = $(this), page = $link.data("pageitem") * 1;
                if ($link.hasClass("disabled")) {
                    return false;
                }
                self.render(page, total);
                return false;
            });
        }
    };
    module.exports = pagination;
});

define("pafweblib/pagination/1.0.0/pagination-debug.handlebars", [ "gallery/handlebars/1.0.2/runtime-debug" ], function(require, exports, module) {
    var Handlebars = require("gallery/handlebars/1.0.2/runtime-debug");
    var template = Handlebars.template;
    module.exports = template(function(Handlebars, depth0, helpers, partials, data) {
        this.compilerInfo = [ 3, ">= 1.0.0-rc.4" ];
        helpers = helpers || {};
        for (var key in Handlebars.helpers) {
            helpers[key] = helpers[key] || Handlebars.helpers[key];
        }
        data = data || {};
        var stack1, functionType = "function", escapeExpression = this.escapeExpression, self = this;
        function program1(depth0, data) {
            var buffer = "", stack1;
            buffer += "\n    ";
            stack1 = helpers["if"].call(depth0, depth0.isPrevBtn, {
                hash: {},
                inverse: self.noop,
                fn: self.program(2, program2, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n\n    ";
            stack1 = helpers["if"].call(depth0, depth0.isEllipsis, {
                hash: {},
                inverse: self.noop,
                fn: self.program(4, program4, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n\n    ";
            stack1 = helpers["if"].call(depth0, depth0.isPageItem, {
                hash: {},
                inverse: self.noop,
                fn: self.program(6, program6, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n\n    ";
            stack1 = helpers["if"].call(depth0, depth0.isNextBtn, {
                hash: {},
                inverse: self.noop,
                fn: self.program(8, program8, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n\n    ";
            stack1 = helpers["if"].call(depth0, depth0.isPageInfo, {
                hash: {},
                inverse: self.noop,
                fn: self.program(10, program10, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n";
            return buffer;
        }
        function program2(depth0, data) {
            var buffer = "", stack1;
            buffer += '\n        <a href="#" class="paf-pagination-btn paf-pagination-prev ';
            if (stack1 = helpers.disabledClass) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.disabledClass;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '" data-pageItem=';
            if (stack1 = helpers.prePageItem) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.prePageItem;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + ">上一页</a>\n    ";
            return buffer;
        }
        function program4(depth0, data) {
            return '\n        <span class="paf-pagination-ellipsis">...</span>\n    ';
        }
        function program6(depth0, data) {
            var buffer = "", stack1;
            buffer += '\n        <a href="#" class="paf-pagination-item ';
            if (stack1 = helpers.activeClass) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.activeClass;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '" data-pageItem=';
            if (stack1 = helpers.pageItem) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.pageItem;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + ">";
            if (stack1 = helpers.pageItem) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.pageItem;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + "</a>\n    ";
            return buffer;
        }
        function program8(depth0, data) {
            var buffer = "", stack1;
            buffer += '\n        <a href="#" class="paf-pagination-btn paf-pagination-next ';
            if (stack1 = helpers.disabledClass) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.disabledClass;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '" data-pageItem=';
            if (stack1 = helpers.nextPageItem) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.nextPageItem;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + ">下一页</a>\n    ";
            return buffer;
        }
        function program10(depth0, data) {
            var buffer = "", stack1;
            buffer += '\n        <span class="paf-pagination-info"><span>';
            if (stack1 = helpers.curr) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.curr;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + "</span>/<span>";
            if (stack1 = helpers.total) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.total;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + "</span>页</span>\n    ";
            return buffer;
        }
        stack1 = helpers.each.call(depth0, depth0.pageElems, {
            hash: {},
            inverse: self.noop,
            fn: self.program(1, program1, data),
            data: data
        });
        if (stack1 || stack1 === 0) {
            return stack1;
        } else {
            return "";
        }
    });
});
