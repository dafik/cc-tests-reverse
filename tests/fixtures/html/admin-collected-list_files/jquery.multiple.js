(function ($) {

    function getJqueryObjectsArray(selector) {
        if (typeof selector === 'string') {
            return [$(selector)];
        } else if (Array.isArray(selector)) {
            var tmp = [];
            selector.forEach(function (element) {
                tmp = $.merge(tmp, getJqueryObjectsArray(element));
            });
            return tmp;
        } else {
            return [$(selector)];
        }
    }

    $.multiple = function () {
        var first = null;
        for (var i = 0; i < arguments.length; i++) {
            getJqueryObjectsArray(arguments[i]).forEach(function (element) {
                if (element instanceof jQuery) {
                    first = (null === first) ? element : first.add(element);
                }
            });
        }
        return (first == null) ? $() : first;
    }
    ;
}(jQuery));