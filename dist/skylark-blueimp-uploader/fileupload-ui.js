/**
 * skylark-blueimp-uploader - The skylark file uploader
 * @author Hudaokeji, Inc.
 * @version v0.0.1
 * @link https://github.com/skylark-integration/skylark-blueimp-uploader/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-utils-dom/eventer","skylark-utils-filer/uploader","skylark-jquery","./tmpl"],function(e,t,i,n,r){"use strict";return n.widget("blueimp.fileuploadui",{processActions:{},_processFile:function(e,t){var i=n.skylark.langx,r=this,o=i.map(e.processQueue,function(e){return function(t){return r.processActions[e.action].call(r,t,e)}});return i.async.waterful(o,[e],r)},_transformProcessQueue:function(e){var t=[];n.each(e.processQueue,function(){var i={},r=this.action,o=!0===this.prefix?r:this.prefix;n.each(this,function(t,r){"string"===n.type(r)&&"@"===r.charAt(0)?i[t]=e[r.slice(1)||(o?o+t.charAt(0).toUpperCase()+t.slice(1):t)]:i[t]=r}),t.push(i)}),e.processQueue=t},processing:function(){return this._processing},process:function(e){var t=this,i=n.extend({},this.options,e);return i.processQueue&&i.processQueue.length&&(this._transformProcessQueue(i),0===this._processing&&this._trigger("processstart"),n.each(e.files,function(r){var o=r?n.extend({},i):i,s=function(){return e.errorThrown?n.Deferred().rejectWith(t,[e]).promise():t._processFile(o,e)};o.index=r,t._processing+=1,t._processingQueue=t._processingQueue.pipe(s,s).always(function(){t._processing-=1,0===t._processing&&t._trigger("processstop")})})),this._processingQueue},options:{processQueue:[],autoUpload:!1,uploadTemplateId:"template-upload",downloadTemplateId:"template-download",filesContainer:void 0,prependFiles:!1,dataType:"json",getNumberOfFiles:function(){return this.filesContainer.children().not(".processing").length},getFilesFromResponse:function(e){return e.result&&n.isArray(e.result.files)?e.result.files:[]},add:function(e,t){var i=n(this),r=i.data("blueimp-fileuploadui")||i.data("fileupload"),o=r.options;t.context=r._renderUpload(t.files).data("data",t).addClass("processing"),o.filesContainer[o.prependFiles?"prepend":"append"](t.context),r._forceReflow(t.context),r._transition(t.context),i.fileuploadui("process",t).always(function(){t.context.each(function(e){n(this).find(".size").text(r._formatFileSize(t.files[e].size))}).removeClass("processing"),r._renderPreviews(t)}).done(function(){t.context.find(".start").prop("disabled",!1),!1!==r._trigger("added",null,t)&&(o.autoUpload||t.autoUpload)&&!1!==t.autoUpload&&t.submit()}).fail(function(){t.files.error&&t.context.each(function(e){var i=t.files[e].error;i&&n(this).find(".error").text(i)})})},send:function(e,t){if(e.isDefaultPrevented())return!1;var i=n(this).data("blueimp-fileuploadui")||n(this).data("fileupload");return t.context&&t.dataType&&"iframe"===t.dataType.substr(0,6)&&t.context.find(".progress").addClass(!n.support.transition&&"progress-animated").attr("aria-valuenow",100).children().first().css("width","100%"),i._trigger("sent",null,t)},done:function(e,t){if(e.isDefaultPrevented())return!1;var i,r,o=n(this).data("blueimp-fileuploadui")||n(this).data("fileupload"),s=(t.getFilesFromResponse||o.options.getFilesFromResponse)(t);t.context?t.context.each(function(e){var a=s[e]||{error:"Empty file upload result"};r=o._addFinishedDeferreds(),o._transition(n(this)).done(function(){var e=n(this);i=o._renderDownload([a]).replaceAll(e),o._forceReflow(i),o._transition(i).done(function(){t.context=n(this),o._trigger("completed",null,t),o._trigger("finished",null,t),r.resolve()})})}):(i=o._renderDownload(s)[o.options.prependFiles?"prependTo":"appendTo"](o.options.filesContainer),o._forceReflow(i),r=o._addFinishedDeferreds(),o._transition(i).done(function(){t.context=n(this),o._trigger("completed",null,t),o._trigger("finished",null,t),r.resolve()}))},fail:function(e,t){if(e.isDefaultPrevented())return!1;var i,r,o=n(this).data("blueimp-fileuploadui")||n(this).data("fileupload");t.context?t.context.each(function(e){if("abort"!==t.errorThrown){var s=t.files[e];s.error=s.error||t.errorThrown||!0,r=o._addFinishedDeferreds(),o._transition(n(this)).done(function(){var e=n(this);i=o._renderDownload([s]).replaceAll(e),o._forceReflow(i),o._transition(i).done(function(){t.context=n(this),o._trigger("failed",null,t),o._trigger("finished",null,t),r.resolve()})})}else r=o._addFinishedDeferreds(),o._transition(n(this)).done(function(){n(this).remove(),o._trigger("failed",null,t),o._trigger("finished",null,t),r.resolve()})}):"abort"!==t.errorThrown?(t.context=o._renderUpload(t.files)[o.options.prependFiles?"prependTo":"appendTo"](o.options.filesContainer).data("data",t),o._forceReflow(t.context),r=o._addFinishedDeferreds(),o._transition(t.context).done(function(){t.context=n(this),o._trigger("failed",null,t),o._trigger("finished",null,t),r.resolve()})):(o._trigger("failed",null,t),o._trigger("finished",null,t),o._addFinishedDeferreds().resolve())},progress:function(e,t){if(e.isDefaultPrevented())return!1;var i=Math.floor(t.loaded/t.total*100);t.context&&t.context.each(function(){n(this).find(".progress").attr("aria-valuenow",i).children().first().css("width",i+"%")})},progressall:function(e,t){var i=n(this),r=Math.floor(t.loaded/t.total*100),o=i.find(".fileupload-progress"),s=o.find(".progress-extended");s.length&&s.html((i.data("blueimp-fileuploadui")||i.data("fileupload"))._renderExtendedProgress(t)),o.find(".progress").attr("aria-valuenow",r).children().first().css("width",r+"%")},start:function(e){if(e.isDefaultPrevented())return!1;var t=n(this).data("blueimp-fileuploadui")||n(this).data("fileupload");t._resetFinishedDeferreds(),t._transition(n(this).find(".fileupload-progress")).done(function(){t._trigger("started",null)})},stop:function(e){if(e.isDefaultPrevented())return!1;var t=n(this).data("blueimp-fileuploadui")||n(this).data("fileupload"),i=t._addFinishedDeferreds();n.when.apply(n,t._getFinishedDeferreds()).done(function(){t._trigger("stopped",null)}),t._transition(n(this).find(".fileupload-progress")).done(function(){n(this).find(".progress").attr("aria-valuenow","0").children().first().css("width","0%"),n(this).find(".progress-extended").html("&nbsp;"),i.resolve()})},processstart:function(e){if(e.isDefaultPrevented())return!1;n(this).addClass("fileupload-processing")},processstop:function(e){if(e.isDefaultPrevented())return!1;n(this).removeClass("fileupload-processing")},destroy:function(e,t){var i=n(this).data("blueimp-fileuploadui")||n(this).data("fileupload"),r=function(){i._transition(t.context).done(function(){n(this).remove(),i._trigger("destroyed",null,t)})};t.url?(t.dataType=t.dataType||i.options.dataType,n.ajax(t).done(r).fail(function(){i._trigger("destroyfailed",null,t)})):r()}},_resetFinishedDeferreds:function(){this._finishedUploads=[]},_addFinishedDeferreds:function(e){return e||(e=n.Deferred()),this._finishedUploads.push(e),e},_getFinishedDeferreds:function(){return this._finishedUploads},_enableDragToDesktop:function(){var e=n(this),t=e.prop("href"),i=e.prop("download"),r="application/octet-stream";e.bind("dragstart",function(e){try{e.originalEvent.dataTransfer.setData("DownloadURL",[r,i,t].join(":"))}catch(e){}})},_formatFileSize:function(e){return"number"!=typeof e?"":e>=1e9?(e/1e9).toFixed(2)+" GB":e>=1e6?(e/1e6).toFixed(2)+" MB":(e/1e3).toFixed(2)+" KB"},_formatBitrate:function(e){return"number"!=typeof e?"":e>=1e9?(e/1e9).toFixed(2)+" Gbit/s":e>=1e6?(e/1e6).toFixed(2)+" Mbit/s":e>=1e3?(e/1e3).toFixed(2)+" kbit/s":e.toFixed(2)+" bit/s"},_formatTime:function(e){var t=new Date(1e3*e),i=Math.floor(e/86400);return(i=i?i+"d ":"")+("0"+t.getUTCHours()).slice(-2)+":"+("0"+t.getUTCMinutes()).slice(-2)+":"+("0"+t.getUTCSeconds()).slice(-2)},_formatPercentage:function(e){return(100*e).toFixed(2)+" %"},_renderExtendedProgress:function(e){return this._formatBitrate(e.bitrate)+" | "+this._formatTime(8*(e.total-e.loaded)/e.bitrate)+" | "+this._formatPercentage(e.loaded/e.total)+" | "+this._formatFileSize(e.loaded)+" / "+this._formatFileSize(e.total)},_renderTemplate:function(e,t){if(!e)return n();var i=e({files:t,formatFileSize:this._formatFileSize,options:this.options});return i instanceof n?i:n(this.options.templatesContainer).html(i).children()},_renderPreviews:function(e){e.context.find(".preview").each(function(t,i){n(i).append(e.files[t].preview)})},_renderUpload:function(e){return this._renderTemplate(this.options.uploadTemplate,e)},_renderDownload:function(e){return this._renderTemplate(this.options.downloadTemplate,e).find("a[download]").each(this._enableDragToDesktop).end()},_startHandler:function(e){e.preventDefault();var t=n(e.currentTarget),i=t.closest(".template-upload").data("data");t.prop("disabled",!0),i&&i.submit&&i.submit()},_cancelHandler:function(e){e.preventDefault();var t=n(e.currentTarget).closest(".template-upload,.template-download"),i=t.data("data")||{};i.context=i.context||t,i.abort?i.abort():(i.errorThrown="abort",this._trigger("fail",null,i))},_deleteHandler:function(e){e.preventDefault();var t=n(e.currentTarget);this._trigger("destroy",null,n.extend({context:t.closest(".template-download"),type:"DELETE"},t.data()))},_forceReflow:function(e){return n.support.transition&&e.length&&e[0].offsetWidth},_transition:function(e){var t=n.Deferred();return n.support.transition&&e.hasClass("fade")&&e.is(":visible")?e.bind(n.support.transition.end,function(i){i.target===e[0]&&(e.unbind(n.support.transition.end),t.resolveWith(e))}).toggleClass("in"):(e.toggleClass("in"),t.resolveWith(e)),t},_initButtonBarEventHandlers:function(){var e=this.element.find(".fileupload-buttonbar"),t=this.options.filesContainer;this._on(e.find(".start"),{click:function(e){e.preventDefault(),t.find(".start").click()}}),this._on(e.find(".cancel"),{click:function(e){e.preventDefault(),t.find(".cancel").click()}}),this._on(e.find(".delete"),{click:function(i){i.preventDefault(),t.find(".toggle:checked").closest(".template-download").find(".delete").click(),e.find(".toggle").prop("checked",!1)}}),this._on(e.find(".toggle"),{change:function(e){t.find(".toggle").prop("checked",n(e.currentTarget).is(":checked"))}})},_destroyButtonBarEventHandlers:function(){this._off(this.element.find(".fileupload-buttonbar").find(".start, .cancel, .delete"),"click"),this._off(this.element.find(".fileupload-buttonbar .toggle"),"change.")},_initEventHandlers:function(){this._on(this.options.filesContainer,{"click .start":this._startHandler,"click .cancel":this._cancelHandler,"click .delete":this._deleteHandler}),this._initButtonBarEventHandlers()},_destroyEventHandlers:function(){this._destroyButtonBarEventHandlers(),this._off(this.options.filesContainer,"click"),this._super()},_enableFileInputButton:function(){this.element.find(".fileinput-button input").prop("disabled",!1).parent().removeClass("disabled")},_disableFileInputButton:function(){this.element.find(".fileinput-button input").prop("disabled",!0).parent().addClass("disabled")},_initTemplates:function(){var e=this.options;e.templatesContainer=this.document[0].createElement(e.filesContainer.prop("nodeName")),r&&(e.uploadTemplateId&&(e.uploadTemplate=r(e.uploadTemplateId)),e.downloadTemplateId&&(e.downloadTemplate=r(e.downloadTemplateId)))},_initFilesContainer:function(){var e=this.options;void 0===e.filesContainer?e.filesContainer=this.element.find(".files"):e.filesContainer instanceof n||(e.filesContainer=n(e.filesContainer))},_initSpecialOptions:function(){this._initFilesContainer(),this._initTemplates()},_create:function(){this._super(),this._processing=0,this._processingQueue=n.Deferred().resolveWith(this).promise(),this._initSpecialOptions(),this._initEventHandlers(),this._uploader=i(this.element,this.options),this._resetFinishedDeferreds(),n.support.fileInput||this._disableFileInputButton()},enable:function(){var e=!1;this.options.disabled&&(e=!0),this._super(),e&&(this.element.find("input, button").prop("disabled",!1),this._enableFileInputButton())},disable:function(){this.options.disabled||(this.element.find("input, button").prop("disabled",!0),this._disableFileInputButton()),this._super()}}),n});
//# sourceMappingURL=sourcemaps/fileupload-ui.js.map
