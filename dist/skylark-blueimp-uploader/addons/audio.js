/**
 * skylark-blueimp-uploader - The skylark file uploader
 * @author Hudaokeji, Inc.
 * @version v0.0.1
 * @link https://github.com/skylark-integration/skylark-blueimp-uploader/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-utils-dom/eventer","skylark-utils-imagex","skylark-jquery","../fileupload-ui"],function(e,i,l,a){"use strict";return a.blueimp.fileuploadui.prototype.options.processQueue.unshift({action:"loadAudio",prefix:!0,fileTypes:"@",maxFileSize:"@",disabled:"@disableAudioPreview"},{action:"setAudio",name:"@audioPreviewName",disabled:"@disableAudioPreview"}),a.widget("blueimp.fileuploadui",a.blueimp.fileuploadui,{options:{loadAudioFileTypes:/^audio\/.*$/},_audioElement:document.createElement("audio"),processActions:{loadAudio:function(e,i){if(i.disabled)return e;var o,u,d=e.files[e.index];return this._audioElement.canPlayType&&this._audioElement.canPlayType(d.type)&&("number"!==a.type(i.maxFileSize)||d.size<=i.maxFileSize)&&(!i.fileTypes||i.fileTypes.test(d.type))&&(o=l.createObjectURL(d))?((u=this._audioElement.cloneNode(!1)).src=o,u.controls=!0,e.audio=u,e):e},setAudio:function(e,i){return e.audio&&!i.disabled&&(e.files[e.index][i.name||"preview"]=e.audio),e}}}),a});
//# sourceMappingURL=../sourcemaps/addons/audio.js.map
