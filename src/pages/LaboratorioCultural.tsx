import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import Footer from '../components/Footer';
import HeaderNav from '../components/HeaderNav';
import TopBar from '../components/TopBar';
import {
  fetchPublicCategories,
  fetchPublicBooks,
  fetchPublicClubs,
  fetchPublicEvents,
  fetchPublicNews,
  fetchPublicSessions,
  InfoCulturaBook,
  InfoCulturaCategory,
  InfoCulturaClub,
  InfoCulturaEvent,
  InfoCulturaNews,
  InfoCulturaSession,
  resolveInfoCulturaAssetUrl
} from '../data/infoculturaApi';
import {
  adminBtnSecondary,
  adminField,
  adminFormGridSpaced,
  adminInput,
  adminLabel,
  container,
  contentEmpty,
  labResearchGrid,
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

function getEventTimeState(item: InfoCulturaEvent): 'upcoming' | 'ongoing' | 'past' {
  const now = Date.now();
  const start = new Date(item.start_date).getTime();
  const end = new Date(item.end_date).getTime();

  if (!Number.isNaN(end) && end < now) return 'past';
  if (!Number.isNaN(start) && start > now) return 'upcoming';
  return 'ongoing';
}

function LaboratorioCultural() {
  const [clubs, setClubs] = useState<InfoCulturaClub[]>([]);
  const [categories, setCategories] = useState<InfoCulturaCategory[]>([]);
  const [newsItems, setNewsItems] = useState<InfoCulturaNews[]>([]);
  const [books, setBooks] = useState<InfoCulturaBook[]>([]);
  const [sessions, setSessions] = useState<InfoCulturaSession[]>([]);
  const [events, setEvents] = useState<InfoCulturaEvent[]>([]);
  const [searchQuery] = useState('');
  const [eventClubFilter, setEventClubFilter] = useState('all');
  const [eventCategoryFilter, setEventCategoryFilter] = useState('all');
  const [eventCityFilter, setEventCityFilter] = useState('all');
  const [eventStateFilter, setEventStateFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'past'>(
    'all'
  );
  const [eventDateFrom, setEventDateFrom] = useState('');
  const [eventDateTo, setEventDateTo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [nextClubs, nextCategories, nextNews, nextBooks, nextSessions, nextEvents] =
          await Promise.all([
          fetchPublicClubs(),
          fetchPublicCategories(),
          fetchPublicNews(),
          fetchPublicBooks(),
          fetchPublicSessions(),
          fetchPublicEvents()
          ]);

        if (!active) return;
        setClubs(nextClubs);
        setCategories(nextCategories);
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
        ) &&
        (eventClubFilter === 'all' || String(item.club_id || '') === eventClubFilter) &&
        (eventCategoryFilter === 'all' || item.category_ids.includes(Number(eventCategoryFilter))) &&
        (eventCityFilter === 'all' ||
          normalizeLabel(item.city || item.location || '') === normalizeLabel(eventCityFilter)) &&
        (eventStateFilter === 'all' || getEventTimeState(item) === eventStateFilter) &&
        (!eventDateFrom || item.event_date.slice(0, 10) >= eventDateFrom) &&
        (!eventDateTo || item.event_date.slice(0, 10) <= eventDateTo)
      ),
    [
      events,
      clubs,
      normalizedQuery,
      eventClubFilter,
      eventCategoryFilter,
      eventCityFilter,
      eventStateFilter,
      eventDateFrom,
      eventDateTo
    ]
  );
  const eventCities = useMemo(
    () =>
      Array.from(
        new Set(events.map((item) => (item.city || item.location || '').trim()).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b, 'pt')),
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
        <section className={labResearchSection}>
          <div className={`${container} px-4 sm:px-6 xl:px-8`}>
           
              <article className={labResearchSubcard}>
                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#fff7ec_0%,#ffffff_46%,#f6f8fb_100%)]">
                  <div className="px-5 py-7 sm:px-6 lg:px-7 sm:py-8">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#dd8609]">
                        Visão Cultural
                      </p>
                      <h3 className="mt-4 font-heading text-3xl font-semibold text-slate-900 sm:text-4xl">
                        Missão e Objetivos
                      </h3>
                      <p className="mt-4 max-w-2xl text-base leading-8 text-slate-700">
                        O Laboratório Cultural existe para aproximar cultura, comunidade académica
                        e participação. Esta entrada apresenta de forma clara a missão do espaço,
                        os seus objetivos e o enquadramento necessário para perceber rapidamente o
                        propósito do Laboratório Cultural sem procurar essa informação no meio do
                        resto do conteúdo.
                      </p>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                          to="/laboratorio-cultural/roadmap"
                          className="inline-flex items-center rounded-md bg-[#dd8609] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        >
                          Abrir página
                        </Link>
                        <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
                          Missão, objetivos e enquadramento
                        </span>
                      </div>
                  </div>
                </div>
              </article>

              {isLoading ? <p className={contentEmpty}>A carregar laboratorio...</p> : null}
              {!isLoading && loadError ? <p className={contentEmpty}>{loadError}</p> : null}
            

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
              <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">Explorar agenda</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Filtra eventos por clube, categoria, cidade, estado e intervalo de datas.
                    </p>
                  </div>
                  <button
                    type="button"
                    className={adminBtnSecondary}
                    onClick={() => {
                      setEventClubFilter('all');
                      setEventCategoryFilter('all');
                      setEventCityFilter('all');
                      setEventStateFilter('all');
                      setEventDateFrom('');
                      setEventDateTo('');
                    }}
                  >
                    Limpar filtros
                  </button>
                </div>

                <div className={adminFormGridSpaced}>
                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="lab-event-club-filter">
                      Clube
                    </label>
                    <select
                      id="lab-event-club-filter"
                      className={adminInput}
                      value={eventClubFilter}
                      onChange={(event) => setEventClubFilter(event.target.value)}
                    >
                      <option value="all">Todos</option>
                      {clubs.map((club) => (
                        <option key={club.id} value={club.id}>
                          {club.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="lab-event-category-filter">
                      Categoria
                    </label>
                    <select
                      id="lab-event-category-filter"
                      className={adminInput}
                      value={eventCategoryFilter}
                      onChange={(event) => setEventCategoryFilter(event.target.value)}
                    >
                      <option value="all">Todas</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="lab-event-city-filter">
                      Cidade
                    </label>
                    <select
                      id="lab-event-city-filter"
                      className={adminInput}
                      value={eventCityFilter}
                      onChange={(event) => setEventCityFilter(event.target.value)}
                    >
                      <option value="all">Todas</option>
                      {eventCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="lab-event-state-filter">
                      Estado
                    </label>
                    <select
                      id="lab-event-state-filter"
                      className={adminInput}
                      value={eventStateFilter}
                      onChange={(event) =>
                        setEventStateFilter(
                          event.target.value as 'all' | 'upcoming' | 'ongoing' | 'past'
                        )
                      }
                    >
                      <option value="all">Todos</option>
                      <option value="upcoming">Proximos</option>
                      <option value="ongoing">A decorrer</option>
                      <option value="past">Concluidos</option>
                    </select>
                  </div>

                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="lab-event-date-from">
                      Data inicial
                    </label>
                    <input
                      id="lab-event-date-from"
                      type="date"
                      className={adminInput}
                      value={eventDateFrom}
                      onChange={(event) => setEventDateFrom(event.target.value)}
                    />
                  </div>

                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="lab-event-date-to">
                      Data final
                    </label>
                    <input
                      id="lab-event-date-to"
                      type="date"
                      className={adminInput}
                      value={eventDateTo}
                      onChange={(event) => setEventDateTo(event.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-8">
                  {filteredEvents.length === 0 ? (
                    <p className={contentEmpty}>Nao existem eventos para os filtros atuais.</p>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {filteredEvents.slice(0, hasSearch ? 6 : 9).map((item) => {
                        const stateLabel =
                          getEventTimeState(item) === 'upcoming'
                            ? 'Proximo'
                            : getEventTimeState(item) === 'ongoing'
                              ? 'A decorrer'
                              : 'Concluido';

                        return (
                          <ResultCard
                            key={`agenda-event-${item.id}`}
                            title={item.title}
                            meta={`${getClubNameById(clubs, item.club_id)} · ${describeEvent(item)}`}
                            description={item.description}
                            href={`/laboratorio-cultural/eventos/${item.id}`}
                            image={item.image}
                            status={stateLabel}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
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
