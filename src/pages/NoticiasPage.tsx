import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import Footer from '../components/Footer';
import HeaderNav from '../components/HeaderNav';
import TopBar from '../components/TopBar';
import {
  fetchPublicNews,
  InfoCulturaNews,
  resolveInfoCulturaAssetUrl
} from '../data/infoculturaApi';
import { container, contentEmpty, contentSection, mainContent } from '../styles/ui';

const ITEMS_PER_PAGE = 8;

function formatDate(value?: string | null): string {
  if (!value) return 'Data por definir';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function ArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="ml-2 mt-0.5 h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function PaginationArrow({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg className={`h-5 w-5 ${direction === 'left' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function buildVisiblePages(currentPage: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 10) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | 'ellipsis'> = [1];
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

function NoticiasPage() {
  const [newsItems, setNewsItems] = useState<InfoCulturaNews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    let active = true;

    async function loadNews() {
      try {
        const response = await fetchPublicNews();
        if (!active) return;
        setNewsItems(response);
      } catch (error) {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar as notícias.');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadNews();

    return () => {
      active = false;
    };
  }, []);

  const sortedNews = useMemo(
    () =>
      [...newsItems].sort((left, right) => {
        const leftTime = new Date(left.published_at || left.created_at).getTime();
        const rightTime = new Date(right.published_at || right.created_at).getTime();
        return rightTime - leftTime;
      }),
    [newsItems]
  );

  const totalPages = Math.max(1, Math.ceil(sortedNews.length / ITEMS_PER_PAGE));
  const requestedPage = Number(searchParams.get('page') || '1');
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.min(Math.floor(requestedPage), totalPages)
      : 1;

  const paginatedNews = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedNews.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, sortedNews]);

  const visiblePages = buildVisiblePages(currentPage, totalPages);

  function goToPage(page: number) {
    setSearchParams(page === 1 ? {} : { page: String(page) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      <TopBar />
      <HeaderNav />
      <Breadcrumbs
        title="Notícias"
        description="Arquivo público de notícias."
        parentLabel="Vida Académica"
        parentHref="/vida-academica/noticias"
        currentLabel="Notícias"
        currentHref="/vida-academica/noticias"
      />

      <main className={mainContent}>
        <section className={contentSection}>
          <div className={`${container} relative z-10 mb-12 mt-6 px-4 sm:px-6 xl:px-8`}>
            {isLoading ? <p className={contentEmpty}>A carregar notícias...</p> : null}
            {loadError ? <p className={contentEmpty}>{loadError}</p> : null}
            {!isLoading && !loadError && paginatedNews.length === 0 ? (
              <p className={contentEmpty}>Ainda não existem notícias publicadas.</p>
            ) : null}

            {!isLoading && !loadError && paginatedNews.length > 0 ? (
              <>
                <div className="space-y-10">
                  {paginatedNews.map((item) => (
                    <article key={item.id}>
                      <div className="space-x-2">
                        {item.club_name ? (
                          <span className="inline-block text-sm font-medium text-orange-400">
                            #{item.club_name.toLowerCase().replace(/\s+/g, '')}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-2 flex flex-col items-start gap-6 lg:flex-row lg:gap-14">
                        <div className="order-2 grow lg:order-1">
                          <h2 className="text-2xl font-bold tracking-tight lg:text-4xl">
                            <Link
                              to={`/vida-academica/noticias/${item.id}`}
                              className="underline-offset-3 hover:underline"
                            >
                              {item.title}
                            </Link>
                          </h2>

                          <time
                            className="mt-3 inline-block text-sm font-medium capitalize text-gray-500"
                            dateTime={item.published_at || item.created_at}
                          >
                            {formatDate(item.published_at || item.created_at)}
                          </time>

                          <p className="mt-3 max-w-3xl text-slate-700">{item.summary}</p>

                          <div className="mt-3">
                            <Link
                              to={`/vida-academica/noticias/${item.id}`}
                              className="flex items-center text-sm font-medium text-orange-400 underline-offset-2 hover:underline"
                            >
                              <span>Ler Mais</span>
                              <ArrowIcon />
                            </Link>
                          </div>
                        </div>

                        <div className="relative order-1 shrink-0 overflow-hidden rounded shadow-xl lg:order-2">
                          <Link to={`/vida-academica/noticias/${item.id}`}>
                            <img
                              className="aspect-[4/2] w-full max-w-lg object-cover transition-transform duration-300 ease-in-out hover:scale-105 lg:mx-auto"
                              src={resolveInfoCulturaAssetUrl(item.image)}
                              alt={item.title}
                            />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-12">
                  <nav aria-label="Paginação" className="flex items-center justify-between">
                    <div className="flex flex-1 justify-between sm:hidden">
                      {currentPage > 1 ? (
                        <button
                          type="button"
                          onClick={() => goToPage(currentPage - 1)}
                          className="relative inline-flex items-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium leading-5 text-gray-700"
                        >
                          Anterior
                        </button>
                      ) : (
                        <span className="relative inline-flex cursor-default items-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium leading-5 text-gray-500">
                          Anterior
                        </span>
                      )}

                      {currentPage < totalPages ? (
                        <button
                          type="button"
                          onClick={() => goToPage(currentPage + 1)}
                          className="relative ml-3 inline-flex items-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium leading-5 text-gray-700"
                        >
                          Próximo
                        </button>
                      ) : (
                        <span className="relative ml-3 inline-flex cursor-default items-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium leading-5 text-gray-500">
                          Próximo
                        </span>
                      )}
                    </div>

                    <div className="hidden flex-1 items-center justify-center sm:flex">
                      <div>
                        <span className="relative z-0 inline-flex rounded-sm">
                          <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => goToPage(currentPage - 1)}
                            className="relative inline-flex items-center rounded-l-sm border border-gray-300 bg-white px-2 py-2 text-sm font-medium leading-5 text-gray-500 disabled:cursor-not-allowed disabled:text-gray-400"
                            aria-label="Anterior"
                          >
                            <PaginationArrow direction="left" />
                          </button>

                          {visiblePages.map((page, index) =>
                            page === 'ellipsis' ? (
                              <span
                                key={`ellipsis-${index}`}
                                className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium leading-5 text-gray-700"
                              >
                                ...
                              </span>
                            ) : (
                              <button
                                key={page}
                                type="button"
                                onClick={() => goToPage(page)}
                                className={`relative inline-flex items-center border border-gray-300 px-4 py-2 text-sm leading-5 ${
                                  page === currentPage
                                    ? 'cursor-default bg-white font-bold text-orange-400'
                                    : 'bg-white font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-500'
                                }`}
                                aria-current={page === currentPage ? 'page' : undefined}
                              >
                                {page}
                              </button>
                            )
                          )}

                          <button
                            type="button"
                            disabled={currentPage === totalPages}
                            onClick={() => goToPage(currentPage + 1)}
                            className="relative inline-flex items-center rounded-r-sm border border-gray-300 bg-white px-2 py-2 text-sm font-medium leading-5 text-gray-500 disabled:cursor-not-allowed disabled:text-gray-400"
                            aria-label="Próximo"
                          >
                            <PaginationArrow direction="right" />
                          </button>
                        </span>
                      </div>
                    </div>
                  </nav>
                </div>
              </>
            ) : null}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default NoticiasPage;
