/**
 Core script to handle the entire layout and base functions
 **/
var App = function () {

    "use strict";

    // IE mode
    var isIE8 = false;
    var isIE9 = false;
    var isIE10 = false;
    var responsiveHandlers = [];
    var layoutColorCodes = {
        'blue': '#54728c',
        'red': '#e25856',
        'green': '#94B86E',
        'purple': '#852b99',
        'grey': '#555555',
        'yellow': '#ffb848'
    };
    var sidebarWidth = '250px';

    //* BEGIN:CORE HANDLERS *//
    // this function handles responsive layout on screen size resize or mobile device rotate.
    var handleResponsive = function () {
        var isIE8 = ( navigator.userAgent.match(/msie [8]/i) );
        var isIE9 = ( navigator.userAgent.match(/msie [9]/i) );
        var isIE10 = !!navigator.userAgent.match(/MSIE 10/);

        if (isIE10) {
            $('html').addClass('ie10'); // detect IE10 version
        }

        $('.navbar li.nav-toggle').click(function () {
            $('body').toggleClass('nav-open');
        });

        /**
         * Sidebar-Toggle-Button
         */

        $('.toggle-sidebar').click(function (e) {
            e.preventDefault();

            // Reset manual divider-resize
            $('#sidebar').css('width', '');
            $('#sidebar > #divider').css('margin-left', '');
            $('#content').css('margin-left', '');

            // Toggle class
            $('#container').toggleClass('sidebar-closed');
        });

        var handleElements = function () {
            // First visible childs add .first
            $('.crumbs .crumb-buttons > li').removeClass('first');
            $('.crumbs .crumb-buttons > li:visible:first').addClass('first');

            // Remove phone-navigation
            if ($('body').hasClass('nav-open')) {
                $('body').toggleClass('nav-open');
            }

            // Add additional scrollbars
            handleScrollbars();

            // Handle project switcher width
            handleProjectSwitcherWidth();
            handleDebugSwitcherWidth();
        }

        // handles responsive breakpoints.
        $(window).setBreakpoints({
            breakpoints: [320, 480, 768, 979, 1200]
        });

        $(window).bind('exitBreakpoint320', function () {
            handleElements();
        });
        $(window).bind('enterBreakpoint320', function () {
            handleElements();
        });

        $(window).bind('exitBreakpoint480', function () {
            handleElements();
        });
        $(window).bind('enterBreakpoint480', function () {
            handleElements();
        });

        $(window).bind('exitBreakpoint768', function () {
            handleElements();
        });
        $(window).bind('enterBreakpoint768', function () {
            handleElements();
        });

        $(window).bind('exitBreakpoint979', function () {
            handleElements();
        });
        $(window).bind('enterBreakpoint979', function () {
            handleElements();
        });

        $(window).bind('exitBreakpoint1200', function () {
            handleElements();
        });
        $(window).bind('enterBreakpoint1200', function () {
            handleElements();
        });
    }

    var calculateHeight = function () {
        $('body').height('100%');

        var $header = $('.header');
        var header_height = $header.outerHeight();

        var document_height = $(document).height();
        var window_height = $(window).height();

        var doc_win_diff = document_height - window_height;

        if (doc_win_diff <= header_height) {
            var new_height = document_height - doc_win_diff;
        } else {
            var new_height = document_height;
        }

        new_height = new_height - header_height;

        var document_height = $(document).height();

        $('body').height(new_height);
    }

    var handleLayout = function () {
        calculateHeight();

        // For margin to top, if header is fixed
        if ($('.header').hasClass('navbar-fixed-top')) {
            $('#container').addClass('fixed-header');
        }
    }

    var handleResizeEvents = function () {
        var resizeLayout = debounce(_resizeEvents, 30);
        $(window).resize(resizeLayout);
    }

    // Executed only every 30ms
    var _resizeEvents = function () {
        calculateHeight();

        // Realign headers from DataTables (otherwise header will have an offset)
        // Only affects horizontal scrolling DataTables
        if ($.fn.dataTable) {
            var tables = $.fn.dataTable.fnTables(true);
            $(tables).each(function () {
                if (typeof $(this).data('horizontalWidth') != 'undefined') {
                    $(this).dataTable().fnAdjustColumnSizing();
                }
            });
        }
    }

    /**
     * Creates and returns a new debounced version of the passed
     * function which will postpone its execution until after wait
     * milliseconds have elapsed since the last time it was invoked.
     *
     * Source: http://underscorejs.org/
     */
    var debounce = function (func, wait, immediate) {
        var timeout, args, context, timestamp, result;
        return function () {
            context = this;
            args = arguments;
            timestamp = new Date();
            var later = function () {
                var last = (new Date()) - timestamp;
                if (last < wait) {
                    timeout = setTimeout(later, wait - last);
                } else {
                    timeout = null;
                    if (!immediate) result = func.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            if (!timeout) {
                timeout = setTimeout(later, wait);
            }
            if (callNow) result = func.apply(context, args);
            return result;
        };
    };

    /**
     * Swipe Events
     */
    var handleSwipeEvents = function () {
        // Enable feature only on small widths
        if ($(window).width() <= 767) {

            $('body').on('movestart', function (e) {
                // If the movestart is heading off in an upwards or downwards
                // direction, prevent it so that the browser scrolls normally.
                if ((e.distX > e.distY && e.distX < -e.distY) || (e.distX < e.distY && e.distX > -e.distY)) {
                    e.preventDefault();
                }

                // Prevents showing sidebar while scrolling through projects
                var $parentClass = $(e.target).parents('#project-switcher, #debug-switcher');

                if ($parentClass.length) {
                    e.preventDefault();
                }
            }).on('swipeleft', function (e) {
                // Hide sidebar on swipeleft
                $('body').toggleClass('nav-open');
            }).on('swiperight', function (e) {
                // Show sidebar on swiperight
                $('body').toggleClass('nav-open');
            });

        }
    }

    var handleSidebarMenu = function () {
        var arrow_class_open = 'fa-angle-down',
            arrow_class_closed = 'fa-angle-left';

        $('li:has(ul)', '#sidebar-content ul').each(function () {
            if ($(this).hasClass('current') || $(this).hasClass('open-default')) {
                $('>a', this).append("<i class='arrow fa " + arrow_class_open + "'></i>");
            } else {
                $('>a', this).append("<i class='arrow fa " + arrow_class_closed + "'></i>");
            }
        });

        if ($('#sidebar').hasClass('sidebar-fixed')) {
            $('#sidebar-content').append('<div class="fill-nav-space"></div>');
        }

        $('#sidebar-content ul > li > a').on('click', function (e) {

            if ($(this).next().hasClass('sub-menu') == false) {
                return;
            }

            // Toggle on small devices instead of accordion
            if ($(window).width() > 767) {
                var parent = $(this).parent().parent();

                parent.children('li.open').children('a').children('i.arrow').removeClass(arrow_class_open).addClass(arrow_class_closed);
                parent.children('li.open').children('.sub-menu').slideUp(200);
                parent.children('li.open-default').children('.sub-menu').slideUp(200);
                parent.children('li.open').removeClass('open').removeClass('open-default');
            }

            var sub = $(this).next();
            if (sub.is(":visible")) {
                $('i.arrow', $(this)).removeClass(arrow_class_open).addClass(arrow_class_closed);
                $(this).parent().removeClass('open');
                sub.slideUp(200, function () {
                    $(this).parent().removeClass('open-fixed').removeClass('open-default');
                    calculateHeight();
                });
            } else {
                $('i.arrow', $(this)).removeClass(arrow_class_closed).addClass(arrow_class_open);
                $(this).parent().addClass('open');
                sub.slideDown(200, function () {
                    calculateHeight();
                });
            }

            e.preventDefault();
        });

        $('#sidebar-content ul > li > a[href!="javascript:void(0);"]').click(function () {
            $('#sidebar-content .current').removeClass('current');
            var p = $(this).parents('li').addClass('current');
        })

        var _handleResizeable = function () {
            $('#divider.resizeable').mousedown(function (e) {
                e.preventDefault();

                var divider_width = $('#divider').width();
                $(document).mousemove(function (e) {
                    var sidebar_width = e.pageX + divider_width;
                    if (sidebar_width <= 300 && sidebar_width >= (divider_width * 2 - 3)) {
                        if (sidebar_width >= 240 && sidebar_width <= 260) {
                            $('#sidebar').css("width", 250);
                            $('#sidebar-content').css("width", 250);
                            $('#content').css("margin-left", 250);
                            $('#divider').css("margin-left", 250);
                        } else {
                            $('#sidebar').css("width", sidebar_width);
                            $('#sidebar-content').css("width", sidebar_width);
                            $('#content').css("margin-left", sidebar_width);
                            $('#divider').css("margin-left", sidebar_width);
                        }

                    }

                })
            });
            $(document).mouseup(function (e) {
                $(document).unbind('mousemove');
            });
        }

        _handleResizeable();
    }

    var handleScrollbars = function () {
        var android_chrome = /android.*chrom(e|ium)/.test(navigator.userAgent.toLowerCase());

        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) && android_chrome == false) {
            $('#sidebar').css('overflow-y', 'auto');
        } else {
            if ($('#sidebar').hasClass('sidebar-fixed') || $(window).width() <= 767) {

                // Since Chrome on Android has problems with scrolling only in sidebar,
                // this is a workaround for this
                //
                // Awaiting update from Google

                if (android_chrome) {
                    var wheelStepInt = 100;
                    $('#sidebar').attr('style', 'position: absolute !important;');

                    // Fix for really high tablet resolutions
                    if ($(window).width() > 979) {
                        $('#sidebar').css('margin-top', '-52px');
                    }

                    // Only hide sidebar on phones
                    if ($(window).width() <= 767) {
                        $('#sidebar').css('margin-left', '-250px').css('margin-top', '-52px');
                    }
                } else {
                    var wheelStepInt = 7;
                }

                $('#sidebar-content').slimscroll({
                    'height': '100%',
                    wheelStep: wheelStepInt
                });
            }
        }
    }

    var handleThemeSwitcher = function () {
        // Add/ Removes theme-* to/ from body
        function _changeTheme(theme) {
            // Remove theme-*
            $('body').removeClass(function (index, css) {
                return (css.match(/\btheme-\S+/g) || []).join(' ');
            });

            // Select theme
            $('body').addClass('theme-' + theme);

            // Store it for page refresh
            $.cookie('theme', theme, {path: '/'});

            // Button styles
            if (theme == 'dark') {
                _toggleBtnInverse('add');
            } else {
                _toggleBtnInverse('remove');
            }
        }

        // Add/ Removes .btn-inverse to/ from switcher
        function _toggleBtnInverse(state) {
            $('#theme-switcher .btn').each(function () {
                if (state == 'add') {
                    $(this).addClass('btn-inverse');
                } else {
                    $(this).removeClass('btn-inverse');
                }
            });
        }

        if ($.cookie) {
            // Handles click-event on switcher
            $('#theme-switcher label').click(function () {
                var self = $(this).find('input');
                var theme = self.data('theme');

                _changeTheme(theme);
            });

            // Checks, if cookie exists
            // (If user actually changed the theme via switcher)
            if ($.cookie('theme')) {
                var cookie_theme = $.cookie('theme');
                _changeTheme(cookie_theme);

                // To select the right switch
                $('#theme-switcher input').each(function () {
                    var self = $(this);
                    var theme = self.data('theme');

                    if (theme == cookie_theme) {
                        self.parent().addClass('active');
                    } else {
                        self.parent().removeClass('active');
                    }
                });

                // Button styles
                if (cookie_theme == 'dark') {
                    _toggleBtnInverse('add');
                } else {
                    _toggleBtnInverse('remove');
                }
            }
        }
    }

    var handleWidgets = function (selector) {
        selector.find('.widget .widget-header').click(function (e) {
            var widget = $(this).closest(".widget");
            var widget_content = widget.children(".widget-content");
            var widget_chart = widget.children(".widget-chart");
            var divider = widget.children(".divider");

            if (widget.hasClass('widget-closed')) {
                // Open Widget
                $(this).children('i').removeClass('fa-angle-up').addClass('fa-angle-down');
                widget_content.slideDown(200, function () {
                    widget.removeClass('widget-closed');
                });
                widget_chart.slideDown(200);
                divider.slideDown(200);
            } else {
                // Close Widget
                $(this).children('i').removeClass('fa-angle-down').addClass('fa-angle-up');
                widget_content.slideUp(200, function () {
                    widget.addClass('widget-closed');
                });
                widget_chart.slideUp(200);
                divider.slideUp(200);
            }
        });
        var x = selector.find('.widget.widget-closed');
        selector.find('.widget.widget-closed').each(function () {
            $(this).children('.widget-content').hide();
            $(this).children('.widget-header').find('.toolbar .widget-collapse i').removeClass('fa-angle-down').addClass('fa-angle-up');
        })
    }

    var handleCheckableTables = function (selector) {
        selector.find('.table-checkable thead th.checkbox-column :checkbox').on('change', function () {
            var checked = $(this).prop('checked');

            var data_horizontalWidth = $(this).parents('table.table-checkable').data('horizontalWidth');
            if (typeof data_horizontalWidth != 'undefined') {
                var $checkable_table_body = $(this).parents('.dataTables_scroll').find('.dataTables_scrollBody tbody');
            } else {
                var $checkable_table_body = $(this).parents('table').children('tbody');
            }

            $checkable_table_body.each(function (i, tbody) {
                $(tbody).find('.checkbox-column,div.checker').each(function (j, cb) {
                    var cb_self = $(':checkbox', $(cb)).prop("checked", checked).trigger('change');

                    if (cb_self.hasClass('uniform')) {
                        $.uniform.update(cb_self);
                    }

                    $(cb).closest('tr').toggleClass('checked', checked);
                });
            });
        });
        selector.find('.table-checkable tbody tr td.checkbox-column :checkbox').on('change', function () {
            var checked = $(this).prop('checked');
            $(this).closest('tr').toggleClass('checked', checked);
        });

        if (selector.hasClass('table')) {
            selector.find('tbody tr td div.checker :checkbox').on('change', function () {
                var checked = $(this).prop('checked');
                $(this).closest('tr').toggleClass('checked', checked);
            });
        }
    }

    var handleTabs = function () {
        // function to fix left/right tab contents
        var fixTabHeight = function (tab) {
            $(tab).each(function () {
                var content = $($($(this).attr("href")));
                var tab = $(this).parent().parent();
                if (tab.height() > content.height()) {
                    content.css('min-height', tab.height());
                }
            });
        }

        // fix tab content on tab click
        $('body').on('click', '.nav.nav-tabs.tabs-left a[data-toggle="tab"], .nav.nav-tabs.tabs-right a[data-toggle="tab"]', function () {
            fixTabHeight($(this));
        });

        // fix tab contents for left/right tabs
        fixTabHeight('.nav.nav-tabs.tabs-left > li.active > a[data-toggle="tab"], .nav.nav-tabs.tabs-right > li.active > a[data-toggle="tab"]');

        // activate tab if tab id provided in the URL
        if (location.hash) {
            var tabid = location.hash.substr(1);
            $('a[href="#' + tabid + '"]').click();
        }
    }

    var handleScrollers = function (selector) {
        selector.find('.scroller').each(function () {
            $(this).slimScroll({
                size: '7px',
                opacity: '0.2',
                position: 'right',
                height: $(this).attr('data-height'),
                alwaysVisible: ($(this).attr('data-always-visible') == '1' ? true : false),
                railVisible: ($(this).attr('data-rail-visible') == '1' ? true : false),
                disableFadeOut: true
            });
        });
    }

    var handleProjectSwitcher = function () {
        handleProjectSwitcherWidth();

        $('.project-switcher-btn').click(function (e) {
            e.preventDefault();

            _hideVisibleProjectSwitcher(this);

            $(this).parent().toggleClass('open');

            // Define default project switcher
            var data_projectSwitcher = _getProjectSwitcherID(this);

            $(data_projectSwitcher).slideToggle(200, function () {
                $(this).toggleClass('open');
            });
        });

        // Hide project switcher on click elsewhere the element
        $('body').click(function (e) {
            var classes = e.target.className.split(' ');

            if ($.inArray('project-switcher', classes) == -1 && $.inArray('project-switcher-btn', classes) == -1
                && $(e.target).parents().index($('.project-switcher')) == -1 && $(e.target).parents('.project-switcher-btn').length == 0) {

                _hideVisibleProjectSwitcher();

            }
        });

        /*
         * Horizontal scrollbars
         */

        $('.project-switcher #frame').each(function () {
            $(this).slimScrollHorizontal({
                width: '100%',
                alwaysVisible: true,
                color: '#fff',
                opacity: '0.2',
                size: '5px'
            });
        });

        var _hideVisibleProjectSwitcher = function (el) {
            $('.project-switcher').each(function () {
                var $projectswitcher = $(this);

                // Only slide up visible project switcher
                if ($projectswitcher.is(':visible')) {
                    var data_projectSwitcher = _getProjectSwitcherID(el);

                    if (data_projectSwitcher != ('#' + $projectswitcher.attr('id'))) {
                        $(this).slideUp(200, function () {
                            $(this).toggleClass('open');

                            // Remove all clicked states from toggle buttons
                            $('.project-switcher-btn').each(function () {
                                // Define default project switcher
                                var data_projectSwitcher = _getProjectSwitcherID(this);

                                if (data_projectSwitcher == ('#' + $projectswitcher.attr('id'))) {
                                    $(this).parent().removeClass('open');
                                }
                            });
                        });
                    }
                }
            });
        }

        var _getProjectSwitcherID = function (el) {
            // Define default project switcher
            var data_projectSwitcher = $(el).data('projectSwitcher');
            if (typeof data_projectSwitcher == 'undefined') {
                data_projectSwitcher = '#project-switcher';
            }

            return data_projectSwitcher;
        }
    }

    /**
     * Calculates project switcher width
     */
    var handleProjectSwitcherWidth = function () {
        $('.project-switcher').each(function () {
            // To fix the hidden-width()-bug
            var $projectswitcher = $(this);
            $projectswitcher.css('position', 'absolute').css('margin-top', '-1000px').show();

            // Iterate through each li
            var total_width = 0;
            $('ul li', this).each(function () {
                total_width += $(this).outerWidth(true) + 15;
            });

            // And finally hide it again
            $projectswitcher.css('position', 'relative').css('margin-top', '0').hide();

            $('ul', this).width(total_width);
        });
    }

    //* END:CORE HANDLERS *//


    var handleDebugSwitcher = function () {
        handleDebugSwitcherWidth();

        $('.debug-switcher-btn').click(function (e) {
            e.preventDefault();

            _hideVisibleDebugSwitcher(this);

            $(this).parent().toggleClass('open');

            // Define default debug switcher
            var data_debugSwitcher = _getDebugSwitcherID(this);

            $(data_debugSwitcher).slideToggle(200, function () {
                $(this).toggleClass('open');
            });
        });

        // Hide debug switcher on click elsewhere the element
        $('body').click(function (e) {
            var classes = e.target.className.split(' ');

            if ($.inArray('debug-switcher', classes) == -1 && $.inArray('debug-switcher-btn', classes) == -1
                && $(e.target).parents().index($('.debug-switcher')) == -1 && $(e.target).parents('.debug-switcher-btn').length == 0) {

                _hideVisibleDebugSwitcher();

            }
        });


        var _hideVisibleDebugSwitcher = function (el) {
            $('.debug-switcher').each(function () {
                var $debugswitcher = $(this);

                // Only slide up visible debug switcher
                if ($debugswitcher.is(':visible')) {
                    var data_debugSwitcher = _getDebugSwitcherID(el);

                    if (data_debugSwitcher != ('#' + $debugswitcher.attr('id'))) {
                        $(this).slideUp(200, function () {
                            $(this).toggleClass('open');

                            // Remove all clicked states from toggle buttons
                            $('.debug-switcher-btn').each(function () {
                                // Define default debug switcher
                                var data_debugSwitcher = _getDebugSwitcherID(this);

                                if (data_debugSwitcher == ('#' + $debugswitcher.attr('id'))) {
                                    $(this).parent().removeClass('open');
                                }
                            });
                        });
                    }
                }
            });
        }

        var _getDebugSwitcherID = function (el) {
            // Define default debug switcher
            var data_debugSwitcher = $(el).data('debugSwitcher');
            if (typeof data_debugSwitcher == 'undefined') {
                data_debugSwitcher = '#debug-switcher';
            }

            return data_debugSwitcher;
        }
    }

    /**
     * Calculates debug switcher width
     */
    var handleDebugSwitcherWidth = function () {
        $('.debug-switcher').each(function () {
            // To fix the hidden-width()-bug
            var $debugswitcher = $(this);
            $debugswitcher.css('position', 'absolute').css('margin-top', '-1000px').show();

            // Iterate through each li
            var total_width = 0;
            $('ul li', this).each(function () {
                total_width += $(this).outerWidth(true) + 15;
            });

            // And finally hide it again
            $debugswitcher.css('position', 'relative').css('margin-top', '0').hide();

            $('ul', this).width(total_width);
        });
    }


    var handleAjaxProgress = function () {

        var hasOnProgress = ("onprogress" in $.ajaxSettings.xhr());

        //If not supported, do nothing
        if (!hasOnProgress) {
            return;
        }

        //patch ajax settings to call a progress callback
        var oldXHR = $.ajaxSettings.xhr;
        $.ajaxSettings.xhr = function () {

            function progress(evt) {
                NProgress.set(evt.loaded / evt.total);
            }

            var xhr = oldXHR();
            var xhr1 = new window.XMLHttpRequest();

            if (xhr instanceof window.XMLHttpRequest) {
                xhr.addEventListener('progress', progress, false);
            }

            if (xhr.upload) {
                xhr.upload.addEventListener('progress', progress, false);
            }

            return xhr;
        };


        $.ajaxSetup({
            beforeSend: function (jqXHR, opt) {
                NProgress.start();
                /*jqXHR.success(function () { })*/
                jqXHR.success(function (evt) {
                    NProgress.done();
                })
                jqXHR.error(function (evt) {
                    NProgress.done();
                })
            }
        });
    }


    function onDeleteConfirmClick(e) {

        var callbackUrl = $(this).attr('href');
        var message = $(this).data('confirmText');
        if (typeof (message) == 'undefined') {
            message = '<p>Czy napewno usunąć?</p> Element zostanie skasowany a jego przywrócenie nie będzie możliwe';
        }

        e.preventDefault();
        var dialog = bootbox.confirm(message, function (confirmed) {

            if (confirmed) {
                frm.content.get(callbackUrl);
                //window.location.href = callbackUrl;
            }
            frm.utils.decreaseWaitCount('modal confirm');
        });
        dialog.find('button').one('click', function () {
            frm.utils.increaseWaitCount('modal confirm');
        })
    }

    var handleDeleteDialog = function (selector) {
        selector = selector || 'body';
        selector = $(selector).find('.confirm-delete');

        $(selector)
            .unbind('click', onDeleteConfirmClick) //remove handler
            .bind('click', onDeleteConfirmClick);

    }

    var handleIconPanel = function (selector) {

        selector = $(selector || 'body').find('.iconPanel');
        if (selector.length == 0) {
            return;
        }

        processObj.dynamicForm({
            openUrl: '/ajax/modal/icon',
            selector: selector,
            title: 'Wybierz ikonę',
            buttons: [],
            dialogOptions: {className: "large"},
            openSuccessCallback: function (selector, dialog, data) {
                var selectIcon = function (icon) {
                    selector = $(selector);
                    dialog.modal('hide');
                    selector.val(icon);
                    selector.parent().find('i').remove();
                    var span = selector.parent().find('.input-group-addon');
                    span.append($("<i>").addClass("fa " + icon));
                };

                var $filter_by = $('#filter-by');

                // Filter icons
                if ($filter_by.length) {
                    var $filter_val = $('#filter-val');
                    var $filter = $('#filter');
                    var $other = $('#new, #web-application, #transportation, #gender, #form-control, #medical, #currency, #text-editor, #directional, #video-player, #brand, #file-type, #spinner, #payment, #chart');
                    var $clear = $('#filter-clear');
                    var $no_results = $('#no-search-results');

                    var $icons = $('.filter-icon', $filter);

                    // Add tab completion
                    $filter_by.tabcomplete(filterSet, {
                        arrowKeys: true
                    });

                    $clear.on('click', function (e) {
                        e.preventDefault();
                        $filter_by
                            .val('')
                            .trigger('input')
                            .trigger('keyup')
                            .focus();

                        $clear.addClass('hide'); // Hide clear button
                    });


                    $filter_by.on('keyup', function () {
                        var $this = $(this);
                        var val = $this.val().toLowerCase();
                        $filter.toggle(!!val);
                        $other.toggle(!val);
                        $clear.toggleClass('hide', !val);
                        $filter_val.text(val);

                        if (!val) return;

                        var resultsCount = 0;
                        $icons.each(function () {
                            var filter = $(this).attr('data-filter').split('|');
                            var show = inFilter(val, filter);
                            if (!show) {
                                if (val.slice(-1) === 's') {
                                    // Try to be smart. Make plural terms singular.
                                    show = inFilter(val.slice(0, -1), filter);
                                }
                            }
                            if (show) resultsCount++;
                            $(this).toggle(!!show);
                        });

                        if (resultsCount == 0 && val.length != 0) {
                            $no_results.find('span').text(val);
                            $no_results.show();
                        } else {
                            $no_results.hide();
                        }
                    });
                }

                function inFilter(val, filter) {
                    for (var i = 0; i < filter.length; i++) {
                        if (filter[i].match(val)) return true;
                    }
                    return false;
                }

                $filter_by
                    .val('')
                    .trigger('input')
                    .trigger('keyup');

                if ($clear) {
                    $clear.addClass('hide'); // Hide clear button
                }

                $('.fontawesome-icon-list a').click(function (e) {

                    e.preventDefault();

                    //processObj.test();
                    var i = $(this).find('i');
                    var icon = '';
                    $(i).each(function () {
                        $($(this).attr('class').split(' ')).each(function () {
                            if (this !== '' && this != 'fa') {
                                icon = this;
                            }
                        });
                    });
                    selectIcon(icon);
                })
            }
        })
    }

    var handleDatePicker = function (selector) {
        /*    selector.find(".datepicker").click(function () {
         $(this).datepicker({
         defaultDate: +0,
         showOtherMonths: true,
         autoSize: true,
         dateFormat: 'yy-mm-dd'
         });
         })*/

        selector.find(".clockpicker").clockpicker({
            'autoclose': true,
            placement: false,
            align: false
        });

        selector.find(".datetimepicker").datetimepicker({
            defaultDate: +0,
            format: 'YYYY-MM-DD HH:mm',
            locale: moment.locale()
        });
        selector.find(".datepicker").datetimepicker({
            defaultDate: +0,
            format: 'YYYY-MM-DD',
            locale: moment.locale()
        });

    }

    var handlePageTitleToggle = function () {
        $(".row-bg-toggle").click(function (a) {
            a.preventDefault();
            $(".page-header").slideToggle(200)
        });
    }


    var handleFormWizard = function (selector) {

        var form = $(selector).find('form.wizard');
        if (form.length == 1) {
            var wizard = form.parents('.wizardBox');

            var error = $(".alert-danger", form);
            var success = $(".alert-success", form);
            form.validate({
                doNotHideMessage: true,
                focusInvalid: false,
                invalidHandler: function (event, validator) {
                    // Display error message on form submit

                    success.hide();
                    error.show();
                }
                /*submitHandler: function (form) {
                 error.hide();
                 success.show();

                 alert('wizzard submit');
                 //form.submit();

                 // Maybe you want to add some Ajax here to submit your form
                 // Otherwise just call form.submit() or remove this submitHandler to submit the form without ajax
                 }*/
            });
            var displayConfirm = function () {
                $("#tab4 .form-control-static", form).each(function () {
                    var input = $('[name="' + $(this).attr("data-display") + '"]', form);
                    if (input.is(":text") || input.is("textarea")) {
                        $(this).html(input.val())
                    } else {
                        if (input.is("select")) {
                            $(this).html(input.find("option:selected").text())
                        } else {
                            if (input.is(":radio") && input.is(":checked")) {
                                $(this).html(input.attr("data-title"))
                            }
                        }
                    }
                })
            };
            var handleTitle = function (tab, navigation, index) {
                var total = navigation.find("li").length;
                var current = index + 1;
                $(".step-title", wizard).text("Step " + (index + 1) + " of " + total);
                $("li", wizard).removeClass("done");
                var li_list = navigation.find("li");
                for (var j = 0; j < index; j++) {
                    $(li_list[j]).addClass("done")
                }
                if (current == 1) {
                    wizard.find(".button-previous").hide()
                } else {
                    wizard.find(".button-previous").show()
                }
                if (current >= total) {
                    wizard.find(".button-next").hide();
                    wizard.find(".button-submit").show();
                    wizard.find(".button-submit").focus();
                    displayConfirm()
                } else {
                    wizard.find(".button-next").show();
                    wizard.find(".button-next").focus();
                    wizard.find(".button-submit").hide()
                }
            };
            wizard.bootstrapWizard({
                nextSelector: ".button-next",
                previousSelector: ".button-previous",

                onTabClick: function (tab, navigation, index, clickedIndex) {
                    success.hide();
                    error.hide();
                    if (clickedIndex >= index && form.valid() == false) {
                        return false
                    }
                    handleTitle(tab, navigation, clickedIndex)
                },
                //tab, navigation, index

                onNext: function (tab, navigation, index) {
                    success.hide();
                    error.hide();
                    if (form.valid() == false) {
                        return false
                    }
                    tab.removeClass('hasErrors');
                    handleTitle(tab, navigation, index)
                },
                onPrevious: function (tab, navigation, index) {
                    success.hide();
                    error.hide();
                    handleTitle(tab, navigation, index)
                },
                onTabShow: function (tab, navigation, index) {
                    // To set progressbar width
                    var total = navigation.find('li').length;
                    var current = index + 1;
                    var percent = (current / total) * 100;
                    wizard.find('.progress-bar').css({
                        width: percent + '%'
                    });
                }
            });

            /*    wizard.find(".button-previous").hide();
             $("#form_wizard .button-submit").click(function () {
             alert("You just finished the wizard. :-)")
             }).hide()*/
        }

    };


    var handleMomentLang = function () {

        var monthsNominative = 'styczeń_luty_marzec_kwiecień_maj_czerwiec_lipiec_sierpień_wrzesień_październik_listopad_grudzień'.split('_'),
            monthsSubjective = 'stycznia_lutego_marca_kwietnia_maja_czerwca_lipca_sierpnia_września_października_listopada_grudnia'.split('_');

        function pl__plural(n) {
            return (n % 10 < 5) && (n % 10 > 1) && ((~~(n / 10) % 10) !== 1);
        }

        function pl__translate(number, withoutSuffix, key) {
            var result = number + ' ';
            switch (key) {
                case 'm':
                    return withoutSuffix ? 'minuta' : 'minutę';
                case 'mm':
                    return result + (pl__plural(number) ? 'minuty' : 'minut');
                case 'h':
                    return withoutSuffix ? 'godzina' : 'godzinę';
                case 'hh':
                    return result + (pl__plural(number) ? 'godziny' : 'godzin');
                case 'MM':
                    return result + (pl__plural(number) ? 'miesiące' : 'miesięcy');
                case 'yy':
                    return result + (pl__plural(number) ? 'lata' : 'lat');
            }
        }

        var pl = moment.defineLocale('pl', {
            months: function (momentToFormat, format) {
                if (/D MMMM/.test(format)) {
                    return monthsSubjective[momentToFormat.month()];
                } else {
                    return monthsNominative[momentToFormat.month()];
                }
            },
            monthsShort: 'sty_lut_mar_kwi_maj_cze_lip_sie_wrz_paź_lis_gru'.split('_'),
            weekdays: 'niedziela_poniedziałek_wtorek_środa_czwartek_piątek_sobota'.split('_'),
            weekdaysShort: 'nie_pon_wt_śr_czw_pt_sb'.split('_'),
            weekdaysMin: 'N_Pn_Wt_Śr_Cz_Pt_So'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'LT:ss',
                L: 'DD.MM.YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY LT',
                LLLL: 'dddd, D MMMM YYYY LT'
            },
            calendar: {
                sameDay: '[Dziś o] LT',
                nextDay: '[Jutro o] LT',
                nextWeek: '[W] dddd [o] LT',
                lastDay: '[Wczoraj o] LT',
                lastWeek: function () {
                    switch (this.day()) {
                        case 0:
                            return '[W zeszłą niedzielę o] LT';
                        case 3:
                            return '[W zeszłą środę o] LT';
                        case 6:
                            return '[W zeszłą sobotę o] LT';
                        default:
                            return '[W zeszły] dddd [o] LT';
                    }
                },
                sameElse: 'L'
            },
            relativeTime: {
                future: 'za %s',
                past: '%s temu',
                s: 'kilka sekund',
                m: pl__translate,
                mm: pl__translate,
                h: pl__translate,
                hh: pl__translate,
                d: '1 dzień',
                dd: '%d dni',
                M: 'miesiąc',
                MM: pl__translate,
                y: 'rok',
                yy: pl__translate
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1, // Monday is the first day of the week.
                doy: 4  // The week that contains Jan 4th is the first week of the year.
            }
        });

        moment.locale('pl');
    }


    return {

        //main function to initiate template pages
        init: function (selector) {


            selector = $(selector || 'body');

            handleMomentLang();

            //core handlers
            handleResponsive(); // Checks for IE-version, click-handler for sidebar-toggle-button, Breakpoints
            handleLayout(); // Calls calculateHeight()
            handleResizeEvents(); // Calls _resizeEvents() every 30ms on resizing
            handleSwipeEvents(); // Enables feature to swipe to the left or right on mobile phones to open the sidebar
            handleSidebarMenu(); // Handles navigation
            handleScrollbars(); // Adds styled scrollbars for sidebar on desktops
            handleThemeSwitcher(); // Bright/ Dark Switcher
            handlePageTitleToggle();

            handleWidgets(selector); // Handle collapse and expand from widgets
            handleCheckableTables(selector); // Checks all checkboxes in a table if master checkbox was toggled
            handleTabs(); // Fixes tab height
            handleScrollers(selector); // Initializes slimscroll for scrollable widgets

            handleProjectSwitcher(); // Adds functionality for project switcher at the header

            handleDebugSwitcher();

            handleAjaxProgress();
            handleDeleteDialog();
            handleIconPanel();
            handleDatePicker(selector);
            handleFormWizard(selector);
        },
        initMessages: function (options) {
            for (var type in options) {
                if (options.hasOwnProperty(type)) {
                    options[type].forEach(function (message) {
                        noty({type: type, text: message})
                    })

                }
            }
        },
        initMenu: handleSidebarMenu,

        handleToAjax: function (selector) {
            selector = $(selector);

            handleDeleteDialog(selector);
            handleIconPanel(selector);

            handleWidgets(selector);
            handleCheckableTables(selector);

            handleScrollers(selector);

            handleDatePicker(selector);
            handleFormWizard(selector);

        },
        handleWidgets: handleWidgets,
        openWidget: function (selector) {
            selector = $(selector);
            var widget = selector.closest('.widget');
            widget.find('.toolbar .widget-collapse i').removeClass('fa-angle-up').addClass('fa-angle-down');
            selector.slideDown(200, function () {
                widget.removeClass('widget-closed');
            });
        },
        closeWidget: function (selector) {
            selector = $(selector);
            var widget = selector.closest('.widget');
            widget.find('.toolbar .widget-collapse i').removeClass('fa-angle-down').addClass('fa-angle-up');
            selector.slideUp(200, function () {
                widget.addClass('widget-closed');
            });
        },
        getLayoutColorCode: function (name) {
            if (layoutColorCodes[name]) {
                return layoutColorCodes[name];
            } else {
                return '';
            }
        },

        // Wrapper function to block elements (indicate loading)
        blockUI: function (el, centerY, options) {
            el = el || window;
            options = options || {}
            if (typeof options.message != 'undefined') {
                options.message = '<span>' + trn.t(options.message) + ' </span> <img src="/static/assets/img/ajax-loading.gif"/>'
            }

            var overlayOptions = {
                message: '<span>' + trn.t('_overlay.message') + ' </span> <img src="/static/assets/img/ajax-loading.gif"/>',
                centerY: centerY != undefined ? centerY : true,
                css: {
                    top: '10%',
                    border: 'none',
                    padding: '2px',
                    backgroundColor: 'none'
                },
                overlayCSS: {
                    backgroundColor: '#000',
                    opacity: 0.4,
                    cursor: 'wait'
                },
                fadeIn: false,
                fadeOut: false
            }
            $.extend(overlayOptions, options);

            $(el).block(overlayOptions);
        },

        // Wrapper function to unblock elements (finish loading)
        unblockUI: function (el) {
            el = el || window
            $(el).unblock({
                onUnblock: function () {
                    $(el).removeAttr("style");
                }
            });
        }
    };
}();

























