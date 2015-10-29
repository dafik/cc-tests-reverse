(function ($) {
    $.fn.columnFilter = function (options) {

        var columnsDef = options.aoColumns;
        var defaultType = 'text';
        var table = this.DataTable();

        function filter(column, value) {
            var columnIndex = column[0][0];
            var settings = column.settings()[0];
            if (settings.aoPreSearchCols[columnIndex].sSearch != value) {
                column
                    .search(value)
                    .draw();
            }
        }

        function stopEvent(e) {
            e.stopPropagation();
        }


        this.find('thead th').each(function (index) {
            if (typeof columnsDef[index] != 'undefined' && columnsDef[index] !== null) {
                var type = columnsDef[index].type || defaultType;
                var cssClass = '';
                if (type == 'date-range') {
                    cssClass = ' rangeDatePicker'
                    type = defaultType;
                }
                if (type == 'number') {
                    type = defaultType;
                }

                if (type != 'text') {
                    alert('not implemented yet: filter ' + type);
                }
                var title = $(this).text();
                var column = table.column(index);
                var doFilter = function () {
                    filter(column, this.value);
                };
                var val = column.search();

                var input = $('<input type="text" placeholder="' + title + '" style="width:100%" class="form-control dtSearch' + cssClass + '" value="' + val + '"/>');
                $(this).html(input);


                input.on('keyup change', _.debounce(doFilter, 500));
                input.click(stopEvent);
            }
        });

    };
})(jQuery);