var trn = {
    t: function (label) {
        if (!this.initialized) {
            return label;
        }

        if (typeof window.translation != 'undefined' && !window.translation) {
            return label;
        }

        var parts = label.split('.');

        var part, obj;
        var base = this.translations;

        while (parts.length > 0) {
            part = parts.shift();
            if (typeof  base[part] != "undefined") {
                base = base[part];
            }
        }
        if (typeof base == 'string') {
            return base;
        } else {
            frm.log.debug('translation for: "' + label + '" not found');
            return label;
        }

    },
    translations: null,
    initialized: false,
    init: function (lang) {
        var self = this;
        var options = {
            url: '/settings/translation/get/' + lang,
            success: function (data, textStatus, jqXHR) {
                self.translations = data.translations;
                self.initialized = true;
            }
        };
        $.ajax(options);
    }
};
trn.init('pl');
