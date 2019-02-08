/**
 * skylark-blueimp-uploader - The skylark file uploader
 * @author Hudaokeji, Inc.
 * @version v0.0.1
 * @link https://github.com/skylark-integration/skylark-blueimp-uploader/
 * @license MIT
 */
!function(e,i){var t=i.define,n=i.require,r="function"==typeof t&&t.amd,a=!r&&"undefined"!=typeof exports;if(!r&&!t){var o={};t=i.define=function(e,i,t){"function"==typeof t?(o[e]={factory:t,deps:i.map(function(i){return function(e,i){if("."!==e[0])return e;var t=i.split("/"),n=e.split("/");t.pop();for(var r=0;r<n.length;r++)"."!=n[r]&&(".."==n[r]?t.pop():t.push(n[r]));return t.join("/")}(i,e)}),resolved:!1,exports:null},n(e)):o[e]={factory:null,resolved:!0,exports:t}},n=i.require=function(e){if(!o.hasOwnProperty(e))throw new Error("Module "+e+" has not been defined");var t=o[e];if(!t.resolved){var r=[];t.deps.forEach(function(e){r.push(n(e))}),t.exports=t.factory.apply(i,r)||null,t.resolved=!0}return t.exports}}if(!t)throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");if(function(e,i){e("skylark-blueimp-uploader/tmpl",["skylark-langx/langx"],function(e){"use strict";var i=function(e,t){var n=/[^\w\-.:]/.test(e)?new Function(i.arg+",tmpl","var _e=tmpl.encode"+i.helper+",_s='"+e.replace(i.regexp,i.func)+"';return _s;"):i.cache[e]=i.cache[e]||i(i.load(e));return t?n(t,i):function(e){return n(e,i)}};return i.cache={},i.load=function(e){return document.getElementById(e).innerHTML},i.regexp=/([\s'\\])(?!(?:[^{]|\{(?!%))*%\})|(?:\{%(=|#)([\s\S]+?)%\})|(\{%)|(%\})/g,i.func=function(e,i,t,n,r,a){return i?{"\n":"\\n","\r":"\\r","\t":"\\t"," ":" "}[i]||"\\"+i:t?"="===t?"'+_e("+n+")+'":"'+("+n+"==null?'':"+n+")+'":r?"';":a?"_s+='":void 0},i.encReg=/[<>&"'\x00]/g,i.encMap={"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&#39;"},i.encode=function(e){return(null==e?"":""+e).replace(i.encReg,function(e){return i.encMap[e]||""})},i.arg="o",i.helper=",print=function(s,e){_s+=e?(s==null?'':s):_e(s);},include=function(s,d){_s+=tmpl(s,d);}",i}),e("skylark-blueimp-uploader/fileupload-ui",["skylark-langx/langx","skylark-utils-dom/eventer","skylark-utils-filer/uploader","skylark-jquery","./tmpl"],function(e,i,t,n,r){"use strict";return n.widget("blueimp.fileuploadui",{processActions:{},_processFile:function(e,i){var t=n.skylark.langx,r=this,a=t.map(e.processQueue,function(e){return function(i){return r.processActions[e.action].call(r,i,e)}});return t.async.waterful(a,[e],r)},_transformProcessQueue:function(e){var i=[];n.each(e.processQueue,function(){var t={},r=this.action,a=!0===this.prefix?r:this.prefix;n.each(this,function(i,r){"string"===n.type(r)&&"@"===r.charAt(0)?t[i]=e[r.slice(1)||(a?a+i.charAt(0).toUpperCase()+i.slice(1):i)]:t[i]=r}),i.push(t)}),e.processQueue=i},processing:function(){return this._processing},process:function(e){var i=this,t=n.extend({},this.options,e);return t.processQueue&&t.processQueue.length&&(this._transformProcessQueue(t),0===this._processing&&this._trigger("processstart"),n.each(e.files,function(r){var a=r?n.extend({},t):t,o=function(){return e.errorThrown?n.Deferred().rejectWith(i,[e]).promise():i._processFile(a,e)};a.index=r,i._processing+=1,i._processingQueue=i._processingQueue.pipe(o,o).always(function(){i._processing-=1,0===i._processing&&i._trigger("processstop")})})),this._processingQueue},options:{processQueue:[],autoUpload:!1,uploadTemplateId:"template-upload",downloadTemplateId:"template-download",filesContainer:void 0,prependFiles:!1,dataType:"json",getNumberOfFiles:function(){return this.filesContainer.children().not(".processing").length},getFilesFromResponse:function(e){return e.result&&n.isArray(e.result.files)?e.result.files:[]},add:function(e,i){var t=n(this),r=t.data("blueimp-fileuploadui")||t.data("fileupload"),a=r.options;i.context=r._renderUpload(i.files).data("data",i).addClass("processing"),a.filesContainer[a.prependFiles?"prepend":"append"](i.context),r._forceReflow(i.context),r._transition(i.context),t.fileuploadui("process",i).always(function(){i.context.each(function(e){n(this).find(".size").text(r._formatFileSize(i.files[e].size))}).removeClass("processing"),r._renderPreviews(i)}).done(function(){i.context.find(".start").prop("disabled",!1),!1!==r._trigger("added",null,i)&&(a.autoUpload||i.autoUpload)&&!1!==i.autoUpload&&i.submit()}).fail(function(){i.files.error&&i.context.each(function(e){var t=i.files[e].error;t&&n(this).find(".error").text(t)})})},send:function(e,i){if(e.isDefaultPrevented())return!1;var t=n(this).data("blueimp-fileuploadui")||n(this).data("fileupload");return i.context&&i.dataType&&"iframe"===i.dataType.substr(0,6)&&i.context.find(".progress").addClass(!n.support.transition&&"progress-animated").attr("aria-valuenow",100).children().first().css("width","100%"),t._trigger("sent",null,i)},done:function(e,i){if(e.isDefaultPrevented())return!1;var t,r,a=n(this).data("blueimp-fileuploadui")||n(this).data("fileupload"),o=i.getFilesFromResponse||a.options.getFilesFromResponse,s=o(i);i.context?i.context.each(function(e){var o=s[e]||{error:"Empty file upload result"};r=a._addFinishedDeferreds(),a._transition(n(this)).done(function(){var e=n(this);t=a._renderDownload([o]).replaceAll(e),a._forceReflow(t),a._transition(t).done(function(){i.context=n(this),a._trigger("completed",null,i),a._trigger("finished",null,i),r.resolve()})})}):(t=a._renderDownload(s)[a.options.prependFiles?"prependTo":"appendTo"](a.options.filesContainer),a._forceReflow(t),r=a._addFinishedDeferreds(),a._transition(t).done(function(){i.context=n(this),a._trigger("completed",null,i),a._trigger("finished",null,i),r.resolve()}))},fail:function(e,i){if(e.isDefaultPrevented())return!1;var t,r,a=n(this).data("blueimp-fileuploadui")||n(this).data("fileupload");i.context?i.context.each(function(e){if("abort"!==i.errorThrown){var o=i.files[e];o.error=o.error||i.errorThrown||!0,r=a._addFinishedDeferreds(),a._transition(n(this)).done(function(){var e=n(this);t=a._renderDownload([o]).replaceAll(e),a._forceReflow(t),a._transition(t).done(function(){i.context=n(this),a._trigger("failed",null,i),a._trigger("finished",null,i),r.resolve()})})}else r=a._addFinishedDeferreds(),a._transition(n(this)).done(function(){n(this).remove(),a._trigger("failed",null,i),a._trigger("finished",null,i),r.resolve()})}):"abort"!==i.errorThrown?(i.context=a._renderUpload(i.files)[a.options.prependFiles?"prependTo":"appendTo"](a.options.filesContainer).data("data",i),a._forceReflow(i.context),r=a._addFinishedDeferreds(),a._transition(i.context).done(function(){i.context=n(this),a._trigger("failed",null,i),a._trigger("finished",null,i),r.resolve()})):(a._trigger("failed",null,i),a._trigger("finished",null,i),a._addFinishedDeferreds().resolve())},progress:function(e,i){if(e.isDefaultPrevented())return!1;var t=Math.floor(i.loaded/i.total*100);i.context&&i.context.each(function(){n(this).find(".progress").attr("aria-valuenow",t).children().first().css("width",t+"%")})},progressall:function(e,i){var t=n(this),r=Math.floor(i.loaded/i.total*100),a=t.find(".fileupload-progress"),o=a.find(".progress-extended");o.length&&o.html((t.data("blueimp-fileuploadui")||t.data("fileupload"))._renderExtendedProgress(i)),a.find(".progress").attr("aria-valuenow",r).children().first().css("width",r+"%")},start:function(e){if(e.isDefaultPrevented())return!1;var i=n(this).data("blueimp-fileuploadui")||n(this).data("fileupload");i._resetFinishedDeferreds(),i._transition(n(this).find(".fileupload-progress")).done(function(){i._trigger("started",null)})},stop:function(e){if(e.isDefaultPrevented())return!1;var i=n(this).data("blueimp-fileuploadui")||n(this).data("fileupload"),t=i._addFinishedDeferreds();n.when.apply(n,i._getFinishedDeferreds()).done(function(){i._trigger("stopped",null)}),i._transition(n(this).find(".fileupload-progress")).done(function(){n(this).find(".progress").attr("aria-valuenow","0").children().first().css("width","0%"),n(this).find(".progress-extended").html("&nbsp;"),t.resolve()})},processstart:function(e){if(e.isDefaultPrevented())return!1;n(this).addClass("fileupload-processing")},processstop:function(e){if(e.isDefaultPrevented())return!1;n(this).removeClass("fileupload-processing")},destroy:function(e,i){var t=n(this).data("blueimp-fileuploadui")||n(this).data("fileupload"),r=function(){t._transition(i.context).done(function(){n(this).remove(),t._trigger("destroyed",null,i)})};i.url?(i.dataType=i.dataType||t.options.dataType,n.ajax(i).done(r).fail(function(){t._trigger("destroyfailed",null,i)})):r()}},_resetFinishedDeferreds:function(){this._finishedUploads=[]},_addFinishedDeferreds:function(e){return e||(e=n.Deferred()),this._finishedUploads.push(e),e},_getFinishedDeferreds:function(){return this._finishedUploads},_enableDragToDesktop:function(){var e=n(this),i=e.prop("href"),t=e.prop("download"),r="application/octet-stream";e.bind("dragstart",function(e){try{e.originalEvent.dataTransfer.setData("DownloadURL",[r,t,i].join(":"))}catch(e){}})},_formatFileSize:function(e){return"number"!=typeof e?"":e>=1e9?(e/1e9).toFixed(2)+" GB":e>=1e6?(e/1e6).toFixed(2)+" MB":(e/1e3).toFixed(2)+" KB"},_formatBitrate:function(e){return"number"!=typeof e?"":e>=1e9?(e/1e9).toFixed(2)+" Gbit/s":e>=1e6?(e/1e6).toFixed(2)+" Mbit/s":e>=1e3?(e/1e3).toFixed(2)+" kbit/s":e.toFixed(2)+" bit/s"},_formatTime:function(e){var i=new Date(1e3*e),t=Math.floor(e/86400);return(t=t?t+"d ":"")+("0"+i.getUTCHours()).slice(-2)+":"+("0"+i.getUTCMinutes()).slice(-2)+":"+("0"+i.getUTCSeconds()).slice(-2)},_formatPercentage:function(e){return(100*e).toFixed(2)+" %"},_renderExtendedProgress:function(e){return this._formatBitrate(e.bitrate)+" | "+this._formatTime(8*(e.total-e.loaded)/e.bitrate)+" | "+this._formatPercentage(e.loaded/e.total)+" | "+this._formatFileSize(e.loaded)+" / "+this._formatFileSize(e.total)},_renderTemplate:function(e,i){if(!e)return n();var t=e({files:i,formatFileSize:this._formatFileSize,options:this.options});return t instanceof n?t:n(this.options.templatesContainer).html(t).children()},_renderPreviews:function(e){e.context.find(".preview").each(function(i,t){n(t).append(e.files[i].preview)})},_renderUpload:function(e){return this._renderTemplate(this.options.uploadTemplate,e)},_renderDownload:function(e){return this._renderTemplate(this.options.downloadTemplate,e).find("a[download]").each(this._enableDragToDesktop).end()},_startHandler:function(e){e.preventDefault();var i=n(e.currentTarget),t=i.closest(".template-upload"),r=t.data("data");i.prop("disabled",!0),r&&r.submit&&r.submit()},_cancelHandler:function(e){e.preventDefault();var i=n(e.currentTarget).closest(".template-upload,.template-download"),t=i.data("data")||{};t.context=t.context||i,t.abort?t.abort():(t.errorThrown="abort",this._trigger("fail",null,t))},_deleteHandler:function(e){e.preventDefault();var i=n(e.currentTarget);this._trigger("destroy",null,n.extend({context:i.closest(".template-download"),type:"DELETE"},i.data()))},_forceReflow:function(e){return n.support.transition&&e.length&&e[0].offsetWidth},_transition:function(e){var i=n.Deferred();return n.support.transition&&e.hasClass("fade")&&e.is(":visible")?e.bind(n.support.transition.end,function(t){t.target===e[0]&&(e.unbind(n.support.transition.end),i.resolveWith(e))}).toggleClass("in"):(e.toggleClass("in"),i.resolveWith(e)),i},_initButtonBarEventHandlers:function(){var e=this.element.find(".fileupload-buttonbar"),i=this.options.filesContainer;this._on(e.find(".start"),{click:function(e){e.preventDefault(),i.find(".start").click()}}),this._on(e.find(".cancel"),{click:function(e){e.preventDefault(),i.find(".cancel").click()}}),this._on(e.find(".delete"),{click:function(t){t.preventDefault(),i.find(".toggle:checked").closest(".template-download").find(".delete").click(),e.find(".toggle").prop("checked",!1)}}),this._on(e.find(".toggle"),{change:function(e){i.find(".toggle").prop("checked",n(e.currentTarget).is(":checked"))}})},_destroyButtonBarEventHandlers:function(){this._off(this.element.find(".fileupload-buttonbar").find(".start, .cancel, .delete"),"click"),this._off(this.element.find(".fileupload-buttonbar .toggle"),"change.")},_initEventHandlers:function(){this._on(this.options.filesContainer,{"click .start":this._startHandler,"click .cancel":this._cancelHandler,"click .delete":this._deleteHandler}),this._initButtonBarEventHandlers()},_destroyEventHandlers:function(){this._destroyButtonBarEventHandlers(),this._off(this.options.filesContainer,"click"),this._super()},_enableFileInputButton:function(){this.element.find(".fileinput-button input").prop("disabled",!1).parent().removeClass("disabled")},_disableFileInputButton:function(){this.element.find(".fileinput-button input").prop("disabled",!0).parent().addClass("disabled")},_initTemplates:function(){var e=this.options;e.templatesContainer=this.document[0].createElement(e.filesContainer.prop("nodeName")),r&&(e.uploadTemplateId&&(e.uploadTemplate=r(e.uploadTemplateId)),e.downloadTemplateId&&(e.downloadTemplate=r(e.downloadTemplateId)))},_initFilesContainer:function(){var e=this.options;void 0===e.filesContainer?e.filesContainer=this.element.find(".files"):e.filesContainer instanceof n||(e.filesContainer=n(e.filesContainer))},_initSpecialOptions:function(){this._initFilesContainer(),this._initTemplates()},_create:function(){this._super(),this._processing=0,this._processingQueue=n.Deferred().resolveWith(this).promise(),this._initSpecialOptions(),this._initEventHandlers(),this._uploader=t(this.element,this.options),this._resetFinishedDeferreds(),n.support.fileInput||this._disableFileInputButton()},enable:function(){var e=!1;this.options.disabled&&(e=!0),this._super(),e&&(this.element.find("input, button").prop("disabled",!1),this._enableFileInputButton())},disable:function(){this.options.disabled||(this.element.find("input, button").prop("disabled",!0),this._disableFileInputButton()),this._super()}}),n}),e("skylark-blueimp-uploader/addons/image",["skylark-langx/langx","skylark-utils-dom/eventer","skylark-utils-imagex","skylark-jquery","../fileupload-ui"],function(e,i,t,n){"use strict";return n.blueimp.fileuploadui.prototype.options.processQueue.unshift({action:"loadImageMetaData",disableImageHead:"@",disableExif:"@",disableExifThumbnail:"@",disableExifSub:"@",disableExifGps:"@",disabled:"@disableImageMetaDataLoad"},{action:"loadImage",prefix:!0,fileTypes:"@",maxFileSize:"@",noRevoke:"@",disabled:"@disableImageLoad"},{action:"resizeImage",prefix:"image",maxWidth:"@",maxHeight:"@",minWidth:"@",minHeight:"@",crop:"@",orientation:"@",forceResize:"@",disabled:"@disableImageResize"},{action:"saveImage",quality:"@imageQuality",type:"@imageType",disabled:"@disableImageResize"},{action:"saveImageMetaData",disabled:"@disableImageMetaDataSave"},{action:"resizeImage",prefix:"preview",maxWidth:"@",maxHeight:"@",minWidth:"@",minHeight:"@",crop:"@",orientation:"@",thumbnail:"@",canvas:"@",disabled:"@disableImagePreview"},{action:"setImage",name:"@imagePreviewName",disabled:"@disableImagePreview"},{action:"deleteImageReferences",disabled:"@disableImageReferencesDeletion"}),n.widget("blueimp.fileuploadui",n.blueimp.fileuploadui,{options:{loadImageFileTypes:/^image\/(gif|jpeg|png|svg\+xml)$/,loadImageMaxFileSize:1e7,imageMaxWidth:1920,imageMaxHeight:1080,imageOrientation:!1,imageCrop:!1,disableImageResize:!0,previewMaxWidth:80,previewMaxHeight:80,previewOrientation:!0,previewThumbnail:!0,previewCrop:!1,previewCanvas:!0},processActions:{loadImage:function(e,i){if(i.disabled)return e;var r=this,a=e.files[e.index],o=n.Deferred();return"number"===n.type(i.maxFileSize)&&a.size>i.maxFileSize||i.fileTypes&&!i.fileTypes.test(a.type)||!t.loadFile(a,function(i){i.src&&(e.img=i),o.resolveWith(r,[e])},i)?e:o.promise()},resizeImage:function(e,i){if(i.disabled||!e.canvas&&!e.img)return e;i=n.extend({canvas:!0},i);var r,a=this,o=n.Deferred(),s=i.canvas&&e.canvas||e.img,l=function(t){t&&(t.width!==s.width||t.height!==s.height||i.forceResize)&&(e[t.getContext?"canvas":"img"]=t),e.preview=t,o.resolveWith(a,[e])};if(e.exif){if(!0===i.orientation&&(i.orientation=e.exif.get("Orientation")),i.thumbnail&&(r=e.exif.get("Thumbnail")))return t.loadFile(r,l,i),o.promise();e.orientation?delete i.orientation:e.orientation=i.orientation}return s?(l(t.scale(s,i)),o.promise()):e},saveImage:function(e,i){if(!e.canvas||i.disabled)return e;var t=this,r=e.files[e.index],a=n.Deferred();return e.canvas.toBlob?(e.canvas.toBlob(function(i){i.name||(r.type===i.type?i.name=r.name:r.name&&(i.name=r.name.replace(/\..+$/,"."+i.type.substr(6)))),r.type!==i.type&&delete e.imageHead,e.files[e.index]=i,a.resolveWith(t,[e])},i.type||r.type,i.quality),a.promise()):e},loadImageMetaData:function(e,i){if(i.disabled)return e;var r=this,a=n.Deferred();return t.meta.parseMetaData(e.files[e.index],function(i){n.extend(e,i),a.resolveWith(r,[e,"aaa"])},i),a.promise()},saveImageMetaData:function(e,i){if(!(e.imageHead&&e.canvas&&e.canvas.toBlob)||i.disabled)return e;var t=e.files[e.index],n=new Blob([e.imageHead,this._blobSlice.call(t,20)],{type:t.type});return n.name=t.name,e.files[e.index]=n,e},setImage:function(e,i){return e.preview&&!i.disabled&&(e.files[e.index][i.name||"preview"]=e.preview),e},deleteImageReferences:function(e,i){return i.disabled||(delete e.img,delete e.canvas,delete e.preview,delete e.imageHead),e}}}),n}),e("skylark-blueimp-uploader/addons/audio",["skylark-langx/langx","skylark-utils-dom/eventer","skylark-utils-imagex","skylark-jquery","../fileupload-ui"],function(e,i,t,n){"use strict";return n.blueimp.fileuploadui.prototype.options.processQueue.unshift({action:"loadAudio",prefix:!0,fileTypes:"@",maxFileSize:"@",disabled:"@disableAudioPreview"},{action:"setAudio",name:"@audioPreviewName",disabled:"@disableAudioPreview"}),n.widget("blueimp.fileuploadui",n.blueimp.fileuploadui,{options:{loadAudioFileTypes:/^audio\/.*$/},_audioElement:document.createElement("audio"),processActions:{loadAudio:function(e,i){if(i.disabled)return e;var r,a,o=e.files[e.index];return this._audioElement.canPlayType&&this._audioElement.canPlayType(o.type)&&("number"!==n.type(i.maxFileSize)||o.size<=i.maxFileSize)&&(!i.fileTypes||i.fileTypes.test(o.type))&&(r=t.createObjectURL(o))?((a=this._audioElement.cloneNode(!1)).src=r,a.controls=!0,e.audio=a,e):e},setAudio:function(e,i){return e.audio&&!i.disabled&&(e.files[e.index][i.name||"preview"]=e.audio),e}}}),n}),e("skylark-blueimp-uploader/addons/video",["skylark-langx/langx","skylark-utils-dom/eventer","skylark-utils-imagex","skylark-jquery","../fileupload-ui"],function(e,i,t,n){"use strict";return n.blueimp.fileuploadui.prototype.options.processQueue.unshift({action:"loadVideo",prefix:!0,fileTypes:"@",maxFileSize:"@",disabled:"@disableVideoPreview"},{action:"setVideo",name:"@videoPreviewName",disabled:"@disableVideoPreview"}),n.widget("blueimp.fileuploadui",n.blueimp.fileuploadui,{options:{loadVideoFileTypes:/^video\/.*$/},_videoElement:document.createElement("video"),processActions:{loadVideo:function(e,i){if(i.disabled)return e;var t,r,a=e.files[e.index];return this._videoElement.canPlayType&&this._videoElement.canPlayType(a.type)&&("number"!==n.type(i.maxFileSize)||a.size<=i.maxFileSize)&&(!i.fileTypes||i.fileTypes.test(a.type))&&(t=loadImage.createObjectURL(a))?((r=this._videoElement.cloneNode(!1)).src=t,r.controls=!0,e.video=r,e):e},setVideo:function(e,i){return e.video&&!i.disabled&&(e.files[e.index][i.name||"preview"]=e.video),e}}}),n}),e("skylark-blueimp-uploader/addons/validate",["skylark-langx/langx","skylark-utils-dom/eventer","skylark-jquery","../fileupload-ui"],function(e,i,t){"use strict";return t.blueimp.fileuploadui.prototype.options.processQueue.push({action:"validate",always:!0,acceptFileTypes:"@",maxFileSize:"@",minFileSize:"@",maxNumberOfFiles:"@",disabled:"@disableValidation"}),t.widget("blueimp.fileuploadui",t.blueimp.fileuploadui,{options:{getNumberOfFiles:t.noop,messages:{maxNumberOfFiles:"Maximum number of files exceeded",acceptFileTypes:"File type not allowed",maxFileSize:"File is too large",minFileSize:"File is too small"}},processActions:{validate:function(e,i){if(i.disabled)return e;var n,r=t.Deferred(),a=this.options,o=e.files[e.index];return(i.minFileSize||i.maxFileSize)&&(n=o.size),"number"===t.type(i.maxNumberOfFiles)&&(a.getNumberOfFiles()||0)+e.files.length>i.maxNumberOfFiles?o.error=a.i18n("maxNumberOfFiles"):!i.acceptFileTypes||i.acceptFileTypes.test(o.type)||i.acceptFileTypes.test(o.name)?n>i.maxFileSize?o.error=a.i18n("maxFileSize"):"number"===t.type(n)&&n<i.minFileSize?o.error=a.i18n("minFileSize"):delete o.error:o.error=a.i18n("acceptFileTypes"),o.error||e.files.error?(e.files.error=!0,r.rejectWith(this,[e])):r.resolveWith(this,[e]),r.promise()}}}),t}),e("skylark-blueimp-uploader/main",["./fileupload-ui","./addons/image","./addons/audio","./addons/video","./addons/validate"],function(e){return e}),e("skylark-blueimp-uploader",["skylark-blueimp-uploader/main"],function(e){return e})}(t),!r){var s=n("skylark-langx/skylark");a?module.exports=s:i.skylarkjs=s}}(0,this);
//# sourceMappingURL=sourcemaps/skylark-blueimp-uploader.js.map
