define("pafweblib/FormValidator/0.1.0/idcard",[],function(a,b){function c(a){var b=0,c=a[17];"x"==a[17].toLowerCase()&&(c=10);for(var d=0;17>d;d++)b+=g[d]*a[d];var e=b%11;return c==h[e]?!0:!1}function d(a){var b=a.substring(6,10),c=a.substring(10,12),d=a.substring(12,14),e=new Date(b,parseFloat(c)-1,parseFloat(d));return e.getFullYear()!=parseFloat(b)||e.getMonth()!=parseFloat(c)-1||e.getDate()!=parseFloat(d)?!1:!0}function e(a){return(new Date).getFullYear()-a.substring(6,10)}function f(a){return a.replace(/(^\s*)|(\s*$)/g,"")}b.check18IdCard=function(a){return a=f(a),18==a.length&&d(a)&&c(a)},b.checkAge=function(a,b){return e(a)>b};var g=[7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2,1],h=[1,0,10,9,8,7,6,5,4,3,2]});
