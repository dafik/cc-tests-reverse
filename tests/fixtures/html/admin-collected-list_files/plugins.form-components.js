/*
 * Core script to handle all form specific plugins
 */

var FormComponents = function () {

    "use strict";

    /**************************
     * Elastic textareas      *
     **************************/
    var initAutosize = function (selector) {
        if ($.fn.autosize) {
            selector.find('textarea.auto').autosize();
        }
    }

    /**************************
     * Input limiter          *
     **************************/
    var initInputlimiter = function (selector) {
        if ($.fn.inputlimiter) {
            // Set default options
            $.extend(true, $.fn.inputlimiter.defaults, {
                boxAttach: false,
                boxId: 'limit-text',
                remText: '%n character%s remaining.',
                limitText: 'Field limited to %n character%s.',
                zeroPlural: true
            });

            // Initialize limiter
            selector.find('textarea.limited').each(function (index, value) {
                var limitText = $.fn.inputlimiter.defaults.limitText;
                var data_limit = $(this).data('limit');
                limitText = limitText.replace(/\%n/g, data_limit);
                limitText = limitText.replace(/\%s/g, (data_limit <= 1 ? '' : 's'));

                $(this).parent().find('#limit-text').html(limitText);
                $(this).inputlimiter({
                    limit: data_limit
                });
            });
        }
    }

    /**************************
     * Uniform                *
     **************************/
    var initUniform = function (selector) {
        if ($.fn.uniform) {
            selector.find(':radio.uniform, :checkbox.uniform').uniform();
        }
    }

    /**************************
     * Tags                   *
     **************************/
    var initTags = function () {
        if ($.fn.tagsInput) {
            // Initialize and set default options
            selector.find('.tags').tagsInput({
                width: '100%',
                height: 'auto',
                defaultText: 'add a tag'
            });
        }
    }

    /**************************
     * Select2                *
     **************************/
    var initSelect2 = function (selector) {
        if ($.fn.select2) {
            // Set default options
            /*$.extend(true, $.fn.select2.defaults, {
             width: 'resolve'
             });*/
            var inModal = false;
            if (selector.hasClass('bootbox-body')) {
                var inModal = true;


            }
            $.fn.select2.defaults.set("theme", "cc");

            // Initialize default select2 boxes
            selector.find('.select2').each(function () {
                    var self = $(this);
                    var d = self.data();
                    var options = {};
                    var test = /_op$/;
                    if (!this.id.match(test)) {
                        options = {
                            'allowClear': true,
                            placeholder: 'wybierz'
                        };
                    }


                    var getOptions = function () {

                        var data = self.data();
                        var tmp = {};
                        var r = /\./
                        var parts;

                        for (var i in data) {
                            if (data.hasOwnProperty(i)) {
                                if (r.test(i)) {
                                    parts = i.split('.');
                                    if (!tmp.hasOwnProperty(parts[0])) {
                                        tmp[parts[0]] = {};
                                    }
                                    tmp[parts[0]][parts[1]] = data[i];

                                } else {
                                    tmp[i] = data[i];
                                }
                            }
                        }

                        var opt = typeof tmp['select2Aa'] != 'undefined' ? tmp['select2Aa'] : false;
                        if (!opt) {
                            return options;
                        }
                        return $.extend(options, {
                            'allowClear': true,
                            ajax: {
                                type: 'POST',
                                url: opt.url,
                                data: function (params) {
                                    var queryParameters = {
                                        q: params.term,
                                        page: params.page,
                                        part: opt.part,
                                        filter: {},
                                        field: opt.field
                                    }
                                    var params = ((typeof opt.filter != 'undefined') ? opt.filter : [])
                                    params.forEach(function (selector) {
                                        queryParameters.filter[selector] = $(selector).val()
                                    });
                                    return queryParameters;
                                },
                                processResults: function (data) {
                                    var tmp = data.results;
                                    if (data.hasOwnProperty('count')) {
                                        var isMax = ((data.page - 1) * data.perPage) > data.count;
                                        if (!isMax) {
                                            var page = data.page || 2;
                                            var newOption = {id: null, text: '<a data-page="' + page + '" class="select2-options-more">more (' + (data.count - tmp.length) + ')</a>'}
                                            tmp.push(newOption);
                                        }
                                    }
                                    return {
                                        results: tmp
                                    };
                                },

                                reset: ((typeof opt.reset != 'undefined') ? opt.reset : [])
                            },
                            escapeMarkup: function (markup) {
                                /*if (markup.indexOf('<a class"select2-options-more">') > -1) {
                                 markup = $(markup)
                                 markup.click(function () {
                                 var x = 1;
                                 })
                                 }*/

                                return markup;
                            },
                        })
                    }


                    if (typeof d.select2 == 'undefined' && !$(this).hasClass('select2-container')) {
                        var options = getOptions()

                        if (inModal) {

                            var _this = this;

                            var selectOnModal = function (Utils, DropdownAdapter, AttachContainer, DropdownSearch) {
                                var CustomAdapter = Utils.Decorate(
                                    Utils.Decorate(
                                        DropdownAdapter,
                                        DropdownSearch
                                    ),
                                    AttachContainer
                                );
                                $.extend(options, {
                                    dropdownAdapter: CustomAdapter
                                });
                                $(_this).select2(options);
                            }

                            $.fn.select2.amd.require([
                                "select2/utils",
                                "select2/dropdown",
                                "select2/dropdown/attachContainer",
                                "select2/dropdown/search",
                            ], selectOnModal)
                        } else {
                            $(this).select2(options);
                            if (typeof options.ajax != 'undefined') {
                                var reset = options.ajax.reset;
                                if (reset.length > 0) {
                                    reset.forEach(function (selector) {
                                        $(self).on('change', function () {
                                            $(selector).data('select2').results.clear();
                                            var v = $(selector).select2('val', '')
                                        })
                                    })
                                }
                                var s2 = $(self).data('select2');
                                s2.on('results:all', function (e) {
                                    /*markup.click(function () {
                                     var x = 1;
                                     })*/
                                    this.$results.find('li a.select2-options-more').click(function () {
                                        s2.results.clear();
                                        s2.trigger('query', {
                                            page: $(this).data('page')
                                        });
                                        var z = 1;
                                    })


                                })


                            }
                        }
                    }
                }
            )
            // Initialize DataTables Select2 Boxes
            selector.find('.dataTables_length select').select2({
                minimumResultsForSearch: "-1"
            });
        }
    }

    /**************************
     * Fileinput              *
     **************************/
    var initFileinput = function (selector) {
        if ($.fn.fileInput) {
            // Set default options
            $.extend(true, $.fn.fileInput.defaults, {
                placeholder: 'Nie wybrano pliku',
                buttontext: 'Wybierz plik ...'
            });

            selector.find('[data-style="fileinput"]').each(function () {
                var $input = $(this);
                $input.fileInput($input.data());
            });
        }
    }

    /**************************
     * Spinner                *
     **************************/
    var initSpinner = function (selector) {
        if ($.fn.spinner) {
            selector.find('.spinner').each(function () {
                $(this).spinner();
            });
        }
    }

    /**************************
     * Dual Select Boxes      *
     **************************/
    var initDualListBox = function (selector) {
        if ($.configureBoxes) {
            $.configureBoxes();
        }
    }

    /**************************
     * Validation             *
     **************************/
    var initValidation = function (selector) {
        if ($.validator) {
            // Set default options
            $.extend($.validator.defaults, {
                errorClass: "has-error",
                validClass: "has-success",
                highlight: function (element, errorClass, validClass) {
                    if (element.type === 'radio') {
                        this.findByName(element.name).addClass(errorClass).removeClass(validClass);
                    } else {
                        $(element).addClass(errorClass).removeClass(validClass);
                    }
                    $(element).closest(".form-group").addClass(errorClass).removeClass(validClass);
                },
                unhighlight: function (element, errorClass, validClass) {
                    if (element.type === 'radio') {
                        this.findByName(element.name).removeClass(errorClass).addClass(validClass);
                    } else {
                        $(element).removeClass(errorClass).addClass(validClass);
                    }
                    $(element).closest(".form-group").removeClass(errorClass).addClass(validClass);

                    // Fix for not removing label in BS3
                    $(element).closest('.form-group').find('label[generated="true"]').html('');
                }
            });

            var _base_resetForm = $.validator.prototype.resetForm;
            $.extend($.validator.prototype, {
                resetForm: function () {
                    _base_resetForm.call(this);
                    this.elements().closest('.form-group')
                        .removeClass(this.settings.errorClass + ' ' + this.settings.validClass);
                },
                showLabel: function (element, message) {
                    var label = this.errorsFor(element);
                    if (label.length) {
                        // refresh error/success class
                        label.removeClass(this.settings.validClass).addClass(this.settings.errorClass);

                        // check if we have a generated label, replace the message then
                        if (label.attr("generated")) {
                            label.html(message);
                        }
                    } else {
                        // create label
                        label = $("<" + this.settings.errorElement + "/>")
                            .attr({"for": this.idOrName(element), generated: true})
                            .addClass(this.settings.errorClass)
                            .addClass('help-block')
                            .html(message || "");
                        if (this.settings.wrapper) {
                            // make sure the element is visible, even in IE
                            // actually showing the wrapped element is handled elsewhere
                            label = label.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
                        }
                        if (!this.labelContainer.append(label).length) {
                            if (this.settings.errorPlacement) {
                                this.settings.errorPlacement(label, $(element));
                            } else {
                                label.insertAfter(element);
                            }
                        }
                    }
                    if (!message && this.settings.success) {
                        label.text("");
                        if (typeof this.settings.success === "string") {
                            label.addClass(this.settings.success);
                        } else {
                            this.settings.success(label, element);
                        }
                    }
                    this.toShow = this.toShow.add(label);
                }
            });
        }
    }

    /**************************
     * WYSIWYG                *
     **************************/
    var initWysiwyg = function (selector) {
        if ($.fn.wysihtml5) {
            // Set default options
            $.extend(true, $.fn.wysihtml5.defaultOptions, {
                stylesheets: ["./assets/css/plugins/bootstrap-wysihtml5.css"]
            });

            selector.find('.wysiwyg').each(function () {
                $(this).wysihtml5();
            });
        }
    }

    /**************************
     * Multiselect            *
     **************************/
    var initMultiselect = function (selector) {
        if ($.fn.multiselect) {
            selector.find('.multiselect').each(function () {
                $(this).multiselect();
            });
        }
    }

    return {

        // main function to initiate all plugins
        init: function (selector) {
            selector = $(selector || 'body');

            initAutosize(selector); // Elastic textareas
            initInputlimiter(selector); // Input limiter
            initUniform(selector); // Uniform (styled radio- and checkboxes)
            initTags(selector); // TagsInput
            initSelect2(selector); // Custom styled selects e.g. with search
            initFileinput(selector); // Custom styled file inputs
            initSpinner(selector); // Spinner
            initDualListBox(selector); // Dual Select Boxes
            initValidation(selector); // Validation
            initWysiwyg(selector); // wysihtml5
            initMultiselect(selector); // Multiselect
        }


    };

}
();