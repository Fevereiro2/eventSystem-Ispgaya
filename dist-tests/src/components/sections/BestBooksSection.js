import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { resolveInfoCulturaAssetUrl } from '../../api/infoculturaApi.js';
import { getLocaleText } from '../../i18n/locale.js';
import { labResearchLink } from '../../styles/ui';
function sortBooks(list) {
    return [...list].sort((left, right) => {
        const featuredDelta = Number(right.is_featured) - Number(left.is_featured);
        if (featuredDelta !== 0)
            return featuredDelta;
        const yearDelta = right.publication_year - left.publication_year;
        if (yearDelta !== 0)
            return yearDelta;
        return left.title.localeCompare(right.title, 'pt');
    });
}
function BestBooksSection({ books, locale, title, description, emptyLabel, viewAllHref, viewAllLabel, detailBaseHref = '/laboratorio-cultural/livros', limit, className = 'w-full' }) {
    const sortedBooks = sortBooks(books);
    const displayedBooks = typeof limit === 'number' ? sortedBooks.slice(0, limit) : sortedBooks;
    const resolvedTitle = title || getLocaleText(locale, 'Livros em destaque', 'Featured books');
    const resolvedDescription = description ||
        getLocaleText(locale, 'Uma seleção dos livros com maior destaque na comunidade cultural.', 'A curated selection of the most relevant books in the cultural community.');
    const resolvedEmptyLabel = emptyLabel ||
        getLocaleText(locale, 'Ainda não existem livros para mostrar.', 'There are no books to show yet.');
    const resolvedViewAllLabel = viewAllLabel || getLocaleText(locale, 'Ver todos os livros', 'View all books');
    return (_jsxs("section", { className: className, "aria-labelledby": "best-books-heading", children: [_jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4", children: [_jsxs("div", { className: "max-w-3xl", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-orange-400", children: getLocaleText(locale, 'Biblioteca', 'Library') }), _jsx("h2", { id: "best-books-heading", className: "mt-3 font-heading text-3xl font-bold tracking-tight text-black xl:text-4xl", children: resolvedTitle }), _jsx("p", { className: "mt-3 max-w-3xl text-sm leading-6 text-slate-600", children: resolvedDescription })] }), viewAllHref ? (_jsx(Link, { to: viewAllHref, className: labResearchLink, children: resolvedViewAllLabel })) : null] }), _jsx("div", { className: "mt-8", children: displayedBooks.length === 0 ? (_jsx("p", { className: "rounded-xl border border-dashed border-slate-300 bg-white px-5 py-8 text-sm text-slate-500", children: resolvedEmptyLabel })) : (_jsx("div", { className: "grid gap-5 md:grid-cols-2 xl:grid-cols-4", children: displayedBooks.map((book) => (_jsxs("article", { className: "group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5", children: [book.cover_image ? (_jsx("img", { src: resolveInfoCulturaAssetUrl(book.cover_image), alt: book.title, className: "h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105" })) : (_jsx("div", { className: "flex h-48 w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-6 text-center", children: _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-slate-500", children: getLocaleText(locale, 'Livro', 'Book') }), _jsx("h3", { className: "mt-2 text-lg font-semibold text-slate-900", children: book.title })] }) })), _jsxs("div", { className: "p-5", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900", children: book.title }), _jsxs("p", { className: "mt-1 text-sm text-slate-500", children: [book.author, " \u00B7 ", book.publication_year] })] }), _jsx("span", { className: "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600", children: book.is_featured
                                                    ? getLocaleText(locale, 'Destaque', 'Featured')
                                                    : getLocaleText(locale, 'Livro', 'Book') })] }), book.club_name ? (_jsx("p", { className: "mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#dd8609]", children: book.club_name })) : null, _jsx("p", { className: "mt-3 line-clamp-3 text-sm leading-6 text-slate-700", children: book.summary }), _jsx("div", { className: "mt-4", children: _jsx(Link, { to: `${detailBaseHref}/${book.id}`, className: "inline-flex items-center text-sm font-semibold text-[#dd8609] underline-offset-2 hover:underline", children: getLocaleText(locale, 'Ver detalhe', 'View details') }) })] })] }, book.id))) })) })] }));
}
export default BestBooksSection;
