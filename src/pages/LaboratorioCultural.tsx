import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Footer from '../components/layout/Footer';
import HeaderNav from '../components/layout/HeaderNav';
import BestBooksSection from '../components/sections/BestBooksSection.js';
import NewsHighlightsSection, {
  type NewsHighlightItem
} from '../components/ui/NewsHighlightsSection';
import TopBar from '../components/layout/TopBar';
import {
  fetchPublicBooks,
  fetchPublicClubs,
  fetchPublicEvents,
  fetchPublicNews,
  fetchPublicSessions,
  InfoCulturaBook,
  InfoCulturaClub,
  InfoCulturaEvent,
  InfoCulturaNews,
  InfoCulturaSession,
  resolveInfoCulturaAssetUrl
} from '../api/infoculturaApi';
import {
  adminBtnSecondary,
  blockText,
  blockTitle,
  container,
  contentEmpty,
  contentCard,
  contentSection,
  labResearchGrid,
  labResearchLink,
  labResearchSubcard,
  labResearchSubtext,
  labResearchSubtitle,
  mainContent
} from '../styles/ui';
import { getLocaleText, useLocale } from '../i18n/locale.js';

function normalizeLabel(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getClubHref(club: InfoCulturaClub): string {
  const label = normalizeLabel(club.name);

  if (label.includes('tuna')) {
    return '/laboratorio-cultural/tuna';
  }

  if (label.includes('leitura')) {
    return '/laboratorio-cultural/clube-leitura';
  }

  if (label.includes('teatro')) {
    return '/laboratorio-cultural/teatro';
  }

  return `/laboratorio-cultural/clubes/${club.id}`;
}

function matchesSearch(query: string, ...values: Array<string | undefined | null>): boolean {
  if (!query) return true;

  return values.some((value) => normalizeLabel(value || '').includes(query));
}

function getClubNameById(clubs: InfoCulturaClub[], clubId?: number | null): string {
  if (!clubId) return '';
  return clubs.find((club) => club.id === clubId)?.name || '';
}

function ResultCard({
  title,
  meta,
  description,
  href,
  image,
  status
}: {
  title: string;
  meta: string;
  description: string;
  href: string;
  image?: string;
  status?: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {image ? (
        <img
          src={resolveInfoCulturaAssetUrl(image)}
          alt={title}
          className="mb-4 h-40 w-full rounded-xl object-cover"
        />
      ) : null}
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {status ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {status}
          </span>
        ) : null}
      </div>
      <p className="mb-2 text-sm text-slate-500">{meta}</p>
      <p className="mb-4 text-sm leading-6 text-slate-700">{description}</p>
      <Link to={href} className={labResearchLink}>
        Ver detalhe
      </Link>
    </article>
  );
}

function LaboratorioCultural() {
  const { locale } = useLocale();
  const [clubs, setClubs] = useState<InfoCulturaClub[]>([]);
  const [newsItems, setNewsItems] = useState<InfoCulturaNews[]>([]);
  const [books, setBooks] = useState<InfoCulturaBook[]>([]);
  const [sessions, setSessions] = useState<InfoCulturaSession[]>([]);
  const [events, setEvents] = useState<InfoCulturaEvent[]>([]);
  const [searchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [nextClubs, nextNews, nextBooks, nextSessions, nextEvents] =
          await Promise.all([
          fetchPublicClubs(),
          fetchPublicNews(),
          fetchPublicBooks(),
          fetchPublicSessions(),
          fetchPublicEvents()
          ]);

        if (!active) return;
        setClubs(nextClubs);
        setNewsItems(nextNews);
        setBooks(nextBooks);
        setSessions(nextSessions);
        setEvents(nextEvents);
      } catch (error) {
        if (!active) return;
        const message =
          error instanceof Error ? error.message : 'Nao foi possivel carregar o laboratorio.';
        setLoadError(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const normalizedQuery = useMemo(() => normalizeLabel(searchQuery), [searchQuery]);
  const filteredClubs = useMemo(
    () =>
      clubs.filter((club) =>
        matchesSearch(normalizedQuery, club.name, club.description, club.mission)
      ),
    [clubs, normalizedQuery]
  );
  const filteredNews = useMemo(
    () =>
      newsItems.filter((item) =>
        matchesSearch(
          normalizedQuery,
          item.title,
          item.summary,
          item.content,
          item.club_name
        )
      ),
    [newsItems, normalizedQuery]
  );
  const filteredBooks = useMemo(
    () =>
      books.filter((item) =>
        matchesSearch(
          normalizedQuery,
          item.title,
          item.author,
          item.summary,
          item.publisher,
          item.club_name
        )
      ),
    [books, normalizedQuery]
  );
  const filteredSessions = useMemo(
    () =>
      sessions.filter((item) =>
        matchesSearch(
          normalizedQuery,
          item.name,
          item.title,
          item.description,
          item.club_name
        )
      ),
    [sessions, normalizedQuery]
  );
  const filteredEvents = useMemo(
    () =>
      events.filter((item) =>
        matchesSearch(
          normalizedQuery,
          item.title,
          item.description,
          item.city,
          item.location,
          getClubNameById(clubs, item.club_id)
        )
      ),
    [events, clubs, normalizedQuery]
  );
  const homepageStyleNews = useMemo<NewsHighlightItem[]>(
    () =>
      [...newsItems]
        .sort((left, right) => {
          const leftTime = new Date(left.published_at || left.created_at).getTime();
          const rightTime = new Date(right.published_at || right.created_at).getTime();
          return rightTime - leftTime;
        })
        .slice(0, 3)
        .map((item) => ({
          title: item.title,
          href: `/vida-academica/noticias/${item.id}`,
          internal: true,
          excerpt: item.summary,
          image: resolveInfoCulturaAssetUrl(item.image),
          imageAlt: item.title,
          publishedAt: item.published_at || item.created_at,
          publishedLabel: new Intl.DateTimeFormat('pt-PT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          }).format(new Date(item.published_at || item.created_at)),
          tags: item.club_name
            ? [
                {
                  label: `#${normalizeLabel(item.club_name).replace(/\s+/g, '')}`,
                  href: '/vida-academica/noticias'
                }
              ]
            : []
        })),
    [newsItems]
  );
  const homepageStyleEvents = useMemo<NewsHighlightItem[]>(
    () =>
      [...events]
        .sort((left, right) => {
          const leftTime = new Date(left.start_date || left.event_date).getTime();
          const rightTime = new Date(right.start_date || right.event_date).getTime();
          return rightTime - leftTime;
        })
        .slice(0, 3)
        .map((item) => ({
          title: item.title,
          href: `/vida-academica/eventos/${item.id}`,
          internal: true,
          excerpt: item.description,
          image: resolveInfoCulturaAssetUrl(item.image),
          imageAlt: item.title,
          publishedAt: item.start_date || item.event_date,
          publishedLabel: new Intl.DateTimeFormat('pt-PT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          }).format(new Date(item.start_date || item.event_date)),
          tags: item.categories.map((category) => ({
            label: `#${normalizeLabel(category.name).replace(/\s+/g, '')}`,
            href: '/vida-academica/eventos'
          }))
        })),
    [events]
  );

  const hasSearch = normalizedQuery.length > 0;
  const totalResults =
    filteredClubs.length +
    filteredNews.length +
    filteredBooks.length +
    filteredSessions.length +
    filteredEvents.length;

  return (
    <>
      <TopBar />
      <HeaderNav />
      <Breadcrumbs
        title="Laboratorio Cultural"
        description="O Laboratório Cultural é um espaço vivo onde a criatividade ganha forma e a cultura se torna experiência."
        parentLabel="Laboratorio Cultural"
        parentHref="/laboratorio-cultural"
        currentLabel="Laboratorio Cultural"
        currentHref="/laboratorio-cultural"
      />

      <main className={mainContent}>
        <section className={contentSection}>
          <div className={`${container} px-4 sm:px-6 xl:px-8`}>
            <div className="space-y-10">
              <article className={contentCard}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#dd8609]">
                  Visão Cultural
                </p>
                <h3 className={`${blockTitle} mt-4`}>Missão e Objetivos</h3>
                <p className={`${blockText} max-w-3xl`}>
                  O Laboratório Cultural existe para aproximar cultura, comunidade académica e
                  participação. Esta entrada apresenta de forma clara a missão do espaço, os seus
                  objetivos e o enquadramento necessário para perceber rapidamente o propósito do
                  Laboratório Cultural sem procurar essa informação no meio do resto do conteúdo.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link to="/laboratorio-cultural/roadmap" className={adminBtnSecondary}>
                    Abrir página
                  </Link>
                  <span className="text-sm text-slate-500">Leitura rápida</span>
                </div>
              </article>

              {isLoading ? <p className={contentEmpty}>A carregar laboratorio...</p> : null}
              {!isLoading && loadError ? <p className={contentEmpty}>{loadError}</p> : null}

              {!isLoading && !loadError ? (
              <div className="mt-10">
                <h2 className="mb-4 text-2xl font-semibold text-slate-900">
                  {hasSearch ? 'Clubes encontrados' : 'Clubes ativos'}
                </h2>
                {filteredClubs.length === 0 ? (
                  <p className={contentEmpty}>Ainda nao existem clubes ativos para mostrar.</p>
                ) : (
                  <div className={labResearchGrid}>
                    {filteredClubs.map((club) => (
                      <article key={club.id} className={labResearchSubcard}>
                        {club.image ? (
                          <img
                            src={resolveInfoCulturaAssetUrl(club.image)}
                            alt={club.name}
                            className="mb-4 h-40 w-full rounded-xl object-cover"
                          />
                        ) : null}
                        <h3 className={labResearchSubtitle}>{club.name}</h3>
                        <p className={labResearchSubtext}>
                          {club.mission ||
                            club.description ||
                            'Clube cultural disponivel no laboratorio.'}
                        </p>
                        <Link to={getClubHref(club)} className={labResearchLink}>
                          Ver mais
                        </Link>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {!isLoading && !loadError && hasSearch ? (
              <div className="mt-10 space-y-10">
                {totalResults === 0 ? (
                  <p className={contentEmpty}>Nao existem resultados para a pesquisa atual.</p>
                ) : null}

                {filteredNews.length > 0 ? (
                  <section>
                    <h2 className="mb-4 text-2xl font-semibold text-slate-900">Noticias</h2>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {filteredNews.slice(0, 6).map((item) => (
                        <ResultCard
                          key={`news-${item.id}`}
                          title={item.title}
                          meta={item.club_name}
                          description={item.summary}
                          href={`/laboratorio-cultural/noticias/${item.id}`}
                          image={item.image}
                          status={item.news_status_name}
                        />
                      ))}
                    </div>
                  </section>
                ) : null}

                {filteredEvents.length > 0 ? (
                  <section>
                    <h2 className="mb-4 text-2xl font-semibold text-slate-900">Eventos</h2>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {filteredEvents.slice(0, 6).map((item) => (
                        <ResultCard
                          key={`event-${item.id}`}
                          title={item.title}
                          meta={getClubNameById(clubs, item.club_id)}
                          description={item.description}
                          href={`/laboratorio-cultural/eventos/${item.id}`}
                          image={item.image}
                          status={item.status}
                        />
                      ))}
                    </div>
                  </section>
                ) : null}

                {filteredSessions.length > 0 ? (
                  <section>
                    <h2 className="mb-4 text-2xl font-semibold text-slate-900">Sessoes</h2>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {filteredSessions.slice(0, 6).map((item) => (
                        <ResultCard
                          key={`session-${item.id}`}
                          title={item.title}
                          meta={item.club_name}
                          description={item.description}
                          href={`/laboratorio-cultural/sessoes/${item.id}`}
                          status={item.name}
                        />
                      ))}
                    </div>
                  </section>
                ) : null}

                <BestBooksSection
                  books={filteredBooks}
                  locale={locale}
                  title={getLocaleText(locale, 'Livros', 'Books')}
                  description={getLocaleText(
                    locale,
                    'Livros filtrados pela pesquisa atual.',
                    'Books filtered by the current search.'
                  )}
                  detailBaseHref="/laboratorio-cultural/livros"
                  limit={6}
                />
              </div>
            ) : null}

            {!isLoading && !loadError && !hasSearch ? (
              <div className="mt-10 space-y-10">
                {homepageStyleNews.length > 0 || homepageStyleEvents.length > 0 ? (
                  <section className="mt-12 bg-white lg:mt-16 xl:mt-20">
                    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 lg:grid-cols-2">
                      <NewsHighlightsSection
                        title="Notícias"
                        viewAllHref="/vida-academica/noticias"
                        viewAllInternal
                        items={homepageStyleNews}
                        className="w-full"
                      />
                      <NewsHighlightsSection
                        title="Eventos"
                        viewAllHref="/vida-academica/eventos"
                        viewAllInternal
                        items={homepageStyleEvents}
                        className="w-full"
                      />
                    </div>
                  </section>
                ) : null}

                <BestBooksSection
                  books={books}
                  locale={locale}
                  title={getLocaleText(locale, 'Livros em destaque', 'Featured books')}
                  description={getLocaleText(
                    locale,
                    'Alguns dos livros mais relevantes do Laboratório Cultural.',
                    'Some of the most relevant books from the Cultural Lab.'
                  )}
                  viewAllHref="/laboratorio-cultural"
                  viewAllLabel={getLocaleText(locale, 'Ver laboratório', 'View lab')}
                  detailBaseHref="/laboratorio-cultural/livros"
                  limit={6}
                />



                {filteredSessions.length > 0 ? (
                  <section>
                    <h2 className="mb-4 text-2xl font-semibold text-slate-900">Sessoes</h2>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {filteredSessions.slice(0, 6).map((item) => (
                        <ResultCard
                          key={`session-overview-${item.id}`}
                          title={item.title}
                          meta={item.club_name}
                          description={item.description}
                          href={`/laboratorio-cultural/sessoes/${item.id}`}
                          status={item.name}
                        />
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            ) : null}

            {!isLoading && !loadError ? (
              <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">Explorar agenda</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Vê todos os eventos numa página própria com filtros e uma leitura geral por
                      calendário.
                    </p>
                  </div>
                  <Link to="/laboratorio-cultural/agenda" className={adminBtnSecondary}>
                    Ver agenda completa
                  </Link>
                </div>
              </div>
            ) : null}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default LaboratorioCultural;
