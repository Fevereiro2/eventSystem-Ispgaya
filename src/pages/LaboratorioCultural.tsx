import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import Footer from '../components/Footer';
import HeaderNav from '../components/HeaderNav';
import TopBar from '../components/TopBar';
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
} from '../data/infoculturaApi';
import {
  container,
  contentEmpty,
  labResearchGrid,
  labResearchHeroCard,
  labResearchHeroText,
  labResearchHeroTitle,
  labResearchLink,
  labResearchSection,
  labResearchSubcard,
  labResearchSubtext,
  labResearchSubtitle,
  mainContent
} from '../styles/ui';

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

function describeEvent(item: InfoCulturaEvent): string {
  const categoryNames = item.categories.map((category) => category.name).join(', ');
  return [item.city, item.location, categoryNames].filter(Boolean).join(' · ');
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
  const [clubs, setClubs] = useState<InfoCulturaClub[]>([]);
  const [newsItems, setNewsItems] = useState<InfoCulturaNews[]>([]);
  const [books, setBooks] = useState<InfoCulturaBook[]>([]);
  const [sessions, setSessions] = useState<InfoCulturaSession[]>([]);
  const [events, setEvents] = useState<InfoCulturaEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [nextClubs, nextNews, nextBooks, nextSessions, nextEvents] = await Promise.all([
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
          describeEvent(item),
          getClubNameById(clubs, item.club_id)
        )
      ),
    [events, clubs, normalizedQuery]
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
        description="A nossa abordagem cultural e interdisciplinar, promovendo criacao artistica, participacao academica e ligacao com a comunidade."
        parentLabel="Laboratorio Cultural"
        parentHref="/laboratorio-cultural"
        currentLabel="Laboratorio Cultural"
        currentHref="/laboratorio-cultural"
      />

      <main className={mainContent}>
        <section className={labResearchSection}>
          <div className={container}>
            <div className={labResearchGrid}>
              <article className={labResearchHeroCard}>
                <h2 className={labResearchHeroTitle}>InfoCultura</h2>
                <p className={labResearchHeroText}>
                  A plataforma de gestao cultural agrega publicacoes, agenda e comunicacao das
                  iniciativas do Laboratorio Cultural.
                </p>
                <Link to="/infocultura" className={labResearchLink}>
                  Ver mais
                </Link>
              </article>

              <article className={labResearchSubcard}>
                <h3 className={labResearchSubtitle}>Pesquisa global</h3>
                <p className={labResearchSubtext}>
                  Procura por clubes, noticias, livros, sessoes e eventos.
                </p>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Pesquisar por clube, noticia, livro ou evento"
                  className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                />
                {hasSearch ? (
                  <p className="mt-3 text-sm text-slate-500">
                    {totalResults} resultado(s) encontrados para "{searchQuery}".
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    Introduz um termo para pesquisar em todo o Laboratorio Cultural.
                  </p>
                )}
              </article>

              {isLoading ? <p className={contentEmpty}>A carregar laboratorio...</p> : null}
              {!isLoading && loadError ? <p className={contentEmpty}>{loadError}</p> : null}
            </div>

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

                {filteredBooks.length > 0 ? (
                  <section>
                    <h2 className="mb-4 text-2xl font-semibold text-slate-900">Livros</h2>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {filteredBooks.slice(0, 6).map((item) => (
                        <ResultCard
                          key={`book-${item.id}`}
                          title={item.title}
                          meta={`${item.club_name} · ${item.author}`}
                          description={item.summary}
                          href={`/laboratorio-cultural/livros/${item.id}`}
                          image={item.cover_image}
                          status={item.is_featured ? 'Destaque' : 'Livro'}
                        />
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            ) : null}

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
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default LaboratorioCultural;
