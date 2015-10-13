/**
 * @Description: select.js
 * @Author: xujia(2014-05-13 17:20)
 */
define("pafweblib/form/1.0.0/select-debug", [ "$-debug" ], function(require, exports, module) {
    var $ = require("$-debug");
    var doc = document, $pafSelects = $(".paf-select");
    $pafSelects.each(function() {
        var $pafSelect = $(this), $selectHeader = $pafSelect.find(".selectHeader"), $selectBody = $pafSelect.find(".selectBody");
        $selectHeader.on("click", function() {
            $selectBody.toggle();
            $pafSelect.toggleClass("paf-select-open");
            return false;
        });
        $selectBody.on("click", "li", function() {
            var $option = $(this);
            $selectHeader.find(".selectHeader-content").html($option.data("content"));
            $selectBody.hide();
            $pafSelect.removeClass("paf-select-open");
            return false;
        });
        $(doc).on("click", function(e) {
            var $target = $(e.target);
            if (!$target.closest(".paf-select").length) {
                $selectBody.hide();
                $pafSelect.removeClass("paf-select-open");
            }
        });
    });
});
