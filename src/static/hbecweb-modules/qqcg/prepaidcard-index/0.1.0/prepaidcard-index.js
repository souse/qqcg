define("consumer/prepaidcard-index/0.1.0/prepaidcard-index",["$","pwdgrd"],function(a,b){function c(){h.length>0&&h.on("click",function(){$t=d(this),url=$t.attr("data-getCardNumPath"),d.get(url,function(a){if(a.totalSize>=10){var b=d("#getPrepaidCardNum").html();seajs.use(["confirmDialog"],function(a){a.create({dialogContentTmp:b,confirmHandler:function(){location.reload()}})})}else location.href=$t.attr("data-addCardPath")}).fail(function(){d("#delPrepaidCardError").html("网络错误，请稍后重试").show()})}),d("a.delPrepaidCardA").on("click",function(){$t=d(this);var a=$t.parent().children("input[name='cardId']").val();d("#prepaidCardId").val(a);var b=d("#delPrepaidCardDiv").html().replace("{{prepaidCardNo}}",$t.parent().siblings("td.cardNo").html().trim()).replace("{{prepaidCardName}}",$t.parent().siblings("td.cardName").html().trim());seajs.use(["confirmDialog"],function(a){a.create({dialogContentTmp:b,confirmHandler:function(){d("#delPrepaidCardError").next(".errorCode").html(""),d("#delPrepaidCardError").hide();var a=$t.attr("data-deletePath"),b="",c="",e="",f=null;if(pwdGrdModule&&(f=pwdGrdModule.getPgeditorById("payPwd"),b=f.pwdResult(),c=f.getDevID(),e=f.getPcInfo()),f&&f.pwdLength()>=6){var g={payPwd:b,devId:c,pcInfo:e,cardId:d("#prepaidCardId").val()};d.post(a,g,function(a){a.success?location.reload():(d("#delPrepaidCardError").html(a.errorMsg).show(),d("#delPrepaidCardError").next(".errorCode").html("["+a.errorCode+"]"))}).fail(function(){d("#delPrepaidCardError").html("网络错误，请稍后重试").show()})}else d("#delPrepaidCardError").html("支付密码长度必须大于或等于6位！").show()}})});var c=function(){var a=[],b={id:"payPwd",sClass:"pafweblib-pwdGrd pafweblib-pwdGrd-middle",iClass:"pafweblib-pwdGrd pafweblib-pwdGrd-inline"};a.push(b),pwdGrdModule=new e({ctrls:a,formSelector:"#delPrepaidCardForm",isMandatory:!0,rootPath:g})},f=null,h=function(){d("#payPwd").length>0&&(c(),clearInterval(f))};f=setInterval(h,200)})}var d=a("$"),e=a("pwdgrd"),f=document,g=(f.body,window.staticFileRoot),h=d("a#addPrepaidCardA");b.init=function(){c()}});
