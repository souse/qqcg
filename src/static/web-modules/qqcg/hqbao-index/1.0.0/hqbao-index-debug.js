(function() {
    define("consumer/hqbao-index/1.0.0/hqbao-index-debug", [ "jquery/jquery/1.10.2/jquery-debug", "arale/calendar/1.0.0/calendar-debug", "$-debug", "gallery/moment/2.0.0/moment-debug", "arale/position/1.0.1/position-debug", "arale/widget/1.1.1/widget-debug", "arale/base/1.1.1/base-debug", "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug", "arale/iframe-shim/1.0.2/iframe-shim-debug" ], function(require, exports, module) {
        var $ = require("jquery/jquery/1.10.2/jquery-debug"), Calendar = require("arale/calendar/1.0.0/calendar-debug");
        function initCalendar() {
            $("#start-cal").val($("#bdate").val());
            $("#end-cal").val($("#edate").val());
            var linmitStart = "2013-01-01", limitEnd = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();
            var startDate = new Calendar({
                trigger: "#start-cal",
                range: [ linmitStart, limitEnd ]
            });
            var endDate = new Calendar({
                trigger: "#end-cal",
                range: [ $("#start-cal").val(), limitEnd ]
            });
            startDate.on("selectDate", function(date) {
                endDate.range([ date, limitEnd ]);
            });
            endDate.on("selectDate", function(date) {
                startDate.range([ linmitStart, date ]);
            });
        }
        function searchDealMsg() {
            var startTime = "", endTime = "", type = "";
            $("#search-deal").on("click", function() {
                startTime = $("#start-cal").val();
                endTime = $("#end-cal").val();
                type = $("#search-type").val();
                window.location.href = "/hqbao?type=" + type + "&startTime=" + startTime + "&endTime=" + endTime;
            });
        }
        exports.init = function() {
            initCalendar();
            searchDealMsg();
        };
    });
})();
