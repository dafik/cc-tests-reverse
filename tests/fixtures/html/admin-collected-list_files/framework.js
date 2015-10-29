jQuery.expr[':'].parents = function (a, i, m) {
    return jQuery(a).parents(m[3]).length < 1;
};
var frm = {
    test: function () {
        return 1;
    },
    emptyFunction: function () {
    },
    ready: false,

    debugEnabled: false,
    domReady: function (mode, debug, lang) {

        mode = mode || 'standard';
        debug = debug || false;

        lang = lang | 'pl';
        this.lang = lang;

        this.debugEnabled = debug;

        this.log.init();
        this.unload.init();
        this.ajax.init();
        this.animation.init();

        if (mode == 'boot') {
            if (this.utils.window.checkExist()) {

                this.menu._selector = $('#nav');
                this.content._selector = $('#content');
                this.dialer._selector = $('#dialer');
                this.debug._selector = $('#debug');

                
                this.messages.get();

                this.content.init();
                this.menu.init();
                this.dialer.init();
                this.softphone.init();
                this.incoming.init();
                this.dialerListener.init();

            }
        }

        this.messages.init();
        this.debug.init(debug);
        this.utils.init();

    },
    unload: {
        prevent: false,
        finishCallbacks: [],
        messageBeforeUnload: "Opuszczenie zresetuje aplikację",
        init: function () {
            window.preventUnloadPrompt = false;

            $(document).keypress(function (event) {
                if (event.keyCode == 116) {
                    window.preventUnloadPrompt = true;
                }
            });
            $(window).bind("beforeunload", function () {
                var ret = frm.unload.check();
                return ret;
            });
            $(window).bind("unload", function () {
                frm.unload.finish()
            });
            this.addFinishCallback(function () {
                $.cookie('logged', null);
            });

            $('#header').find('a').click(function () {
                $.cookie('logged', null);
            });

        },
        check: function () {
            if (!window.preventUnloadPrompt && !frm.unload.prevent) {
                frm.unload.prevent = false;
                window.preventUnloadPrompt = false;
                return frm.unload.messageBeforeUnload;
            }
        },
        finish: function () {
            $.ajaxSetup({async: false});
            $(frm.unload.finishCallbacks).each(function (key, value) {
                var type = typeof value;
                if (type == 'function') {
                    value();
                }
            })
        },
        addFinishCallback: function (callback) {
            frm.unload.finishCallbacks.push(callback);
        }

    },
    animation: {
        init: function () {
            if ($.cookie('_a')) {
                $.fx.off = true;
                frm.log.info('animation disabled cookie found');
            }
        },
        //effects: ["blind", "bounce", "clip", "drop", "explode", "fold", "highlight", "puff", "pulsate", "scale", "shake", "size", "slide"],
        effects: ["slide"],
        easing: ["linear", "swing", "easeInQuad", "easeOutQuad", "easeInOutQuad", "easeInCubic", "easeOutCubic", "easeInOutCubic", "easeInQuart", "easeOutQuart", "easeInOutQuart", "easeInQuint", "easeOutQuint", "easeInOutQuint", "easeInExpo", "easeOutExpo", "easeInOutExpo", "easeInSine", "easeOutSine", "easeInOutSine", "easeInCirc", "easeOutCirc", "easeInOutCirc", "easeInElastic", "easeOutElastic", "easeInOutElastic", "easeInBack", "easeOutBack", "easeInOutBack", "easeInBounce", "easeOutBounce", "easeInOutBounce"],
        getRandEffects: function () {
            var rand = this.getRandom(0, this.effects.length);
            return this.effects[rand];
        },
        getRandEasing: function () {
            var rand = this.getRandom(0, this.easing.length);
            return this.easing[rand];

        },
        getRandom: function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    },
    content: {
        _selector: $('#content'),
        _tabEnabled: false,
        _tabId: 1,
        _tabTemplate: "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>",
        currentUrl: '/',
        setCurrentUrl: function (url) {
            frm.content.currentUrl = url;
            frm.log.info('new content url: ' + url);
        },
        init: function () {

            //frm.content._selector.tabs();
            frm.menu._selector.bind('menu-displayed', function () {
                //alert('menu wyswietlone');
                $('#content').show(frm.animation.getRandEffects(), {
                    duration: 1000,
                    easing: frm.animation.getRandEasing(),
                });
            });

            this._selector.bind('content-loaded data-loaded', function (event, data, options) {
                frm.content.put(data, options)
            });
            this._selector.bind('content-beforeReplace', frm.content.scrollUp);
            frm.content._selector.delegate("span.ui-icon-close", "click", function () {
                var panelId = $(this).closest("li").remove().attr("aria-controls");
                $("#" + panelId).remove();
                frm.content._selector.tabs("refresh");
            });
        },
        get: function (url, target, postData, additionalOptions, clearMessages) {
            frm.utils.increaseWaitCount('content');

            frm.log.debug('frm.content.get:' + url);

            var over = '#container';
            if (!url) {
                return;
            }
            additionalOptions = additionalOptions || {};
            clearMessages = clearMessages || false;
            if (clearMessages) {
                additionalOptions['clearMessages'] = true;
            }


            target = ((typeof (target) == 'undefined' || target == null) ? this._selector : $.isFunction(target) ? target() : target);

            App.blockUI(over);

            var options = $.extend({
                target: target,
                over: over,
                url: url,
                //async: false,
                success: function (data, textStatus, jqXHR) {
                    frm.log.debug('frm.content.get - success');

                    jqXHR.inHistory = true;
                    frm.debug.dynamicDebug(this.url, this.type, this.data ? this.data : '', target);
                    if (target == frm.content._selector) {
                        frm.content._selector.trigger('content-loaded', [data, options]);
                    } else {
                        frm.content._selector.trigger('data-loaded', [data, options]);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    //alert(this.url + "\n" + errorThrown);
                    App.unblockUI(over);
                }
            }, additionalOptions);

            if (typeof(postData) != 'undefined' && postData != null) {
                options.data = postData;
                options.type = 'POST';
            }

            frm.debug.dynamicDebug(url, ((typeof(postData) == 'undefined' && postData != null) ? 'get' : 'post'), postData);
            $.ajax(options)

            return options;
        },
        addAsTab: function (content, options) {
            frm.content._tabId++;

            var label = frm.content._tabId,
                id = "content-" + frm.content._tabId,
                li = $(frm.content._tabTemplate.replace(/#\{href\}/g, "#" + id).replace(/#\{label\}/g, label))

            frm.content._selector.append("<div id='" + id + "'>" + content + "</div>");
            var txt = $('#' + id)[0].firstChild.textContent.trim();
            if (txt) {
                if (txt.length > 15) {
                    txt = txt.substr(0, 15) + '..'
                }
                li.find('a').html(txt);
            }
            frm.content._selector.find(".ui-tabs-nav").append(li);

            //TODO
            frm.utils.dynamic.callback(options.url, '#' + id);

            var count = frm.content._selector.find(".ui-tabs-nav li").length;
            frm.content._selector.tabs("refresh");
            frm.content._selector.tabs({active: count - 1});

        },
        scrollUp: function () {
            var element = $('body');
            if (element.scrollTop() > 0) {
                element.scrollTop(0)
            }
        },
        put: function (data, options) {
            frm.log.debug('frm.content.put');
            window.preventUnloadPrompt = false;
            if (typeof (data) == 'object') {
                //noinspection JSUnresolvedVariable
                if (typeof(data.auth) != 'undefined' && data.auth) {
                    //TODO logowanie na modalu

                    frm.unload.prevent = true;
                    window.location.href = '/';
                    frm.utils.decreaseWaitCount('content');
                    return;
                }
                if (data.reload && data.url) {
                    frm.messages.get();
                    if ($(options.target).attr('id') != 'content' && !$(options.target).hasClass('bootbox-body')) {
                        $(options.target).parents('.modal-dialog').modal('hide');
                        options.target = '#content'

                    }
                    frm.content.get(data.url, options.target, null, {}, true);
                    frm.debug.dynamicDebug(data.url, 'reload', '');
                    App.unblockUI(options.over);
                    frm.utils.decreaseWaitCount('content');
                    return;
                }

                if (data.return) {
                    frm.content.put(data.return, options);
                }
                if (data.messages) {
                    frm.messages.put(data.messages);
                } else if (data.form) {
                    $(options.target).html(data.form);
                    frm.utils.dynamic.callback(options.url, options.target)

                }
            } else {
                try {
                    window.cminstance = [];
                    if (frm.content._tabEnabled) {
                        frm.content.addAsTab(data, options);
                    } else {
                        frm.content._selector.trigger('content-beforeReplace');
                        try {
                            frm.log.debug('frm.content.put - before html');
                            $(options.target).html(data);
                            frm.log.debug('frm.content.get - after html');
                        } catch (e) {
                            if (frm.debug) {
                                frm.debug.debug(e)
                            }
                        }
                        while (this.callbacks.length) {
                            var callback = this.callbacks.shift();
                            callback.fn.call(callback.thisp);
                        }

                        frm.utils.dynamic.callback(options.url, options.target)

                    }

                } catch (e) {

                    if (frm.debug) {
                        frm.debug.debug(e)
                    }

                    //alert(this.url + "\n" + e);

                }
            }
            frm.content._selector.trigger('content-inserted');
            App.unblockUI(options.over);
            frm.log.debug('frm.content.get - inserted');
            frm.utils.decreaseWaitCount('content');
            frm.content.setCurrentUrl(options.url);
        },
        callbacks: [],
        addCallback: function (fn, thisp) {
            if (typeof fn == 'function') {
                this.callbacks.push({fn: fn, thisp: thisp})
            } else {
                throw 'Callback mus by function'
            }
        }

    },
    menu: {
        _menu: false,
        _selector: undefined,
        init: function () {

            this._selector.bind('menu-loaded', function (event, data) {
                frm.menu.parse(data);
            });
            this._selector.bind('menu-parsed', function () {
                frm.menu.activate();
            });
            this._selector.bind('menu-activated', function () {
                frm.menu.show();
            });
            this._selector.bind('menu-displayed', function () {
            })
            this.get();
        },
        reload: function () {
            this._menu = false;
            $(this._selector).html('');
            this.get();
        },
        get: function () {
            var options = {
                url: '/framework/menu',
                success: function (responseText) {
                    frm.menu._selector.trigger('menu-loaded', [responseText.menu]);
                }
            };
            $.ajax(options);
        },
        parse: function (data) {
            this._menu = data;
            var menuElement = this._selector;
            menuElement.hide();

            var menu = frm.menu._menu;

            $.each(menu, function (key, value) {
                var newElem = frm.menu.createMenuElement(value, key);
                $(menuElement).append(newElem);
            });
            this._selector.trigger('menu-parsed');
        },
        createMenuElement: function (definition, name) {
            var definition = $.extend({icon: ''}, definition);
            var opt = {name: name};
            var children = [];
            $.each(definition, function (key, value) {
                if (key == 'children') {
                    $.each(value, function (key1, value1) {
                        children.push(frm.menu.createMenuElement(value1, key1));
                    })
                } else if (key == 'active') {
                    //opt['class'] = 'active'
                } else if (key == 'label') {

                } else if (key == 'link') {

                } else if (key == 'target') {

                } else {
                    opt[key] = value;
                }
            });

            var elem = $('<li>', opt);
            var link = typeof definition.link != 'undefined' ? definition.link : 'javascript:void(0);';

            elem.append($('<a title="' + definition.label + '" href="' + link + '"><i class="fa ' + definition.icon + '"> </i>' + definition.label + '<i class="arrow fa fa-angle-left"></i></a>'));
            if (typeof(definition.link) != 'undefined') {
                if (typeof(definition.target) != 'undefined' && definition.target == '_blank') {
                    $(elem).click(function () {
                        window.open(definition.link);
                    })
                } else {
                    $(elem).click(function (e) {
                        e.preventDefault();
                        frm.content.get(definition.link);

                    })
                }
            }
            if (children.length > 0) {
                //var childContainer = $('<ul>',{class:'children'})
                var childContainer = $('<ul class="sub-menu">', {});
                elem.append(childContainer);
                $(children).each(function (key, value) {
                    childContainer.append(value);
                })

            }
            return elem;
        },
        show: function () {
            frm.menu._selector.show(
                frm.animation.getRandEffects(),
                {
                    duration: 1000,
                    easing: frm.animation.getRandEasing()
                }
            );
            frm.menu._selector.trigger('menu-displayed');
        },
        activate: function () {
            App.initMenu();
            this._selector.trigger('menu-activated');
        }
    },
    ajax: {
        init: function () {
            $(document).ajaxError(function (e, jqxhr, settings, exception) {
                frm.ajax.errorHandler(e, jqxhr, settings, exception);
            });
            $(document).ajaxSuccess(function (event, xhr, settings) {
                var clearMessages = false;
                if (typeof settings.clearMessages != 'undefined') {
                    clearMessages = true;
                }
                if (!clearMessages) {
                    
                    frm.messages.get();
                }
                if (typeof( xhr.inHistory) == 'undefined') {
                    frm.debug.dynamicDebug(settings.url, settings.type, settings.data ? settings.data : '');
                }
            });
/*            $(document).on('ajaxStart ajaxSend ajaxSuccess ajaxError ajaxComplete ajaxStop', function (e, jqxhr, settings, exception) {
                if (settings) {
                    frm.log.debug(e.type, settings.url);
                } else {
                    frm.log.debug(e.type);
                }
            })*/
            $(document).on('ajaxSend', function (e, jqxhr, settings, exception) {
                frm.utils.increaseWaitCount('ajax: ' + settings.url);
            })
            $(document).on('ajaxComplete', function (e, jqxhr, settings, exception) {
                if (settings.url != '/settings/translation/get/pl') {
                    frm.utils.decreaseWaitCount('ajax: ' + settings.url);
                }
            })

        },
        /**
         *
         * @param {jQuery.Event} e
         * @param {{}} jqxhr
         * @param {{}} settings
         * @param {Error|string} [exception]
         */
        errorHandler: function (e, jqxhr, settings, exception) {
            if (exception == "abort") {
                return
            }
            if (jqxhr.status == 444) {
                var formOptions = {
                    autoOpen: true,
                    title: "Logowanie",
                    openUrl: "/login/ajax",
                    buttons: {
                        "Zaloguj": {
                            className: "btn-success",
                            type: 'ajax',
                            successCallback: function (selector, dialog, data) {
                                $.ajax(settings);
                            }
                        }
                    },
                }
                processObj.dynamicForm(formOptions)

            } else {
                var message;
                if (typeof exception == "undefined" || typeof exception == 'string') {
                    try {
                        var xmlDoc = $.parseHTML(jqxhr.responseText);
                    } catch (ex) {
                        xmlDoc = undefined;
                    }
                    if (xmlDoc) {
                        //var error = $(xmlDoc).find('#content').text().replace('<br/>', "\n").replace(/ +/gi, " ");
                        message = $(xmlDoc).find('#content');
                        if (message.length == 0) {
                            message = $(xmlDoc).find('pre')
                            if (message.length == 1) {
                                var inner = message[0].innerHTML;
                                inner = inner.replace(/(?:\r\n|\r|\n)/g, '<br />');
                                message = inner;
                            } else {
                                message = jqxhr.responseText;
                            }

                        }
                        //var error = $($($(xmlDoc).find('#content')).html().replace('<br/>', "\n").replace(/ +/gi, " ")).text();

                        //$(error).dialog();
                        /*$('<div/>').html(error).dialog({
                         modal: true,
                         appendTo: '#content',
                         width: 1170
                         }).on("dialogclose", function () {
                         $(this).dialog("destroy");
                         });*/
                    } else {
                        message = '<p>Ajax error: <br /> url:' + settings.url + "<br />" + 'status: ' + jqxhr.status + "<br />" + (jqxhr.responseText != '' ? '<textarea  style="width:100%" rows="20">' + jqxhr.responseText + '</textarea></p>' : '');
                    }
                } else {
                    var error;
                    if (typeof exception == 'string') {
                        error = exception;
                    } else {
                        error = htmlEntities(exception.message.substr(0, 50));
                    }

                    message = '<p>Ajax error: ' + error + "<br /> url:" + settings.url + "<br />" + 'status: ' + jqxhr.status + "<br />" + (jqxhr.responseText != '' ? '<textarea style="width:100%" rows="20">' + jqxhr.responseText + '</textarea></p>' : '');
                }
                frm.utils.showError(message);

                function htmlEntities(str) {
                    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                }
            }
        }
    },
    debug: {
        _debug: null,
        _selector: $('#debug'),
        _loaded: false,
        init: function (debug) {
            this._selector.bind('debug-loaded', function (event, data) {
                frm.debug._loaded = true;
                frm.debug.parse(data);
            });
            this._selector.bind('debug-parsed', function () {
                frm.utils.dynamic.callback(null, frm.debug._selector);

                frm.debug.enable();
                frm.debug.show();
            });
            this._selector.bind('debug-displayed', function () {
                //alert('debug wyswietlony');
                frm.debug._selector.find('span.next').click(function (event) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    frm.debug.historyNext();
                    return false;
                });
                frm.debug._selector.find('span.back').click(function (event) {
                    var events = $._data(this, 'events');
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    frm.debug.historyBack();
                    return false;
                });

                frm.utils.misc.buttons(frm.debug._selector.find('span.back,span.next')).button('disable');

            });
            frm.debug.expected = 'debug';
            $(document).keypress(function (event) {
                var d = frm.debug;
                var charCode = event.keyCode ? event.keyCode : event.which;
                d.entered += String.fromCharCode(charCode);
                if (d.expected == d.entered) {
                    frm.debug.get();
                    $('.dropdown.debug').show().find('a').trigger('click');

                } else {
                    if (!(new RegExp('^' + d.entered).test(d.expected))) {
                        d.entered = '';
                    }
                }
            });
            if (debug) {
                this.get();
                $('.dropdown.debug').show()
            }


        },
        get: function () {
            var options = {
                url: '/framework/debug',
                success: function (responseText) {
                    frm.debug._selector.trigger('debug-loaded', [responseText.debug])
                }
            };
            $.ajax(options);
        },
        parse: function (data) {
            this._debug = data;
            this._selector.html(data);
            this._selector.trigger('debug-parsed');
        },
        show: function () {
            $('#debug').show(
                frm.animation.getRandEffects(),
                {
                    duration: 1000,
                    easing: frm.animation.getRandEasing()
                },
                function () {
                    frm.debug._selector.trigger('debug-displayed');
                }
            );
            frm.debug._selector.trigger('debug-displayed');

        },
        expected: '',
        entered: '',
        history: [],
        historyContent: [],
        historyCurrent: null,
        historyNext: function () {
            var current = this.historyCurrent + 1;
            //alert(current + this.historyContent[current].url);
            this.historyCurrent = current;
            frm.debug._selector.find('span.back').button('enable');
            if (this.historyCurrent == this.historyContent.length - 1) {
                frm.debug._selector.find('span.next').button('disable');
            }
            frm.content.get(this.historyContent[current].url, "#content", null, {isHistoryBack: true});

        },
        historyBack: function () {
            var current = this.historyCurrent;
            if (current == null) {
                current = this.historyContent.length - 2;
            } else {
                current = current - 1;
            }
            //alert(current + this.historyContent[current].url);
            this.historyCurrent = current;
            if (this.historyCurrent == 0) {
                frm.debug._selector.find('span.back').button('disable');
            }
            if (this.historyCurrent < this.historyContent.length - 1) {
                frm.debug._selector.find('span.next').button('enable');
            }
            frm.content.get(this.historyContent[current].url, "#content", null, {isHistoryBack: true});
        },
        enable: function () {

            $('td.try a.test').click(function () {
                frm.content.get($('td.try input').val());
            })
            $('td.try a.last').click(function () {
                var url = $(this).parents('tbody').find('.request').text();
                frm.content.get(url);
            })
        },
        dynamicDebug: function (url, type, message, target) {
            $('div#debugBox td.request').html(url);
            $('div#debugBox td.action').html(type);
            var now = new Date();
            $('div#debugBox td.time').html(now.toLocaleTimeString());
            $('div#debugBox td.message').html(message ? decodeURIComponent(message).split('&').join('<br />') : '');

            this.historyAdd({
                url: url,
                type: type,
                date: now,
                message: message ? message : '',
                target: target
            })
        },
        historyAdd: function (history) {
            return;
            var h = this.history;
            h.push(history);
            this.history2cookie();
            this.history = h;
            if (history.target && $(history.target).selector == '#content') {
                frm.debug.historyCurrent = null;
                frm.debug._selector.find('span.next').button('disable');

                frm.debug.historyContent.push(history);
                if (frm.debug.historyContent.length > 1 && frm.debug.historyCurrent == null) {
                    frm.debug._selector.find('span.back').button('enable');
                }
            }
        },
        history2cookie: function () {

            function lengthInUtf8Bytes(str) {
                // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
                var m = encodeURIComponent(str).match(/%[89ABab]/g);
                return str.length + (m ? m.length : 0);
            }

            function compress(uncompressed) {
                "use strict";
                // Build the dictionary.
                var i,
                    dictionary = {},
                    c,
                    wc,
                    w = "",
                    result = [],
                    dictSize = 256;
                for (i = 0; i < 256; i += 1) {
                    dictionary[String.fromCharCode(i)] = i;
                }

                for (i = 0; i < uncompressed.length; i += 1) {
                    c = uncompressed.charAt(i);
                    wc = w + c;
                    //Do not use dictionary[wc] because javascript arrays
                    //will return values for array['pop'], array['push'] etc
                    // if (dictionary[wc]) {
                    if (dictionary.hasOwnProperty(wc)) {
                        w = wc;
                    } else {
                        result.push(dictionary[w]);
                        // Add wc to the dictionary.
                        dictionary[wc] = dictSize++;
                        w = String(c);
                    }
                }

                // Output the code for w.
                if (w !== "") {
                    result.push(dictionary[w]);
                }
                return result;
            }

            var h, j, l,
                test = true,
                maxLength = 3900,
                elems = 10;

            while (test) {
                h = this.history.slice(Math.max(this.history.length - elems, 1));
                h.forEach(function (val) {
                    if (val.target != undefined) {
                        if (val.target.selector != undefined) {
                            val.target = val.target.selector
                        } else {
                            val.target = null;
                        }
                    }
                });

                j = JSON.stringify(h);
                l = lengthInUtf8Bytes(j);

                if (l < maxLength) {
                    test = false;
                } else {
                    elems--;
                }
            }

            var c = compress(j);
            var cl = lengthInUtf8Bytes(compress(j));

            document.cookie = '_h=' + j + '; expires=0; path=/';


        },
        put: function (m) {
            $('div#debugBox td.error').html(m);
            frm.debug.log(m);
        },
        debug: function (e) {

            var s = e.stack;
            var m = e.message;
            $('div#debugBox td.error').html(m);
            $('div#debugBox td.stack').html(s);
            frm.log.log(m);
            frm.log.log(s);
        }
    },
    messages: {
        init: function () {
            
            frm.messages.get();
            /*            frm.content._selector.bind('content-inserted', function () {
             
             frm.messages.get();
             });*/
        },

        get: function (messages) {
            //frm.log.debug('messages get');
            messages = messages || {};
            if ($.cookie('_m')) {

                //frm.log.debug('messages get cookie found');
                //frm.log.debug('messages cookie');
                //frm.log.debug(document.cookie);
                var messages = $.parseJSON($.base64.decode($.cookie('_m')));
                frm.messages.clear();


                if (typeof(messages.error) != 'undefined') {
                    $(messages.error).each(function () {
                        noty({type: 'error', text: this});
                    })
                }
                //noinspection JSUnresolvedVariable
                if (typeof(messages.notice) != 'undefined') {
                    //noinspection JSUnresolvedVariable
                    $(messages.notice).each(function () {
                        noty({type: 'warning', text: this})
                    })
                }
                //noinspection JSUnresolvedVariable
                if (typeof(messages.confirmation) != 'undefined') {
                    //noinspection JSUnresolvedVariable
                    $(messages.confirmation).each(function () {
                        noty({type: 'information', text: this})
                    })
                }
                if (typeof(messages.debug) != 'undefined') {
                    $(messages.debug).each(function () {
                        noty({type: 'alert', text: this})
                    })
                }
            } else {
                frm.test();
            }
            //frm.log.debug('messages got');
        },
        put: function (data) {
            this.get(data);
        },
        clear: function () {
            if ($.cookie('_m')) {
                $.cookie('_m', null);
            }
        }
    },
    /*    footer: {
     _selector: $('#footer'),
     _footer: null,
     init: function () {
     this._selector.bind('footer-loaded', function (event, data) {
     frm.footer.parse(data);
     });
     this._selector.bind('footer-parsed', function () {
     frm.utils.dynamic.callback(null, frm.footer._selector);
     frm.footer.show();
     });
     this._selector.bind('footer-displayed', function () {
     //alert('foot wyswietlony');
     });
     this.get();

     },
     get: function () {
     var options = {
     url: '/framework/footer',
     success: function (responseText) {
     frm.footer._selector.trigger('footer-loaded', [responseText.footer]);
     }
     };
     $.ajax(options);
     },
     parse: function (data) {
     this._footer = data;
     this._selector.html(data);
     this._selector.trigger('footer-parsed');
     },
     show: function () {
     this._selector.show(frm.animation.getRandEffects(), {
     duration: 1000,
     easing: frm.animation.getRandEasing()
     });
     this._selector.trigger('footer-displayed')
     }
     },*/
    softphone: {
        _selector: $('#softphone'),
        _softphone: null,
        _call: $('#call'),
        _phonenumber: $('#phonenumber'),
        _settings: $('#settings'),
        _history: $('#history'),
        _initialized: false,
        init: function () {
            this._selector.bind('softphone-loaded', function (event, data) {
                frm.softphone.parse(data);
            });
            this._selector.bind('softphone-parsed', function () {
                frm.utils.dynamic.callback(null, frm.softphone._selector);
                frm.softphone.show();
            });
            this._selector.bind('softphone-displayed', function () {
                if (typeof sf == 'object' && typeof sf.init == 'function') {
                    sf.init({
                        selector: frm.softphone._selector,
                        legend: frm.softphone._selector.find('legend'),
                        call: frm.softphone._call,
                        number: frm.softphone._phonenumber,
                        settings: frm.softphone._settings,
                        history: frm.softphone._history,
                        updateLegend: frm.softphone.updateLegend,
                        updateNumber: frm.softphone.updateNumber
                    });
                } else {

                }
            });
            this.get();

        },
        get: function () {
            var options = {
                url: '/framework/softphone',
                success: function (responseText) {
                    frm.softphone._selector.trigger('softphone-loaded', [responseText.softphone]);
                }
            };
            $.ajax(options);
        },
        parse: function (data) {
            if (data) {
                this._softphone = data;
                this._selector.html(data);
                this._selector.trigger('softphone-parsed');
            }
        },
        show: function () {
            this._selector.show(frm.animation.getRandEffects(), {
                duration: 1000,
                easing: frm.animation.getRandEasing()
            });

            this._call = $('#call');
            this._phonenumber = $('#phonenumber');
            this._settings = $('#settings');
            this._history = $('#history');

            this._initialized = true;

            this._selector.trigger('softphone-displayed')
        },
        updateLegend: function (message) {
            this._selector.find('legend').html(message);
        },
        updateNumber: function (message) {
            this._phonenumber.val(message)
        }
    },
    incoming: {
        _selector: $('#incoming'),
        _incoming: null,
        init: function () {
            this._selector.bind('incoming-loaded', function (event, data) {
                frm.incoming.parse(data);
            });
            this._selector.bind('incoming-parsed', function () {
                frm.utils.dynamic.callback(null, frm.incoming._selector);
                frm.incoming.show();
            });
            this._selector.bind('incoming-displayed', function () {
                if (typeof incoming == 'object' && typeof incoming.init == 'function') {
                    incoming.init({
                        selector: frm.incoming._selector
                    });
                }
            });
            this.get();

        },
        get: function () {
            var options = {
                url: '/framework/incoming',
                success: function (responseText) {
                    frm.incoming._selector.trigger('incoming-loaded', [responseText.softphone]);
                }
            };
            $.ajax(options);
        },
        parse: function (data) {
            if (data) {
                this._incoming = data;
                this._selector.html(data);
                this._selector.trigger('incoming-parsed');
            }
        },
        show: function () {
            this._selector.show(frm.animation.getRandEffects(), {
                duration: 1000,
                easing: frm.animation.getRandEasing()
            });
            this._selector.trigger('incoming-displayed')
        }
    },
    dialerListener: {
        _selector: $('#dialerListener'),
        _incoming: null,
        init: function () {
            if (typeof dl != "undefined") {
                dl.init({
                    selector: frm.incoming._selector
                });
            }
        }
    },
    dialer: {
        _selector: $('#dialer'),
        _messages: null,
        _dialer: null,
        _sip: null,
        _queueId: null,
        _pe: null,
        _logged: false,
        _in_login: false,
        _queue: false,

        init: function () {
            this._selector.bind('dialer-loaded', function (event, data, sip, queueId) {
                frm.dialer.parse(data, sip, queueId);
            });
            this._selector.bind('dialer-parsed', function () {
                frm.dialer.show();
            });
            this._selector.bind('dialer-displayed', function () {
                frm.dialer._messages = $('#dialer').find('.message');

                frm.dialer._selector.delegate('.dropdown-menu li:not(.dlLogout) a', 'click', function () {
                    frm.dialer._queueId = $(this).data('id');
                    frm.dialer._selector.trigger('dialer-queueChanged');
                    frm.dialer.changeState();
                })

                $('#queueId').change(function () {
                    if ($(this).val() != frm.dialer._queueId) {
                        frm.dialer._queueId = $(this).val();
                        frm.dialer._selector.trigger('dialer-queueChanged');
                    }
                });
                $('#dialer-change-state').click(function () {
                    $('#dialer-change-state').button("disable");
                    frm.dialer.changeState();
                    return false;
                });

                frm.dialer._selector.find('.dropdown-menu li.dlLogout:not(.divider) a').click(function () {
                    frm.dialer.logout();
                })


            });
            this._selector.bind('dialer-stateChanged', function (ewvent, data) {
                frm.dialer.update(data);
            });
            this._selector.bind('dialer-queueChanged', function () {
                frm.dialer.changeQueue();
            });


            frm.unload.addFinishCallback(function () {

                frm.dialer.logout();
            });


            this.get();

        },
        get: function () {
            var options = {
                url: '/framework/dialer',
                success: function (responseText) {
                    responseText.sip = responseText.sip || null;
                    responseText.queueId = responseText.queueId || null;
                    frm.dialer._selector.trigger('dialer-loaded', [responseText.dialer, responseText.sip, responseText.queueId]);
                }
            };
            $.ajax(options);
        },
        parse: function (data, sip, queueId) {
            if (data) {
                this._dialer = data;
                this._sip = sip;
                this._queueId = queueId;
                this._selector.find('.dropdown-menu li:not(.dlLogout)').remove()
                this._selector.find('.dropdown-menu').prepend(data);
                this._selector.trigger('dialer-parsed');
            }
        },
        show: function () {
            this._selector.show(frm.animation.getRandEffects(), {
                duration: 1000,
                easing: frm.animation.getRandEasing()
            });
            this._selector.trigger('dialer-displayed')
        },
        update: function (data) {

            if (data && typeof(data.queue) != 'undefined' && data.queue != this._queue) {
                this._queue = data.queue
            }
            var legend = '';
            if (this._logged) {
                if (this._sip) {
                    legend += ' ' + this._sip;
                }
                if (this._queue) {
                    legend += '@' + this._queue;
                }
            } else {
                legend = 'Dialer';
            }
            legend += ' <i class="fa fa-caret-down small"></i>';
            this._selector.find('.dropdown-toggle').html(legend);

            if (this._logged) {
                this._selector.find('.dropdown-menu li.dlLogout').show();
            } else {
                this._selector.find('.dropdown-menu li.dlLogout').hide();
            }

        },

        changeQueue: function () {
            this.logout();
        },
        changeState: function () {
            if (this._logged) {
                this.logout();
            } else {
                this.login();
            }

        },

        _start: function () {
            if (!this.pe) {
                //this.pe = setInterval('frm.dialer._check()', 3000);
            }

            dListener.start();
            dListener.on('new_client', this._onNewClientId);
        },
        _stop: function () {
            if (this.pe) {
                clearInterval(this.pe);
                this.pe = null;
            }
            dListener.stop();
            dListener.off('new_client', this._onNewClientId);
        },
        _onNewClientId: function (data, callback) {
            if (!isNaN(parseInt(data))) {
                frm.dialer.logout();
                frm.content.get('/tm/callrecords/predictive/id/' + data)
            }
            callback();
        },
        _check: function () {
            var url = '/check.php?sip=' + this._sip;
            $.ajax({
                url: url,
                success: function (data) {
                    if (!isNaN(parseInt(data))) {
                        frm.dialer.logout();
                        frm.content.get('/tm/callrecords/predictive/id/' + data)
                    }
                },
                type: 'GET'
            });
        },
        login: function () {
            if (!this._queueId) {
                this._queueId = $('#queueId').val();
            }
            if (this._sip && this._queueId && !this._logged && !this._in_login) {
                this._clearMessages();
                var url = '/tm/predictive/login/sip/' + this._sip + '/pid/' + this._queueId;
                this._in_login = true;
                $.ajax({
                    url: url,
                    dataType: "json",
                    type: 'GET',
                    success: function (data) {
                        frm.dialer._in_login = false;
                        if (data && typeof data.message != 'undefined') {
                            frm.dialer._logged = true;
                            frm.dialer._start();
                            frm.dialer._selector.trigger('dialer-stateChanged', [data]);

                        } else {
                            frm.dialer._stop();
                            var message = '';
                            if (data && typeof data.error != 'undefined') {
                                message = data.error;
                            } else {
                                message = 'error';
                            }
                            frm.dialer._setMessage(message, 'error');
                        }
                        $('#dialer-change-state').button("enable");
                    }
                });
            } else {
                if (!this._sip) {
                    var message = 'sip not found';
                    frm.dialer._setMessage(message, 'error');
                    $('#dialer-change-state').button("enable");
                }
            }
        },
        logout: function () {

            this._clearMessages();
            if (this._sip) {
                var url = '/tm/predictive/logout/sip/' + this._sip;
                $.ajax({
                    url: url,
                    dataType: "json",
                    type: 'GET',
                    success: function (data) {
                        if (data && typeof data.message != 'undefined') {
                            frm.dialer._logged = false;
                            frm.dialer._stop();
                            frm.dialer._selector.trigger('dialer-stateChanged');
                        } else {
                            var message = '';
                            if (data && typeof data.error != 'undefined') {
                                message = data.error;
                            } else {
                                message = 'error';
                            }
                            frm.dialer._setMessage(message, 'error');
                        }
                        $('#dialer-change-state').button("enable");
                    }
                });
            }
        },
        _setMessage: function (message, type) {
            if (typeof type == 'undefined') {
                type = 'debug';
            }
            message = '<div class="border ' + type + '">' + message + '</div>';
            frm.messages.put({
                error: message
            })
            //frm.dialer._messages.html(message);
            //frm.dialer._messages.show();
        },
        _clearMessages: function () {
            if (frm.dialer._messages) {
                frm.dialer._messages.html(null);
                frm.dialer._messages.hide();
            }
        }
    },
    statistics: {
        predictiveConfId: null,
        pe: null,
        order: ['predictive_id', 'predictive_hour', 'calls_count', 'agents_count', 'all_agents_count', 'busy_count', 'no_answer_count', 'drop_count',
            'answer_count', 'last_agent_wait_time', 'average_agent_wait_time', 'last_connection_wait_time', 'average_connection_wait_time', 'drop_percentage',
            'current_ratio', 'base_ratio', 'last_access_time', 'n_ratio', 'n_agents', 'n_excepted', 'n_calls_count', 'n_calls_to_make'
        ],
        stopHandler: null,
        start: function (predictiveConfId) {
            this.predictiveConfId = predictiveConfId;
            this.pe = setInterval("frm.statistics.check()", 5000);
            this.stopHandler = function () {
                frm.statistics.stop()
            };
            frm.content._selector.bind('content-loaded', this.stopHandler);


        },
        stop: function () {
            clearInterval(this.pe);
            if (this.stopHandler) {
                frm.content._selector.unbind('content-loaded', this.stopHandler);
            }
        },
        check: function () {
            $.ajax({
                url: '/tm/predictive/getstats/id/' + this.predictiveConfId,
                success: function (data) {
                    frm.statistics.requestSuccess(data)
                },
                type: 'GET'
            });

            $.ajax({
                url: '/tm/predictive/getstats1/id/' + this.predictiveConfId,
                success: function (data) {
                    frm.statistics.requestSuccess1(data)
                },
                type: 'GET'
            });
            $.ajax({
                url: '/tm/predictive/getstats2/id/' + this.predictiveConfId,
                success: function (data) {
                    frm.statistics.requestSuccess2(data)
                },
                type: 'GET'
            });
        },
        requestSuccess: function (data) {
            try {
                if (typeof (data.rows) != "undefined" && typeof (data.rows) == "object" && data.rows.length > 0) {
                    this.iterateTr(data.rows);
                }
            } catch (e) {
                frm.debug.debug(e);
            }
        },
        requestSuccess1: function (data) {
            try {
                var x = data.out;

                var a1 = $('td#count').first();
                frm.statistics.checkElementValue(a1[0], x, 'count');
                var a2 = $('td#countOpen');
                frm.statistics.checkElementValue(a2[0], x, 'countOpen');
                var a3 = $('td#countOpenNow');
                frm.statistics.checkElementValue(a3[0], x, 'countOpenNow');

            } catch (e) {
                frm.debug.debug(e);
                //alert(e.message);
            }
        },
        requestSuccess2: function (data) {
            try {
                var target = $('table.queueMembers').find('tbody');
                target.html(data);
            } catch (e) {
                frm.debug.debug(e);
            }
        },
        iterateTr: function (rows) {
            $('table.queueStats').find('tbody tr').each(function (index, value) {
                var row = rows[index];
                if (typeof(row) != 'undefined') {
                    frm.statistics.iterateTd(value, row);
                } else {
                    frm.test();
                }
            });
        },
        iterateTd: function (tr, row) {
            if (row) {
                $(tr).find('td').each(function (index) {
                    frm.test();
                    frm.statistics.checkElementValue(this, row, frm.statistics.order[index]);
                    frm.test();
                });
            } else {
                throw 'row not found';

            }
        },
        checkElementValue: function (element, row, propertyName) {
            try {
                var elemVal = element.innerHTML;
                var z = row.hasOwnProperty(propertyName);


                if (z) {
                    var newVal = eval('row.' + propertyName) + '';
                    /* if (propertyName == 'last_access_time') {
                     var date = new Date(newVal / 1000);
                     // newVal = date.toLocaleString();
                     }*/

                    var regex = /(\d+)\.(\d{1})/;
                    if (newVal.match(regex)) {
                        var matches = regex.exec(newVal);
                        newVal = matches[0];
                    }
                    if (elemVal != newVal) {
                        if (elemVal > newVal) {
                            $(element).addClass('changeDown');
                            $(element).removeClass('changeUp');
                        }
                        if (elemVal < newVal) {
                            $(element).addClass('changeUp');
                            $(element).removeClass('changeDown');
                        }
                        element.title = elemVal;
                        element.innerHTML = newVal;
                    } else {
                        // element.className = null;
                        // element.title = null;
                    }
                } else {
                    alert(propertyName);
                }
            } catch (e) {
                throw e;
            }
        }
    },
    utils: {
        waitCount: 0,
        init: function () {
            this.form.copyFields();
            processObj.changePassword('li.user a.mChangePass');
            //this.activateDialogWithContent();
        },
        increaseWaitCount: function (from) {
            frm.ready = false;
            this.waitCount++;
            frm.log.debug('WC inc l:' + this.waitCount + ' ' + from);
        },
        decreaseWaitCount: function (from) {
            this.waitCount--;
            frm.log.debug('WC dec l:' + this.waitCount + ' ' + from);
            if (this.waitCount == 0) {
                frm.ready = true;
                frm.log.debug('framework ready');
            }
        },
        getWaitCount: function () {
            return this.waitCount;
        },
        getFrmState: function () {
            if (frm.ready) {
                return 'ready';
            } else {
                return 'wait ' + this.waitCount;
            }
        },
        showError: function (message) {
            var out;
            if (message instanceof jQuery) {
                out = message.find('div.errorPage.error')
                if (out.length == 0) {
                    out = message;
                }
            } else if (false === message.indexOf('<div class="errorPage error">')) {
                var parts = message.split("\n");

                out = $('<ul>');
                parts.forEach(function (item) {
                    var txt = item;
                    var li = $('<li>');
                    li.append(txt);
                    out.append(li);
                })
            } else {
                out = message;
            }

            bootbox.alert(out, frm.emptyFunction, {
                className: 'large'
            })
        },

        dynamic: {
            callback: function (currentAction, selector) {
                selector = $(selector || frm.content._selector);


                try {
                    this.forms($(selector), currentAction, selector);
                } catch (e) {
                    frm.utils.showError(e.message + '<br/>' + e.stack);
                }

                try {
                    App.handleToAjax(selector);
                } catch (e) {
                    frm.utils.showError(e.message + '<br/>' + e.stack);
                }

                try {
                    Plugins.init(selector);
                } catch (e) {
                    frm.utils.showError(e.message + '<br/>' + e.stack);
                }
                try {
                    FormComponents.init(selector);
                } catch (e) {
                    frm.utils.showError(e.message + '<br/>' + e.stack);
                }
                try {
                    frm.utils.repo.init(selector);
                } catch (e) {
                    frm.utils.showError(e.message + '<br/>' + e.stack);
                }
                try {
                    frm.utils.misc.dpdTrack(selector);
                    //frm.utils.misc.chosen();

                    frm.utils.form.copyFields(selector);

                    //frm.utils.activateDialogWithContent();

                    this.modalLinks(selector);
                    this.links(selector);
                } catch (e) {
                    frm.utils.showError(e.message + '<br/>' + e.stack);
                }
                frm.utils.misc.buttons($(selector).find('a.button, input.button, input[type="submit"],button'));


                $(selector).find('table.datatable').on('draw.dt', function () {
                    frm.utils.dynamic.callback(currentAction, this);
                })

            },
            modalLinks: function (selector, options) {
                options = options || {};
                var found = $(selector).find('a[href]').filter('.modal');
                /*var elems = {};
                 found.each(function () {
                 var item = $(this).attr('class').split(' ').sort().join('.');
                 elems[item] = item;
                 })
                 found = [];
                 for (var val in elems) {
                 found.push('.'+val);
                 }
                 var links = found.join(',');*/
                if (found.size() > 0) {
                    options = {
                        getTitle: function (elem) {
                            return $(elem).html()
                        },
                        getOpenUrl: function (elem) {
                            return $(elem).attr('href');
                        },
                        openSuccessCallback: function (selector, dialog) {
                            frm.utils.dynamic.callback($(selector).attr('href'), dialog)
                        },
                        openUrl: null,
                        selector: found
                    };

                    processObj.dynamicForm(options);
                }

            },
            links: function (selector) {
                var links = $(selector).find('a[href]:not(.noDynamic)').filter(':parents(.pagination)');
                if (links.length > 0) {
                    //alert('found: ' + links.length + ' linków');
                    links.each(function () {
                        var events = jQuery._data(this, "events");
                        if (!events || typeof events.click == 'undefined') {
                            $(this).click(function (e) {
                                e.preventDefault();
                                var target = '#content';
                                var options = {};
                                var bootBoxBody = $(this).parents('div.bootbox-body')
                                if (bootBoxBody.length == 1) {
                                    target = bootBoxBody;
                                    options['headers'] = {'X-target': 'modal'};
                                }
                                var url = $(this).attr('href');
                                frm.content.get(url, target, null, options);
                                return false;
                            });
                        }
                    })
                }
                $(selector).find('a[href]').filter('.noDynamic').each(function () {
                    var events = $._data(this, 'events');
                    if (typeof events != 'object' || !events.click) {
                        $(this).click(function (event) {
                            event.preventDefault();
                            window.preventUnloadPrompt = true;
                            window.open($(this).attr('href'), '_self');
                            setTimeout(function () {
                                window.preventUnloadPrompt = false;
                            }, 100);

                            return false;
                        });
                    }
                })
            },
            forms: function (selector, currentAction, target) {
                target = target || '#content';
                var forms = $(selector).find('form');
                if (forms.length > 0) {
                    //      alert('found: ' + forms.length + ' formularzy');
                }

                forms.each(function () {
                    var action = $(this).attr('action');
                    if (!action) {
                        $(this).attr('action', currentAction);
                    }
                    var events = $._data(this, 'events');
                    if ($(this).hasClass('wizard')) {
                        $(this).find(':submit').click(function () {
                                alert('wizzard submit click');
                            }
                        );
                        $(this).submit(onWizardSubmit);

                        function onWizardSubmit() {
                            return onFormSubmitClickHandler.call(this, false);
                        }
                    } else if (typeof events != 'object' || typeof events.click == 'undefined') {
                        $(this).find(':submit').click(onFormSubmitClickHandler);
                        $(this).submit(onFormSubmitHandler);
                    }
                });
                forms.bind('reset', onFormResetHandler);

                function onFormSubmitClickHandler(returnVal) {

                    returnVal = returnVal || false;

                    var form = $(this).parents('form');
                    if (form.length == 0 && this.localName == 'form') {
                        form = $(this);
                    }
                    var postData;
                    var options = {};

                    //noinspection JSUnresolvedVariable
                    if (window.cminstance.length > 0) {
                        var instance;
                        for (var i = 0; i < window.cminstance.length; i++) {
                            //noinspection JSUnresolvedVariable
                            instance = window.cminstance[i];
                            instance.save();
                        }
                    }


                    if ($(form).find('input[type="file"]').size() > 0) {

                        postData = new FormData();
                        options = {
                            processData: false,
                            contentType: false,
                            type: 'POST'
                        };
                        $(form[0].elements).each(function () {
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
                        postData = $(form).serialize();
                        var r20 = /%20/g;
                        var add = encodeURIComponent($(this).attr('name')) + "=" + encodeURIComponent($(this).val()).replace(r20, "+");
                        postData += '&' + add;
                    }

                    if (this.formAction) {
                        var url = this.formAction;
                    } else {
                        var url = $(form).attr('action');
                    }


                    frm.content.get(url, target, postData, options);
                    return returnVal;
                }

                function onFormSubmitHandler(event, ret) {
                    ret = ret || false;
                    if (ret) {
                        return true;
                    }
                    return false;
                }

                var inReset = false;

                function onFormResetHandler(event, ret) {

                    var form = this;

                    if (!inReset) {
                        inReset = true;
                        setTimeout(function () {
                            form.reset();
                        }, 100);
                    } else {

                        var notEmpty = $(form).find('input').not(':submit').not(':reset').filter(function () {
                            return !!this.value;
                        });

                        if (notEmpty.length > 0) {
                            notEmpty.each(function () {
                                $(this).val('');
                            });
                            $(form).find(':submit').trigger('click');
                        }
                        inReset = false;
                    }

                }


            }
        },
        form: {

            copyFields: function () {
                var copyElements = $('form input[type=radio].copy');
                copyElements.change(function () {
                    var sourceName = $(this).val();
                    var source = $('#fieldset-' + sourceName);
                    var target = $(this).parents('.widget.box');
                    if (target.length > 0) {
                        var fieldsetName = target.attr('id').replace('fieldset-', '');
                        var i, elem, id, name, targetElement;

                        var elements = $(target).find('input').not('input[type=submit]').not('.copy');

                        if (source.length) {
                            for (i = 0; i < elements.length; i++) {
                                elem = elements[i];
                                id = $(elem).attr('id').replace(fieldsetName + '-', '');
                                name = '#' + sourceName + '-' + id;
                                targetElement = $(name);
                                if (targetElement.length) {
                                    $(elem).val(targetElement.val());
                                    $(elem).prop('readonly', true);
                                }
                            }
                        } else {
                            for (i = 0; i < elements.length; i++) {
                                elem = elements[i];
                                id = $(elem).attr('id').replace(fieldsetName + '-', '');
                                name = '#' + fieldsetName + '-' + id;
                                targetElement = $(name);
                                if (targetElement.length) {
                                    $(elem).prop('readonly', false);
                                }
                            }
                        }
                    } else {
                        frm.log.error('frm.form.copyFields target not found for ' + this)
                    }
                });
                copyElements.filter(':checked').each(function () {
                    var sourceName = $(this).val();
                    if (sourceName != "-1") {
                        var target = $(this).parents('.widget.box');
                        if (target.length > 0) {
                            var fieldsetName = target.attr('id').replace('fieldset-', '');
                            var elements = $(target).find('input').not('input[type=submit]').not('.copy');
                            for (var i = 0; i < elements.length; i++) {
                                var elem = elements[i];
                                var id = $(elem).attr('id').replace(fieldsetName + '-', '');
                                var name = '#' + sourceName + '-' + id;
                                var targetElement = $(name);
                                if (targetElement.length) {
                                    $(elem).prop('readonly', true);
                                }
                            }
                        } else {
                            frm.log.error('frm.form.copyFields target not found for ' + this)
                        }
                    }
                })
            }
        },
        repo: {
            init: function (selector) {
                selector = $(selector || '.repoForm');
                if (selector.length > 0) {

                    var url = '/administrator/repository/subform/kind/';
                    var handleSubForm = function (selector, subform) {
                        frm.test();
                        if ($(this).val()) {
                            App.openWidget(selector);
                            frm.content.get(url + subform + '/id/' + $(this).val(), selector)
                        } else {
                            App.closeWidget(selector);
                            $(selector).html('');
                        }
                    };

                    $('#record-data_base_id').change(function () {
                        handleSubForm.call(this, '#fieldset-source .widget-content', 'source');
                    });
                    $('#base-project_id').change(function () {
                        handleSubForm.call(this, '#fieldset-process .widget-content', 'process');
                    });
                    $('#base-form_data_id').change(function () {
                        handleSubForm.call(this, '#fieldset-collected .widget-content', 'collected');
                    })
                }

            }
        },
        misc: {
            buttons: function (selector) {
                $(selector).each(function () {
                    var events = $._data(this, 'events');
                    var form = $(this).parents('form');
                    var hasAction = false;
                    if (form.length > 0) {
                        if (typeof events == 'object') {
                            hasAction = true;
                        } else {
                            var eventsF = $._data(form[0], 'events');
                            if (typeof eventsF == 'object') {
                                hasAction = true;
                            }
                        }
                    } else {
                        if (typeof events == 'object') {
                            hasAction = true;
                        }
                    }
                    $(this).button();
                    if (!hasAction && $(this).attr('id') != 'clearFilter_0') {
                        $(this).click(function (event) {
                            event.preventDefault();
                            var z = this.href;
                            if (this.href) {
                                frm.content.get(this.href);
                            }
                        });
                    }
                });
                return selector;
            },

            dpdTrack: function (selector) {
                selector.find('.dpdCheck').click(function () {
                    var url = "http://www.dpd.com.pl/tracking.asp?przycisk=Wyszukaj&p1=" + $(this).attr('rel');
                    window.open(url, '_blank', 'location=0, menubar=0, resizable=1, scrollbars=0, status=0, titlebar=0, toolbar=0, width=1000');
                })
            },
            errorsAsTooltip: function () {
                frm.log.warn('deprecated - frm.utils.misc.errorsAsTooltip')
            }

        },
        window: {
            checkExist: function () {

                if (!frm.utils.window.checkPresence()) {
                    frm.utils.window.setPresence()
                    frm.unload.addFinishCallback(function () {
                        frm.utils.window.deletePresence();
                    });

                    return true;
                }
                window.name = 'toclose'
                window.open('javascript:windowtest()', window.name);
                window.preventUnloadPrompt = true;
                window.close();
                return false;
            },
            setPresence: function () {
                //document.cookie = '_pres=true; expires=0; path=/';
                $.cookie('_pres', true, {'raw': 'expires=0; path=/'});
            },
            deletePresence: function () {
                $.cookie('_pres', null);
            },
            checkPresence: function () {
                if ($.cookie('_pres')) {
                    return true;
                }
                return false;
            }
        },
        getDataFormat: function (selectorInput, selectorTarget) {
            var dfId = $(selectorInput).val();
            if (dfId == 'x') {
                $(selectorTarget).val(null);
            } else {
                var url = '/administrator/databases/getdbformat/id/' + dfId;
                frm.content.get(url, selectorTarget);
            }
        },
        setDbName: function (selectorInput, selectorTarget) {
            var selected = $(selectorInput).val();
            if (selected == 'x') {
                $(selectorTarget).prop('disabled', false);
            } else {
                var x = $(selectorInput).find('option:selected').attr('label');
                if (typeof (x) != 'undefined') {
                    $(selectorTarget).val(x);
                }
                $(selectorTarget).prop('disabled', true);
            }
        },
        codeMirror: {
            completeAfter: function (cm, pred) {
                var cur = cm.getCursor();
                if (!pred || pred()) setTimeout(function () {
                    if (!cm.state.completionActive)
                        cm.showHint({completeSingle: false});
                }, 100);
                return CodeMirror.Pass;
            },

            completeIfAfterLt: function (cm) {
                return completeAfter(cm, function () {
                    var cur = cm.getCursor();
                    return cm.getRange(CodeMirror.Pos(cur.line, cur.ch - 1), cur) == "<";
                });
            },

            completeIfInTag: function (cm) {
                return completeAfter(cm, function () {
                    var tok = cm.getTokenAt(cm.getCursor());
                    if (tok.type == "string" && (!/['"]/.test(tok.string.charAt(tok.string.length - 1)) || tok.string.length == 1)) return false;
                    var inner = CodeMirror.innerMode(cm.getMode(), tok.state).state;
                    return inner.tagName;
                });
            },

            show: function (element, dictionary) {
                if (element instanceof jQuery) {
                    element = element[0];
                }
                var options = {
                    mode: 'xml',
                    theme: 'eclipse',
                    lineNumbers: true,
                    lineWrapping: true,
                    //viewportMargin: \'Infinity\',
                    extraKeys: {
                        "\'<\'": frm.utils.codeMirror.completeAfter,
                        "\'/\'": frm.utils.codeMirror.completeIfAfterLt,
                        "\' \'": frm.utils.codeMirror.completeIfInTag,
                        "\'=\'": frm.utils.codeMirror.completeIfInTag,
                        "Ctrl-Space": "autocomplete",
                        "Ctrl-Q": function (cm) {
                            cm.foldCode(cm.getCursor());
                        },
                        "F11": function (cm) {
                            cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                        },
                        "Esc": function (cm) {
                            if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                        }
                    },
                    foldGutter: true,
                    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                    hintOptions: {schemaInfo: dictionary}
                };
                var editor = CodeMirror.fromTextArea(element, options);
                window.cminstance.push(editor);
            }
        },


        fileDownload: function (url, message, options) {

            options = options || {};

            var over = '#content';
            App.blockUI(over, undefined, {message: message});

            var downloadOptions = {
                failCallback: function (responseHtml) {
                    App.unblockUI(over)
                    frm.utils.showError(responseHtml)
                    if (typeof options.failCallback == 'function') {
                        options.failCallback()
                    }
                },
                successCallback: function () {
                    App.unblockUI(over);
                    if (typeof options.successCallback == 'function') {
                        options.successCallback()
                    }
                },
                httpMethod: "POST"

            }
            if (typeof options.postData != 'undefined') {
                downloadOptions.data = options.postData
            }
            $.fileDownload(url, downloadOptions);
        }


    },
    log: {
        debugout: null,
        init: function () {
            this.debugout = new debugout();
        },
        info: function () {
            args = Array.prototype.slice.call(arguments);
            args.unshift("info");
            this.debugout.log(args);
            console.info.apply(console, arguments);
        },
        error: function () {
            args = Array.prototype.slice.call(arguments);
            args.unshift("error");
            this.debugout.log(args)
            console.error.apply(console, arguments);
        },
        warn: function () {
            args = Array.prototype.slice.call(arguments);
            args.unshift("warn");
            this.debugout.log(args)
            console.warn.apply(console, arguments);
        },
        log: function () {
            args = Array.prototype.slice.call(arguments);
            args.unshift("log");
            this.debugout.log(args)
            console.log.apply(console, arguments);
        },
        debug: function (message) {
            args = Array.prototype.slice.call(arguments);
            args.unshift("debug");
            //this.debugout.log(['debug', message]);
            this.debugout.log(args);

            if (frm.debugEnabled) {
                var now = new Date();
                now = now.toJSON().substring(11);
                args.unshift(now)
                console.debug.apply(console, args);

            }

        }

    }
}
var windowtest = function () {
    //return 'ok1';
    var x = 1;
}