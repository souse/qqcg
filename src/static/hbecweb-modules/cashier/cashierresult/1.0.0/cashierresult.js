define("cashier/cashierresult/1.0.0/cashierresult",["$"],function(a){function b(a){var b=window.contextPath+"/cashier/"+f+"/order?isAbc="+g+"&addFastpay="+i+"&versionNo="+h;!1===a.inProgress?(clearTimeout(d),window.location.assign(b)):40>j&&(j+=1,d=setTimeout(c,3e3))}function c(){e.ajax({type:"GET",url:window.contextPath+"/cashier/"+f+"/status/inprogress",dataType:"json",success:b,error:function(){}})}var d,e=a("$"),f=e("#orderId").val(),g="0",h="V2",i="0",j=0;if("success"===e("#status").val()){var k=e("#orderId").val();e.ajax({type:"GET",url:window.contextPath+"/cashier/pointShow",data:{transId:k},dataType:"json",success:function(a){a.points>0&&(a.flag?(e(".successP").after('<div class="successDiv">恭喜您获得'+a.points+"积分，将在1天内到账。</div>"),e(".fontff9138.fontB").length&&(e(".o").after('<p class="o2">恭喜您获得'+a.points+"积分，将在1天内到账。</p>"),e(".o").css("margin-top","20px"),e(".t a").css({position:"relative",top:"-30px"}))):(e(".successP").after('<div class="successDiv">恭喜您获得'+a.points+'积分，请登录<a class="as" target="_blank" href="'+"https://www.1qianbao.com/yqb/"+'">手机壹钱包</a>领取。</div>'),e(".fontff9138.fontB").length&&(e(".o").after('<p class="o2">恭喜您获得'+a.points+'积分，请登录<a class="as" target="_blank" href="'+"https://www.1qianbao.com/yqb/"+'">手机壹钱包</a>领取。</p>'),e(".o").css("margin-top","20px"),e(".t a").css({position:"relative",top:"-30px"}))))}})}e("#isAbc").length>0&&(g=e("#isAbc").val()),e("#addFastpay").length>0&&(i=e("#addFastpay").val()),e("#inProgress").length>0&&"1"===e("#inProgress").val()&&c(),e("#redirectUrl").length>0&&!(e("#merchantLink").length>0)&&setTimeout("location.href='"+e("#redirectUrl").val()+"';",5e3)});
