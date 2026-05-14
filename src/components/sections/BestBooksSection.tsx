import { Link } from 'react-router-dom';

import type { InfoCulturaBook } from '../../api/infoculturaApi.js';
import { resolveInfoCulturaAssetUrl } from '../../api/infoculturaApi.js';
import { Locale, getLocaleText } from '../../i18n/locale.js';
import { labResearchLink } from '../../styles/ui';

type BestBooksSectionProps = {
  books: InfoCulturaBook[];
  locale: Locale;
  title?: string;
  description?: string;
  emptyLabel?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  detailBaseHref?: string;
  limit?: number;
  className?: string;
};

function sortBooks(list: InfoCulturaBook[]): InfoCulturaBook[] {
  return [...list].sort((left, right) => {
    const featuredDelta = Number(right.is_featured) - Number(left.is_featured);
    if (featuredDelta !== 0) return featuredDelta;

    const yearDelta = right.publication_year - left.publication_year;
    if (yearDelta !== 0) return yearDelta;

    return left.title.localeCompare(right.title, 'pt');
  });
}

function BestBooksSection({
  books,
  locale,
  title,
  description,
  emptyLabel,
  viewAllHref,
  viewAllLabel,
  detailBaseHref = '/laboratorio-cultural/livros',
  limit,
  className = 'w-full'
}: BestBooksSectionProps) {
  const sortedBooks = sortBooks(books);
  const displayedBooks = typeof limit === 'number' ? sortedBooks.slice(0, limit) : sortedBooks;

  const resolvedTitle = title || getLocaleText(locale, 'Livros em destaque', 'Featured books');
  const resolvedDescription =
    description ||
    getLocaleText(
      locale,
      'Uma seleção dos livros com maior destaque na comunidade cultural.',
      'A curated selection of the most relevant books in the cultural community.'
    );
  const resolvedEmptyLabel =
    emptyLabel ||
    getLocaleText(
      locale,
      'Ainda não existem livros para mostrar.',
      'There are no books to show yet.'
    );
  const resolvedViewAllLabel =
    viewAllLabel || getLocaleText(locale, 'Ver todos os livros', 'View all books');

  return (
    <section className={className} aria-labelledby="best-books-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
            {getLocaleText(locale, 'Biblioteca', 'Library')}
          </p>
          <h2
            id="best-books-heading"
            className="mt-3 font-heading text-3xl font-bold tracking-tight text-black xl:text-4xl"
          >
            {resolvedTitle}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{resolvedDescription}</p>
        </div>

        {viewAllHref ? (
          <Link to={viewAllHref} className={labResearchLink}>
            {resolvedViewAllLabel}
          </Link>
        ) : null}
      </div>

      <div className="mt-8">
        {displayedBooks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-8 text-sm text-slate-500">
            {resolvedEmptyLabel}
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {displayedBooks.map((book) => (
              <article
                key={book.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
              >
                {book.cover_image ? (
                  <img
                    src={resolveInfoCulturaAssetUrl(book.cover_image)}
                    alt={book.title}
                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-6 text-center">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {getLocaleText(locale, 'Livro', 'Book')}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900">{book.title}</h3>
                    </div>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{book.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {book.author} · {book.publication_year}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {book.is_featured
                        ? getLocaleText(locale, 'Destaque', 'Featured')
                        : getLocaleText(locale, 'Livro', 'Book')}
                    </span>
                  </div>

                  {book.club_name ? (
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#dd8609]">
                      {book.club_name}
                    </p>
                  ) : null}

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-700">
                    {book.summary}
                  </p>

                  <div className="mt-4">
                    <Link
                      to={`${detailBaseHref}/${book.id}`}
                      className="inline-flex items-center text-sm font-semibold text-[#dd8609] underline-offset-2 hover:underline"
                    >
                      {getLocaleText(locale, 'Ver detalhe', 'View details')}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default BestBooksSection;
