define("pafweblib/loading/1.0.0/loading",["jquery/jquery/1.10.2/jquery"],function(a,b,c){var d=a("jquery/jquery/1.10.2/jquery"),e={el:"body",text:"loading....",show:!0},f=function(a){this.options=d.extend({},e,a),this.$box=this.options.el,this.loading=null,this.text=this.options.text,this.options.show&&this.show()};f.prototype={show:function(){var a='<div class="loading-container"><div class="loading-mask"></div><div class="loading-content"><div class="icon"></div><div class="loading-text">'+this.options.text+"</div>"+"</div>"+"</div>";this.loading=d(a).appendTo(d(this.$box))},hide:function(){this.loading.remove()}},c.exports=f});
