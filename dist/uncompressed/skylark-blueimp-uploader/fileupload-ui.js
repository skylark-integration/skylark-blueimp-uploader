define([
    "skylark-langx/langx",
    "skylark-utils-dom/eventer",
    "skylark-utils-filer/uploader",
    "skylark-jquery",
    "./tmpl"
],function (langx,eventer,uploader,$,tmpl) {

    'use strict';

//    $.blueimp.fileupload.prototype._specialOptions.push(
//        'filesContainer',
//        'uploadTemplateId',
//        'downloadTemplateId'
//    );

    // The UI version extends the file upload widget
    // and adds complete user interface interaction:
    $.widget('blueimp.fileuploadui',  {
        processActions: {
            /*
            log: function (data, options) {
                console[options.type](
                    'Processing "' + data.files[data.index].name + '"'
                );
            }
            */
        },

        _processFile: function (data, originalData) {
            /*
            var that = this,
                dfd = $.Deferred().resolveWith(that, [data]),
                chain = dfd.promise();
            this._trigger('process', null, data);
            $.each(data.processQueue, function (i, settings) {
                var func = function (data) {
                    if (originalData.errorThrown) {
                        return $.Deferred()
                                .rejectWith(that, [originalData]).promise();
                    }
                    return that.processActions[settings.action].call(
                        that,
                        data,
                        settings
                    );
                };
                chain = chain.pipe(func, settings.always && func);
            });
            chain
                .done(function () {
                    that._trigger('processdone', null, data);
                    that._trigger('processalways', null, data);
                })
                .fail(function () {
                    that._trigger('processfail', null, data);
                    that._trigger('processalways', null, data);
                });
            return chain;
            */
            var langx = $.skylark.langx,
                that = this;
            var funcs = langx.map(data.processQueue,function(setting) {
                var func = function (data) {
                    return that.processActions[setting.action].call(
                        that,
                        data,
                        setting
                    );
                };
                return func;                
            });
            return langx.async.waterful(funcs,[data],that);
        },

        // Replaces the settings of each processQueue item that
        // are strings starting with an "@", using the remaining
        // substring as key for the option map,
        // e.g. "@autoUpload" is replaced with options.autoUpload:
        _transformProcessQueue: function (options) {
            var processQueue = [];
            $.each(options.processQueue, function () {
                var settings = {},
                    action = this.action,
                    prefix = this.prefix === true ? action : this.prefix;
                $.each(this, function (key, value) {
                    if ($.type(value) === 'string' &&
                            value.charAt(0) === '@') {
                        settings[key] = options[
                            value.slice(1) || (prefix ? prefix +
                                key.charAt(0).toUpperCase() + key.slice(1) : key)
                        ];
                    } else {
                        settings[key] = value;
                    }

                });
                processQueue.push(settings);
            });
            options.processQueue = processQueue;
        },

        // Returns the number of files currently in the processsing queue:
        processing: function () {
            return this._processing;
        },

        // Processes the files given as files property of the data parameter,
        // returns a Promise object that allows to bind callbacks:
        process: function (data) {
            var that = this,
                options = $.extend({}, this.options, data);
            if (options.processQueue && options.processQueue.length) {
                this._transformProcessQueue(options);
                if (this._processing === 0) {
                    this._trigger('processstart');
                }
                $.each(data.files, function (index) {
                    var opts = index ? $.extend({}, options) : options,
                        func = function () {
                            if (data.errorThrown) {
                                return $.Deferred()
                                        .rejectWith(that, [data]).promise();
                            }
                            return that._processFile(opts, data);
                        };
                    opts.index = index;
                    that._processing += 1;
                    that._processingQueue = that._processingQueue.pipe(func, func)
                        .always(function () {
                            that._processing -= 1;
                            if (that._processing === 0) {
                                that._trigger('processstop');
                            }
                        });
                });
            }
            return this._processingQueue;
        },


        options: {
            // The list of processing actions:
            processQueue: [
                /*
                {
                    action: 'log',
                    type: 'debug'
                }
                */
            ],



            // By default, files added to the widget are uploaded as soon
            // as the user clicks on the start buttons. To enable automatic
            // uploads, set the following option to true:
            autoUpload: false,
            // The ID of the upload template:
            uploadTemplateId: 'template-upload',
            // The ID of the download template:
            downloadTemplateId: 'template-download',
            // The container for the list of files. If undefined, it is set to
            // an element with class "files" inside of the widget element:
            filesContainer: undefined,
            // By default, files are appended to the files container.
            // Set the following option to true, to prepend files instead:
            prependFiles: false,
            // The expected data type of the upload response, sets the dataType
            // option of the $.ajax upload requests:
            dataType: 'json',

            // Function returning the current number of files,
            // used by the maxNumberOfFiles validation:
            getNumberOfFiles: function () {
                return this.filesContainer.children()
                    .not('.processing').length;
            },

            // Callback to retrieve the list of files from the server response:
            getFilesFromResponse: function (data) {
                if (data.result && $.isArray(data.result.files)) {
                    return data.result.files;
                }
                return [];
            },

            // The add callback is invoked as soon as files are added to the fileupload
            // widget (via file input selection, drag & drop or add API call).
            // See the basic file upload widget for more information:
            add: function (e, data) {
                //if (e.isDefaultPrevented()) {
                //    return false;
                //}
                var $this = $(this),
                    that = $this.data('blueimp-fileuploadui') ||
                        $this.data('fileupload'),
                    options = that.options;
                data.context = that._renderUpload(data.files)
                    .data('data', data)
                    .addClass('processing');
                options.filesContainer[
                    options.prependFiles ? 'prepend' : 'append'
                ](data.context);
                that._forceReflow(data.context);
                that._transition(data.context);
//                data.process(function () {
//                    return $this.fileupload('process', data);
//                }).always(function () {
                $this.fileuploadui('process', data).always(function () {
                    data.context.each(function (index) {
                        $(this).find('.size').text(
                            that._formatFileSize(data.files[index].size)
                        );
                    }).removeClass('processing');
                    that._renderPreviews(data);
                }).done(function () {
                    data.context.find('.start').prop('disabled', false);
                    if ((that._trigger('added', null,data) !== false) &&
                            (options.autoUpload || data.autoUpload) &&
                            data.autoUpload !== false) {
                        data.submit();
                    }
                }).fail(function () {
                    if (data.files.error) {
                        data.context.each(function (index) {
                            var error = data.files[index].error;
                            if (error) {
                                $(this).find('.error').text(error);
                            }
                        });
                    }
                });
            },
            // Callback for the start of each file upload request:
            send: function (e, data) {
                if (e.isDefaultPrevented()) {
                    return false;
                }
                var that = $(this).data('blueimp-fileuploadui') ||
                        $(this).data('fileupload');
                if (data.context && data.dataType &&
                        data.dataType.substr(0, 6) === 'iframe') {
                    // Iframe Transport does not support progress events.
                    // In lack of an indeterminate progress bar, we set
                    // the progress to 100%, showing the full animated bar:
                    data.context
                        .find('.progress').addClass(
                            !$.support.transition && 'progress-animated'
                        )
                        .attr('aria-valuenow', 100)
                        .children().first().css(
                            'width',
                            '100%'
                        );
                }
                return that._trigger('sent', null,data);
            },
            // Callback for successful uploads:
            done: function (e, data) {
                if (e.isDefaultPrevented()) {
                    return false;
                }
                var that = $(this).data('blueimp-fileuploadui') ||
                        $(this).data('fileupload'),
                    getFilesFromResponse = data.getFilesFromResponse ||
                        that.options.getFilesFromResponse,
                    files = getFilesFromResponse(data),
                    template,
                    deferred;
                if (data.context) {
                    data.context.each(function (index) {
                        var file = files[index] ||
                                {error: 'Empty file upload result'};
                        deferred = that._addFinishedDeferreds();
                        that._transition($(this)).done(
                            function () {
                                var node = $(this);
//                                template = that._renderDownload([file]);
                                template = that._renderDownload([file])
                                    .replaceAll(node);
                                that._forceReflow(template);
                                that._transition(template).done(
                                    function () {
                                        data.context = $(this);
                                        that._trigger('completed', null,data);
                                        that._trigger('finished', null,data);
                                        deferred.resolve();
                                    }
                                );
                            }
                        );
                    });
                } else {
                    template = that._renderDownload(files)[
                        that.options.prependFiles ? 'prependTo' : 'appendTo'
                    ](that.options.filesContainer);
                    that._forceReflow(template);
                    deferred = that._addFinishedDeferreds();
                    that._transition(template).done(
                        function () {
                            data.context = $(this);
                            that._trigger('completed', null,data);
                            that._trigger('finished', null,data);
                            deferred.resolve();
                        }
                    );
                }
            },
            // Callback for failed (abort or error) uploads:
            fail: function (e, data) {
                if (e.isDefaultPrevented()) {
                    return false;
                }
                var that = $(this).data('blueimp-fileuploadui') ||
                        $(this).data('fileupload'),
                    template,
                    deferred;
                if (data.context) {
                    data.context.each(function (index) {
                        if (data.errorThrown !== 'abort') {
                            var file = data.files[index];
                            file.error = file.error || data.errorThrown ||
                                true;
                            deferred = that._addFinishedDeferreds();
                            that._transition($(this)).done(
                                function () {
                                    var node = $(this);
                                    template = that._renderDownload([file])
                                        .replaceAll(node);
                                    that._forceReflow(template);
                                    that._transition(template).done(
                                        function () {
                                            data.context = $(this);
                                            that._trigger('failed', null,data);
                                            that._trigger('finished', null,data);
                                            deferred.resolve();
                                        }
                                    );
                                }
                            );
                        } else {
                            deferred = that._addFinishedDeferreds();
                            that._transition($(this)).done(
                                function () {
                                    $(this).remove();
                                    that._trigger('failed', null,data);
                                    that._trigger('finished', null,data);
                                    deferred.resolve();
                                }
                            );
                        }
                    });
                } else if (data.errorThrown !== 'abort') {
                    data.context = that._renderUpload(data.files)[
                        that.options.prependFiles ? 'prependTo' : 'appendTo'
                    ](that.options.filesContainer)
                        .data('data', data);
                    that._forceReflow(data.context);
                    deferred = that._addFinishedDeferreds();
                    that._transition(data.context).done(
                        function () {
                            data.context = $(this);
                            that._trigger('failed', null,data);
                            that._trigger('finished', null,data);
                            deferred.resolve();
                        }
                    );
                } else {
                    that._trigger('failed', null,data);
                    that._trigger('finished', null,data);
                    that._addFinishedDeferreds().resolve();
                }
            },
            // Callback for upload progress events:
            progress: function (e, data) {
                if (e.isDefaultPrevented()) {
                    return false;
                }
                var progress = Math.floor(data.loaded / data.total * 100);
                if (data.context) {
                    data.context.each(function () {
                        $(this).find('.progress')
                            .attr('aria-valuenow', progress)
                            .children().first().css(
                                'width',
                                progress + '%'
                            );
                    });
                }
            },
            // Callback for global upload progress events:
            progressall: function (e, data) {
                //if (e.isDefaultPrevented()) {
                //    return false;
                //}
                var $this = $(this),
                    progress = Math.floor(data.loaded / data.total * 100),
                    globalProgressNode = $this.find('.fileupload-progress'),
                    extendedProgressNode = globalProgressNode
                        .find('.progress-extended');
                if (extendedProgressNode.length) {
                    extendedProgressNode.html(
                        ($this.data('blueimp-fileuploadui') || $this.data('fileupload'))
                            ._renderExtendedProgress(data)
                    );
                }
                globalProgressNode
                    .find('.progress')
                    .attr('aria-valuenow', progress)
                    .children().first().css(
                        'width',
                        progress + '%'
                    );
            },
            // Callback for uploads start, equivalent to the global ajaxStart event:
            start: function (e) {
                if (e.isDefaultPrevented()) {
                    return false;
                }
                var that = $(this).data('blueimp-fileuploadui') ||
                        $(this).data('fileupload');
                that._resetFinishedDeferreds();
                that._transition($(this).find('.fileupload-progress')).done(
                    function () {
                        that._trigger('started', null);
                    }
                );
            },
            // Callback for uploads stop, equivalent to the global ajaxStop event:
            stop: function (e) {
                if (e.isDefaultPrevented()) {
                    return false;
                }
                var that = $(this).data('blueimp-fileuploadui') ||
                        $(this).data('fileupload'),
                    deferred = that._addFinishedDeferreds();
                $.when.apply($, that._getFinishedDeferreds())
                    .done(function () {
                        that._trigger('stopped', null);
                    });
                that._transition($(this).find('.fileupload-progress')).done(
                    function () {
                        $(this).find('.progress')
                            .attr('aria-valuenow', '0')
                            .children().first().css('width', '0%');
                        $(this).find('.progress-extended').html('&nbsp;');
                        deferred.resolve();
                    }
                );
            },
            processstart: function (e) {
                if (e.isDefaultPrevented()) {
                    return false;
                }
                $(this).addClass('fileupload-processing');
            },
            processstop: function (e) {
                if (e.isDefaultPrevented()) {
                    return false;
                }
                $(this).removeClass('fileupload-processing');
            },
            // Callback for file deletion:
            destroy: function (e, data) {
                //if (e.isDefaultPrevented()) {
                //    return false;
                //}
                var that = $(this).data('blueimp-fileuploadui') ||
                        $(this).data('fileupload'),
                    removeNode = function () {
                        that._transition(data.context).done(
                            function () {
                                $(this).remove();
                                that._trigger('destroyed', null,data);
                            }
                        );
                    };
                if (data.url) {
                    data.dataType = data.dataType || that.options.dataType;
                    $.ajax(data).done(removeNode).fail(function () {
                        that._trigger('destroyfailed', null,data);
                    });
                } else {
                    removeNode();
                }
            }
        },


        _resetFinishedDeferreds: function () {
            this._finishedUploads = [];
        },

        _addFinishedDeferreds: function (deferred) {
            if (!deferred) {
                deferred = $.Deferred();
            }
            this._finishedUploads.push(deferred);
            return deferred;
        },

        _getFinishedDeferreds: function () {
            return this._finishedUploads;
        },

        // Link handler, that allows to download files
        // by drag & drop of the links to the desktop:
        _enableDragToDesktop: function () {
            var link = $(this),
                url = link.prop('href'),
                name = link.prop('download'),
                type = 'application/octet-stream';
            link.bind('dragstart', function (e) {
                try {
                    e.originalEvent.dataTransfer.setData(
                        'DownloadURL',
                        [type, name, url].join(':')
                    );
                } catch (ignore) {}
            });
        },

        _formatFileSize: function (bytes) {
            if (typeof bytes !== 'number') {
                return '';
            }
            if (bytes >= 1000000000) {
                return (bytes / 1000000000).toFixed(2) + ' GB';
            }
            if (bytes >= 1000000) {
                return (bytes / 1000000).toFixed(2) + ' MB';
            }
            return (bytes / 1000).toFixed(2) + ' KB';
        },

        _formatBitrate: function (bits) {
            if (typeof bits !== 'number') {
                return '';
            }
            if (bits >= 1000000000) {
                return (bits / 1000000000).toFixed(2) + ' Gbit/s';
            }
            if (bits >= 1000000) {
                return (bits / 1000000).toFixed(2) + ' Mbit/s';
            }
            if (bits >= 1000) {
                return (bits / 1000).toFixed(2) + ' kbit/s';
            }
            return bits.toFixed(2) + ' bit/s';
        },

        _formatTime: function (seconds) {
            var date = new Date(seconds * 1000),
                days = Math.floor(seconds / 86400);
            days = days ? days + 'd ' : '';
            return days +
                ('0' + date.getUTCHours()).slice(-2) + ':' +
                ('0' + date.getUTCMinutes()).slice(-2) + ':' +
                ('0' + date.getUTCSeconds()).slice(-2);
        },

        _formatPercentage: function (floatValue) {
            return (floatValue * 100).toFixed(2) + ' %';
        },

        _renderExtendedProgress: function (data) {
            return this._formatBitrate(data.bitrate) + ' | ' +
                this._formatTime(
                    (data.total - data.loaded) * 8 / data.bitrate
                ) + ' | ' +
                this._formatPercentage(
                    data.loaded / data.total
                ) + ' | ' +
                this._formatFileSize(data.loaded) + ' / ' +
                this._formatFileSize(data.total);
        },

        _renderTemplate: function (func, files) {
            if (!func) {
                return $();
            }
            var result = func({
                files: files,
                formatFileSize: this._formatFileSize,
                options: this.options
            });
            if (result instanceof $) {
                return result;
            }
            return $(this.options.templatesContainer).html(result).children();
        },

        _renderPreviews: function (data) {
            data.context.find('.preview').each(function (index, elm) {
                $(elm).append(data.files[index].preview);
            });
        },

        _renderUpload: function (files) {
            return this._renderTemplate(
                this.options.uploadTemplate,
                files
            );
        },

        _renderDownload: function (files) {
            return this._renderTemplate(
                this.options.downloadTemplate,
                files
            ).find('a[download]').each(this._enableDragToDesktop).end();
        },

        _startHandler: function (e) {
            e.preventDefault();
            var button = $(e.currentTarget),
                template = button.closest('.template-upload'),
                data = template.data('data');
            button.prop('disabled', true);
            if (data && data.submit) {
                data.submit();
            }
        },

        _cancelHandler: function (e) {
            e.preventDefault();
            var template = $(e.currentTarget)
                    .closest('.template-upload,.template-download'),
                data = template.data('data') || {};
            data.context = data.context || template;
            if (data.abort) {
                data.abort();
            } else {
                data.errorThrown = 'abort';
                this._trigger('fail', null,data);
            }
        },

        _deleteHandler: function (e) {
            e.preventDefault();
            var button = $(e.currentTarget);
            this._trigger('destroy', null, $.extend({
                context: button.closest('.template-download'),
                type: 'DELETE'
            }, button.data()));
        },

        _forceReflow: function (node) {
            return $.support.transition && node.length &&
                node[0].offsetWidth;
        },

        _transition: function (node) {
            var dfd = $.Deferred();
            if ($.support.transition && node.hasClass('fade') && node.is(':visible')) {
                node.bind(
                    $.support.transition.end,
                    function (e) {
                        // Make sure we don't respond to other transitions events
                        // in the container element, e.g. from button elements:
                        if (e.target === node[0]) {
                            node.unbind($.support.transition.end);
                            dfd.resolveWith(node);
                        }
                    }
                ).toggleClass('in');
            } else {
                node.toggleClass('in');
                dfd.resolveWith(node);
            }
            return dfd;
        },

        _initButtonBarEventHandlers: function () {
            var fileUploadButtonBar = this.element.find('.fileupload-buttonbar'),
                filesList = this.options.filesContainer;
            this._on(fileUploadButtonBar.find('.start'), {
                click: function (e) {
                    e.preventDefault();
                    filesList.find('.start').click();
                }
            });
            this._on(fileUploadButtonBar.find('.cancel'), {
                click: function (e) {
                    e.preventDefault();
                    filesList.find('.cancel').click();
                }
            });
            this._on(fileUploadButtonBar.find('.delete'), {
                click: function (e) {
                    e.preventDefault();
                    filesList.find('.toggle:checked')
                        .closest('.template-download')
                        .find('.delete').click();
                    fileUploadButtonBar.find('.toggle')
                        .prop('checked', false);
                }
            });
            this._on(fileUploadButtonBar.find('.toggle'), {
                change: function (e) {
                    filesList.find('.toggle').prop(
                        'checked',
                        $(e.currentTarget).is(':checked')
                    );
                }
            });
        },

        _destroyButtonBarEventHandlers: function () {
            this._off(
                this.element.find('.fileupload-buttonbar')
                    .find('.start, .cancel, .delete'),
                'click'
            );
            this._off(
                this.element.find('.fileupload-buttonbar .toggle'),
                'change.'
            );
        },

        _initEventHandlers: function () {
            //this._super();
            this._on(this.options.filesContainer, {
                'click .start': this._startHandler,
                'click .cancel': this._cancelHandler,
                'click .delete': this._deleteHandler
            });
            this._initButtonBarEventHandlers();
        },

        _destroyEventHandlers: function () {
            this._destroyButtonBarEventHandlers();
            this._off(this.options.filesContainer, 'click');
            this._super();
        },

        _enableFileInputButton: function () {
            this.element.find('.fileinput-button input')
                .prop('disabled', false)
                .parent().removeClass('disabled');
        },

        _disableFileInputButton: function () {
            this.element.find('.fileinput-button input')
                .prop('disabled', true)
                .parent().addClass('disabled');
        },

        _initTemplates: function () {
            var options = this.options;
            options.templatesContainer = this.document[0].createElement(
                options.filesContainer.prop('nodeName')
            );
            if (tmpl) {
                if (options.uploadTemplateId) {
                    options.uploadTemplate = tmpl(options.uploadTemplateId);
                }
                if (options.downloadTemplateId) {
                    options.downloadTemplate = tmpl(options.downloadTemplateId);
                }
            }
        },

        _initFilesContainer: function () {
            var options = this.options;
            if (options.filesContainer === undefined) {
                options.filesContainer = this.element.find('.files');
            } else if (!(options.filesContainer instanceof $)) {
                options.filesContainer = $(options.filesContainer);
            }
        },

        _initSpecialOptions: function () {
            //this._super();
            this._initFilesContainer();
            this._initTemplates();
        },

        _create: function () {
            this._super();

            this._processing = 0;
            this._processingQueue = $.Deferred().resolveWith(this)
                .promise();


            this._initSpecialOptions();
            this._initEventHandlers();

            //$(this.element).fileupload(this.options);
            this._uploader = uploader(this.element,this.options);
            this._resetFinishedDeferreds();
            if (!$.support.fileInput) {
                this._disableFileInputButton();
            }
        },

        enable: function () {
            var wasDisabled = false;
            if (this.options.disabled) {
                wasDisabled = true;
            }
            this._super();
            if (wasDisabled) {
                this.element.find('input, button').prop('disabled', false);
                this._enableFileInputButton();
            }
        },

        disable: function () {
            if (!this.options.disabled) {
                this.element.find('input, button').prop('disabled', true);
                this._disableFileInputButton();
            }
            this._super();
        }

    });

    return $;
});
