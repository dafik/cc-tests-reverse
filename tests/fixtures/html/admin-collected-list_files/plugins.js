/**
 * Core script to handle plugins
 */

var Plugins = function () {

    "use strict";

    /**
     * $.browser for jQuery 1.9
     */
    var initBrowserDetection = function (selector) {
        $.browser = {};
        (function () {
            $.browser.msie = false;
            $.browser.version = 0;
            if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
                $.browser.msie = true;
                $.browser.version = RegExp.$1;
            }
        })();
    }

    /**
     * Daterangepicker
     */
    var initDaterangepicker = function (selector) {
        if ($.fn.daterangepicker) {
            var options = {
                startDate: moment().subtract(29, 'days'),
                endDate: moment(),
                minDate: '2012-01-01',
                maxDate: '2016-01-01',
                dateLimit: {days: 60},
                showDropdowns: true,
                showWeekNumbers: false,
                timePicker: false,
                timePickerIncrement: 1,
                timePicker12Hour: false,
                ranges: {
                    'Dzisiaj': [moment(), moment()],
                    'Wczoraj': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Ostatnie 7 dni': [moment().subtract(6, 'days'), moment()],
                    'Ostatnie 30 dni': [moment().subtract(29, 'days'), moment()],
                    'Ten miesiąc': [moment().startOf('month'), moment().endOf('month')],
                    'Ostatni miesiąc': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                },
                opens: 'center',
                buttonClasses: ['btn btn-default'],
                applyClass: 'btn-sm btn-primary',
                cancelClass: 'btn-sm',
                format: 'YYYY-MM-DD',
                separator: ' do ',
                locale: {
                    applyLabel: 'Zatwierdź',
                    fromLabel: 'Od',
                    toLabel: 'Do',
                    customRangeLabel: 'Własne widełki',
                    daysOfWeek: ['Nd', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb'],
                    monthNames: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
                    firstDay: 1
                }
            };

            var callback = function (start, end) {
                var range_updated = start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY');

                App.blockUI($("#content"));
                setTimeout(function () {
                    App.unblockUI($("#content"));
                    noty({
                        text: '<strong>Zaktualizowano: ' + range_updated + '.</strong>',
                        type: 'success',
                        timeout: 1000
                    });
                    //App.scrollTo();
                }, 1000);

                $('.range span').html(range_updated);
            };


            selector.find('.rangeDatePicker').click(function () {
                var selector = $(this);


                selector.daterangepicker(options);
                selector.trigger('click.daterangepicker');
                selector.on('apply.daterangepicker cancel.daterangepicker', removeDatepicker)
                function removeDatepicker(event) {
                    $('.daterangepicker.dropdown-menu').remove();
                    selector.off('apply.daterangepicker cancel.daterangepicker', removeDatepicker);
                    if (event.type == 'cancel') {
                        selector.val('');
                        selector.trigger('change');
                    }
                }

            });

            //$('.range span').html(moment().subtract('days', 29).format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));
        }
    }

    /**
     * Sparklines
     */
    var initSparklines = function (selector) {
        if ($.fn.sparkline) {
            // Set default options
            $.extend(true, $.fn.sparkline.defaults, {
                line: {
                    highlightSpotColor: App.getLayoutColorCode('green'),
                    highlightLineColor: App.getLayoutColorCode('red')
                },
                bar: {
                    barColor: App.getLayoutColorCode('blue'),
                    negBarColor: App.getLayoutColorCode('red'),
                    barWidth: 5,
                    barSpacing: 2
                },
                tristate: {
                    posBarColor: App.getLayoutColorCode('green'),
                    negBarColor: App.getLayoutColorCode('red')
                },
                box: {
                    medianColor: App.getLayoutColorCode('red')
                }
            });

            $(window).resize(function () {
                $.sparkline_display_visible();
            }).resize();

            // Initialize statbox sparklines
            selector.find('.statbox-sparkline').each(function () {
                $(this).sparkline('html', Plugins.getSparklineStatboxDefaults());
            })
        }
    }

    /**************************
     * Tooltips               *
     **************************/
    var initTooltips = function (selector) {
        // Set default options

        // TODO: $.extend does not work since BS3!

        $('div.tooltip.fade.top.in').remove(); //claer old

        // This fixes issue #5865
        // (When using tooltips and popovers with the Bootstrap input groups,
        // you'll have to set the container option to avoid unwanted side effects.)
        $.extend(true, $.fn.tooltip.defaults, {
            container: 'body'
        });

        selector.find('.bs-tooltip').tooltip({
            container: 'body'
        });
        selector.find('.bs-focus-tooltip').tooltip({
            trigger: 'focus',
            container: 'body'
        });
    }

    /**************************
     * Popovers               *
     **************************/
    var initPopovers = function (selector) {
        selector.find('.bs-popover').popover();
    }

    /**************************
     * Noty                   *
     **************************/
    var initNoty = function (selector) {
        if ($.noty) {
            // Set default options
            $.extend(true, $.noty.defaults, {
                type: 'alert',
                timeout: false,
                maxVisible: 5,
                animation: {
                    open: {
                        height: 'toggle'
                    },
                    close: {
                        height: 'toggle'
                    },
                    easing: 'swing',
                    speed: 200
                }
            });
        }
    }

    /**************************
     * Easy Pie Chart         *
     **************************/
    var initCircularCharts = function (selector) {
        if ($.easyPieChart) {
            // Set default options
            $.extend(true, $.easyPieChart.defaultOptions, {
                lineCap: 'butt',
                animate: 500,
                barColor: App.getLayoutColorCode('blue')
            });

            // Initialize defaults
            selector.find('.circular-chart').easyPieChart({
                size: 110,
                lineWidth: 10
            });
        }
    }


    var TableButton = function () {
        this.events = {};
    };
    TableButton.prototype.setView = function (view) {
        this.view = view;
        return this;
    };
    TableButton.prototype.addCallback = function (eventName, callback) {
        if (!this.events.hasOwnProperty(eventName)) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
        return this;
    };
    TableButton.prototype.init = function () {
        var obj = $(this.view);

        for (var eventName in this.events) {
            if (this.events.hasOwnProperty(eventName)) {
                this.events[eventName].forEach(function (callback) {
                    obj.on(eventName, callback);
                })
            }
        }
        return obj;
        //make obj
        //add callback
    };
    window.TableButton = TableButton;


    /**************************
     * DataTables             *
     **************************/
    var initDataTables = function (selector) {
        if ($.fn.dataTable) {
            // Set default options

            $.extend(true, $.fn.dataTable.defaults, {
                "sDom": "<'row'<'dataTables_header clearfix'<'col-md-4'l><'col-md-8'f>r>>t<'row'<'dataTables_footer clearfix'<'col-md-6'i><'col-md-6'p>>>",
                // set the initial value
                "iDisplayLength": 10,

                "oLanguage": {
                    "oAria": {
                        "sSortAscending": trn.t('_dt.aria.sortAscending'),
                        "sSortDescending": trn.t('_dt.aria.sortDescending')
                    },

                    "oPaginate": {
                        "sFirst": trn.t("_dt.paginate.first"),
                        "sLast": trn.t("_dt.paginate.last"),
                        "sNext": trn.t("_dt.paginate.next"),
                        "sPrevious": trn.t("_dt.paginate.previous")
                    },
                    "sEmptyTable": trn.t('_dt.emptyTable'),
                    "sInfo": trn.t('_dt.info'),
                    "sInfoEmpty": trn.t('_dt.infoEmpty'),
                    "sInfoFiltered": trn.t('_dt.infoFiltered'),
                    "sInfoPostFix": "",
                    "sDecimal": ",",
                    "sThousands": "",
                    "sLengthMenu": trn.t('_dt.lengthMenu.label'),
                    "sLoadingRecords": trn.t('_dt.loadingRecords'),
                    "sProcessing": trn.t('_dt.processing'),
                    "sSearch": "",
                    "sSearchPlaceholder": "",
                    "sUrl": "",
                    "sZeroRecords": trn.t('_dt.zeroRecords')
                },
                "bInfo": false,
                "bPaginate": false,
                "bFilter": false,
                "bSort": true,
                "bStateSave": true,

                fnDrawCallback: function () {
                    if ($.fn.uniform) {
                        $(':radio.uniform, :checkbox.uniform').uniform();
                    }

                    if ($.fn.select2) {
                        $('.dataTables_length select').select2({
                            minimumResultsForSearch: "-1"
                        });

                        var self = this;
                        self.find(".filter_column").each(function () {
                            //var z = self.data("columnfilterSelect2");
                            //if (typeof z != "undefined") {
                            $(this).children("input").addClass("form-control");
                            $(this).children("select").each(function (i, t) {
                                    //$(this).select2();
                                }
                            )
                            //} else {
                            //    $(this).children("input, select").addClass("form-control")
                            //}
                        })

                    }

                    // SEARCH - Add the placeholder for Search and Turn this into in-line formcontrol
                    var search_input = $(this).closest('.dataTables_wrapper').find('div[id$=_filter] input');

                    // Only apply settings once
                    if (search_input.parent().hasClass('input-group')) return;

                    //search_input.attr('placeholder', 'Search')
                    search_input.addClass('form-control')
                    search_input.wrap('<div class="input-group"></div>');
                    search_input.parent().prepend('<span class="input-group-addon"><i class="fa fa-search"></i></span>');
                    //search_input.parent().prepend('<span class="input-group-addon"><i class="icon-search"></i></span>').css('width', '250px');

                    // Responsive
                    /*if (typeof responsiveHelper != 'undefined') {
                     responsiveHelper.respond();
                     }*/
                },
                fnInitComplete: function () {
                    var addWidget = $(this).data('widget') || true;
                    var isWidget = $(this).parent().parent().hasClass('widget-content');
                    if (!isWidget && addWidget) {
                        var template = $(
                            '<div class="widget box">' +
                            '   <div class="widget-header"><h4><i class="fa fa-reorder"></i> </h4>' +
                            '       <div class="toolbar no-padding">' +
                            '           <div class="btn-group"><span class="btn btn-xs widget-collapse"><i class="fa fa-angle-down"></i></span></div>' +
                            '       </div>' +
                            '   </div>' +
                            '   <div class="widget-content no-padding"></div>' +
                            '</div>');
                        if ($(this).data('title')) {
                            var elem = template.find('.widget-header h4 i').after($(this).data('title'));
                        }
                        var content = $(this).parent().before(template).detach().appendTo(template.find('.widget-content'));
                        App.handleWidgets(content.parents('.widget').parent());
                    }
                }
            });

            /* Default class modification */
            $.extend($.fn.dataTable.ext.classes, {
                sFilterInput: "form-control",
                sLengthSelect: "form-control"
            });


            $.fn.dataTable.defaults.aLengthMenu = [[5, 10, 25, 50, -1], [5, 10, 25, 50, trn.t('_dt.lengthMenu.5')]];

            // Initialize default datatables
            selector.find('.datatable').each(function () {
                frm.utils.increaseWaitCount('dt init');

                var self = $(this);
                var globalSearch = typeof(self.data("globalSearch")) == 'undefined' ? true : self.data("globalSearch");

                var options = {
                    "order": [],
                    "sDom": "<'row'<'dataTables_header clearfix'<'col-md-4'l><'col-md-8'" + (globalSearch ? 'f' : '') + ">r>>t<'row'<'dataTables_footer clearfix'<'col-md-6'i><'col-md-6'p>>>",
                };

                function logEvent(e, data) {
                    frm.log.debug('dt.' + e.type);
                }

                $.fn.dataTable.ext.errMode = function (settings, tn, msg) {
                    frm.log.warn(msg)
                };

                var opt = {
                    "column-sizing.dt": logEvent,
                    "column-visibility.dt": logEvent,
                    "destroy.dt": logEvent,
                    "draw.dt": logEvent,
                    "error.dt": logEvent,
                    "init.dt": logEvent,
                    "length.dt": logEvent,
                    "order.dt": logEvent,
                    "page.dt": logEvent,
                    "preXhr.dt": logEvent,
                    "processing.dt": logEvent,
                    "search.dt": logEvent,
                    "stateLoaded.dt": logEvent,
                    "stateLoadParams.dt": logEvent,
                    "stateSaveParams.dt": logEvent,
                    "xhr.dt": logEvent
                };
                //self.on(opt);



                //monitorEvents($(this)[0]);

                /*
                 * Options via data-attribute
                 */

                // General Wrapper
                var data_dataTable = self.data('datatable');
                if (typeof data_dataTable != 'undefined') {
                    $.extend(true, options, data_dataTable);
                }

                // Display Length
                var data_displayLength = self.data('displayLength');
                if (typeof data_displayLength != 'undefined') {
                    $.extend(true, options, {
                        "iDisplayLength": data_displayLength
                    });
                }

                // Horizontal Scrolling
                var data_horizontalWidth = self.data('horizontalWidth');
                if (typeof data_horizontalWidth != 'undefined') {
                    $.extend(true, options, {
                        "sScrollX": "100%",
                        "sScrollXInner": data_horizontalWidth,
                        "bScrollCollapse": true
                    });
                }

                /*
                 * Other
                 */

                // Checkable Tables
                if (self.hasClass('table-checkable')) {
                    $.extend(true, options, {
                        'aoColumnDefs': [
                            {'bSortable': false, 'aTargets': [0]}
                        ]
                    });
                }

                // TableTools
                if (self.hasClass('table-tabletools')) {
                    $.extend(true, options, {
                        "sDom": "<'row'<'dataTables_header clearfix'<'col-md-4'l><'col-md-8'Tf>r>>t<'row'<'dataTables_footer clearfix'<'col-md-6'i><'col-md-6'p>>>", // T is new
                        "oTableTools": {
                            "aButtons": [
                                /* "copy",*/
                                trn.t('_dt.tableTools.buttons.print'),
                                trn.t('_dt.tableTools.buttons.csv'),
                                /* "xls",*/
                                trn.t('_dt.tableTools.buttons.pdf')
                            ],
                            "sSwfPath": "/static/plugins/datatables/tabletools/swf/copy_csv_xls_pdf.swf"
                        }
                    });
                }
                var data_dataColvis = typeof(self.data("colvis")) == 'undefined' ? true : self.data("colvis");
                if (self.find('thead > tr > th').length > 4 && data_dataColvis) {
                    self.addClass('table-colvis')
                }

                // ColVis
                if (self.hasClass('table-colvis')) {
                    $.extend(true, options, {
                        "sDom": "<'row'<'dataTables_header clearfix'<'col-md-4'l><'col-md-8'C" + (globalSearch ? 'f' : '') + ">r>>t<'row'<'dataTables_footer clearfix'<'col-md-6'i><'col-md-6'p>>>", // C is new
                        "oColVis": {
                            "buttonText": trn.t('_dt.colVis.buttonText') + " <i class='fa fa-angle-down'></i>",
                            "iOverlayFade": 0
                        }
                    });
                }

                if (self.hasClass('table-tabletools') && self.hasClass('table-colvis')) {
                    $.extend(true, options, {
                        "oTableTools": {
                            "aButtons": [
                                /* "copy",*/
                                trn.t('_dt.tableTools.buttons.print'),
                                trn.t('_dt.tableTools.buttons.csv'),
                                /* "xls",*/
                                trn.t('_dt.tableTools.buttons.pdf')
                            ],
                            "sSwfPath": "/static/plugins/datatables/tabletools/swf/copy_csv_xls_pdf.swf"
                        },

                        "sDom": "<'row'<'dataTables_header clearfix'<'col-md-4'l><'col-md-8'TC" + (globalSearch ? 'f' : '') + ">r>>t<'row'<'dataTables_footer clearfix'<'col-md-6'i><'col-md-6'p>>>", // C is new
                        "oColVis": {
                            "buttonText": "Columns <i class='fa fa-angle-down'></i>",
                            "iOverlayFade": 0
                        }
                    });
                }


                // If ColVis is used with checkable Tables
                if (self.hasClass('table-checkable') && self.hasClass('table-colvis')) {
                    $.extend(true, options, {
                        "oColVis": {
                            "aiExclude": [0]
                        }
                    });
                }

                // Responsive Tables
                if (self.hasClass('table-responsive')) {
                    var responsiveHelper;
                    var breakpointDefinition = {
                        tablet: 1024,
                        phone: 480
                    };

                    // Preserve old function from $.extend above
                    // to extend a function
                    var old_fnDrawCallback = $.fn.dataTable.defaults.fnDrawCallback;

                    $.extend(true, options, {
                        bAutoWidth: false,
                        fnPreDrawCallback: function () {
                            // Initialize the responsive datatables helper once.
                            if (!responsiveHelper) {
                                responsiveHelper = new ResponsiveDatatablesHelper(this, breakpointDefinition);
                            }
                        },
                        fnRowCallback: function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                            responsiveHelper.createExpandIcon(nRow);
                        },
                        fnDrawCallback: function (oSettings) {
                            // Extending function
                            old_fnDrawCallback.apply(this, oSettings);

                            responsiveHelper.respond();
                        }
                    });
                }

                /*
                 $.extend(true, options,
                 {
                 "paging": false,
                 "ordering": false,
                 "info": false
                 }
                 )



                 "searching": false,
                 "paging":   false,
                 "ordering": false,
                 "info":     false
                 se

                 var data_searching = self.data("searching");
                 var data_paging = self.data("paging");
                 if (typeof data_paging != "undefined") {
                 $.extend(true, options, {'paging': data_paging});
                 }
                 var data_ordering = self.data("ordering");
                 var data_info = self.data("info");
                 */
                var data_datatableFunction = self.data("datatableFunction");
                if (typeof data_datatableFunction != "undefined") {
                    $.extend(true, options, window[data_datatableFunction]())
                }


                var data_datatablePaging = self.data("paging") || true;
                if (data_datatablePaging) {
                    if (self.find('tbody tr').length > 20) {
                        options['paging'] = true;
                    }
                }


                var tableButtons = [];
                var data_datatableButtons = self.data("datatableButtons");
                if (typeof data_datatableButtons != "undefined") {
                    var buttons = window[data_datatableButtons]();
                    buttons.forEach(function (button) {
                        tableButtons.push(button);
                    })
                }


                var injectButtons = function () {
                    var dataTable = this;
                    tableButtons.forEach(function (button, index, arr) {
                        var obj = button.init();
                        $(dataTable)
                            .parent()
                            .find('.dataTables_header .col-md-8')
                            .append(obj);

                    })
                }
                self.on('init.dt', injectButtons);
                self.on('init.dt', function () {
                    frm.utils.decreaseWaitCount('dt init');
                })


                if (self.hasClass("table-columnfilter")) {
                    options['searching'] = true;
                    options['info'] = true;
                    var filterOptions = {sFilteringTrigger: false};
                    var dataOptions = self.data("columnfilter");
                    if (typeof dataOptions != "undefined") {
                        $.extend(true, filterOptions, dataOptions)
                    } else {
                        var generatedOptions = {"sPlaceHolder": "head:after", "aoColumns": []};
                        self.find('thead th').each(function () {
                            if ($(this).text() != 'opcje') {
                                generatedOptions.aoColumns.push({"type": "text"})
                            } else {
                                generatedOptions.aoColumns.push(null);
                            }
                        })
                        $.extend(true, filterOptions, generatedOptions);
                        //data-columnFilter='{"sPlaceHolder":"head:after","aoColumns": [ null, {"type": "text"},null, {"type": "select"}, {"type": "select"}, {"type": "text"}, {"type": "text"}, {"type": "text"}]}'
                    }
                    var dt = $(this).dataTable(options);
                    dt.columnFilter(filterOptions);
                    self.find(".filter_column").each(function () {
                        /*
                         var z = self.data("columnfilterSelect2");
                         if (typeof z != "undefined") {
                         */
                        $(this).find("input").addClass("form-control");
                        $(this).find("select").select2();
                        /*
                         } else {
                         $(this).children("input, select").addClass("form-control")
                         }
                         */
                    });

                    var table = $(this).DataTable();
                    var clearBtnOnClick = function () {
                        self.find('input.dtSearch').val('');

                        table.columns().every(function () {
                            this.search('');
                        });
                        table.draw();
                    }

                    var clrBtn = new TableButton();
                    clrBtn.setView('<button class="clear btn" style="float: right"><span>' + trn.t('_dt.clearFilter') + ' <i class="fa fa-times"></i></span></button>');
                    clrBtn.addCallback('click', clearBtnOnClick);

                    tableButtons.push(clrBtn);
                } else {
                    $(this).dataTable(options);
                }
                var options = self.dataTable().fnSettings();

                if (options.oFeatures.bServerSide) {
                    self.on("draw.dt", function () {
                        frm.utils.dynamic.callback(null, $(this));
                    })
                }

            });
        }
    }

    /**************************
     * Flot Defaults          *
     **************************/
    var defaultPlotOptions = {
        colors: [App.getLayoutColorCode('blue'), App.getLayoutColorCode('red'), App.getLayoutColorCode('green'), App.getLayoutColorCode('purple'), App.getLayoutColorCode('grey'), App.getLayoutColorCode('yellow')],
        legend: {
            show: true,
            labelBoxBorderColor: "", // border color for the little label boxes
            backgroundOpacity: 0.95 // set to 0 to avoid background
        },
        series: {
            points: {
                show: false,
                radius: 3,
                lineWidth: 2, // in pixels
                fill: true,
                fillColor: "#ffffff",
                symbol: "circle" // or callback
            },
            lines: {
                // we don't put in show: false so we can see
                // whether lines were actively disabled
                show: true,
                lineWidth: 2, // in pixels
                fill: false,
                fillColor: {colors: [{opacity: 0.4}, {opacity: 0.1}]}
            },
            bars: {
                lineWidth: 1, // in pixels
                barWidth: 1, // in units of the x axis
                fill: true,
                fillColor: {colors: [{opacity: 0.7}, {opacity: 1}]},
                align: "left", // or "center"
                horizontal: false
            },
            pie: {
                show: false,
                radius: 1,
                label: {
                    show: false,
                    radius: 2 / 3,
                    formatter: function (label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;text-shadow: 0 1px 0 rgba(0, 0, 0, 0.6);">' + label + '<br/>' + Math.round(series.percent) + '%</div>';
                    },
                    threshold: 0.1
                }
            },
            shadowSize: 0
        },
        grid: {
            show: true,
            borderColor: "#efefef", // set if different from the grid color
            tickColor: "rgba(0,0,0,0.06)", // color for the ticks, e.g. "rgba(0,0,0,0.15)"
            labelMargin: 10, // in pixels
            axisMargin: 8, // in pixels
            borderWidth: 0, // in pixels
            minBorderMargin: 10, // in pixels, null means taken from points radius
            mouseActiveRadius: 5 // how far the mouse can be away to activate an item
        },
        tooltipOpts: {
            defaultTheme: false
        },
        selection: {
            color: App.getLayoutColorCode('blue')
        }
    };

    var defaultPlotWidgetOptions = {
        colors: ['#ffffff'],
        legend: {
            show: false,
            backgroundOpacity: 0
        },
        series: {
            points: {}
        },
        grid: {
            tickColor: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff'
        },
        shadowSize: 1
    };

    /**************************
     * Circle Dial (Knob)     *
     **************************/
    var initKnob = function (selector) {
        if ($.fn.knob) {
            selector.find(".knob").knob();

            // All elements, which has no color specified, apply default color
            selector.find('.knob').each(function () {
                if (typeof $(this).attr('data-fgColor') == 'undefined') {
                    $(this).trigger('configure', {
                        'fgColor': App.getLayoutColorCode('blue'),
                        'inputColor': App.getLayoutColorCode('blue')
                    });
                }
            });
        }
    }

    /**************************
     * Sparkline Statbox Defaults
     **************************/
    var defaultSparklineStatboxOptions = {
        type: 'bar',
        height: '19px',
        zeroAxis: false,
        barWidth: '4px',
        barSpacing: '1px',
        barColor: '#fff'
    }

    /**************************
     * ColorPicker            *
     **************************/
    var initColorPicker = function (selector) {
        if ($.fn.colorpicker) {
            selector.find('.bs-colorpicker').colorpicker();
        }
    }

    /**************************
     * Template               *
     **************************/
    var initTemplate = function () {
        if ($.fn.template) {
            // Set default options
            $.extend(true, $.fn.template.defaults, {});
        }
    }

    var initBootbox = function () {
        if (typeof window.bootbox != "undefined") {
            bootbox.setLocale('pl');
        }
    }

    return {

        // main function to initiate all plugins
        init: function (selector) {
            window.tableOptions = {
                data: {
                    'datatable': 'extend options',
                    'display-length': '"iDisplayLength": data_displayLength',
                    'horizontal-width': '"sScrollX": "100%", "sScrollXInner": data_horizontalWidth, "bScrollCollapse": true',
                    'datatable-function': '$.extend(true, options, window[data_datatableFunction]())',
                    'searching': 'searching',
                    'paging': 'paging',
                    'ordering': 'ordering',
                    'info': 'info',
                    'data-columnFilter': '{"sPlaceHolder":"head:after","aoColumns": [ null, {"type": "text"},null, {"type": "select"}, {"type": "select"}, {"type": "text"}, {"type": "text"}, {"type": "text"}]}',
                    'data-columnFilter-select2': "true"

                },
                classes: {
                    'table-checkable': 'Checkable Tables',
                    'table-tabletools': 'TableTools',
                    'table-colvis': 'ColVis',
                    'table-checkable && table-colvis': '"oColVis": {"aiExclude": [0]}',
                    'table-responsive': 'Responsive Tables',
                    "table-columnfilter": 'filter def'
                }
            }

            if (typeof ($.blockUI) != 'undefined') {
                $.blockUI.defaults.baseZ = 2000;
            }

            selector = $(selector || 'body');

            initBrowserDetection(selector); // $.browser for jQuery 1.9
            initDataTables(selector); // Managed Tables
            initDaterangepicker(selector); // Daterangepicker for dashboard
            initSparklines(selector); // Small charts
            initTooltips(selector); // Bootstrap tooltips
            initPopovers(selector); // Bootstrap popovers
            initNoty(selector); // Notifications

            initCircularCharts(selector); // Easy Pie Chart
            initKnob(selector); // Circle Dial
            initColorPicker(selector); // Bootstrap ColorPicker
            //initTemplate(); // Template

            initBootbox();
        },

        getFlotDefaults: function () {
            return defaultPlotOptions;
        },

        getFlotWidgetDefaults: function () {
            return $.extend(true, {}, Plugins.getFlotDefaults(), defaultPlotWidgetOptions);
        },

        getSparklineStatboxDefaults: function () {

            var x = {
                "time": 1436352784011,
                "start": 0,
                "length": 10,
                "order": [],
                "search": {"search": "", "smart": true, "regex": false, "caseInsensitive": true},
                "columns": [
                    {"visible": true, "search": {"search": "", "smart": true, "regex": false, "caseInsensitive": true}},
                    {"visible": true, "search": {"search": "", "smart": true, "regex": false, "caseInsensitive": true}},
                    {"visible": true, "search": {"search": "", "smart": true, "regex": false, "caseInsensitive": true}},
                    {"visible": true, "search": {"search": "", "smart": true, "regex": false, "caseInsensitive": true}},
                    {"visible": true, "search": {"search": "", "smart": true, "regex": false, "caseInsensitive": true}},
                    {"visible": true, "search": {"search": "", "smart": true, "regex": false, "caseInsensitive": true}}
                ]
            };
            return defaultSparklineStatboxOptions;
        }

    };

}();