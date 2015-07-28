Agent = {
 sendPassiveLog:function(){
	var gloabl =[];
	var total={};	
	var headers = {};
	var body = {};
	var log = {}; 
	//var content = {};
	var extra = {};
	var ver = "1.8"; //log版本号
	var logtime = new Date().getTime();
	var isEncrypt = true;
	//log:
	var sessionid = getcookie("sessionid");
	var logid = getcookie("logid");
	var logType = getcookie("logType");
	var appid = getcookie("appid");
	var deviceid =getcookie("deviceid");
	var url = getcookie("enterUrl");
	var referrer = getcookie("referrer");
	var userid = getcookie("userid");
	var defineEvent = getcookie("defineEvent");
	var definEvFile = getcookie("definEvFile");
	var difineExtra = getcookie("difineExtra");
	if(appid == ""){//如果未初始化是否要返回错误信息
		return "请设置appid";
	}
	if(url == ""){//如果未初始化是否要返回错误信息
		return "请设置url和referrer";
	}
	var location =  "";
	var ip = "0.0.0.0";
	var network_type = "";

	log.ver = ver;
	log.sessionid = sessionid;
	log.logid = logid;	
	log.type=logType;
	log.time = logtime;
	log.appid = appid;
	log.deviceid = deviceid;
	log.userid = userid;
	log.app_ver = "";
	log.app_channel = "";
	log.network_type = network_type;
	log.ip = ip;
	if(logType == 3){
		log.referrer = referrer;
		log.entry = parseInt(getcookie("entry"));
	}
	if(logType == 4){
		log.enterid = getcookie("logid");
		log.exit = new Date().getTime();
	}
	
	if(logType != 4){
		log.url = url;
		if(definEvFile != null && definEvFile != ""){	
		var strArray = definEvFile.split(",");
		for(var i = 0;i<strArray.length;i++){
			var subArray = strArray[i].split(":");
			extra[subArray[0]] = subArray[1];
			}
		}
	
		log.extra = extra;
	}
	
	if(logType == 5){
		log.entry = parseInt(getcookie("selfdefineentry"));
		log.exit = parseInt(getcookie("selfdefineexit"));
		log.group = getcookie("group");
	}

	sendLog(log);
},

sendAppPause:function(){
	var gloabl =[];
	var total={};	
	var headers = {};
	var body = {};
	var log = {}; 
	//var content = {};
	var extra = {};
	var ver = "1.8"; //log版本号
	var logtime = new Date().getTime();
	var isEncrypt = true;
	//log:
	var sessionid = getcookie("sessionid");
	var logid = getcookie("logid");
	var logType = getcookie("logType");
	var appid = getcookie("appid");
	var deviceid =getcookie("deviceid");
	var url = getcookie("enterUrl");
	var referrer = getcookie("referrer");
	var userid = getcookie("userid");
	var defineEvent = getcookie("defineEvent");
	var definEvFile = getcookie("definEvFile");
	var difineExtra = getcookie("difineExtra");
	if(appid == "" || userid == ""){//如果未初始化是否要返回错误信息
		return "请设置appid";
	}
	if(url == ""){//如果未初始化是否要返回错误信息
		return "请设置url和referrer";
	}
	var location =  "";
	var ip = "0.0.0.0";
	var network_type = "";

	log.ver = ver;
	log.sessionid = sessionid;
	log.logid = logid;	
	log.type=logType;
	log.time = logtime;
	log.appid = appid;
	log.deviceid = deviceid;
	log.userid = userid;
	log.app_ver = "";
	log.app_channel = "";
	log.network_type = network_type;
	log.ip = ip;
	log.pagecount = getcookie("pagecount");

	sendLog(log);
},

sendInitiativeLog:function(){
var gloabl =[];
var total={};
var headers = {};
var body = {};
var activeLog = {};
var timestamp = new Date().getTime();
var ua = navigator.userAgent;
var macAndLan = this.getBrowserInfo().split("|");
var lang = this.getLanguage();
var manufacture =  macAndLan[1];
var model = macAndLan[0];
var screen = window.screen.height +"*"+ window.screen.width;
var appid = getcookie("appid");
var userid = getcookie("userid");
var ver = "1.8";
if(appid == ""){//如果未初始化是否要返回错误信息
	return "请设置appid";
}

activeLog.ver = ver;
activeLog.sessionid = getcookie("sessionid");
activeLog.logid = Math.uuid();
activeLog.type = getcookie("logType");
activeLog.time = timestamp;
activeLog.appid = appid;
activeLog.deviceid = getcookie("deviceid");
activeLog.userid = userid;
activeLog.lang = lang;
activeLog.mmc = 0;
activeLog.mnc = 0;
activeLog.lac = 0;
activeLog.cid = 0;
activeLog.imsi = "";
activeLog.imei = "";
activeLog.mac = "";
activeLog.screen = screen;
activeLog.manufacture = manufacture;

activeLog.model = model;
activeLog.sdk = "";//系统版本号 需要得到的

//activeLog.ip = "0.0.0.0";
activeLog.ua = ua;
activeLog.cpu = "";//cpu的速度
activeLog.memory = "";//内存大小
activeLog.crack = 0;//是否破解
activeLog.app_ver = "";//应用版本号 需要得到的
activeLog.app_channel = "";
activeLog.network_type = "";
activeLog.ip = "0.0.0.0";
activeLog.location = "";

sendLog(activeLog);

},
//init appid
init:function(APPID,channnel){
	addcookie("appid",APPID,31);
	addcookie("channel",channnel,31);
},
startSession:function(){
  	if (getcookie("deviceid") == "")
		addcookie("deviceid",Math.uuid(),0);

	addcookie("sessionid",Math.uuid(),31);
	addcookie("logType",1,61);
	this.sendInitiativeLog();
},

//被动log
//进入画面
  enterPage:function(url,hashmap){
  	if (getcookie("sessionid") == "")
		this.startSession();

	var str = "";
	if(hashmap != null && hashmap != ""){
		str = parseHash(hashmap);
	}
	addcookie("logid",Math.uuid(),61);
	addcookie("logType",3,31);
	addcookie("entry",new Date().getTime(),31);
	addcookie("referrer",getcookie("enterUrl"),31);
	addcookie("enterUrl",url,31);
	addcookie("definEvFile",str,31);
	this.sendPassiveLog();
},
//离开画面
  leavePage:function(url){
  	if (getcookie("sessionid") == "")
		startSession();

	addcookie("closeDate",new Date().getTime(),31);
	addcookie("leaveUrl",url,31);
	addcookie("logType",4,31);
	this.sendPassiveLog();
},

//自定义事件
 customizeEvent:function(eventid,entry,exit,hashmap,group){
 	if (getcookie("sessionid") == "")
		startSession();

	var str = "";
	if(hashmap != null && hashmap != ""){
		str = parseHash(hashmap);
	}
	addcookie("definEvFile",str,31);
	addcookie("logType",5,31);
	addcookie("selfdefineentry",entry,61);
	addcookie("selfdefineexit",exit,61);
	addcookie("group",group,61);
	this.sendPassiveLog();
},
//1：画面显示；2，按键点击
setContentType:function(contentType){
	addcookie("contentType",contentType,31);
	addcookie("logType",3,31);
},
setDeviceId:function(){
	addcookie("deviceid",userid,31);
},	
setUserId:function(userid){
	addcookie("userid",userid,31);
},	
//send passive log
 trigger:function(){

	this.sendPassiveLog();
},
endSession:function(pagecount){
	addcookie("pagecount",pagecount,31);
	addcookie("logType",2,31);
	this.sendAppPause();

},
// circle pause
pauseSession:function(){},
//circle resume
resumeSession:function(){},
/***************************************end define fun**************************************************/	
 getBrowserInfo:function()
{
	var agent = navigator.userAgent.toLowerCase();

	var Sys = {};

	var ua =navigator.userAgent.toLowerCase();

	var s;

	(s = ua.match(/qqbrowser\/([\d.]+)/)) ?Sys.qq = s[1] :

			(s = ua.match(/msie ([\d.]+)/)) ? Sys.ie= s[1] :

					(s = ua.match(/firefox\/([\d.]+)/)) ?Sys.firefox = s[1] :

							(s = ua.match(/taobrowser\/([\d.]+)/)) ?Sys.tao = s[1] :

									(s = ua.match(/chrome\/([\d.]+)/)) ?Sys.chrome = s[1] :

											(s = ua.match(/opera.([\d.]+)/)) ?Sys.opera = s[1] :

													(s =ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;

	//test

	if (Sys.ie) {

		return 'IE' +s[1]+"|微软";

	}

	if (Sys.firefox){

		return 'Firefox'+"|Mozilla基金会";

	}

	if (Sys.qq){

		return 'QQ'+"|腾讯";

	}

	if (Sys.tao){

		return 'Tao'+"|阿里巴巴";

	}

	if (Sys.chrome){

		return 'Chrome'+"|Google";

	}

	if (Sys.opera){

		return 'Opera'+"|挪威";

	}

	if (Sys.safari){

		return 'Safari'+"|苹果";

	}
},

getLanguage:function(){
        if (navigator.appName == 'Netscape')
            var language = navigator.language;
        else
            var language = navigator.browserLanguage;
        if (language.indexOf('en') > -1) return 'english';
        else if (language.indexOf('nl') > -1) return 'dutch';
        else if (language.indexOf('fr') > -1) return 'french';
        else if (language.indexOf('de') > -1) return 'german';
        else if (language.indexOf('ja') > -1) return 'japanese';
        else if (language.indexOf('it') > -1) return 'italian';
        else if (language.indexOf('pt') > -1) return 'portuguese';
        else if (language.indexOf('es') > -1) return 'Spanish';
        else if (language.indexOf('sv') > -1) return 'swedish';
        else if (language.indexOf('zh') > -1) return 'chinese';
        else
            return 'english';
    }

}	

/**************************************sendLog******************************/
function sendLog(payload){
	var headers = {};
	var total={};	
	var gloabl =[];

	headers.timestamp = new Date().getTime();
	headers.host = "0.0.0.0";
	headers.isEncrypt = "true";

	total.headers = headers;
	total.body = encryption(JSON.stringify(payload));

	gloabl.push(total);
	var finalData = JSON.stringify(gloabl);
	// alert(finalData);
	ajaxReq(finalData);
}
/**************************************sendLog******************************/

/**************************************ajaxForm******************************/
//xmlhttprequest
			  function ajaxReq(data){
						  var xmlhttp;
						  if (window.XMLHttpRequest)
						  {// code for IE7+, Firefox, Chrome, Opera, Safari
						   xmlhttp=new XMLHttpRequest();
						  }
						  else
						  {// code for IE6, IE5
						   xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
						  }
						  //xmlhttp.onreadystatechange=function()
						  //{
						  //if (xmlhttp.readyState==4 && xmlhttp.status==200)
						  //{
						  //var result = xmlhttp.responseText;
						  //}
						  //}

						   xmlhttp.open("POST","http://192.168.1.87",true);
						   xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
						   xmlhttp.send(data);
						  }







/***************************************parse hashmap**************************************************/
function parseHash(hashmap){
	var str = "";
    if(hashmap != null){
		var length = hashmap.size();
		var keys = hashmap.keySet();
		for(var i =0;i<length;i++){
			str += keys[i]+":"+hashmap.get(keys[i])+",";
		}
	}
	return str;
}
/****************************hashMap***********************************/
function HashMap(){  
				//定义长度  
				var length = 0;  
				//创建一个对象  
				var obj = new Object();  
			  
				/** 
			   * 判断Map是否为空 
				*/  
				this.isEmpty = function(){  
					return length == 0;  
				};  
			  
				/**     * 判断对象中是否包含给定Key 
				*/      this.containsKey=function(key){  
					return (key in obj);  
				};  
			  
				/** 
				* 判断对象中是否包含给定的Value 
				*/  
				this.containsValue=function(value){  
					for(var key in obj){  
						if(obj[key] == value){  
							return true;  
						}  
					}  
					return false;  
				};  
			  
				/** 
				*向map中添加数据 
				*/  
				this.put=function(key,value){  
					if(!this.containsKey(key)){  
						length++;  
					}  
					obj[key] = value;  
				};  
			  
				/** 
				* 根据给定的Key获得Value 
				*/  
				this.get=function(key){  
				   return this.containsKey(key)?obj[key]:null;  
				};  
			  
				/** 
				* 根据给定的Key删除一个值 
				*/  
				this.remove=function(key){  
					if(this.containsKey(key)&&(delete obj[key])){  
						length--;  
					}  
				};  
				  /** 
				* 获得Map中的所有Value 
				*/  
				this.values=function(){  
					var _values= new Array();  
					for(var key in obj){  
						_values.push(obj[key]);  
					}  
					return _values;  
				};  
			  
				/** 
				* 获得Map中的所有Key 
				*/  
				this.keySet=function(){  
					var _keys = new Array();  
					for(var key in obj){  
						_keys.push(key);  
					}  
					return _keys;  
				};  
			  
				/** 
				* 获得Map的长度 
				*/  
				this.size = function(){  
					return length;  
				};  
			  
				/** 
				* 清空Map 
				*/  
				this.clear = function(){  
					length = 0;  
					obj = new Object();  
				};  
}  
/****************************hashMap***********************************/

/*********************UUID的获取************************************************/

(function() {

  // Private array of chars to use

  var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

 

  Math.uuid = function (len, radix) {

    var chars = CHARS, uuid = [], i;

    radix = radix || chars.length;

    if (len) {

      // Compact form

      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];

    } else {
      // rfc4122, version 4 form
      var r;
      // rfc4122 requires these characters

      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';

      uuid[14] = '4';
      // Fill in random data.  At i==19 set the high bits of clock sequence as

      // per rfc4122, sec. 4.1.5

      for (i = 0; i < 36; i++) {

        if (!uuid[i]) {

          r = 0 | Math.random()*16;

          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];

        }

      }

    }
    return uuid.join('');
  };
  // A more performant, but slightly bulkier, RFC4122v4 solution.  We boost performance

  // by minimizing calls to random()

  Math.uuidFast = function() {

    var chars = CHARS, uuid = new Array(36), rnd=0, r;

    for (var i = 0; i < 36; i++) {

      if (i==8 || i==13 ||  i==18 || i==23) {

        uuid[i] = '-';

      } else if (i==14) {

        uuid[i] = '4';

      } else {

        if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;

        r = rnd & 0xf;

        rnd = rnd >> 4;

        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
		return uuid.join('');
  };
  // A more compact, but less performant, RFC4122v4 solution:

  Math.uuidCompact = function() {

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {

      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);

      return v.toString(16);

    });
  };
})();

/*********************UUID************************************************/
/*********************cookie************************************************/
			function addcookie(name,value,expireHours){
				var cookieString=name+"="+escape(value);
				//判断是否设置过期时间
				if(expireHours>0){
					var date=new Date();
					date.setTime(date.getTime+expireHours*3600*1000);
					cookieString=cookieString+"; expire="+date.toGMTString();
				}
					document.cookie=cookieString;
			}
			function getcookie(name){
				var strcookie=document.cookie;
				var arrcookie=strcookie.split("; ");
				for(var i=0;i<arrcookie.length;i++){
					var arr=arrcookie[i].split("=");
					if(arr[0]==name)return unescape(arr[1]);
				}
				return "";
			}
			function delCookie(name){//删除cookie
				var exp = new Date();
				exp.setTime(exp.getTime() - 1);
				var cval=getCookie(name);
				if(cval!=null) document.cookie= name + "="+cval+";expires="+exp.toGMTString();
			}		
			

/*********************cookie************************************************/

function encryption(word){
	var key = CryptoJS.enc.Utf8.parse("0102030405060708");   
    var iv  = CryptoJS.enc.Utf8.parse('0102030405060708');  
    var srcs = CryptoJS.enc.Utf8.parse(word);  
    var encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: iv,mode:CryptoJS.mode.CBC});    

	return encrypted.toString();
}

/*********************AES************************************************/
/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(u,p){var d={},l=d.lib={},s=function(){},t=l.Base={extend:function(a){s.prototype=this;var c=new s;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
r=l.WordArray=t.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=p?c:4*a.length},toString:function(a){return(a||v).stringify(this)},concat:function(a){var c=this.words,e=a.words,j=this.sigBytes;a=a.sigBytes;this.clamp();if(j%4)for(var k=0;k<a;k++)c[j+k>>>2]|=(e[k>>>2]>>>24-8*(k%4)&255)<<24-8*((j+k)%4);else if(65535<e.length)for(k=0;k<a;k+=4)c[j+k>>>2]=e[k>>>2];else c.push.apply(c,e);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
32-8*(c%4);a.length=u.ceil(c/4)},clone:function(){var a=t.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],e=0;e<a;e+=4)c.push(4294967296*u.random()|0);return new r.init(c,a)}}),w=d.enc={},v=w.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var e=[],j=0;j<a;j++){var k=c[j>>>2]>>>24-8*(j%4)&255;e.push((k>>>4).toString(16));e.push((k&15).toString(16))}return e.join("")},parse:function(a){for(var c=a.length,e=[],j=0;j<c;j+=2)e[j>>>3]|=parseInt(a.substr(j,
2),16)<<24-4*(j%8);return new r.init(e,c/2)}},b=w.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var e=[],j=0;j<a;j++)e.push(String.fromCharCode(c[j>>>2]>>>24-8*(j%4)&255));return e.join("")},parse:function(a){for(var c=a.length,e=[],j=0;j<c;j++)e[j>>>2]|=(a.charCodeAt(j)&255)<<24-8*(j%4);return new r.init(e,c)}},x=w.Utf8={stringify:function(a){try{return decodeURIComponent(escape(b.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return b.parse(unescape(encodeURIComponent(a)))}},
q=l.BufferedBlockAlgorithm=t.extend({reset:function(){this._data=new r.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=x.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,e=c.words,j=c.sigBytes,k=this.blockSize,b=j/(4*k),b=a?u.ceil(b):u.max((b|0)-this._minBufferSize,0);a=b*k;j=u.min(4*a,j);if(a){for(var q=0;q<a;q+=k)this._doProcessBlock(e,q);q=e.splice(0,a);c.sigBytes-=j}return new r.init(q,j)},clone:function(){var a=t.clone.call(this);
a._data=this._data.clone();return a},_minBufferSize:0});l.Hasher=q.extend({cfg:t.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){q.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(b,e){return(new a.init(e)).finalize(b)}},_createHmacHelper:function(a){return function(b,e){return(new n.HMAC.init(a,
e)).finalize(b)}}});var n=d.algo={};return d}(Math);
(function(){var u=CryptoJS,p=u.lib.WordArray;u.enc.Base64={stringify:function(d){var l=d.words,p=d.sigBytes,t=this._map;d.clamp();d=[];for(var r=0;r<p;r+=3)for(var w=(l[r>>>2]>>>24-8*(r%4)&255)<<16|(l[r+1>>>2]>>>24-8*((r+1)%4)&255)<<8|l[r+2>>>2]>>>24-8*((r+2)%4)&255,v=0;4>v&&r+0.75*v<p;v++)d.push(t.charAt(w>>>6*(3-v)&63));if(l=t.charAt(64))for(;d.length%4;)d.push(l);return d.join("")},parse:function(d){var l=d.length,s=this._map,t=s.charAt(64);t&&(t=d.indexOf(t),-1!=t&&(l=t));for(var t=[],r=0,w=0;w<
l;w++)if(w%4){var v=s.indexOf(d.charAt(w-1))<<2*(w%4),b=s.indexOf(d.charAt(w))>>>6-2*(w%4);t[r>>>2]|=(v|b)<<24-8*(r%4);r++}return p.create(t,r)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}})();
(function(u){function p(b,n,a,c,e,j,k){b=b+(n&a|~n&c)+e+k;return(b<<j|b>>>32-j)+n}function d(b,n,a,c,e,j,k){b=b+(n&c|a&~c)+e+k;return(b<<j|b>>>32-j)+n}function l(b,n,a,c,e,j,k){b=b+(n^a^c)+e+k;return(b<<j|b>>>32-j)+n}function s(b,n,a,c,e,j,k){b=b+(a^(n|~c))+e+k;return(b<<j|b>>>32-j)+n}for(var t=CryptoJS,r=t.lib,w=r.WordArray,v=r.Hasher,r=t.algo,b=[],x=0;64>x;x++)b[x]=4294967296*u.abs(u.sin(x+1))|0;r=r.MD5=v.extend({_doReset:function(){this._hash=new w.init([1732584193,4023233417,2562383102,271733878])},
_doProcessBlock:function(q,n){for(var a=0;16>a;a++){var c=n+a,e=q[c];q[c]=(e<<8|e>>>24)&16711935|(e<<24|e>>>8)&4278255360}var a=this._hash.words,c=q[n+0],e=q[n+1],j=q[n+2],k=q[n+3],z=q[n+4],r=q[n+5],t=q[n+6],w=q[n+7],v=q[n+8],A=q[n+9],B=q[n+10],C=q[n+11],u=q[n+12],D=q[n+13],E=q[n+14],x=q[n+15],f=a[0],m=a[1],g=a[2],h=a[3],f=p(f,m,g,h,c,7,b[0]),h=p(h,f,m,g,e,12,b[1]),g=p(g,h,f,m,j,17,b[2]),m=p(m,g,h,f,k,22,b[3]),f=p(f,m,g,h,z,7,b[4]),h=p(h,f,m,g,r,12,b[5]),g=p(g,h,f,m,t,17,b[6]),m=p(m,g,h,f,w,22,b[7]),
f=p(f,m,g,h,v,7,b[8]),h=p(h,f,m,g,A,12,b[9]),g=p(g,h,f,m,B,17,b[10]),m=p(m,g,h,f,C,22,b[11]),f=p(f,m,g,h,u,7,b[12]),h=p(h,f,m,g,D,12,b[13]),g=p(g,h,f,m,E,17,b[14]),m=p(m,g,h,f,x,22,b[15]),f=d(f,m,g,h,e,5,b[16]),h=d(h,f,m,g,t,9,b[17]),g=d(g,h,f,m,C,14,b[18]),m=d(m,g,h,f,c,20,b[19]),f=d(f,m,g,h,r,5,b[20]),h=d(h,f,m,g,B,9,b[21]),g=d(g,h,f,m,x,14,b[22]),m=d(m,g,h,f,z,20,b[23]),f=d(f,m,g,h,A,5,b[24]),h=d(h,f,m,g,E,9,b[25]),g=d(g,h,f,m,k,14,b[26]),m=d(m,g,h,f,v,20,b[27]),f=d(f,m,g,h,D,5,b[28]),h=d(h,f,
m,g,j,9,b[29]),g=d(g,h,f,m,w,14,b[30]),m=d(m,g,h,f,u,20,b[31]),f=l(f,m,g,h,r,4,b[32]),h=l(h,f,m,g,v,11,b[33]),g=l(g,h,f,m,C,16,b[34]),m=l(m,g,h,f,E,23,b[35]),f=l(f,m,g,h,e,4,b[36]),h=l(h,f,m,g,z,11,b[37]),g=l(g,h,f,m,w,16,b[38]),m=l(m,g,h,f,B,23,b[39]),f=l(f,m,g,h,D,4,b[40]),h=l(h,f,m,g,c,11,b[41]),g=l(g,h,f,m,k,16,b[42]),m=l(m,g,h,f,t,23,b[43]),f=l(f,m,g,h,A,4,b[44]),h=l(h,f,m,g,u,11,b[45]),g=l(g,h,f,m,x,16,b[46]),m=l(m,g,h,f,j,23,b[47]),f=s(f,m,g,h,c,6,b[48]),h=s(h,f,m,g,w,10,b[49]),g=s(g,h,f,m,
E,15,b[50]),m=s(m,g,h,f,r,21,b[51]),f=s(f,m,g,h,u,6,b[52]),h=s(h,f,m,g,k,10,b[53]),g=s(g,h,f,m,B,15,b[54]),m=s(m,g,h,f,e,21,b[55]),f=s(f,m,g,h,v,6,b[56]),h=s(h,f,m,g,x,10,b[57]),g=s(g,h,f,m,t,15,b[58]),m=s(m,g,h,f,D,21,b[59]),f=s(f,m,g,h,z,6,b[60]),h=s(h,f,m,g,C,10,b[61]),g=s(g,h,f,m,j,15,b[62]),m=s(m,g,h,f,A,21,b[63]);a[0]=a[0]+f|0;a[1]=a[1]+m|0;a[2]=a[2]+g|0;a[3]=a[3]+h|0},_doFinalize:function(){var b=this._data,n=b.words,a=8*this._nDataBytes,c=8*b.sigBytes;n[c>>>5]|=128<<24-c%32;var e=u.floor(a/
4294967296);n[(c+64>>>9<<4)+15]=(e<<8|e>>>24)&16711935|(e<<24|e>>>8)&4278255360;n[(c+64>>>9<<4)+14]=(a<<8|a>>>24)&16711935|(a<<24|a>>>8)&4278255360;b.sigBytes=4*(n.length+1);this._process();b=this._hash;n=b.words;for(a=0;4>a;a++)c=n[a],n[a]=(c<<8|c>>>24)&16711935|(c<<24|c>>>8)&4278255360;return b},clone:function(){var b=v.clone.call(this);b._hash=this._hash.clone();return b}});t.MD5=v._createHelper(r);t.HmacMD5=v._createHmacHelper(r)})(Math);
(function(){var u=CryptoJS,p=u.lib,d=p.Base,l=p.WordArray,p=u.algo,s=p.EvpKDF=d.extend({cfg:d.extend({keySize:4,hasher:p.MD5,iterations:1}),init:function(d){this.cfg=this.cfg.extend(d)},compute:function(d,r){for(var p=this.cfg,s=p.hasher.create(),b=l.create(),u=b.words,q=p.keySize,p=p.iterations;u.length<q;){n&&s.update(n);var n=s.update(d).finalize(r);s.reset();for(var a=1;a<p;a++)n=s.finalize(n),s.reset();b.concat(n)}b.sigBytes=4*q;return b}});u.EvpKDF=function(d,l,p){return s.create(p).compute(d,
l)}})();
CryptoJS.lib.Cipher||function(u){var p=CryptoJS,d=p.lib,l=d.Base,s=d.WordArray,t=d.BufferedBlockAlgorithm,r=p.enc.Base64,w=p.algo.EvpKDF,v=d.Cipher=t.extend({cfg:l.extend(),createEncryptor:function(e,a){return this.create(this._ENC_XFORM_MODE,e,a)},createDecryptor:function(e,a){return this.create(this._DEC_XFORM_MODE,e,a)},init:function(e,a,b){this.cfg=this.cfg.extend(b);this._xformMode=e;this._key=a;this.reset()},reset:function(){t.reset.call(this);this._doReset()},process:function(e){this._append(e);return this._process()},
finalize:function(e){e&&this._append(e);return this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(e){return{encrypt:function(b,k,d){return("string"==typeof k?c:a).encrypt(e,b,k,d)},decrypt:function(b,k,d){return("string"==typeof k?c:a).decrypt(e,b,k,d)}}}});d.StreamCipher=v.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var b=p.mode={},x=function(e,a,b){var c=this._iv;c?this._iv=u:c=this._prevBlock;for(var d=0;d<b;d++)e[a+d]^=
c[d]},q=(d.BlockCipherMode=l.extend({createEncryptor:function(e,a){return this.Encryptor.create(e,a)},createDecryptor:function(e,a){return this.Decryptor.create(e,a)},init:function(e,a){this._cipher=e;this._iv=a}})).extend();q.Encryptor=q.extend({processBlock:function(e,a){var b=this._cipher,c=b.blockSize;x.call(this,e,a,c);b.encryptBlock(e,a);this._prevBlock=e.slice(a,a+c)}});q.Decryptor=q.extend({processBlock:function(e,a){var b=this._cipher,c=b.blockSize,d=e.slice(a,a+c);b.decryptBlock(e,a);x.call(this,
e,a,c);this._prevBlock=d}});b=b.CBC=q;q=(p.pad={}).Pkcs7={pad:function(a,b){for(var c=4*b,c=c-a.sigBytes%c,d=c<<24|c<<16|c<<8|c,l=[],n=0;n<c;n+=4)l.push(d);c=s.create(l,c);a.concat(c)},unpad:function(a){a.sigBytes-=a.words[a.sigBytes-1>>>2]&255}};d.BlockCipher=v.extend({cfg:v.cfg.extend({mode:b,padding:q}),reset:function(){v.reset.call(this);var a=this.cfg,b=a.iv,a=a.mode;if(this._xformMode==this._ENC_XFORM_MODE)var c=a.createEncryptor;else c=a.createDecryptor,this._minBufferSize=1;this._mode=c.call(a,
this,b&&b.words)},_doProcessBlock:function(a,b){this._mode.processBlock(a,b)},_doFinalize:function(){var a=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){a.pad(this._data,this.blockSize);var b=this._process(!0)}else b=this._process(!0),a.unpad(b);return b},blockSize:4});var n=d.CipherParams=l.extend({init:function(a){this.mixIn(a)},toString:function(a){return(a||this.formatter).stringify(this)}}),b=(p.format={}).OpenSSL={stringify:function(a){var b=a.ciphertext;a=a.salt;return(a?s.create([1398893684,
1701076831]).concat(a).concat(b):b).toString(r)},parse:function(a){a=r.parse(a);var b=a.words;if(1398893684==b[0]&&1701076831==b[1]){var c=s.create(b.slice(2,4));b.splice(0,4);a.sigBytes-=16}return n.create({ciphertext:a,salt:c})}},a=d.SerializableCipher=l.extend({cfg:l.extend({format:b}),encrypt:function(a,b,c,d){d=this.cfg.extend(d);var l=a.createEncryptor(c,d);b=l.finalize(b);l=l.cfg;return n.create({ciphertext:b,key:c,iv:l.iv,algorithm:a,mode:l.mode,padding:l.padding,blockSize:a.blockSize,formatter:d.format})},
decrypt:function(a,b,c,d){d=this.cfg.extend(d);b=this._parse(b,d.format);return a.createDecryptor(c,d).finalize(b.ciphertext)},_parse:function(a,b){return"string"==typeof a?b.parse(a,this):a}}),p=(p.kdf={}).OpenSSL={execute:function(a,b,c,d){d||(d=s.random(8));a=w.create({keySize:b+c}).compute(a,d);c=s.create(a.words.slice(b),4*c);a.sigBytes=4*b;return n.create({key:a,iv:c,salt:d})}},c=d.PasswordBasedCipher=a.extend({cfg:a.cfg.extend({kdf:p}),encrypt:function(b,c,d,l){l=this.cfg.extend(l);d=l.kdf.execute(d,
b.keySize,b.ivSize);l.iv=d.iv;b=a.encrypt.call(this,b,c,d.key,l);b.mixIn(d);return b},decrypt:function(b,c,d,l){l=this.cfg.extend(l);c=this._parse(c,l.format);d=l.kdf.execute(d,b.keySize,b.ivSize,c.salt);l.iv=d.iv;return a.decrypt.call(this,b,c,d.key,l)}})}();
(function(){for(var u=CryptoJS,p=u.lib.BlockCipher,d=u.algo,l=[],s=[],t=[],r=[],w=[],v=[],b=[],x=[],q=[],n=[],a=[],c=0;256>c;c++)a[c]=128>c?c<<1:c<<1^283;for(var e=0,j=0,c=0;256>c;c++){var k=j^j<<1^j<<2^j<<3^j<<4,k=k>>>8^k&255^99;l[e]=k;s[k]=e;var z=a[e],F=a[z],G=a[F],y=257*a[k]^16843008*k;t[e]=y<<24|y>>>8;r[e]=y<<16|y>>>16;w[e]=y<<8|y>>>24;v[e]=y;y=16843009*G^65537*F^257*z^16843008*e;b[k]=y<<24|y>>>8;x[k]=y<<16|y>>>16;q[k]=y<<8|y>>>24;n[k]=y;e?(e=z^a[a[a[G^z]]],j^=a[a[j]]):e=j=1}var H=[0,1,2,4,8,
16,32,64,128,27,54],d=d.AES=p.extend({_doReset:function(){for(var a=this._key,c=a.words,d=a.sigBytes/4,a=4*((this._nRounds=d+6)+1),e=this._keySchedule=[],j=0;j<a;j++)if(j<d)e[j]=c[j];else{var k=e[j-1];j%d?6<d&&4==j%d&&(k=l[k>>>24]<<24|l[k>>>16&255]<<16|l[k>>>8&255]<<8|l[k&255]):(k=k<<8|k>>>24,k=l[k>>>24]<<24|l[k>>>16&255]<<16|l[k>>>8&255]<<8|l[k&255],k^=H[j/d|0]<<24);e[j]=e[j-d]^k}c=this._invKeySchedule=[];for(d=0;d<a;d++)j=a-d,k=d%4?e[j]:e[j-4],c[d]=4>d||4>=j?k:b[l[k>>>24]]^x[l[k>>>16&255]]^q[l[k>>>
8&255]]^n[l[k&255]]},encryptBlock:function(a,b){this._doCryptBlock(a,b,this._keySchedule,t,r,w,v,l)},decryptBlock:function(a,c){var d=a[c+1];a[c+1]=a[c+3];a[c+3]=d;this._doCryptBlock(a,c,this._invKeySchedule,b,x,q,n,s);d=a[c+1];a[c+1]=a[c+3];a[c+3]=d},_doCryptBlock:function(a,b,c,d,e,j,l,f){for(var m=this._nRounds,g=a[b]^c[0],h=a[b+1]^c[1],k=a[b+2]^c[2],n=a[b+3]^c[3],p=4,r=1;r<m;r++)var q=d[g>>>24]^e[h>>>16&255]^j[k>>>8&255]^l[n&255]^c[p++],s=d[h>>>24]^e[k>>>16&255]^j[n>>>8&255]^l[g&255]^c[p++],t=
d[k>>>24]^e[n>>>16&255]^j[g>>>8&255]^l[h&255]^c[p++],n=d[n>>>24]^e[g>>>16&255]^j[h>>>8&255]^l[k&255]^c[p++],g=q,h=s,k=t;q=(f[g>>>24]<<24|f[h>>>16&255]<<16|f[k>>>8&255]<<8|f[n&255])^c[p++];s=(f[h>>>24]<<24|f[k>>>16&255]<<16|f[n>>>8&255]<<8|f[g&255])^c[p++];t=(f[k>>>24]<<24|f[n>>>16&255]<<16|f[g>>>8&255]<<8|f[h&255])^c[p++];n=(f[n>>>24]<<24|f[g>>>16&255]<<16|f[h>>>8&255]<<8|f[k&255])^c[p++];a[b]=q;a[b+1]=s;a[b+2]=t;a[b+3]=n},keySize:8});u.AES=p._createHelper(d)})();

/*********************AES************************************************/
