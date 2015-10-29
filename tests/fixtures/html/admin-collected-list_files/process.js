var processObj = {
    initialize: function () {
    },
    domReady: function () {
    },
    dynamicForm: function (options) {
        var autoOpen = false;
        if (typeof(options.autoOpen) != 'undefined') {
            autoOpen = options.autoOpen;
        }
        if (typeof(options.openUrl) == 'undefined') {
            throw 'couldn\'t found options.openUrl';
        }
        if (typeof(options.selector) == 'undefined' && !autoOpen) {
            throw 'couldn\'t found options.selector to bind';
        }
        if ($(options.selector).length == 0 && !autoOpen) {
            return
        }

        try {
            options.dialogOptions = $.extend({
                nbr: function (selector) {
                    return settings.nbr(selector);
                }
            }, options.dialogOptions);

            var settings = $.extend({
                encId: function (selector) {
                    var res = $(selector).data('id');
                    return (typeof(res) == 'undefined' ? '' : res);
                },
                dialogOptions: {
                    nbr: function (selector) {
                        return settings.nbr(selector);
                    }
                },
                buttons: {},
                openUrlParams: [],
                getOpenUrl: function (selector) {
                    var params = '';
                    if (this.openUrlParams.length > 0) {
                        this.openUrlParams.forEach(function (item, key) {
                            if (item.indexOf('$') === 0) {
                                params += $(selector).data(item.substring(1));
                            } else {
                                params += item;
                            }
                        })
                    } else {
                        params = settings.encId(selector);
                    }
                    var baseUrl = settings.openUrl;
                    var localUrl = $(selector).data('openUrl');
                    if (localUrl) {
                        baseUrl = localUrl;
                    }

                    return baseUrl + params;
                },
                beforeModalCallback: function (selector) {
                    return true;
                },
                openSuccessCallback: function (selector, dialog) {
                    //frm.utils.dynamic.callback(undefined, dialog);
                },
                afterOpenCallback: function () {
                },
                titleCallback: function () {
                    return settings.title;
                },
            }, options);


            var countSelector = 1;


            function onModalSelectorClick(e) {
                frm.utils.increaseWaitCount('modal show');
                e.preventDefault();
                var selector = this;
                $(selector).data('dialogSettings', settings);
                if (!settings.beforeModalCallback(selector)) {
                    return;
                }
                var newDialogOptions = prepareDialogOptions(settings);
                var dialog = bootbox.dialog(newDialogOptions);
                $(dialog).data('dialogSettings', settings);
                settings.selector = $(selector);
                settings.dialog = dialog;
                App.blockUI();
                var ajaxOptions = {
                    url: settings.getOpenUrl(selector),
                    //async: false,
                    success: function (data) {
                        var html;
                        App.unblockUI();
                        if (typeof data == 'object') {
                            if (data.form) {
                                html = data.form;
                            }
                            if (data.error) {
                                bootbox.alert(data.error, function () {
                                    dialog.modal('hide');
                                });
                                return;
                            }
                        } else {
                            html = data;
                        }
                        var body = $(dialog).find('.bootbox-body');
                        try {
                            window.inModalInsert = true;
                            window.inModalInsertObj = dialog;
                            body.html(html);
                            delete window.inModalInsert;
                            delete window.inModalInsertObj;
                        } catch (e) {
                            noty({type: 'error', text: e.message})
                        }
                        dialog.on('shown.bs.modal', function () {
                            dialog.one('hide.bs.modal', function () {
                                frm.utils.increaseWaitCount('modal hide');
                            });
                            dialog.one('hidden.bs.modal', function () {
                                frm.utils.decreaseWaitCount('modal hidden');
                            });


                            frm.utils.dynamic.callback(undefined, body);
                            settings.openSuccessCallback(selector, dialog, data);
                            settings.afterOpenCallback(selector, dialog);
                            frm.utils.decreaseWaitCount('modal shown');
                        });

                        dialog.modal("show");

                    },
                    error: function (e) {
                        App.unblockUI();
                        noty({type: 'error', text: e.responseText})
                    },
                    headers: {
                        'X-target': 'modal'
                    }

                }

                $.ajax(ajaxOptions);
                function prepareDialogOptions(sett) {
                    var buttonsDef = {};
                    var countButton = 1;
                    var settings1 = $(selector).data('dialogSettings');
                    var settings2 = sett;

                    for (var buttonName in settings.buttons) {
                        if (settings.buttons.hasOwnProperty(buttonName)) {
                            var buttonDefinition = settings.buttons[buttonName];
                            buttonsDef[buttonName] = buttonDefinition;


                            function newCallback(e) {
                                var btnText = $(e.target).text();
                                var self = settings.buttons[btnText];
                                if (typeof self != 'undefined' && typeof self.beforeSendCallback != 'undefined') {
                                    self.beforeSendCallback(selector, dialog);
                                }
                                if (typeof(self.type) != 'undefined' && self.type == 'ajax') {
                                    var url = (self.hasOwnProperty('url') ? self.url + settings.encId(selector) : settings.getOpenUrl(selector) );
                                    var getData = function () {
                                        var postData;
                                        if ($(dialog).find('form').find('input[type="file"]').size() > 0) {

                                            postData = new FormData();

                                            $($(dialog).find('form')[0].elements).each(function () {
                                                if (this.localName == 'input' && $(this).attr('type') == 'file') {
                                                    if (this.files.length > 0) {
                                                        if (this.files.length == 1) {
                                                            postData.append(this.name, this.files[0]);
                                                        } else {
                                                            $.each(this.files, function (i, file) {
                                                                postData.append('file-' + i, file);
                                                            });
                                                        }
                                                    }
                                                } else {
                                                    if ($(this).is(':checkbox')) {
                                                        if ($(this).is(':checked')) {
                                                            postData.append(this.name, $(this).val())
                                                        }
                                                    } else {
                                                        postData.append(this.name, $(this).val())
                                                    }
                                                }
                                            });
                                        } else {
                                            if ($(dialog).find('form').length > 0) {
                                                postData = $(dialog).find('form').serialize();
                                                //var r20 = /%20/g;
                                                //var add = encodeURIComponent($(this).attr('name')) + "=" + encodeURIComponent($(this).val()).replace(r20, "+");
                                                //postData += '&' + add;
                                            }
                                        }
                                        return postData;
                                    }

                                    var options = {
                                        url: url,
                                        type: 'POST',
                                        data: getData(),
                                        success: function (data) {
                                            if (typeof (data) == 'object') {
                                                if (data.info) {
                                                    frm.utils.showError(data.info);
                                                }
                                                if (data.reload && data.url) {
                                                    if (typeof self.reloadCallback != 'undefined') {
                                                        self.reloadCallback(selector, dialog, data)
                                                    }
                                                    dialog.modal("hide");
                                                    frm.content.get(data.url, null, null, {}, true);
                                                    frm.debug.dynamicDebug(url, 'reload', '');
                                                } else if (data.message == 'form' || data.hasOwnProperty('form')) {
                                                    if (data.message == 'form') {
                                                        frm.log.warn('deprecated - form as message is not nessery')

                                                    }
                                                    $(dialog).find('.bootbox-body').html('');
                                                    $(dialog).find('.bootbox-body').html(data.form);
                                                    frm.utils.dynamic.callback(undefined, dialog);
                                                    if (typeof self.formCallback != 'undefined') {
                                                        self.formCallback(selector, dialog, data)
                                                    }
                                                } else if (data.message == 'ok') {
                                                    frm.utils.dynamic.callback(undefined, dialog);
                                                    if (typeof self.successCallback != 'undefined') {
                                                        self.successCallback(selector, dialog, data)
                                                    }
                                                    dialog.modal("hide");
                                                } else {
                                                    alert('error: ' + data.message);
                                                    dialog.modal("hide");
                                                }
                                            } else {
                                                alert('error : brak odpowiedzi');
                                                dialog.modal("hide");
                                            }

                                        },
                                        error: function () {
                                            if (typeof(self.errorCallback != 'undefined')) {
                                                self.errorCallback(selector)
                                            }
                                            dialog.modal("hide");
                                        }
                                    }
                                    if (typeof (options.data) == 'object' && options.data instanceof FormData) {
                                        options = $.extend({
                                            processData: false,
                                            contentType: false,
                                            type: 'POST'
                                        }, options);
                                    }
                                    $.ajax(options)
                                    return false;
                                } else {
                                    if (typeof self.buttonCallback != 'undefined') {
                                        self.buttonCallback(selector, dialog)
                                    }
                                    dialog.modal("hide");
                                }
                            }

                            if (typeof buttonDefinition.buttonCallback == "undefined" && typeof buttonDefinition.callback == 'function') {
                                buttonDefinition.buttonCallback = buttonDefinition.callback;
                            }

                            buttonDefinition.callback = newCallback;
                            buttonDefinition.uid = countSelector + '-' + countButton;
                        }
                        countButton++;
                    }

                    var dialogOptions = $.extend({
                        show: false,
                        message: '<div class="content"></div>',
                        buttons: $.extend(buttonsDef, {
                            cancel: {
                                label: "Anuluj",
                                className: "btn-primary-bb",
                                callback: function () {
                                    $(dialog).modal("hide");
                                }
                            }
                        }),
                        close: function () {
                            $(dialog).modal("hide");
                        },
                        settings: settings
                    }, settings.dialogOptions);

                    dialogOptions.title = settings.titleCallback(selector, dialog);

                    if (typeof settings.beforeCloseCallback != 'undefined') {
                        dialogOptions.beforeClose = settings.beforeCloseCallback;
                    }

                    return dialogOptions;
                }

                return false;
            }

            if (autoOpen) {
                var thisObj = {};
                var e = new jQuery.Event();
                onModalSelectorClick.call(thisObj, e);
            } else {
                $(settings.selector).each(function (index, elem) {
                    var events = $._data(this, 'events') || {};
                    if (events.hasOwnProperty('click')) {
                        events.click.forEach(function (handler) {
                            if (handler.handler.prototype.constructor.name == 'onModalSelectorClick') {
                                $(elem).unbind('click', handler.handler);
                            }
                        })
                    }
                })
                //click(onModalSelectorClick);


                $(settings.selector).click(onModalSelectorClick);
            }
            //$(settings.selector).delegate('click', onModalSelectorClick);

        } catch (e) {
            App.unblockUI();
            noty({type: 'error', text: e.responseText})
        }
    },

    collectedPreview: function (selector) {
        selector = selector || '.collectedPreview';
        this.dynamicForm({
            selector: selector,
            title: "Podglad danych",
            openUrl: "/ajax/complete/preview/id/",
            buttons: [],
            dialogOptions: {className: "large"}
        });
    },
    collectedEdit: function (selector) {
        selector = selector || '.collectedEdit';
        this.dynamicForm({
            selector: selector,
            title: "Podglad danych",
            openUrl: "/ajax/complete/edit/id/",
            buttons: {
                "Zapisz zmiany": {
                    className: "btn-success",

                    callback: function (selector, dialog) {
                        var self = this;
                        var url = '/ajax/complete/edit/id/' + $(selector).data('id');
                        $.ajax({
                            url: url,
                            type: 'POST',
                            data: $(dialog).find('form').serialize(),
                            success: function (data) {
                                if (typeof (data) == 'object') {
                                    if (data.message == 'ok') {
                                        if (typeof(self.successCallback) != 'undefined') {
                                            self.successCallback(selector)
                                        }
                                        //dialog.dialog("close");
                                        dialog.modal('hide');
                                    } else if (data.message == 'form') {
                                        $(dialog).html('');
                                        $(dialog).html(data.form);
                                        if (typeof(self.formCallback) != 'undefined') {
                                            self.formCallback(selector)
                                        }
                                    } else {
                                        alert('error: ' + data.message);
                                        //dialog.dialog("close");
                                        dialog.modal('hide');
                                    }
                                } else {
                                    alert('error : brak odpowiedzi');
                                    dialog.dialog("close");
                                    dialog.modal('hide');
                                }
                            },
                            error: function () {
                                if (typeof(self.errorCallback) != 'undefined') {
                                    self.errorCallback(selector)
                                }
                                dialog.dialog("close");
                                dialog.modal('hide');
                            }
                        })
                    }
                }
            },
            dialogOptions: {className: "large"}
        });

    },
    addNote: function (selector) {
        selector = selector || '.addNote';
        this.dynamicForm({
            openUrl: '/ajax/complete/note/id/',
            selector: selector,
            title: 'Dodaj notatkę',
            buttons: {
                "Zapisz zmiany": {
                    type: "ajax",
                    className: "btn-success",

                    url: '/ajax/complete/note/id/',
                    successCallback: function (selector, dialog, data) {
                        var note = $(dialog).find('form textarea').first().val();
                        var z = $(selector)
                            .parents('.bootbox-body')
                            .find('table tr').find('td:first').filter(function () {
                                return this.innerHTML == 'notatka';
                            })
                        z.next().html(note);

                        $(selector)
                            .parents('.bootbox-body')
                            .find('table tr').find('td:first').filter(function () {
                            return this.innerHTML == 'notatka';
                        }).next().html(note);
                        var date = $(dialog).find('form input[type="text"]').first().val();
                        $(selector)
                            .parents('.bootbox-body')
                            .find('table tr').find('td:first').filter(function () {
                            return this.innerHTML == 'notatka data';
                        }).next().html(date);

                    }
                }
            }
        })
    },

    callsPreview: function (selector) {
        selector = selector || '.callsPreview';
        this.dynamicForm({
            selector: selector,
            title: "Podglad danych",
            openUrl: "/administrator/collected/calldetails/id/",
            dialogOptions: {className: "large"},
            openSuccessCallback: function (selector, dialog) {
                processObj.playRecording(dialog);
            },
        });
    },

    processEdit: function (dialog) {
        this.dynamicForm({
            parentDialog: dialog,
            selector: ".processEdit",
            titleCallback: function (selector) {
                return "edycja procesu: " + $(selector).data('title');
            },
            openUrl: "",
            buttons: {
                "Zapisz zmiany": {
                    type: "ajax",
                    className: "btn-success",
                    successCallback: function (selector, dialog) {
                        var options = $(selector).data('dialogSettings');
                        var options1 = $(dialog).data('dialogSettings');

                        var parentOptions = options.parentDialog.data('dialogSettings');

                        var newUrl = parentOptions.getOpenUrl(parentOptions.selector);


                        var body = $(options.parentDialog).find('.bootbox-body')

                        frm.content.get(newUrl, body);

                        if (typeof(parentOptions) != 'undefined' && typeof(parentOptions.openSuccessCallback) != 'undefined') {
                            frm.content._selector.one('content-inserted', function (data, options) {
                                parentOptions.openSuccessCallback(parentOptions.selector, parentOptions.dialog);
                            })
                        }
                    }
                }
            }
        });
    },
    playRecording: function (selector) {
        this.dynamicForm({
            selector: $(selector).find(".callPlay"),
            openUrl: "/administrator/collected/playrecording/id/",
        });
    },

    showHistory: function (selector) {
        selector = selector || '.history';

        this.dynamicForm({
            selector: selector,
            title: "historia danych ",
            openUrl: "/administrator/repository/history/id/",
            dialogOptions: {className: "large"}
        });
    },
    dpdDelivery: function (selector, postalCode, fieldSelectorFrom, fieldSelectorTo) {
        selector = $(selector || '.dpdDelivery');

        if (typeof fieldSelectorFrom == 'undefined') {
            if ($('#delivery_address-hourFrom').length > 0) {
                fieldSelectorFrom = '#delivery_address-hourFrom';
            }
        }
        if (typeof fieldSelectorFrom == 'undefined') {
            if ($('#delivery_address-hourTo').length > 0) {
                fieldSelectorFrom = '#delivery_address-hourTo';
            }
        }
        if (selector.length) {
            if (typeof fieldSelectorFrom == 'undefined' || typeof fieldSelectorTo == 'undefined') {
                var group1 = $(selector).parent().parent().next().next();
                var label1 = group1.find('label');
                if (null !== label1.text().match(/od/i)) {
                    fieldSelectorFrom = group1.find('input');
                }
                var group2 = $(selector).parent().parent().next().next().next();
                var label2 = group2.find('label');
                if (null !== label2.text().match(/do/i)) {
                    fieldSelectorTo = group2.find('input');
                }
            }


            var template = '' +
                '<table class="table table-striped table-condensed table-hover">' +
                '    <thead>' +
                '    <tr>' +
                '        <th>Od</th>' +
                '        <th>Do</th>' +
                '        <% if(isForm){%>' +
                '        <th>opcje</th>' +
                '        <% }%>' +
                '    </tr>' +
                '    </thead>' +
                '    <tbody>' +
                '    <%for(var i=0;i<elements.length;i++){%>' +
                '    <tr>' +
                '        <td><%=elements[i][1]%></td>' +
                '        <td><%=elements[i][2]%></td>' +
                '        <% if(isForm){%>' +
                '        <td>' +
                '            <ul class="table-controls">' +
                '                <li><a class="bs-tooltip chooseDpd" data-original-title="wybierz"><i class="fa fa-check"></i></a></li>' +
                '            </ul>' +
                '        </td>' +
                '        <% } %>' +
                '    </tr>' +
                '    <%}%>' +
                '    </tbody>' +
                '</table>';

            var options = {
                beforeModalCallback: function () {
                    var post = ($(postalCode).is(':input') ? $(postalCode).val() : $(postalCode).text());
                    if (!post) {
                        bootbox.alert(trn.t('_error.noPostCode'));
                        return false;
                    }
                    return true;
                },
                openUrl: '/ajax/modal/dpddelivery/postalCode/',
                selector: selector,
                title: 'Doręczenia DPD kod pocztowy: ' + ($(postalCode).is(':input') ? $(postalCode).val() : $(postalCode).text()),
                openSuccessCallback: function (selector, dialog, data) {
                    frm.test();

                    var location = window.location.hostname
                    if (-1 !== location.indexOf('ccnew') || -1 !== location.indexOf('cc.local')) {
                        dialog.find('.bootbox-body').html('');
                    }

                    var data = {
                        elements: JSON.parse(data.data),
                        isForm: false
                    };
                    if (typeof fieldSelectorFrom != 'undefined' && typeof fieldSelectorTo != 'undefined') {
                        data.isForm = true;
                    }
                    var tmpl = $($.tmpl(template, data));
                    dialog.find('.bootbox-body').append(tmpl);
                    if (typeof fieldSelectorFrom != 'undefined' && typeof fieldSelectorTo != 'undefined') {
                        tmpl.find('a.chooseDpd').click(function () {
                            var td = $(this).parents('tr').find('td')
                            $(fieldSelectorFrom).val($(td[0]).text());
                            $(fieldSelectorTo).val($(td[1]).text());
                            dialog.modal('hide');
                        })
                    }

                }
            };

            if (typeof(postalCode) != 'undefined') {
                $.extend(options, {
                    encId: function () {
                        var elem = $(postalCode);
                        var value;
                        if (elem.is(':input')) {
                            value = elem.val();
                        } else {
                            value = elem.text();
                        }
                        return value.replace('-', '');
                    }
                });
            }
            this.dynamicForm(options)
        }
    },
    dynamicHelper: function (params) {
        frm.test();
        params = params || {};

        var bindTo, requestParams;

        if (typeof (params.bindTo) != 'undefined') {
            bindTo = $(params.bindTo);
            if (bindTo.length == 0) {
                frm.utils.showError('elemenet to bind' + params.bindTo + 'not found');
            }
        } else {
            frm.utils.showError('elemenet to bind not defined');
        }


        if (typeof (params.request) == 'object') {
            requestParams = params.request;
        } else {
            frm.utils.showError('request options not defined');
        }

        $(bindTo).click(function () {
            var baseOptions = {
                type: 'GET'
            };

            var requestOptions = $.extend(baseOptions, requestParams);

            $.ajax(requestOptions);

            /*                if (typeof(postalCode) != 'undefined') {
             $.extend(options, {
             encId: function () {
             var elem = $(postalCode);
             var value;
             if (elem.is(':input')) {
             value = elem.val();
             } else {
             value = elem.text();
             }
             return  value.replace('-', '');
             }
             });
             }

             processObj.dynamicForm(options)*/
        });
    },
    itemSelection: function (isFile, tableId) {
        isFile = typeof isFile == 'undefined' ? false : isFile;

        function selection() {
            var btn = $('#send');
            if (btn.length == 0) {
                btn = $('<button id="send" class="btn"><span>Export <i class="fa fa-download"></i></span></button>')
                $('.dataTables_header .col-md-8').append(btn)
            }
            btn.prop('disabled', true);
            btn.click(function () {
                var form = $(this).parents('form');
                if (isFile) {
                    window.preventUnloadPrompt = true;
                    $('form').trigger('submit', true);
                } else {
                    frm.content.get(form.attr('action'), '#content', form.serialize());
                }
                $('input[name^="c"]:checkbox:checked').each(function () {
                    var x = $(this).parents('tr');
                    x.remove();
                })
            });
            $('input:checkbox').filter('input[name^="c"]').change(function () {
                if ($(this).is(':checked')) {
                    btn.prop('disabled', false);
                } else {
                    if ($('input[name^="c"]:checkbox:checked').length == 0) {
                        btn.prop('disabled', true);
                    }
                }
            });
            if ($('input[name^="c"]:checkbox:checked').length > 0) {
                btn.prop('disabled', false);
            }
        }

        if (tableId) {
            $(tableId).on('init.dt', selection);
        } else {
            selection();
        }
    },
    pack: {
        urlPrefix: null,
        ready: function (urlPrefix) {
            this.urlPrefix = urlPrefix;
            processObj.pack.barcodeWait('#barcode-1');

            var btnCreate = $('button.createPackage');


            btnCreate.prop('disabled', true)
            btnCreate.addClass('btn-success')

            $('select#type, select#unit').change(function () {
                if ($('select#type').val() != 'x') {
                    $(this).prop('disabled', true);
                }
                if ($('select#unit').val() != 'x') {
                    $(this).prop('disabled', true);
                }
                if ($('select#type').val() != 'x' && $('select#unit').val() != 'x' && $('input#packId').val() != '') {
                    $(this).parents('form').find('input').prop('disabled', false).focus();

                }
            });
            $('input#packId').keyup(function () {
                if ($('select#type').val() != 'x' && $('select#unit').val() != 'x' && $('input#packId').val() != '') {
                    $(this).parents('form').find('input').prop('disabled', false);

                }
            });
            btnCreate.click(function (event) {
                var disabled = $(this).prop('disabled')
                if (!disabled) {
                    var form = $('form#pack');
                    $('select#type').prop('disabled', false);
                    $('select#unit').prop('disabled', false);
                    $('input#packId').prop('disabled', false);

                    var postData = $(form).serialize();
                    var url = $('form#pack').attr('action');


                    var options = {
                        successCallback: function () {
                            frm.content.get(processObj.pack.urlPrefix + '/list');
                        },
                        postData: postData
                    }
                    var message = 'Przygotowywanie exportu, proszę czekać...'
                    frm.utils.fileDownload(url, message, options);
                    return false;

                    return false;
                }
            })
        },
        addItem: function (after) {
            var max = 50;
            if ($(after).parents('form').find('input').not('#packId').length >= max) {
                alert(max + ' dodanych');
                return false;
            }

            var count = $(after).parents('form').find('input[type="text"]').not('#packId').length + 1;
            var current = $('#barcode-1').parents('.form-group');
            var form = $(after).parents('.form-group')


            var newElem = $('<div class="form-group">' +
                '<label for="' + 'barcode-' + count + '" class="col-md-2 control-label optional">' + 'barcode' + count + '</label>' +
                '<div class="col-md-10 controls">' +
                '<input type="text" name="' + 'barcode[' + count + ']' + '" id="' + 'barcode-' + count + '" value="" class=" form-control">' +
                '</div></div>');
            form.after(newElem);
            var input = newElem.find('input').focus();

            processObj.pack.barcodeWait(input);
            return true;
        },
        barcodeWait: function (element) {
            $(element).keyup(function (event) {
                var value = $(this).val();
                //console.log('change ' + event.target.id + ' v:' + value + ' k:' + event.keyCode);
                if (event.keyCode < 47) {
                    return     //egz. ctrl+v fires twice
                }
                if (value.length == 12) {
                    if (!processObj.pack.checkIfExist(value, $(element).parents('form').find('input[type="text"]'))) {
                        var _super = this;
                        var url = processObj.pack.urlPrefix + '/_check/barcode/' + value + '/type/' + $('select#type').val() + '/unit/' + $('select#unit').val();
                        frm.content.get(url, null, {}, {
                            success: function (data, statusText, jqXHR) {
                                App.unblockUI(this.over);
                                if (data.message && data.message == 'ok') {
                                    $(this.super).unbind(event);
                                    // clear errors if exist
                                    processObj.pack.addItem(_super);
                                    $(this.super).prop('readonly', true);
                                    $('button.createPackage').prop('disabled', false)

                                } else {
                                    //add error
                                    $(this.super).val('');
                                    frm.utils.showError('<p>błąd</p>' + data.error);
                                    $('button.createPackage').prop('disabled', true)
                                }
                            },
                            super: _super
                        })
                    } else {
                        $(this).val('');
                        frm.utils.showError('<p>błąd</p>numer na liście');
                    }
                }
            })
        },
        checkIfExist: function (value, elements) {
            for (var i = 0; i < elements.length - 1; i++) {
                if (value == $(elements[i]).val()) {
                    return true;
                }
            }
            return false
        }
    },
    changePassword: function (selector) {
        var options = {
            selector: selector,
            title: "Zmina hasła ",
            openUrl: "/logout/changepass/encId/",
            openUrlParams: [],
            buttons: {
                "Zmień": {
                    name: "Zmień",
                    type: "ajax",
                    className: "btn-success",
                    url: '/logout/changepass/encId/',
                    successCallback: function () {
                    },
                    formCallback: function () {
                    },
                    errorCallback: function () {
                    },
                    reloadCallback: function () {
                    },
                    beforeSendCallback: function () {
                    }
                }
            }
            ,
            dialogOptions: {
                className: "large"
            }
        }
        processObj.dynamicForm(options);
    }
};
jQuery(document).ready(function () {
    processObj.domReady();
});
