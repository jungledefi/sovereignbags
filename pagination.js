(function($) {
    $.fn.pagination = function(options) {
        const settings = $.extend({
            dataSource: [],
            pageSize: 10,
            callback: function(data, pagination) {}
        }, options);

        const $this = $(this);
        let currentPage = 1;
        const visiblePageCount = 10;

        function renderPagination(totalPages) {
            $this.empty();
            if (totalPages <= 1) return;

            $this.off('click', '.page');
            let startPage = Math.max(1, currentPage - Math.floor(visiblePageCount / 2));
            let endPage = Math.min(totalPages, currentPage + Math.floor(visiblePageCount / 2));

            if (startPage > 1) {
                $this.append(`<a href="#" class="page" data-page="1">1</a>`);
                if (startPage > 2) {
                    $this.append(`<span>...</span>`);
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                const activeClass = (i === currentPage) ? ' active' : '';
                $this.append(`<a href="#" class="page${activeClass}" data-page="${i}">${i}</a>`);
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    $this.append(`<span>...</span>`);
                }
                $this.append(`<a href="#" class="page" data-page="${totalPages}">${totalPages}</a>`);
            }

            $this.on('click', '.page', function(e) {
                e.preventDefault();
                const newPage = parseInt($(this).data('page'));
                if (newPage !== currentPage) {
                    currentPage = newPage;
                    renderData();
                }
            });
        }

        function renderData() {
            const start = (currentPage - 1) * settings.pageSize;
            const end = start + settings.pageSize;
            const paginatedData = settings.dataSource.slice(start, end);
            console.log('Paginated data:', paginatedData);
            settings.callback(paginatedData, { currentPage, totalPages: Math.ceil(settings.dataSource.length / settings.pageSize) });
            renderPagination(Math.ceil(settings.dataSource.length / settings.pageSize));
        }

        renderData();

        return this;
    };
})(jQuery);