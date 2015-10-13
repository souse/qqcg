define("consumer/popUp/1.0.0/icon-debug", [ "jquery/jquery/1.10.2/jquery-debug" ], function(require, exports, module) {
    var $ = require("jquery/jquery/1.10.2/jquery-debug"), $quesIcon = $("#questionnaireIcon");
    function initIcon() {
        if ($quesIcon.length > 0) {
            $quesIcon.hover(function() {
                $(this).removeClass("iconNormal").addClass("iconHover");
            }, function() {
                $(this).removeClass("iconHover").addClass("iconNormal");
            });
        }
    }
    exports.init = function() {
        initIcon();
    };
});
