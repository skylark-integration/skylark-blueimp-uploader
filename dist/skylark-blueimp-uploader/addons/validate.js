/**
 * skylark-blueimp-uploader - The skylark file uploader
 * @author Hudaokeji, Inc.
 * @version v0.0.1
 * @link https://github.com/skylark-integration/skylark-blueimp-uploader/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-utils-dom/eventer","skylark-jquery","../fileupload-ui"],function(e,i,l){"use strict";return l.blueimp.fileuploadui.prototype.options.processQueue.push({action:"validate",always:!0,acceptFileTypes:"@",maxFileSize:"@",minFileSize:"@",maxNumberOfFiles:"@",disabled:"@disableValidation"}),l.widget("blueimp.fileuploadui",l.blueimp.fileuploadui,{options:{getNumberOfFiles:l.noop,messages:{maxNumberOfFiles:"Maximum number of files exceeded",acceptFileTypes:"File type not allowed",maxFileSize:"File is too large",minFileSize:"File is too small"}},processActions:{validate:function(e,i){if(i.disabled)return e;var r,s=l.Deferred(),t=this.options,a=e.files[e.index];return(i.minFileSize||i.maxFileSize)&&(r=a.size),"number"===l.type(i.maxNumberOfFiles)&&(t.getNumberOfFiles()||0)+e.files.length>i.maxNumberOfFiles?a.error=t.i18n("maxNumberOfFiles"):!i.acceptFileTypes||i.acceptFileTypes.test(a.type)||i.acceptFileTypes.test(a.name)?r>i.maxFileSize?a.error=t.i18n("maxFileSize"):"number"===l.type(r)&&r<i.minFileSize?a.error=t.i18n("minFileSize"):delete a.error:a.error=t.i18n("acceptFileTypes"),a.error||e.files.error?(e.files.error=!0,s.rejectWith(this,[e])):s.resolveWith(this,[e]),s.promise()}}}),l});
//# sourceMappingURL=../sourcemaps/addons/validate.js.map
