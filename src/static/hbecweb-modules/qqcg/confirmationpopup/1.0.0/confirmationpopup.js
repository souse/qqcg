define("consumer/confirmationpopup/1.0.0/confirmationpopup",["jquery/jquery/1.10.2/jquery"],function(a,b,c){var d,e=a("jquery/jquery/1.10.2/jquery");d=function(a){this.opts=e.extend(!0,d.defaults,a),this.mask=null,this.$el=null,this.el=null,this.init()},d.prototype={init:function(){var a=this;this.opts;var b='<div class="confirmation"><h3>'+this.opts.h3+'<span class="cancel"></span></h3>'+'<div><p id="'+this.opts.pId+'">'+this.opts.p+"</p>"+'<input type="button" class="inputL succeed" value="'+this.opts.inputL+'" />'+'<input type="button" class="inputR failure" value="'+this.opts.inputR+'" />'+'<a class="chooseotherpay" href="'+this.opts.aHref+'">'+this.opts.aText+"</a>"+"</div></div>";e("body").append(b),a.$el=e(".confirmation"),a.setMask(),e(".succeed").on("click",{scope:a},a.fnSucceed),e(".failure").on("click",{scope:a},a.fnFailure),e(".cancel").on("click",{scope:a},a.fnCancel)},fn:function(){},fnSucceed:function(a){var b=a.data.scope;return b.opts.uid,b.opts.callbacks.fnSucceed&&b.opts.callbacks.fnSucceed(),b.mask.remove(),b.destroy(),!1},fnFailure:function(a){var b=a.data.scope;return b.opts.uid,b.opts.callbacks.fnFailure&&b.opts.callbacks.fnFailure(),b.mask.remove(),b.destroy(),!1},fnCancel:function(a){var b=a.data.scope;return b.opts.uid,b.opts.callbacks.fnCancel&&b.opts.callbacks.fnCancel(),b.mask.remove(),b.destroy(),!1},destroy:function(){this.$el.remove()},setMask:function(){var a=this;this.mask=e('<div class="mask"></div>').appendTo(a.opts.parent).css({height:e(document).height(),width:e(a.opts.parent).width()})}},d.defaults={parent:"body",inputL:"付款成功",inputR:"付款不成功",h3:"登录网上银行付款",p:"在网银页面完成相关流程后，请告诉壹钱包最终结果（付款完成前请不要关闭该窗口）：",pId:"pid",aText:"返回选择其他支付方式",aHref:"#",callbacks:{fnSucceed:function(){window.console&&console.log("fnSucceed")},fnFailure:function(){window.console&&console.log("fnFailured")},fnCancel:function(){window.console&&console.log("fnCancel")}}},c.exports=d});