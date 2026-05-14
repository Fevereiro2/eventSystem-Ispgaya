import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { contentEmpty } from '../../styles/ui.js';
import { useLocale, getLocaleText } from '../../i18n/locale.js';
const DEFAULT_ITEMS_PER_PAGE = 8;
function buildVisiblePages(currentPage, totalPages) {
    if (totalPages <= 10) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    const pages = [1];
    const start = Math.max(2, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);
    if (start > 2) {
        pages.push('ellipsis');
    }
    for (let page = start; page <= end; page += 1) {
        pages.push(page);
    }
    if (end < totalPages - 1) {
        pages.push('ellipsis');
    }
    pages.push(totalPages);
    return pages;
}
function PaginationArrow({ direction }) {
    return (_jsx(ChevronRight, { "aria-hidden": "true", className: `h-5 w-5 ${direction === 'left' ? 'rotate-180' : ''}`, strokeWidth: 2 }));
}
function PaginatedCollection({ items, isLoading, error, loadingMessage, emptyMessage, itemsPerPage = DEFAULT_ITEMS_PER_PAGE, renderItem }) {
    const { locale } = useLocale();
    const [searchParams, setSearchParams] = useSearchParams();
    const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
    const requestedPage = Number(searchParams.get('page') || '1');
    const currentPage = Number.isFinite(requestedPage) && requestedPage > 0
        ? Math.min(Math.floor(requestedPage), totalPages)
        : 1;
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return items.slice(start, start + itemsPerPage);
    }, [currentPage, items, itemsPerPage]);
    const visiblePages = buildVisiblePages(currentPage, totalPages);
    function goToPage(page) {
        setSearchParams(page === 1 ? {} : { page: String(page) });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (isLoading) {
        return _jsx("p", { className: contentEmpty, children: loadingMessage });
    }
    if (error) {
        return _jsx("p", { className: contentEmpty, children: error });
    }
    if (paginatedItems.length === 0) {
        return _jsx("p", { className: contentEmpty, children: emptyMessage });
    }
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "space-y-10", children: paginatedItems.map((item) => renderItem(item)) }), _jsx("div", { className: "mt-12", children: _jsxs("nav", { "aria-label": "Pagina\u00E7\u00E3o", className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { className: "flex flex-1 justify-between gap-3 sm:hidden", children: [currentPage > 1 ? (_jsx("button", { type: "button", onClick: () => goToPage(currentPage - 1), className: "relative inline-flex w-full items-center justify-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium leading-5 text-gray-700", children: getLocaleText(locale, 'Anterior', 'Previous') })) : (_jsx("span", { className: "relative inline-flex w-full cursor-default items-center justify-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium leading-5 text-gray-500", children: getLocaleText(locale, 'Anterior', 'Previous') })), currentPage < totalPages ? (_jsx("button", { type: "button", onClick: () => goToPage(currentPage + 1), className: "relative inline-flex w-full items-center justify-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium leading-5 text-gray-700", children: getLocaleText(locale, 'Próximo', 'Next') })) : (_jsx("span", { className: "relative inline-flex w-full cursor-default items-center justify-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium leading-5 text-gray-500", children: getLocaleText(locale, 'Próximo', 'Next') }))] }), _jsx("div", { className: "hidden flex-1 items-center justify-center sm:flex", children: _jsxs("span", { className: "relative z-0 inline-flex rounded-sm", children: [_jsx("button", { type: "button", disabled: currentPage === 1, onClick: () => goToPage(currentPage - 1), className: "relative inline-flex items-center rounded-l-sm border border-gray-300 bg-white px-2 py-2 text-sm font-medium leading-5 text-gray-500 disabled:cursor-not-allowed disabled:text-gray-400", "aria-label": "Anterior", children: _jsx(PaginationArrow, { direction: "left" }) }), visiblePages.map((page, index) => page === 'ellipsis' ? (_jsx("span", { className: "relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium leading-5 text-gray-700", children: "..." }, `ellipsis-${index}`)) : (_jsx("button", { type: "button", onClick: () => goToPage(page), className: `relative inline-flex items-center border border-gray-300 px-4 py-2 text-sm leading-5 ${page === currentPage
                                            ? 'cursor-default bg-white font-bold text-orange-400'
                                            : 'bg-white font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-500'}`, "aria-current": page === currentPage ? 'page' : undefined, children: page }, page))), _jsx("button", { type: "button", disabled: currentPage === totalPages, onClick: () => goToPage(currentPage + 1), className: "relative inline-flex items-center rounded-r-sm border border-gray-300 bg-white px-2 py-2 text-sm font-medium leading-5 text-gray-500 disabled:cursor-not-allowed disabled:text-gray-400", "aria-label": "Pr\u00F3ximo", children: _jsx(PaginationArrow, { direction: "right" }) })] }) })] }) })] }));
}
export default PaginatedCollection;
