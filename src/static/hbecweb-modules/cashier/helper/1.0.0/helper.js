define("cashier/helper/1.0.0/helper",["$","handlebars","Formatter"],function(a){var b=(a("$"),a("handlebars")),c=a("Formatter");b.registerHelper("money",function(a){return(!a||0>a)&&(a=0),c.formatMoney(a/1e6,2)}),b.registerHelper("default",function(a,b){return a||(a=b),a}),b.registerHelper("phone",function(a){return a&&(a=c.formatMobile(a)),a}),b.registerHelper("lowercase",function(a){return a&&""!==a?a.toLowerCase():void 0}),b.registerHelper("cardtype",function(a){return"D"==a?"cxk":"xyk"}),b.registerHelper("selectOne",function(a){return a&&a.length>0?a[0].cardType:""}),b.registerHelper("more",function(a){return a&&a.length>0?a.length<9?"fn-hide":"more":""}),b.registerHelper("cardlist",function(a,c){var d,e=c.fn,f=c.inverse,g=0,h="";c.data&&(d=b.createFrame(c.data));for(var i=a.length;i>g;g++)d&&(d.index=g),a[g].showClass=d.index<9?"":"fn-hide",h+=e(a[g],{data:d});return 0===g&&(h=f(this)),h})});
