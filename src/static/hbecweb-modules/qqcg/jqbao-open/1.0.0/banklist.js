define("consumer/jqbao-open/1.0.0/banklist",[],function(a,b){var c=function(a){function b(){$("#"+a.btnId).click(function(){c()})}function c(){if($("#Id_dialogBox")[0])return $("#Id_dialogBox").show(),void 0;var b='<div class="banklistBox" id="Id_dialogBox"><div class="banklistBoxBlock"></div><div class="banklistBody"><div class="banklistHeader"><span>储蓄卡</span><span class="banklistClose" id="banklistClose">╳</span></div><div class="banklistInfo">请选择自动还款银行卡</div><div class="banklistShowBox" id="Id_banklistBox"><ul class="banks">',c="",d='</ul></div><div class="banklistSureBtn" id="banklistSureBtn">确认</div></div></div>';$.ajax({dataType:"json",type:"GET",url:"/fastpaycard?time="+(new Date).getTime()}).done(function(a){if("000000"==a.code){console.log(a.data);var e=a.data;if(e.length>0){for(var f=0;f<e.length;f++){var g=e[f],h=g.bankEnc,i=h.substring(h.length-4,h.length);c+=0==f?'<li class="bank active"><label><input name="bankCode" type="radio" checked="checked"><span class="box-icon"><span class="spanBankName" title="'+g.bankName+'" bankenc="'+h+'" bankencshort="'+i+'">'+g.bankName+'</span><span class="spanBankNo">尾号'+i+"</span></span></label></li>":'<li class="bank"><label><input name="bankCode" type="radio"><span class="box-icon"><span class="spanBankName" title="'+g.bankName+'" bankenc="'+h+'" bankencshort="'+i+'">'+g.bankName+'</span><span class="spanBankNo">尾号'+i+"</span></span></label></li>"}$("body").append(b+c+d)}}else console.log("提示用户错误信息："+a.message+", code:"+a.code)}).fail(function(){console.log("error")}),$(document).on("click","#banklistClose",function(){$("#Id_dialogBox").hide()}),$(document).on("click","#banklistSureBtn",function(){var b=$("#Id_banklistBox li.active span.spanBankName");if(b.length>0){var c=b.html(),d=b.attr("bankenc"),e=b.attr("bankencshort");$("#"+a.backBankName).attr("title",c).html(c),$("#"+a.backBankNumF).html("尾号"+e),$("#jqb_bankencform").length>0&&$("#jqb_bankencform").val(d),$("#Id_dialogBox").hide()}else $("#Id_dialogBox").hide()}),$(document).on("click","#Id_banklistBox li.bank",function(a){var b=$(a.currentTarget);b.addClass("active").find("input").prop("checked",!0),$("#Id_banklistBox li.bank").not(b).removeClass("active")})}if("undefined"!=a)try{b()}catch(d){console.log("前端数据异常："+d.toString())}};b.init=c});