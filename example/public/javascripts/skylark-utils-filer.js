/**
 * skylark-utils-filer - The filer features enhancement for skylark utils.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.1
 * @link www.skylarkjs.org
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx/skylark");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('skylark-utils-filer/filer',[
    "skylark-langx/skylark"
], function(skylark) {

    function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }


    var filer = function() {
        return filer;
    };

    return skylark.filer = filer;
});
define('skylark-utils-filer/download',[
    "./filer"
],function(filer){

    function downloadFile(data, name) {
        if (window.navigator.msSaveBlob) {
            if (types.isString(data)) {
                data = dataURItoBlob(data);
            }
            window.navigator.msSaveBlob(data, name);
        } else {
            var a = document.createElement('a');
            if (data instanceof Blob) {
                data = URL.createObjectURL(data);
            }
            a.href = data;
            a.setAttribute('download', name || 'noname');
            a.dispatchEvent(new CustomEvent('click'));
        }
    }

    return filer.downlad = downloadFile;

});

 define('skylark-utils-filer/webentry',[
    "skylark-langx/arrays",
    "skylark-langx/Deferred",
    "./filer"
],function(arrays,Deferred, filer){
    var concat = Array.prototype.concat;
    var webentry = (function() {
        function one(entry, path) {
            var d = new Deferred(),
                onError = function(e) {
                    d.reject(e);
                };

            path = path || '';
            if (entry.isFile) {
                entry.file(function(file) {
                    file.relativePath = path;
                    d.resolve(file);
                }, onError);
            } else if (entry.isDirectory) {
                var dirReader = entry.createReader();
                dirReader.readEntries(function(entries) {
                    all(
                        entries,
                        path + entry.name + '/'
                    ).then(function(files) {
                        d.resolve(files);
                    }).catch(onError);
                }, onError);
            } else {
                // Return an empy list for file system items
                // other than files or directories:
                d.resolve([]);
            }
            return d.promise;
        }

        function all(entries, path) {
            return Deferred.all(
                arrays.map(entries, function(entry) {
                    return one(entry, path);
                })
            ).then(function() {
                return concat.apply([], arguments);
            });
        }

        return {
            one: one,
            all: all
        };
    })();

    return filer.webentry = webentry;
});
  define('skylark-utils-filer/dropzone',[
    "skylark-langx/arrays",
    "skylark-langx/Deferred",
    "skylark-utils-dom/styler",
    "skylark-utils-dom/eventer",
    "./filer",
    "./webentry"
],function(arrays,Deferred, styler, eventer, filer, webentry){  /*
     * Make the specified element to could accept HTML5 file drag and drop.
     * @param {HTMLElement} elm
     * @param {PlainObject} params
     */
    function dropzone(elm, params) {
        params = params || {};
        var hoverClass = params.hoverClass || "dropzone",
            droppedCallback = params.dropped;

        var enterdCount = 0;
        eventer.on(elm, "dragenter", function(e) {
            if (e.dataTransfer && e.dataTransfer.types.indexOf("Files") > -1) {
                eventer.stop(e);
                enterdCount++;
                styler.addClass(elm, hoverClass)
            }
        });

        eventer.on(elm, "dragover", function(e) {
            if (e.dataTransfer && e.dataTransfer.types.indexOf("Files") > -1) {
                eventer.stop(e);
            }
        });

        eventer.on(elm, "dragleave", function(e) {
            if (e.dataTransfer && e.dataTransfer.types.indexOf("Files") > -1) {
                enterdCount--
                if (enterdCount == 0) {
                    styler.removeClass(elm, hoverClass);
                }
            }
        });

        eventer.on(elm, "drop", function(e) {
            if (e.dataTransfer && e.dataTransfer.types.indexOf("Files") > -1) {
                styler.removeClass(elm, hoverClass)
                eventer.stop(e);
                if (droppedCallback) {
                    var items = e.dataTransfer.items;
                    if (items && items.length && (items[0].webkitGetAsEntry ||
                            items[0].getAsEntry)) {
                        webentry.all(
                            arrays.map(items, function(item) {
                                if (item.webkitGetAsEntry) {
                                    return item.webkitGetAsEntry();
                                }
                                return item.getAsEntry();
                            })
                        ).then(droppedCallback);
                    } else {
                        droppedCallback(e.dataTransfer.files);
                    }
                }
            }
        });

        return this;
    }

     return filer.dropzone = dropzone;
});
define('skylark-utils-filer/pastezone',[
    "skylark-langx/objects",
    "skylark-utils-dom/eventer",
    "./filer"
],function(objects, eventer, filer){
    function pastezone(elm, params) {
        params = params || {};
        var hoverClass = params.hoverClass || "pastezone",
            pastedCallback = params.pasted;

        eventer.on(elm, "paste", function(e) {
            var items = e.originalEvent && e.originalEvent.clipboardData &&
                e.originalEvent.clipboardData.items,
                files = [];
            if (items && items.length) {
                objects.each(items, function(index, item) {
                    var file = item.getAsFile && item.getAsFile();
                    if (file) {
                        files.push(file);
                    }
                });
            }
            if (pastedCallback && files.length) {
                pastedCallback(files);
            }
        });

        return this;
    }

    return filer.pastezone = pastezone;

});

define('skylark-utils-filer/select',[
    "./filer"
],function(filer){
    var fileInput,
        fileInputForm,
        fileSelected,
        maxFileSize = 1 / 0;

    function select(params) {
        params = params || {};
        var directory = params.directory || false,
            multiple = params.multiple || false,
            fileSelected = params.picked;
        if (!fileInput) {
            var input = fileInput = document.createElement("input");

            function selectFiles(pickedFiles) {
                for (var i = pickedFiles.length; i--;) {
                    if (pickedFiles[i].size > maxFileSize) {
                        pickedFiles.splice(i, 1);
                    }
                }
                fileSelected(pickedFiles);
            }

            input.type = "file";
            input.style.position = "fixed";
            input.style.left = 0;
            input.style.top = 0;
            input.style.opacity = .001;
            document.body.appendChild(input);

            input.onchange = function(e) {
                var entries = e.target.webkitEntries || e.target.entries;

                if (entries && entries.length) {
                    webentry.all(entries).then(function(files) {
                        selectFiles(files);
                    });
                } else {
                    selectFiles(Array.prototype.slice.call(e.target.files));
                }
                // reset to "", so selecting the same file next time still trigger the change handler
                input.value = "";
            };
        }
        fileInput.multiple = multiple;
        fileInput.webkitdirectory = directory;
        fileInput.click();
    }

    return filer.select = select;
});


define('skylark-utils-filer/picker',[
    "skylark-langx/objects",
    "skylark-utils-dom/eventer",
    "./filer",
    "./select",
],function(objects, eventer, filer, select){
    /*
     * Make the specified element to pop-up the file selection dialog box when clicked , and read the contents the files selected from client file system by user.
     * @param {HTMLElement} elm
     * @param {PlainObject} params
     */
    function picker(elm, params) {
        eventer.on(elm, "click", function(e) {
            e.preventDefault();
            select(params);
        });
        return this;
    }

    return filer.picker = picker;

});



define('skylark-utils-filer/read',[
    "skylark-langx/Deferred",
    "./filer"
],function(Deferred, filer){

    function readFile(file, params) {
        params = params || {};
        var d = new Deferred,
            reader = new FileReader();

        reader.onload = function(evt) {
            d.resolve(evt.target.result);
        };
        reader.onerror = function(e) {
            var code = e.target.error.code;
            if (code === 2) {
                alert('please don\'t open this page using protocol fill:///');
            } else {
                alert('error code: ' + code);
            }
        };

        if (params.asArrayBuffer) {
            reader.readAsArrayBuffer(file);
        } else if (params.asDataUrl) {
            reader.readAsDataURL(file);
        } else if (params.asText) {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }

        return d.promise;
    }

    return filer.read = filer.readFile = readFile;
    
});

define('skylark-utils-filer/upload',[
	"skylark-langx/types",
	"skylark-langx/objects",
	"skylark-langx/arrays",
    "skylark-langx/Deferred",
	"skylark-langx/Xhr",
	"./filer"
],function(types, objects, arrays, Deferred,Xhr, filer){

    function upload(params) {
        var xoptions = objects.mixin({
            contentRange: null, //

            // The parameter name for the file form data (the request argument name).
            // If undefined or empty, the name property of the file input field is
            // used, or "files[]" if the file input name property is also empty,
            // can be a string or an array of strings:
            paramName: undefined,
            // By default, each file of a selection is uploaded using an individual
            // request for XHR type uploads. Set to false to upload file
            // selections in one request each:
            singleFileUploads: true,
            // To limit the number of files uploaded with one XHR request,
            // set the following option to an integer greater than 0:
            limitMultiFileUploads: undefined,
            // The following option limits the number of files uploaded with one
            // XHR request to keep the request size under or equal to the defined
            // limit in bytes:
            limitMultiFileUploadSize: undefined,
            // Multipart file uploads add a number of bytes to each uploaded file,
            // therefore the following option adds an overhead for each file used
            // in the limitMultiFileUploadSize configuration:
            limitMultiFileUploadSizeOverhead: 512,
            // Set the following option to true to issue all file upload requests
            // in a sequential order:
            sequentialUploads: false,
            // To limit the number of concurrent uploads,
            // set the following option to an integer greater than 0:
            limitConcurrentUploads: undefined,
            // By default, XHR file uploads are sent as multipart/form-data.
            // The iframe transport is always using multipart/form-data.
            // Set to false to enable non-multipart XHR uploads:
            multipart: true,
            // To upload large files in smaller chunks, set the following option
            // to a preferred maximum chunk size. If set to 0, null or undefined,
            // or the browser does not support the required Blob API, files will
            // be uploaded as a whole.
            maxChunkSize: undefined,
            // When a non-multipart upload or a chunked multipart upload has been
            // aborted, this option can be used to resume the upload by setting
            // it to the size of the already uploaded bytes. This option is most
            // useful when modifying the options object inside of the "add" or
            // "send" callbacks, as the options are cloned for each file upload.
            uploadedBytes: undefined,
            // By default, failed (abort or error) file uploads are removed from the
            // global progress calculation. Set the following option to false to
            // prevent recalculating the global progress data:
            recalculateProgress: true,
            // Interval in milliseconds to calculate and trigger progress events:
            progressInterval: 100,
            // Interval in milliseconds to calculate progress bitrate:
            bitrateInterval: 500,
            // By default, uploads are started automatically when adding files:
            autoUpload: true,

            // Error and info messages:
            messages: {
                uploadedBytes: 'Uploaded bytes exceed file size'
            },

            // Translation function, gets the message key to be translated
            // and an object with context specific data as arguments:
            i18n: function(message, context) {
                message = this.messages[message] || message.toString();
                if (context) {
                    objects.each(context, function(key, value) {
                        message = message.replace('{' + key + '}', value);
                    });
                }
                return message;
            },

            // Additional form data to be sent along with the file uploads can be set
            // using this option, which accepts an array of objects with name and
            // value properties, a function returning such an array, a FormData
            // object (for XHR file uploads), or a simple object.
            // The form of the first fileInput is given as parameter to the function:
            formData: function(form) {
                return form.serializeArray();
            },

            // The add callback is invoked as soon as files are added to the fileupload
            // widget (via file input selection, drag & drop, paste or add API call).
            // If the singleFileUploads option is enabled, this callback will be
            // called once for each file in the selection for XHR file uploads, else
            // once for each file selection.
            //
            // The upload starts when the submit method is invoked on the data parameter.
            // The data object contains a files property holding the added files
            // and allows you to override plugin options as well as define ajax settings.
            //
            // Listeners for this callback can also be bound the following way:
            // .bind('fileuploadadd', func);
            //
            // data.submit() returns a Promise object and allows to attach additional
            // handlers using jQuery's Deferred callbacks:
            // data.submit().done(func).fail(func).always(func);
            add: function(e, data) {
                if (e.isDefaultPrevented()) {
                    return false;
                }
                if (data.autoUpload || (data.autoUpload !== false &&
                        $(this).fileupload('option', 'autoUpload'))) {
                    data.process().done(function() {
                        data.submit();
                    });
                }
            },

            // Other callbacks:

            // Callback for the submit event of each file upload:
            // submit: function (e, data) {}, // .bind('fileuploadsubmit', func);

            // Callback for the start of each file upload request:
            // send: function (e, data) {}, // .bind('fileuploadsend', func);

            // Callback for successful uploads:
            // done: function (e, data) {}, // .bind('fileuploaddone', func);

            // Callback for failed (abort or error) uploads:
            // fail: function (e, data) {}, // .bind('fileuploadfail', func);

            // Callback for completed (success, abort or error) requests:
            // always: function (e, data) {}, // .bind('fileuploadalways', func);

            // Callback for upload progress events:
            // progress: function (e, data) {}, // .bind('fileuploadprogress', func);

            // Callback for global upload progress events:
            // progressall: function (e, data) {}, // .bind('fileuploadprogressall', func);

            // Callback for uploads start, equivalent to the global ajaxStart event:
            // start: function (e) {}, // .bind('fileuploadstart', func);

            // Callback for uploads stop, equivalent to the global ajaxStop event:
            // stop: function (e) {}, // .bind('fileuploadstop', func);

            // Callback for change events of the fileInput(s):
            // change: function (e, data) {}, // .bind('fileuploadchange', func);

            // Callback for paste events to the pasteZone(s):
            // paste: function (e, data) {}, // .bind('fileuploadpaste', func);

            // Callback for drop events of the dropZone(s):
            // drop: function (e, data) {}, // .bind('fileuploaddrop', func);

            // Callback for dragover events of the dropZone(s):
            // dragover: function (e) {}, // .bind('fileuploaddragover', func);

            // Callback for the start of each chunk upload request:
            // chunksend: function (e, data) {}, // .bind('fileuploadchunksend', func);

            // Callback for successful chunk uploads:
            // chunkdone: function (e, data) {}, // .bind('fileuploadchunkdone', func);

            // Callback for failed (abort or error) chunk uploads:
            // chunkfail: function (e, data) {}, // .bind('fileuploadchunkfail', func);

            // Callback for completed (success, abort or error) chunk upload requests:
            // chunkalways: function (e, data) {}, // .bind('fileuploadchunkalways', func);

            // The plugin options are used as settings object for the ajax calls.
            // The following are jQuery ajax settings required for the file uploads:
            processData: false,
            contentType: false,
            cache: false
        }, params);

        var blobSlice = function() {
                var slice = Blob.prototype.slice || Blob.prototype.webkitSlice || Blob.prototype.mozSlice;
  	            return slice.apply(this, arguments);
            },
            ajax = function(data) {
                return Xhr.request(data.url, data);
            };

        function initDataSettings(o) {
            o.type = o.type || "POST";

            if (!chunkedUpload(o, true)) {
                if (!o.data) {
                    initXHRData(o);
                }
                //initProgressListener(o);
            }
        }

        function initXHRData(o) {
            var that = this,
                formData,
                file = o.files[0],
                // Ignore non-multipart setting if not supported:
                multipart = o.multipart,
                paramName = types.type(o.paramName) === 'array' ?
                o.paramName[0] : o.paramName;

            o.headers = objects.mixin({}, o.headers);
            if (o.contentRange) {
                o.headers['Content-Range'] = o.contentRange;
            }
            if (!multipart) {
                o.headers['Content-Disposition'] = 'attachment; filename="' +
                    encodeURI(file.name) + '"';
                o.contentType = file.type || 'application/octet-stream';
                o.data = o.blob || file;
            } else {
                formData = new FormData();
                if (o.blob) {
                    formData.append(paramName, o.blob, file.name);
                } else {
                    objects.each(o.files, function(index, file) {
                        // This check allows the tests to run with
                        // dummy objects:
                        formData.append(
                            (types.type(o.paramName) === 'array' &&
                                o.paramName[index]) || paramName,
                            file,
                            file.uploadName || file.name
                        );
                    });
                }
                o.data = formData;
            }
            // Blob reference is not needed anymore, free memory:
            o.blob = null;
        }

        function getTotal(files) {
            var total = 0;
            objects.each(files, function(index, file) {
                total += file.size || 1;
            });
            return total;
        }

        function getUploadedBytes(jqXHR) {
            var range = jqXHR.getResponseHeader('Range'),
                parts = range && range.split('-'),
                upperBytesPos = parts && parts.length > 1 &&
                parseInt(parts[1], 10);
            return upperBytesPos && upperBytesPos + 1;
        }

        function initProgressObject(obj) {
            var progress = {
                loaded: 0,
                total: 0,
                bitrate: 0
            };
            if (obj._progress) {
                objects.mixin(obj._progress, progress);
            } else {
                obj._progress = progress;
            }
        }

        function BitrateTimer() {
            this.timestamp = ((Date.now) ? Date.now() : (new Date()).getTime());
            this.loaded = 0;
            this.bitrate = 0;
            this.getBitrate = function(now, loaded, interval) {
                var timeDiff = now - this.timestamp;
                if (!this.bitrate || !interval || timeDiff > interval) {
                    this.bitrate = (loaded - this.loaded) * (1000 / timeDiff) * 8;
                    this.loaded = loaded;
                    this.timestamp = now;
                }
                return this.bitrate;
            };
        }

        function chunkedUpload(options, testOnly) {
            options.uploadedBytes = options.uploadedBytes || 0;
            var that = this,
                file = options.files[0],
                fs = file.size,
                ub = options.uploadedBytes,
                mcs = options.maxChunkSize || fs,
                slice = blobSlice,
                dfd = new Deferred(),
                promise = dfd.promise,
                jqXHR,
                upload;
            if (!(slice && (ub || mcs < fs)) ||
                options.data) {
                return false;
            }
            if (testOnly) {
                return true;
            }
            if (ub >= fs) {
                file.error = options.i18n('uploadedBytes');
                return this._getXHRPromise(
                    false,
                    options.context, [null, 'error', file.error]
                );
            }
            // The chunk upload method:
            upload = function() {
                // Clone the options object for each chunk upload:
                var o = objects.mixin({}, options),
                    currentLoaded = o._progress.loaded;
                o.blob = slice.call(
                    file,
                    ub,
                    ub + mcs,
                    file.type
                );
                // Store the current chunk size, as the blob itself
                // will be dereferenced after data processing:
                o.chunkSize = o.blob.size;
                // Expose the chunk bytes position range:
                o.contentRange = 'bytes ' + ub + '-' +
                    (ub + o.chunkSize - 1) + '/' + fs;
                // Process the upload data (the blob and potential form data):
                initXHRData(o);
                // Add progress listeners for this chunk upload:
                //initProgressListener(o);
                jqXHR = ajax(o).done(function(result, textStatus, jqXHR) {
                        ub = getUploadedBytes(jqXHR) ||
                            (ub + o.chunkSize);
                        // Create a progress event if no final progress event
                        // with loaded equaling total has been triggered
                        // for this chunk:
                        if (currentLoaded + o.chunkSize - o._progress.loaded) {
                            dfd.progress({
                                lengthComputable: true,
                                loaded: ub - o.uploadedBytes,
                                total: ub - o.uploadedBytes
                            });
                        }
                        options.uploadedBytes = o.uploadedBytes = ub;
                        o.result = result;
                        o.textStatus = textStatus;
                        o.jqXHR = jqXHR;
                        //that._trigger('chunkdone', null, o);
                        //that._trigger('chunkalways', null, o);
                        if (ub < fs) {
                            // File upload not yet complete,
                            // continue with the next chunk:
                            upload();
                        } else {
                            dfd.resolveWith(
                                o.context, [result, textStatus, jqXHR]
                            );
                        }
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        o.jqXHR = jqXHR;
                        o.textStatus = textStatus;
                        o.errorThrown = errorThrown;
                        //that._trigger('chunkfail', null, o);
                        //that._trigger('chunkalways', null, o);
                        dfd.rejectWith(
                            o.context, [jqXHR, textStatus, errorThrown]
                        );
                    });
            };
            //this._enhancePromise(promise);
            promise.abort = function() {
                return jqXHR.abort();
            };
            upload();
            return promise;
        }

        initDataSettings(xoptions);

        xoptions._bitrateTimer = new BitrateTimer();

        var jqXhr = chunkedUpload(xoptions) || ajax(xoptions);

        jqXhr.options = xoptions;

        return jqXhr;
    }

	return filer.upload = upload;	
});
define('skylark-utils-filer/uploader',[
    "skylark-langx/langx",
    "skylark-utils-dom/eventer",
    "skylark-utils-dom/query",
    "./dropzone",
    "./pastezone",
    "./picker",
    "./upload"
],function (langx,eventer,$,dropzone,pastezone,picker,upload) {
    'use strict';

    var Deferred = langx.Deferred;


    // The fileupload widget listens for change events on file input fields defined
    // via fileInput setting and paste or drop events of the given dropZone.
    // In addition to the default jQuery Widget methods, the fileupload widget
    // exposes the "add" and "send" methods, to add or directly send files using
    // the fileupload API.
    // By default, files added via file input selection, paste, drag & drop or
    // "add" method are uploaded immediately, but it is possible to override
    // the "add" callback option to queue file uploads.

    var FileUploader = langx.Evented.inherit( {

        options: {
            // The drop target element(s), by the default the complete document.
            // Set to null to disable drag & drop support:
            dropZone: $(document),

            // The paste target element(s), by the default the complete document.
            // Set to null to disable paste support:
            pasteZone: $(document),

            // The file input field(s), that are listened to for change events.
            // If undefined, it is set to the file input fields inside
            // of the widget element on plugin initialization.
            // Set to null to disable the change listener.
            picker: undefined,


            // The parameter name for the file form data (the request argument name).
            // If undefined or empty, the name property of the file input field is
            // used, or "files[]" if the file input name property is also empty,
            // can be a string or an array of strings:
            paramName: undefined,
            
            // By default, each file of a selection is uploaded using an individual
            // request for XHR type uploads. Set to false to upload file
            // selections in one request each:
            singleFileUploads: true,
            
            // To limit the number of files uploaded with one XHR request,
            // set the following option to an integer greater than 0:
            limitMultiFileUploads: undefined,
            
            // The following option limits the number of files uploaded with one
            // XHR request to keep the request size under or equal to the defined
            // limit in bytes:
            limitMultiFileUploadSize: undefined,

            // Multipart file uploads add a number of bytes to each uploaded file,
            // therefore the following option adds an overhead for each file used
            // in the limitMultiFileUploadSize configuration:
            limitMultiFileUploadSizeOverhead: 512,

            // Set the following option to true to issue all file upload requests
            // in a sequential order:
            sequentialUploads: false,
            
            // To limit the number of concurrent uploads,
            // set the following option to an integer greater than 0:
            limitConcurrentUploads: undefined,

            // Set the following option to the location of a postMessage window,
            // to enable postMessage transport uploads:
            postMessage: undefined,
 
            // By default, XHR file uploads are sent as multipart/form-data.
            // The iframe transport is always using multipart/form-data.
            // Set to false to enable non-multipart XHR uploads:
            multipart: true,
 
            // To upload large files in smaller chunks, set the following option
            // to a preferred maximum chunk size. If set to 0, null or undefined,
            // or the browser does not support the required Blob API, files will
            // be uploaded as a whole.
            maxChunkSize: undefined,
 
            // When a non-multipart upload or a chunked multipart upload has been
            // aborted, this option can be used to resume the upload by setting
            // it to the size of the already uploaded bytes. This option is most
            // useful when modifying the options object inside of the "add" or
            // "send" callbacks, as the options are cloned for each file upload.
            uploadedBytes: undefined,
 
            // By default, failed (abort or error) file uploads are removed from the
            // global progress calculation. Set the following option to false to
            // prevent recalculating the global progress data:
            recalculateProgress: true,
 
            // Interval in milliseconds to calculate and trigger progress events:
            progressInterval: 100,
 
            // Interval in milliseconds to calculate progress bitrate:
            bitrateInterval: 500,
 
            // By default, uploads are started automatically when adding files:
            autoUpload: false,

            // Error and info messages:
            messages: {
                uploadedBytes: 'Uploaded bytes exceed file size'
            },

            // Translation function, gets the message key to be translated
            // and an object with context specific data as arguments:
            i18n: function (message, context) {
                message = this.messages[message] || message.toString();
                if (context) {
                    langx.each(context, function (key, value) {
                        message = message.replace('{' + key + '}', value);
                    });
                }
                return message;
            },

            // Additional form data to be sent along with the file uploads can be set
            // using this option, which accepts an array of objects with name and
            // value properties, a function returning such an array, a FormData
            // object (for XHR file uploads), or a simple object.
            // The form of the first fileInput is given as parameter to the function:
            formData: function (form) {
                return form.serializeArray();
            },

            // The add callback is invoked as soon as files are added to the fileupload
            // widget (via file input selection, drag & drop, paste or add API call).
            // If the singleFileUploads option is enabled, this callback will be
            // called once for each file in the selection for XHR file uploads, else
            // once for each file selection.
            //
            // The upload starts when the submit method is invoked on the data parameter.
            // The data object contains a files property holding the added files
            // and allows you to override plugin options as well as define ajax settings.
            //
            // Listeners for this callback can also be bound the following way:
            // .bind('fileuploadadd', func);
            //
            // data.submit() returns a Promise object and allows to attach additional
            // handlers using jQuery's Deferred callbacks:
            // data.submit().done(func).fail(func).always(func);
            add: function (e, data) {
                if (e.isDefaultPrevented()) {
                    return false;
                }
                if (data.autoUpload || (data.autoUpload !== false && $(this).fileupload("instance").option('autoUpload') )) {
                    data.process().done(function () {
                        data.submit();
                    });
                }
            },

            // Other callbacks:

            // Callback for the submit event of each file upload:
            // submit: function (e, data) {}, // .bind('fileuploadsubmit', func);

            // Callback for the start of each file upload request:
            // send: function (e, data) {}, // .bind('fileuploadsend', func);

            // Callback for successful uploads:
            // done: function (e, data) {}, // .bind('fileuploaddone', func);

            // Callback for failed (abort or error) uploads:
            // fail: function (e, data) {}, // .bind('fileuploadfail', func);

            // Callback for completed (success, abort or error) requests:
            // always: function (e, data) {}, // .bind('fileuploadalways', func);

            // Callback for upload progress events:
            // progress: function (e, data) {}, // .bind('fileuploadprogress', func);

            // Callback for global upload progress events:
            // progressall: function (e, data) {}, // .bind('fileuploadprogressall', func);

            // Callback for uploads start, equivalent to the global ajaxStart event:
            // start: function (e) {}, // .bind('fileuploadstart', func);

            // Callback for uploads stop, equivalent to the global ajaxStop event:
            // stop: function (e) {}, // .bind('fileuploadstop', func);

            // Callback for change events of the fileInput(s):
            // change: function (e, data) {}, // .bind('fileuploadchange', func);

            // Callback for paste events to the pasteZone(s):
            // paste: function (e, data) {}, // .bind('fileuploadpaste', func);

            // Callback for drop events of the dropZone(s):
            // drop: function (e, data) {}, // .bind('fileuploaddrop', func);

            // Callback for dragover events of the dropZone(s):
            // dragover: function (e) {}, // .bind('fileuploaddragover', func);

            // Callback for the start of each chunk upload request:
            // chunksend: function (e, data) {}, // .bind('fileuploadchunksend', func);

            // Callback for successful chunk uploads:
            // chunkdone: function (e, data) {}, // .bind('fileuploadchunkdone', func);

            // Callback for failed (abort or error) chunk uploads:
            // chunkfail: function (e, data) {}, // .bind('fileuploadchunkfail', func);

            // Callback for completed (success, abort or error) chunk upload requests:
            // chunkalways: function (e, data) {}, // .bind('fileuploadchunkalways', func);

            // The plugin options are used as settings object for the ajax calls.
            // The following are jQuery ajax settings required for the file uploads:
            processData: false,
            contentType: false,
            cache: false
        },

        // A list of options that require reinitializing event listeners and/or
        // special initialization code:
        _specialOptions: [
            'picker',
            'dropZone',
            'pasteZone',
            'multipart',
            'filesContainer',
            'uploadTemplateId',
            'downloadTemplateId'            
        ],

        _BitrateTimer: function () {
            this.timestamp = ((Date.now) ? Date.now() : (new Date()).getTime());
            this.loaded = 0;
            this.bitrate = 0;
            this.getBitrate = function (now, loaded, interval) {
                var timeDiff = now - this.timestamp;
                if (!this.bitrate || !interval || timeDiff > interval) {
                    this.bitrate = (loaded - this.loaded) * (1000 / timeDiff) * 8;
                    this.loaded = loaded;
                    this.timestamp = now;
                }
                return this.bitrate;
            };
        },

        _getTotal: function (files) {
            var total = 0;
            langx.each(files, function (index, file) {
                total += file.size || 1;
            });
            return total;
        },

        _initProgressObject: function (obj) {
            var progress = {
                loaded: 0,
                total: 0,
                bitrate: 0
            };
            if (obj._progress) {
                langx.extend(obj._progress, progress);
            } else {
                obj._progress = progress;
            }
        },

        _initResponseObject: function (obj) {
            var prop;
            if (obj._response) {
                for (prop in obj._response) {
                    if (obj._response.hasOwnProperty(prop)) {
                        delete obj._response[prop];
                    }
                }
            } else {
                obj._response = {};
            }
        },

        _onProgress: function (e, data) {
            if (e.lengthComputable) {
                var now = ((Date.now) ? Date.now() : (new Date()).getTime()),
                    loaded;
                if (data._time && data.progressInterval &&
                        (now - data._time < data.progressInterval) &&
                        e.loaded !== e.total) {
                    return;
                }
                data._time = now;
                loaded = Math.floor(
                    e.loaded / e.total * (data.chunkSize || data._progress.total)
                ) + (data.uploadedBytes || 0);
                // Add the difference from the previously loaded state
                // to the global loaded counter:
                this._progress.loaded += (loaded - data._progress.loaded);
                this._progress.bitrate = this._bitrateTimer.getBitrate(
                    now,
                    this._progress.loaded,
                    data.bitrateInterval
                );
                data._progress.loaded = data.loaded = loaded;
                data._progress.bitrate = data.bitrate = data._bitrateTimer.getBitrate(
                    now,
                    loaded,
                    data.bitrateInterval
                );
                // Trigger a custom progress event with a total data property set
                // to the file size(s) of the current upload and a loaded data
                // property calculated accordingly:
                this._trigger(
                    'progress',
                    eventer.create('progress', {delegatedEvent: e}),
                    data
                );
                // Trigger a global progress event for all current file uploads,
                // including ajax calls queued for sequential file uploads:
                this._trigger(
                    'progressall',
                    eventer.create('progressall', {delegatedEvent: e}),
                    this._progress
                );
            }
        },

        _getParamName: function (options) {
            var picker = $(options.picker),
                paramName = options.paramName;
            //if (!paramName) {
            //    paramName = [fileInput.prop('name') || 'files[]'];
            // } else if (!langx.isArray(paramName)) {

            if (!langx.isArray(paramName)) {
                paramName = [paramName];
            }
            return paramName;
        },


        // jQuery 1.6 doesn't provide .state(),
        // while jQuery 1.8+ removed .isRejected() and .isResolved():
        _getDeferredState: function (deferred) {
            if (deferred.state) {
                return deferred.state();
            }
            if (deferred.isResolved()) {
                return 'resolved';
            }
            if (deferred.isRejected()) {
                return 'rejected';
            }
            return 'pending';
        },

        // Maps jqXHR callbacks to the equivalent
        // methods of the given Promise object:
        _enhancePromise: function (promise) {
            promise.success = promise.done;
            promise.error = promise.fail;
            promise.complete = promise.always;
            return promise;
        },

        // Creates and returns a Promise object enhanced with
        // the jqXHR methods abort, success, error and complete:
        _getXHRPromise: function (resolveOrReject, context, args) {
            var dfd = new Deferred(),
                promise = dfd.promise;
            context = context || this.options.context || promise;
            if (resolveOrReject === true) {
                dfd.resolveWith(context, args);
            } else if (resolveOrReject === false) {
                dfd.rejectWith(context, args);
            }
            promise.abort = dfd.promise;
            return this._enhancePromise(promise);
        },

        // Adds convenience methods to the data callback argument:
        _addConvenienceMethods: function (e, data) {
            var that = this,
                getPromise = function (args) {
                    return new Deferred().resolveWith(that, args).promise;
                };
            data.process = function (resolveFunc, rejectFunc) {
                if (resolveFunc || rejectFunc) {
                    data._processQueue = this._processQueue =
                        (this._processQueue || getPromise([this])).pipe(
                            function () {
                                if (data.errorThrown) {
                                    return new Deferred()
                                        .rejectWith(that, [data]).promise;
                                }
                                return getPromise(arguments);
                            }
                        ).pipe(resolveFunc, rejectFunc);
                }
                return this._processQueue || getPromise([this]);
            };
            data.submit = function () {
                if (this.state() !== 'pending') {
                    data.jqXHR = this.jqXHR =
                        (that._trigger(
                            'submit',
                            eventer.create('submit', {delegatedEvent: e}),
                            this
                        ) !== false) && that._onSend(e, this);
                }
                return this.jqXHR || that._getXHRPromise();
            };
            data.abort = function () {
                if (this.jqXHR) {
                    return this.jqXHR.abort();
                }
                this.errorThrown = 'abort';
                that._trigger('fail', null, this);
                return that._getXHRPromise(false);
            };
            data.state = function () {
                if (this.jqXHR) {
                    return that._getDeferredState(this.jqXHR);
                }
                if (this._processQueue) {
                    return that._getDeferredState(this._processQueue);
                }
            };
            data.processing = function () {
                return !this.jqXHR && this._processQueue && that
                    ._getDeferredState(this._processQueue) === 'pending';
            };
            data.progress = function () {
                return this._progress;
            };
            data.response = function () {
                return this._response;
            };
        },

        _beforeSend: function (e, data) {
            if (this._active === 0) {
                // the start callback is triggered when an upload starts
                // and no other uploads are currently running,
                // equivalent to the global ajaxStart event:
                this._trigger('start');
                // Set timer for global bitrate progress calculation:
                this._bitrateTimer = new this._BitrateTimer();
                // Reset the global progress values:
                this._progress.loaded = this._progress.total = 0;
                this._progress.bitrate = 0;
            }
            // Make sure the container objects for the .response() and
            // .progress() methods on the data object are available
            // and reset to their initial state:
            this._initResponseObject(data);
            this._initProgressObject(data);
            data._progress.loaded = data.loaded = data.uploadedBytes || 0;
            data._progress.total = data.total = this._getTotal(data.files) || 1;
            data._progress.bitrate = data.bitrate = 0;
            this._active += 1;
            // Initialize the global progress values:
            this._progress.loaded += data.loaded;
            this._progress.total += data.total;
        },

        _onDone: function (result, textStatus, jqXHR, options) {
            var total = options._progress.total,
                response = options._response;
            if (options._progress.loaded < total) {
                // Create a progress event if no final progress event
                // with loaded equaling total has been triggered:
                this._onProgress(eventer.create('progress', {
                    lengthComputable: true,
                    loaded: total,
                    total: total
                }), options);
            }
            response.result = options.result = result;
            response.textStatus = options.textStatus = textStatus;
            response.jqXHR = options.jqXHR = jqXHR;
            this._trigger('done', null, options);
        },

        _onFail: function (jqXHR, textStatus, errorThrown, options) {
            var response = options._response;
            if (options.recalculateProgress) {
                // Remove the failed (error or abort) file upload from
                // the global progress calculation:
                this._progress.loaded -= options._progress.loaded;
                this._progress.total -= options._progress.total;
            }
            response.jqXHR = options.jqXHR = jqXHR;
            response.textStatus = options.textStatus = textStatus;
            response.errorThrown = options.errorThrown = errorThrown;
            this._trigger('fail', null, options);
        },

        _trigger : function(type,event,data) {
            var e = eventer.proxy(event);
            e.type = type;
            e.data =data;
            return this.trigger(e,data);
        },

        _onAlways: function (jqXHRorResult, textStatus, jqXHRorError, options) {
            // jqXHRorResult, textStatus and jqXHRorError are added to the
            // options object via done and fail callbacks
            this._trigger('always', null, options);
        },

        _onSend: function (e, data) {
            if (!data.submit) {
                this._addConvenienceMethods(e, data);
            }
            var that = this,
                jqXHR,
                aborted,
                slot,
                pipe,
                send = function () {
                    that._sending += 1;
                    data.url = that.options.url;
                    data.dataType = that.options.dataType;
                    data.xhrFields = that.options.xhrFields;

                    jqXHR = upload(data);

                    jqXHR.progress(function(e){
                        //var oe = e.originalEvent;
                        // Make sure the progress event properties get copied over:
                        //e.lengthComputable = oe.lengthComputable;
                        //e.loaded = oe.loaded;
                        //e.total = oe.total;
                        that._onProgress(e, jqXHR.options);

                    }).done(function (result, textStatus) {
                        that._onDone(result, textStatus, jqXHR, jqXHR.options);
                    }).fail(function (e, textStatus) {
                        that._onFail(jqXHR, textStatus,e, jqXHR.options);
                    }).always(function () {
                        that._sending -= 1;
                        that._active -= 1;
                        that._trigger('stop');
                    });
                    return jqXHR;
                };
            this._beforeSend(e, data);

            return send();
        },
        _onAdd: function (e, data) {
            var that = this,
                result = true,
                options = langx.extend({}, this.options, data),
                files = data.files,
                filesLength = files.length,
                limit = options.limitMultiFileUploads,
                limitSize = options.limitMultiFileUploadSize,
                overhead = options.limitMultiFileUploadSizeOverhead,
                batchSize = 0,
                paramName = this._getParamName(options),
                paramNameSet,
                paramNameSlice,
                fileSet,
                i,
                j = 0;
            if (limitSize && (!filesLength || files[0].size === undefined)) {
                limitSize = undefined;
            }
            if (!(options.singleFileUploads || limit || limitSize)) {
                fileSet = [files];
                paramNameSet = [paramName];
            } else if (!(options.singleFileUploads || limitSize) && limit) {
                fileSet = [];
                paramNameSet = [];
                for (i = 0; i < filesLength; i += limit) {
                    fileSet.push(files.slice(i, i + limit));
                    paramNameSlice = paramName.slice(i, i + limit);
                    if (!paramNameSlice.length) {
                        paramNameSlice = paramName;
                    }
                    paramNameSet.push(paramNameSlice);
                }
            } else if (!options.singleFileUploads && limitSize) {
                fileSet = [];
                paramNameSet = [];
                for (i = 0; i < filesLength; i = i + 1) {
                    batchSize += files[i].size + overhead;
                    if (i + 1 === filesLength ||
                            ((batchSize + files[i + 1].size + overhead) > limitSize) ||
                            (limit && i + 1 - j >= limit)) {
                        fileSet.push(files.slice(j, i + 1));
                        paramNameSlice = paramName.slice(j, i + 1);
                        if (!paramNameSlice.length) {
                            paramNameSlice = paramName;
                        }
                        paramNameSet.push(paramNameSlice);
                        j = i + 1;
                        batchSize = 0;
                    }
                }
            } else {
                paramNameSet = paramName;
            }
            data.originalFiles = files;
            langx.each(fileSet || files, function (index, element) {
                var newData = langx.extend({}, data);
                newData.files = fileSet ? element : [element];
                newData.paramName = paramNameSet[index];
                that._initResponseObject(newData);
                that._initProgressObject(newData);
                that._addConvenienceMethods(e, newData);
                result = that._trigger(
                    'add',
                    eventer.create('add', {delegatedEvent: e}),
                    newData
                );
                return result;
            });
            return result;
        },

        _initEventHandlers: function () {
            var that = this;

            dropzone(this.options.dropZone[0],{
                dropped : function (files) {
                    var data = {};
                    data.files = files;
                    that._onAdd(null, data);
                }
            });

            pastezone(this.options.pasteZone[0],{
                pasted : function (files) {
                    var data = {};
                    data.files = files;
                    that._onAdd(null, data);
                }
            });

            picker(this.options.picker[0],{
                multiple: true,
                picked : function (files) {
                    var data = {};
                    data.files = files;
                    that._onAdd(null, data);
                }
            });
        },

        _destroyEventHandlers: function () {
            //this._off(this.options.dropZone, 'dragover drop');
            //this._off(this.options.pasteZone, 'paste');
            //this._off(this.options.picker, 'change');
        },

        _setOption: function (key, value) {
            var reinit = langx.inArray(key, this._specialOptions) !== -1;
            if (reinit) {
                this._destroyEventHandlers();
            }
            this._super(key, value);
            if (reinit) {
                this._initSpecialOptions();
                this._initEventHandlers();
            }
        },

        _initSpecialOptions: function () {
            var options = this.options;
            //if (options.fileInput === undefined) {
            //    //options.fileInput = this.element.is('input[type="file"]') ?
            //    //        this.element : this.element.find('input[type="file"]');
            //    options.fileInput = this.element.find('.fileinput-button');
            
            if (options.picker) {
                if (!(options.picker instanceof $)) {
                    options.picker = $(options.picker,this._elm);
                }                
            }

            if (options.dropZone) {
                if (!(options.dropZone instanceof $)) {
                    options.dropZone = $(options.dropZone,this._elm);
                }
            }

            if (options.pasteZone) {
                if (!(options.pasteZone instanceof $)) {
                    options.pasteZone = $(options.pasteZone,this._elm);
                }                
            }
        },

        _getRegExp: function (str) {
            var parts = str.split('/'),
                modifiers = parts.pop();
            parts.shift();
            return new RegExp(parts.join('/'), modifiers);
        },

        _isRegExpOption: function (key, value) {
            return key !== 'url' && langx.type(value) === 'string' &&
                /^\/.*\/[igm]{0,3}$/.test(value);
        },

        _construct: function (elm,options) {
            this._elm = elm;
            this.options = langx.mixin({},this.options,options);
            this._initSpecialOptions();
            this._slots = [];
            this._sequence = this._getXHRPromise(true);
            this._sending = this._active = 0;
            this._initProgressObject(this);
            this._initEventHandlers();
        },

        // This method is exposed to the widget API and allows to query
        // the number of active uploads:
        active: function () {
            return this._active;
        },

        // This method is exposed to the widget API and allows to query
        // the widget upload progress.
        // It returns an object with loaded, total and bitrate properties
        // for the running uploads:
        progress: function () {
            return this._progress;
        },

        // This method is exposed to the widget API and allows adding files
        // using the fileupload API. The data parameter accepts an object which
        // must have a files property and can contain additional options:
        // .fileupload('add', {files: filesList});
        add: function (data) {
            var that = this;
            if (!data || this.options.disabled) {
                return;
            }
            data.files = langx.makeArray(data.files);
            this._onAdd(null, data);
        },

        // This method is exposed to the widget API and allows sending files
        // using the fileupload API. The data parameter accepts an object which
        // must have a files or fileInput property and can contain additional options:
        // .fileupload('send', {files: filesList});
        // The method returns a Promise object for the file upload call.
        send: function (data) {
            if (data && !this.options.disabled) {
                data.files = langx.makeArray(data.files);
                if (data.files.length) {
                    return this._onSend(null, data);
                }
            }
            return this._getXHRPromise(false, data && data.context);
        }

    });


    function uploader(elm,options) {
        var fuInst = new FileUploader(elm,options);
        fuInst.on("all",function(evt,data){
            var typ = evt.type;
            if (langx.isFunction(options[typ])) {
                options[typ].call(fuInst._elm,evt,data);
            }
        });
    }

    return uploader;

});

define('skylark-utils-filer/main',[
	"./filer",
	"./download",
	"./dropzone",
	"./pastezone",
	"./picker",
	"./read",
	"./select",
	"./upload",
	"./uploader",
	"./webentry"
],function(filer){
	return filer;
});
define('skylark-utils-filer', ['skylark-utils-filer/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-utils-filer.js.map
