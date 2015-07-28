/**
 * @Title:  pafweblib 格式化工具类
 * @Description: 格式化工具类，提供了一些常用的格式化显示方法
 * @author yechunan
 * @date 2014-04-15 15:13:26
 * @version V0.1.0
 */
define("pafweblib/Formatter/0.1.0/Formatter-debug", [], function(require, exports, module) {
    var trimRegex = /^[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+|[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+$/g, stripTagsRE = /<\/?[^>]+>/gi, stripScriptsRe = /(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/gi;
    module.exports = {
        /* 基础方法 */
        /**
         * 检查 value 如果为空则转换成空字符串.
         * @param {Object} value
         * @return {Object} result
         */
        undef: function(v) {
            return v !== undefined ? v : "";
        },
        /**
         * 检查value 如果为空转换成 defaultValue.
         * @param {Object} value
         * @param {String} [defaultValue=""] defaultValue.
         * @return {String} result
         */
        defaultValue: function(v, defaultValue) {
            return v !== undefined && v !== "" ? v : defaultValue;
        },
        /**
         * 根据传入start和length来截取字符串
         * @param {String} value 被截取的字符串
         * @param {Number} start 开始截取的字符下标
         * @param {Number} length 字符的长度
         * @return {String} result
         * @method
         */
        substr: "paf".substr(-1) != "f" ? function(v, start, length) {
            var str = String(v);
            return start < 0 ? str.substr(Math.max(str.length + start, 0), length) : str.substr(start, length);
        } : function(v, start, length) {
            return String(v).substr(start, length);
        },
        /**
         * 改变所有字母为小写.
         * @param {String} value
         * @return {String} result
         */
        lowercase: function(v) {
            return String(v).toLowerCase();
        },
        /**
         * 改变所有字母为大写.
         * @param {String} value
         * @return {String} result
         */
        uppercase: function(v) {
            return String(v).toUpperCase();
        },
        /**
         * 去左右空格，保留中间空字符串  Example:
         *
         *     var s = '  foo bar  ';
         *     alert('-' + s + '-');        //alerts "- foo bar -"
         *     alert('-' + trim(s) + '-');  //alerts "-foo bar-"
         *
         * @param {String} string.
         * @return {String} result.
         */
        trim: function(v) {
            return v.replace(trimRegex, "");
        },
        /**
         * 替换所有 HTML 标签.
         * @param {Object} value
         * @return {String} result
         */
        stripTags: function(v) {
            return !v ? v : String(v).replace(stripTagsRE, "");
        },
        /**
         * 替换所有 script 标签.
         * @param {Object} value
         * @return {String} result
         */
        stripScripts: function(v) {
            return !v ? v : String(v).replace(stripScriptsRe, "");
        },
        /**
         * 全角转半角.
         * @param {Object} value
         * @return {String} result
         */
        dbc2sbc: function(v) {
            var result = "", i, code;
            for (i = 0; i < v.length; i++) {
                code = v.charCodeAt(i);
                if (code >= 65281 && code <= 65373) {
                    result += String.fromCharCode(v.charCodeAt(i) - 65248);
                } else if (code == 12288) {
                    result += String.fromCharCode(v.charCodeAt(i) - 12288 + 32);
                } else {
                    result += v.charAt(i);
                }
            }
            return result;
        },
        /* 业务方法 */
        /**
         * 格式化银行卡号显示，每4位添加一个空格.
         * @param {Object} value 银行卡卡号
         * @param {Bool} bool 是否格式化显示
         * @return {String} result
         */
        stylizeBankCard: function(v, bool) {
            var split = this.defaultValue(bool, true);
            if (v !== undefined && v !== "") {
                if (split) v = v.replace(/\s/g, " ").replace(/(\d{4})(?=\d)/g, "$1" + " "); else v = v.replace(/\s+/g, "");
            }
            return v;
        },
        /**
         * 格式化银行卡号，只显示最后4位.
         * @param {Object} value 银行卡卡号
         * @return {String} result
         */
        lastFourBankCard: function(v) {
            var r = "";
            if (v !== undefined && v !== "") {
                r = this.substr(v, v.length - 4, v.length);
            }
            return r;
        },
        /**
         * 姓名加掩码显示.
         * @param {Object} value 姓名
         * @return {String} result
         */
        maskName: function(v) {
            var r = "";
            if (v !== undefined && v !== "") {
                r = this.substr(v, 0, 1);
                if (v.length == 2) {
                    r = [ r, "*" ].join("");
                } else if (v.length == 3) {
                    r = [ r, "**" ].join("");
                } else if (v.length >= 4) {
                    r = [ r, "***" ].join("");
                }
            }
            return r;
        },
        /**
         * 手机号码中间4位掩码显示.
         * @param {Object} value 手机号码
         * @return {String} result
         */
        maskMobile: function(v) {
            var r = "";
            if (v !== undefined && v !== "") {
                r = [ this.substr(v, 0, 3), this.substr(v, v.length - 4, v.length) ].join(" **** ");
            }
            return r;
        },
        /**
         * 手机号码格式化.
         * @param {Object} value 手机号码
         * @return {String} result
         */
        formatMobile: function(v) {
            var r = "";
            if (v !== undefined && v !== "") {
                r = [ this.substr(v, 0, 3), this.substr(v, 3, 4), this.substr(v, v.length - 4, v.length) ].join(" ");
            }
            return r;
        },
        /**
         * 身份证加掩码显示.
         * @param {Object} value 身份证
         * @return {String} result
         */
        maskIdentityCard: function(v) {
            var r = "";
            if (v !== undefined && v !== "") {
                r = [ this.substr(v, 0, 3), this.substr(v, v.length - 2, v.length) ].join("*************");
            }
            return r;
        },
        /**
         * 将数字转换成逗号分隔的样式,保留两位小数
         * @param {Object} value 数字
         * @param {Object} n 小数位数
         * @return {String} result
         */
        formatMoney: function(value, n) {
            n = n > 0 && n <= 20 ? n : 2;
            value = parseFloat((value + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
            var l = value.split(".")[0].split("").reverse(), i, r = value.split(".")[1];
            var t = "";
            for (i = 0; i < l.length; i++) {
                t += l[i] + ((i + 1) % 3 == 0 && i + 1 != l.length ? "," : "");
            }
            return t.split("").reverse().join("") + "." + r;
        },
        /**
         * 将逗号分隔样式的数字还原
         * @param {Object} value 数字
         * @return {String} result
         */
        restoreMoney: function(value) {
            return parseFloat(value.replace(/[^\d\.-]/g, ""));
        },
        date: function() {},
        time: function() {}
    };
});
