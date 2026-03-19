import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import ClubRegistrationModal, {
  ClubRegistrationFormData
} from '../components/ClubRegistrationModal';
import Footer from '../components/Footer';
import HeaderNav from '../components/HeaderNav';
import TopBar from '../components/TopBar';
import {
  createClubRegistration,
  fetchPublicBooks,
  fetchPublicClub,
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
  adminBtnPrimary,
  adminBtnSecondary,
  adminField,
  adminFormGridSpaced,
  adminInput,
  adminLabel,
  blockText,
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

function formatDate(value?: string | null): string {
  if (!value) return 'Sem data';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-PT', {
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
  const { clubId } = useParams();
  const [club, setClub] = useState<InfoCulturaClub | null>(null);
  const [newsItems, setNewsItems] = useState<InfoCulturaNews[]>([]);
  const [books, setBooks] = useState<InfoCulturaBook[]>([]);
  const [sessions, setSessions] = useState<InfoCulturaSession[]>([]);
  const [events, setEvents] = useState<InfoCulturaEvent[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
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
        throw new Error('Clube invalido.');
      }

      const clubs = await fetchPublicClubs();
      const matchedClub = clubs.find((item) => matchesClubTerms(item.name, clubSearchTerms));
      if (!matchedClub) {
        throw new Error('Clube nao encontrado.');
      }

      return matchedClub.id;
    }

    async function loadClub() {
      try {
        const resolvedClubId = await resolveClubId();
        const [nextClub, nextNews, nextBooks, nextSessions, nextEvents] = await Promise.all([
          fetchPublicClub(resolvedClubId),
          fetchPublicNews(resolvedClubId),
          fetchPublicBooks(resolvedClubId),
          fetchPublicSessions(resolvedClubId),
          fetchPublicEvents(resolvedClubId)
        ]);

        if (!active) return;

        setClub(nextClub);
        setNewsItems(nextNews);
        setBooks(nextBooks);
        setSessions(nextSessions);
        setEvents(nextEvents);
      } catch (error) {
        if (!active) return;
        const message =
          error instanceof Error ? error.message : 'Nao foi possivel carregar o clube.';
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
  }, [clubId, clubSearchTerms]);

  const filteredNews = useMemo(
    () => newsItems.filter((item) => isOnOrAfterDate(item.published_at, fromDate)),
    [newsItems, fromDate]
  );
  const filteredSessions = useMemo(
    () => sessions.filter((item) => isOnOrAfterDate(item.session_date, fromDate)),
    [sessions, fromDate]
  );
  const filteredEvents = useMemo(
    () => events.filter((item) => isOnOrAfterDate(item.event_date, fromDate)),
    [events, fromDate]
  );
  const filteredBooks = useMemo(
    () => books.filter((item) => (featuredOnly ? item.is_featured : true)),
    [books, featuredOnly]
  );

  const title = pageTitle || club?.name || 'Clube Cultural';
  const description =
    pageDescription ||
    club?.mission ||
    club?.description ||
    'Pagina publica do clube cultural.';
  const currentHref =
    routePath || (clubId ? `/laboratorio-cultural/clubes/${clubId}` : '/laboratorio-cultural');

  async function handleSubmitRegistration(data: ClubRegistrationFormData) {
    if (!club) return;

    setIsSubmittingRegistration(true);
    setRegistrationError('');

    try {
      await createClubRegistration(club.id, data);
      setRegistrationFeedback('Inscricao enviada com sucesso. Aguarda validacao pelo clube.');
      setIsRegistrationModalOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel enviar a inscricao.';
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
        parentLabel="Laboratorio Cultural"
        parentHref="/laboratorio-cultural"
        currentLabel={title}
        currentHref={currentHref}
      />

      <main className={mainContent}>
        <section className={contentSection}>
          <div className={container}>
            <div className={contentCard}>
              <h2 className={blockTitle}>{title}</h2>
              <p className={blockText}>{description}</p>

              {!isLoading && !loadError && club?.enable_registrations ? (
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className={adminBtnPrimary}
                    onClick={() => {
                      setRegistrationFeedback('');
                      setRegistrationError('');
                      setIsRegistrationModalOpen(true);
                    }}
                  >
                    Inscrever-me neste clube
                  </button>
                  <p className="text-sm text-slate-600">
                    O pedido sera enviado para validacao da equipa do clube.
                  </p>
                </div>
              ) : null}

              {registrationFeedback ? (
                <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {registrationFeedback}
                </p>
              ) : null}

              {!isLoading && !loadError ? (
                <div className={`${adminFormGridSpaced} mt-8`}>
                  <div className={adminField}>
                    <label className={adminLabel} htmlFor="club-filter-date">
                      Mostrar a partir de
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
                      Livros em destaque
                    </label>
                    <select
                      id="club-filter-featured"
                      className={adminInput}
                      value={featuredOnly ? 'sim' : 'todos'}
                      onChange={(event) => setFeaturedOnly(event.target.value === 'sim')}
                    >
                      <option value="todos">Todos</option>
                      <option value="sim">Apenas destaque</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      className={adminBtnSecondary}
                      onClick={() => {
                        setFromDate('');
                        setFeaturedOnly(false);
                      }}
                    >
                      Limpar filtros
                    </button>
                  </div>
                </div>
              ) : null}

              {isLoading ? (
                <p className={contentEmpty}>A carregar clube...</p>
              ) : loadError ? (
                <p className={contentEmpty}>{loadError}</p>
              ) : (
                <>
                  {filteredNews.length === 0 &&
                  filteredBooks.length === 0 &&
                  filteredSessions.length === 0 &&
                  filteredEvents.length === 0 ? (
                    <p className={contentEmpty}>
                      Ainda nao existem conteudos publicados para os filtros atuais.
                    </p>
                  ) : null}

                  {filteredNews.length > 0 ? (
                    <div className="mt-8">
                      <h3 className={blockTitle}>Noticias</h3>
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
                            <p className={contentItemDate}>{formatDate(item.published_at)}</p>
                            <p className={contentItemDesc}>{item.summary}</p>
                          </article>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {filteredSessions.length > 0 ? (
                    <div className="mt-8">
                      <h3 className={blockTitle}>Sessoes</h3>
                      <div className={contentItems}>
                        {filteredSessions.map((item) => (
                          <article key={item.id} className={contentItemCard}>
                            <div className={contentItemHeader}>
                              <h4 className={contentItemTitle}>{item.title}</h4>
                              <span className={contentItemStatus}>{item.name}</span>
                            </div>
                            <p className={contentItemDate}>
                              {formatDate(item.session_date)} · {formatDate(item.start_date)}
                            </p>
                            <p className={contentItemDesc}>{item.description}</p>
                          </article>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {filteredEvents.length > 0 ? (
                    <div className="mt-8">
                      <h3 className={blockTitle}>Eventos</h3>
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
                              {formatDate(item.event_date)} ·{' '}
                              {item.location || item.city || 'Local por definir'}
                            </p>
                            <p className={contentItemDesc}>{item.description}</p>
                          </article>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {filteredBooks.length > 0 ? (
                    <div className="mt-8">
                      <h3 className={blockTitle}>Livros</h3>
                      <div className={contentItems}>
                        {filteredBooks.map((item) => (
                          <article key={item.id} className={contentItemCard}>
                            {item.cover_image ? (
                              <img
                                src={resolveInfoCulturaAssetUrl(item.cover_image)}
                                alt={item.title}
                                className="mb-4 h-44 w-full rounded-xl object-cover"
                              />
                            ) : null}
                            <div className={contentItemHeader}>
                              <h4 className={contentItemTitle}>{item.title}</h4>
                              <span className={contentItemStatus}>
                                {item.is_featured ? 'Destaque' : 'Livro'}
                              </span>
                            </div>
                            <p className={contentItemDate}>
                              {item.author} · {item.publication_year}
                            </p>
                            <p className={contentItemDesc}>{item.summary}</p>
                          </article>
                        ))}
                      </div>
                    </div>
                  ) : null}
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
