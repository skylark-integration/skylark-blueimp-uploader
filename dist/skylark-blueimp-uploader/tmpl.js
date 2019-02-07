/**
 * skylark-blueimp-uploader - The skylark file uploader
 * @author Hudaokeji, Inc.
 * @version v0.0.1
 * @link https://github.com/skylark-integration/skylark-blueimp-uploader/
 * @license MIT
 */
define(["skylark-langx/langx"],function(n){"use strict";var e=function(n,t){var r=/[^\w\-.:]/.test(n)?new Function(e.arg+",tmpl","var _e=tmpl.encode"+e.helper+",_s='"+n.replace(e.regexp,e.func)+"';return _s;"):e.cache[n]=e.cache[n]||e(e.load(n));return t?r(t,e):function(n){return r(n,e)}};return e.cache={},e.load=function(n){return document.getElementById(n).innerHTML},e.regexp=/([\s'\\])(?!(?:[^{]|\{(?!%))*%\})|(?:\{%(=|#)([\s\S]+?)%\})|(\{%)|(%\})/g,e.func=function(n,e,t,r,c,u){return e?{"\n":"\\n","\r":"\\r","\t":"\\t"," ":" "}[e]||"\\"+e:t?"="===t?"'+_e("+r+")+'":"'+("+r+"==null?'':"+r+")+'":c?"';":u?"_s+='":void 0},e.encReg=/[<>&"'\x00]/g,e.encMap={"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&#39;"},e.encode=function(n){return(null==n?"":""+n).replace(e.encReg,function(n){return e.encMap[n]||""})},e.arg="o",e.helper=",print=function(s,e){_s+=e?(s==null?'':s):_e(s);},include=function(s,d){_s+=tmpl(s,d);}",e});
//# sourceMappingURL=sourcemaps/tmpl.js.map
