/**
 * skylark-blueimp-uploader - The skylark file uploader
 * @author Hudaokeji, Inc.
 * @version v0.0.1
 * @link https://github.com/skylark-integration/skylark-blueimp-uploader/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-utils-dom/eventer","skylark-utils-imagex","skylark-jquery","../fileupload-ui"],function(e,i,l,o){"use strict";return o.blueimp.fileuploadui.prototype.options.processQueue.unshift({action:"loadVideo",prefix:!0,fileTypes:"@",maxFileSize:"@",disabled:"@disableVideoPreview"},{action:"setVideo",name:"@videoPreviewName",disabled:"@disableVideoPreview"}),o.widget("blueimp.fileuploadui",o.blueimp.fileuploadui,{options:{loadVideoFileTypes:/^video\/.*$/},_videoElement:document.createElement("video"),processActions:{loadVideo:function(e,i){if(i.disabled)return e;var l,d,t=e.files[e.index];return this._videoElement.canPlayType&&this._videoElement.canPlayType(t.type)&&("number"!==o.type(i.maxFileSize)||t.size<=i.maxFileSize)&&(!i.fileTypes||i.fileTypes.test(t.type))&&(l=loadImage.createObjectURL(t))?((d=this._videoElement.cloneNode(!1)).src=l,d.controls=!0,e.video=d,e):e},setVideo:function(e,i){return e.video&&!i.disabled&&(e.files[e.index][i.name||"preview"]=e.video),e}}}),o});
//# sourceMappingURL=../sourcemaps/addons/video.js.map
