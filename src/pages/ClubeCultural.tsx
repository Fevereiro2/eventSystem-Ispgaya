import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ClubRegistrationModal, {
  ClubRegistrationFormData
} from '../components/ui/ClubRegistrationModal';
import Footer from '../components/layout/Footer';
import HeaderNav from '../components/layout/HeaderNav';
import BestBooksSection from '../components/sections/BestBooksSection.js';
import TopBar from '../components/layout/TopBar';
import {
  createClubRegistration,
  fetchPublicBooks,
  fetchPublicClub,
  fetchPublicClubs,
  fetchPublicCategories,
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
} from '../api/infoculturaApi';
import {
  adminBtnSecondary,
  adminField,
  adminFormGridSpaced,
  adminInput,
  adminLabel,
  blockTitle,
  container,
  contentCard,
  contentEmpty,
  contentItemCard,
  contentItemDate,
  contentItemDesc,
  contentItemHeader,
  contentItemStatus,
  contentItemTitle,
  contentItems,
  contentSection,
  mainContent
} from '../styles/ui';
import { getLocaleText, useLocale } from '../i18n/locale.js';

type ClubeCulturalProps = {
  pageTitle?: string;
  pageDescription?: string;
  routePath?: string;
  clubSearchTerms?: string[];
};

function normalizeLabel(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function matchesClubTerms(name: string, terms: string[]): boolean {
  const label = normalizeLabel(name);
  return terms.some((term) => label.includes(normalizeLabel(term)));
}

function formatDate(value?: string | null, locale: 'pt' | 'en' = 'pt'): string {
  if (!value) return getLocaleText(locale, 'Sem data', 'No date');

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'pt-PT', {
    dateStyle: 'medium',
    timeStyle: value.includes('T') ? 'short' : undefined
  }).format(date);
}

function isOnOrAfterDate(value: string | null | undefined, fromDate: string): boolean {
  if (!fromDate || !value) return true;
  return value.slice(0, 10) >= fromDate;
}

function ClubeCultural({
  pageTitle,
  pageDescription,
  routePath,
  clubSearchTerms
}: ClubeCulturalProps) {
  const { locale } = useLocale();
  const { clubId } = useParams();
  const [club, setClub] = useState<InfoCulturaClub | null>(null);
  const [newsItems, setNewsItems] = useState<InfoCulturaNews[]>([]);
  const [books, setBooks] = useState<InfoCulturaBook[]>([]);
  const [categories, setCategories] = useState<InfoCulturaCategory[]>([]);
  const [sessions, setSessions] = useState<InfoCulturaSession[]>([]);
  const [events, setEvents] = useState<InfoCulturaEvent[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [eventCategoryFilter, setEventCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [registrationFeedback, setRegistrationFeedback] = useState('');

  useEffect(() => {
    let active = true;

    async function resolveClubId(): Promise<number> {
      if (clubId) {
        return Number(clubId);
      }

      if (!clubSearchTerms || clubSearchTerms.length === 0) {
        throw new Error(getLocaleText(locale, 'Clube ínvalido.', 'Invalid club.'));
      }

      const clubs = await fetchPublicClubs();
      const matchedClub = clubs.find((item) => matchesClubTerms(item.name, clubSearchTerms));
      if (!matchedClub) {
        throw new Error(getLocaleText(locale, 'Clube Não encontrado.', 'Club not found.'));
      }

      return matchedClub.id;
    }

    async function loadClub() {
      try {
        const resolvedClubId = await resolveClubId();
        const [nextClub, nextNews, nextBooks, nextCategories, nextSessions, nextEvents] = await Promise.all([
          fetchPublicClub(resolvedClubId),
          fetchPublicNews(resolvedClubId),
          fetchPublicBooks(resolvedClubId),
          fetchPublicCategories(),
          fetchPublicSessions(resolvedClubId),
          fetchPublicEvents({ clubId: resolvedClubId })
        ]);

        if (!active) return;

        setClub(nextClub);
        setNewsItems(nextNews);
        setBooks(nextBooks);
        setCategories(nextCategories);
        setSessions(nextSessions);
        setEvents(nextEvents);
      } catch (error) {
        if (!active) return;
        const message =
          error instanceof Error ? error.message : getLocaleText(locale, 'Não foi possivel carregar o clube.', 'Unable to load the club.');
        setLoadError(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadClub();

    return () => {
      active = false;
    };
  }, [clubId, clubSearchTerms, locale]);

  const filteredNews = useMemo(
    () => newsItems.filter((item) => isOnOrAfterDate(item.published_at, fromDate)),
    [newsItems, fromDate]
  );
  const filteredSessions = useMemo(
    () => sessions.filter((item) => isOnOrAfterDate(item.session_date, fromDate)),
    [sessions, fromDate]
  );
  const filteredEvents = useMemo(
    () =>
      events.filter(
        (item) =>
          isOnOrAfterDate(item.event_date, fromDate) &&
          (eventCategoryFilter === 'all' || item.category_ids.includes(Number(eventCategoryFilter)))
      ),
    [events, fromDate, eventCategoryFilter]
  );
  const filteredBooks = useMemo(
    () => books.filter((item) => (featuredOnly ? item.is_featured : true)),
    [books, featuredOnly]
  );

  const title = pageTitle || club?.name || getLocaleText(locale, 'Clube Cultural', 'Cultural Club');
  const description =
    pageDescription ||
    club?.mission ||
    club?.description ||
    getLocaleText(locale, 'Página pública do clube cultural.', 'Public page for the cultural club.');
  const currentHref =
    routePath || (clubId ? `/laboratorio-cultural/clubes/${clubId}` : '/laboratorio-cultural');

  async function handleSubmitRegistration(data: ClubRegistrationFormData) {
    if (!club) return;

    setIsSubmittingRegistration(true);
    setRegistrationError('');

    try {
      await createClubRegistration(club.id, data);
      setRegistrationFeedback(
        getLocaleText(
          locale,
          'Inscrição enviada com sucesso. Aguarda validação pelo clube.',
          'Registration sent successfully. Wait for club validation.'
        )
      );
      setIsRegistrationModalOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : getLocaleText(locale, 'Não foi possivel enviar a inscrição.', 'Unable to submit the registration.');
      setRegistrationError(message);
    } finally {
      setIsSubmittingRegistration(false);
    }
  }

  return (
    <>
      <TopBar />
      <HeaderNav />
      <Breadcrumbs
        title={title}
        description={description}
        parentLabel={getLocaleText(locale, 'Laboratório Cultural', 'Cultural Lab')}
        parentHref="/laboratorio-cultural"
        currentLabel={title}
        currentHref={currentHref}
      />

      <main className={mainContent}>
        <section className={contentSection}>
          <div className={container}>
            <div className={contentCard}>
              {club?.image ? (
                <img
                  src={resolveInfoCulturaAssetUrl(club.image)}
                  alt={title}
                  className="mb-6 h-64 w-full rounded-2xl object-cover"
                />
              ) : null}
              <h2 className={blockTitle}>{title}</h2>
              
              <div className="my-8 rounded-xl p-8">
                <div className="space-y-6">
                  {description
                    .split('\n\n')
                    .filter((para) => para.trim().length > 0)
                    .map((para, idx) => (
                      <p 
                        key={idx} 
                        className="text-base leading-relaxed text-slate-700"
                      >
                        {para.trim()}
                      </p>
                    ))}
                </div>
              </div>

              {!isLoading && !loadError && club?.enable_registrations ? (
                <section
                  className="w-full"
                  style={{
                    backgroundColor: 'rgb(255 247 237)',
                    paddingTop: '5rem',
                    paddingBottom: '5rem',
                    backgroundImage: "url('/images/stripes-pattern.svg')",
                    backgroundPosition: 'top',
                    backgroundRepeat: 'repeat',
                    backgroundSize: 'auto'
                  }}
                >
                  <section className="relative w-full px-4 sm:px-6 xl:px-8 z-10">
                    <div className="text-center">
                      <h3 className="font-serif text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
                        {getLocaleText(locale, 'Inscreve-te já neste clube', 'Join this club')}
                      </h3>
                      <div className="mt-3 mx-auto max-w-5xl text-lg text-slate-700">
                        <p>
                          {getLocaleText(
                            locale,
                            'Vem fazer parte da nossa comunidade de artistas, junta-te a nós!',
                            'Come be part of our community of artists, join us!'
                          )}
                        </p>
                        <p>
                          {getLocaleText(
                            locale,
                            'Vive uma experiência desafiante, enriquecedora e artistica.',
                            'Live a challenging, enriching and artistic experience.'
                          )}
                        </p>
                      </div> 
                    </div>

                    <div className="mt-8 text-center">
                      <button
                        type="button"
                        className="group inline-flex items-center px-7 py-5 bg-orange-700 text-white text-xl font-medium rounded-sm shadow-lg transition ease-in-out duration-200 hover:shadow-xl hover:bg-orange-600"
                        onClick={() => {
                          setRegistrationFeedback('');
                          setRegistrationError('');
                          setIsRegistrationModalOpen(true);
                        }}
                      >
                        {getLocaleText(locale, 'Inscrever-me neste clube', 'Join this club')}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mt-1 ml-4 h-7 w-7 transition-transform ease-in-out duration-200 group-hover:translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                      <p className="mt-2 text-sm text-slate-600">
                        {getLocaleText(locale, 'O pedido será enviado para validação da equipa do clube.', 'The request will be sent to the club team for validation.')}
                      </p>
                    </div>
                  </section>
                </section>
              ) : null}

              {registrationFeedback ? (
                <p className="mb-8 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {registrationFeedback}
                </p>
              ) : null}

              {!isLoading && !loadError ? (
                <div className={`${adminFormGridSpaced} mt-12`}>
                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="club-filter-date">
                      {getLocaleText(locale, 'Mostrar a partir de', 'Show from')}
                    </label>
                    <input
                      id="club-filter-date"
                      type="date"
                      className={adminInput}
                      value={fromDate}
                      onChange={(event) => setFromDate(event.target.value)}
                    />
                  </div>

                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="club-filter-featured">
                      {getLocaleText(locale, 'Livros em destaque', 'Featured books')}
                    </label>
                    <select
                      id="club-filter-featured"
                      className={adminInput}
                      value={featuredOnly ? 'sim' : 'todos'}
                      onChange={(event) => setFeaturedOnly(event.target.value === 'sim')}
                    >
                      <option value="todos">{getLocaleText(locale, 'Todos', 'All')}</option>
                      <option value="sim">{getLocaleText(locale, 'Apenas destaque', 'Featured only')}</option>
                    </select>
                  </div>

                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="club-filter-category">
                      {getLocaleText(locale, 'Categoria de evento', 'Event category')}
                    </label>
                    <select
                      id="club-filter-category"
                      className={adminInput}
                      value={eventCategoryFilter}
                      onChange={(event) => setEventCategoryFilter(event.target.value)}
                    >
                      <option value="all">{getLocaleText(locale, 'Todas', 'All')}</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      className={adminBtnSecondary}
                      onClick={() => {
                        setFromDate('');
                        setFeaturedOnly(false);
                        setEventCategoryFilter('all');
                      }}
                    >
                      {getLocaleText(locale, 'Limpar filtros', 'Clear filters')}
                    </button>
                  </div>
                </div>
              ) : null}

              {isLoading ? (
                <p className={contentEmpty}>{getLocaleText(locale, 'A carregar clube...', 'Loading club...')}</p>
              ) : loadError ? (
                <p className={contentEmpty}>{loadError}</p>
              ) : (
                <>
                  {filteredNews.length === 0 &&
                  filteredBooks.length === 0 &&
                  filteredSessions.length === 0 &&
                  filteredEvents.length === 0 ? (
                    <p className={contentEmpty}>
                      {getLocaleText(locale, 'Ainda não existem conteúdos publicados para os filtros atuais.', 'There are no published contents for the current filters.')}
                    </p>
                  ) : null}

                  {filteredNews.length > 0 ? (
                    <div className="mt-8">
                      <h3 className={blockTitle}>{getLocaleText(locale, 'Notícias', 'News')}</h3>
                      <div className={contentItems}>
                        {filteredNews.map((item) => (
                          <article key={item.id} className={contentItemCard}>
                            {item.image ? (
                              <img
                                src={resolveInfoCulturaAssetUrl(item.image)}
                                alt={item.title}
                                className="mb-4 h-44 w-full rounded-xl object-cover"
                              />
                            ) : null}
                            <div className={contentItemHeader}>
                              <h4 className={contentItemTitle}>{item.title}</h4>
                              <span className={contentItemStatus}>{item.news_status_name}</span>
                            </div>
                            <p className={contentItemDate}>{formatDate(item.published_at, locale)}</p>
                            <p className={contentItemDesc}>{item.summary}</p>
                            <Link
                              to={`/laboratorio-cultural/noticias/${item.id}`}
                              className={adminBtnSecondary}
                            >
                              {getLocaleText(locale, 'Ver detalhe', 'View details')}
                            </Link>
                          </article>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {filteredSessions.length > 0 ? (
                    <div className="mt-8">
                      <h3 className={blockTitle}>{getLocaleText(locale, 'Sessões', 'Sessions')}</h3>
                      <div className={contentItems}>
                        {filteredSessions.map((item) => (
                          <article key={item.id} className={contentItemCard}>
                            <div className={contentItemHeader}>
                              <h4 className={contentItemTitle}>{item.title}</h4>
                              <span className={contentItemStatus}>{item.name}</span>
                            </div>
                            <p className={contentItemDate}>
                              {formatDate(item.session_date, locale)} · {formatDate(item.start_date, locale)}
                            </p>
                            <p className={contentItemDesc}>{item.description}</p>
                            <Link
                              to={`/laboratorio-cultural/sessoes/${item.id}`}
                              className={adminBtnSecondary}
                            >
                              {getLocaleText(locale, 'Ver detalhe', 'View details')}
                            </Link>
                          </article>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {filteredEvents.length > 0 ? (
                    <div className="mt-8">
                      <h3 className={blockTitle}>{getLocaleText(locale, 'Eventos', 'Events')}</h3>
                      <div className={contentItems}>
                        {filteredEvents.map((item) => (
                          <article key={item.id} className={contentItemCard}>
                            {item.image ? (
                              <img
                                src={resolveInfoCulturaAssetUrl(item.image)}
                                alt={item.title}
                                className="mb-4 h-44 w-full rounded-xl object-cover"
                              />
                            ) : null}
                            <div className={contentItemHeader}>
                              <h4 className={contentItemTitle}>{item.title}</h4>
                              <span className={contentItemStatus}>{item.status}</span>
                            </div>
                            <p className={contentItemDate}>
                              {formatDate(item.event_date, locale)} ·{' '}
                              {item.location || item.city || getLocaleText(locale, 'Local por definir', 'Location to be defined')}
                            </p>
                            <p className={contentItemDesc}>{item.description}</p>
                            {item.categories.length > 0 ? (
                              <p className={contentItemDate}>
                                {item.categories.map((category) => category.name).join(', ')}
                              </p>
                            ) : null}
                            <Link
                              to={`/laboratorio-cultural/eventos/${item.id}`}
                              className={adminBtnSecondary}
                            >
                              {getLocaleText(locale, 'Ver detalhe', 'View details')}
                            </Link>
                          </article>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <BestBooksSection
                    books={filteredBooks}
                    locale={locale}
                    title={getLocaleText(locale, 'Livros', 'Books')}
                    description={getLocaleText(
                      locale,
                      'Livros filtrados e ordenados por destaque.',
                      'Books filtered and sorted by relevance.'
                    )}
                    detailBaseHref="/laboratorio-cultural/livros"
                  />
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <ClubRegistrationModal
        clubName={title}
        isOpen={isRegistrationModalOpen}
        isSubmitting={isSubmittingRegistration}
        submitError={registrationError}
        onClose={() => {
          if (!isSubmittingRegistration) {
            setIsRegistrationModalOpen(false);
            setRegistrationError('');
          }
        }}
        onSubmit={handleSubmitRegistration}
      />

      <Footer />
    </>
  );
}

export default ClubeCultural;
