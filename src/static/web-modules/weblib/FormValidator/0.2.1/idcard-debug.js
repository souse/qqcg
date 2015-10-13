/**
 * @Description: idcard.js
 * @Author: xujia(2014-07-04 19:29)
 */
define("pafweblib/FormValidator/0.2.1/idcard-debug", [], function(require, exports) {
    // 判断18位身份证是否有效
    exports.check18IdCard = function(idCard) {
        idCard = trim(idCard);
        return idCard.length == 18 && isValidityBrithBy18IdCard(idCard) && isTrueValidateCodeBy18IdCard(idCard);
    };
    // 判断是否是age年龄以上
    exports.checkAge = function(idCard, age) {
        return getAge(idCard) > age;
    };
    var Wi = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1 ];
    // 加权因子
    var ValideCode = [ 1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2 ];
    // 身份证验证位值.10代表X
    /**
     * 判断身份证号码为18位时最后的验证位是否正确
     * @param a_idCard 身份证号码数组
     * @return
     */
    function isTrueValidateCodeBy18IdCard(a_idCard) {
        var sum = 0, lastChar = a_idCard[17];
        // 声明加权求和变量
        if (a_idCard[17].toLowerCase() == "x") {
            lastChar = 10;
        }
        for (var i = 0; i < 17; i++) {
            sum += Wi[i] * a_idCard[i];
        }
        var valCodePosition = sum % 11;
        // 得到验证码所位置
        if (lastChar == ValideCode[valCodePosition]) {
            return true;
        } else {
            return false;
        }
    }
    /**
     * 验证18位数身份证号码中的生日是否是有效生日
     * @param idCard 18位书身份证字符串
     * @return
     */
    function isValidityBrithBy18IdCard(idCard18) {
        var year = idCard18.substring(6, 10);
        var month = idCard18.substring(10, 12);
        var day = idCard18.substring(12, 14);
        var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
        // 这里用getFullYear()获取年份，避免千年虫问题
        if (temp_date.getFullYear() != parseFloat(year) || temp_date.getMonth() != parseFloat(month) - 1 || temp_date.getDate() != parseFloat(day)) {
            return false;
        } else {
            return true;
        }
    }
    // 通过身份证取得年龄
    function getAge(idCard18) {
        return new Date().getFullYear() - idCard18.substring(6, 10);
    }
    //去掉字符串头尾空格
    function trim(str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }
});
