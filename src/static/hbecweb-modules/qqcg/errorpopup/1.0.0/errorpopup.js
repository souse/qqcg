define("consumer/errorpopup/1.0.0/errorpopup",["jquery/jquery/1.10.2/jquery"],function(a,b,c){var d,e=a("jquery/jquery/1.10.2/jquery");d=function(a){this.opts=e.extend(!0,d.defaults,a),this.mask=null,this.$el=null,this.el=null,this.init()},d.prototype={init:function(){var a=this;this.opts;var b='<div class="errorLayout">'+this.opts.sHtml+"</div>";e("body").append(b),a.$el=e(".errorLayout"),a.setMask(),e("#confirm").on("click",{scope:a},a.fnConfirmIng),e("#close").on("click",{scope:a},a.fnCancle)},fn:function(){},fnConfirmIng:function(a){var b=a.data.scope,c=b.opts.callbacks.fnConfirmIng&&b.opts.callbacks.fnConfirmIng();return c?!1:(b.mask.remove(),b.destroy(),!1)},fnCancle:function(a){var b=a.data.scope;return b.opts.callbacks.fnCancle&&b.opts.callbacks.fnCancle(),b.mask.remove(),b.destroy(),!1},destroy:function(){this.$el.remove()},setMask:function(){var a=this;this.mask=e('<div class="mask"></div>').appendTo(a.opts.parent).css({height:e(document).height(),width:e(a.opts.parent).width()})}},d.defaults={parent:"body",sHtml:'<div class="title-fail"><span id="close" class="cancle"></span></div><div class="nav-fail"><div class="nav-fail-msg textset">系统异常，请稍后再试。</div><div class="textset"><input type="button" id="confirm" class="fail-confirm" value="确定"></div></div>',callbacks:{fnConfirmIng:function(){return window.console&&console.log("fnConfirmIng"),!1},fnCancle:function(){window.console&&console.log("fnCancle")}}},c.exports=d});
