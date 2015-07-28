define(function(require, exports, module){
	var $ = require('$'),$quesIcon=$("#questionnaireIcon");
	function initIcon(){
 	   if($quesIcon.length>0){
		    $quesIcon.hover(function(){
				$(this).removeClass("iconNormal").addClass("iconHover");
			},function(){
				$(this).removeClass("iconHover").addClass("iconNormal");		
			});
	   }
	}
	exports.init = function(){
		initIcon();
	}
});