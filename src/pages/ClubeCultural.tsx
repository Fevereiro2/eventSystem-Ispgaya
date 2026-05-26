import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ClubRegistrationModal, {
  ClubRegistrationFormData
} from '../components/ui/ClubRegistrationModal';
import NewsHighlightsSection, { type NewsHighlightItem } from '../components/ui/NewsHighlightsSection';
import Footer from '../components/layout/Footer';
import HeaderNav from '../components/layout/HeaderNav';
import BestBooksSection from '../components/sections/BestBooksSection.js';
import TopBar from '../components/layout/TopBar';
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
} from '../api/infoculturaApi';
import {
  adminBtnSecondary,
  blockTitle,
  blockText,
  container,
  mainContent,
  sectionSpace
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
  const [sessions, setSessions] = useState<InfoCulturaSession[]>([]);
  const [events, setEvents] = useState<InfoCulturaEvent[]>([]);
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
        const [nextClub, nextNews, nextBooks, nextSessions, nextEvents] = await Promise.all([
          fetchPublicClub(resolvedClubId),
          fetchPublicNews(resolvedClubId),
          fetchPublicBooks(resolvedClubId),
          fetchPublicSessions(resolvedClubId),
          fetchPublicEvents({ clubId: resolvedClubId })
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

  const filteredNews = useMemo(() => newsItems.filter((item) => isOnOrAfterDate(item.published_at, '')), [newsItems]);
  const filteredSessions = useMemo(() => sessions.filter((item) => isOnOrAfterDate(item.session_date, '')), [sessions]);
  const filteredEvents = useMemo(() => events.filter((item) => isOnOrAfterDate(item.event_date, '')), [events]);
  const filteredBooks = books;
  const highlightedNews = useMemo<NewsHighlightItem[]>(
    () =>
      [...filteredNews]
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
          image: item.image ? resolveInfoCulturaAssetUrl(item.image) : '',
          imageAlt: item.title,
          publishedAt: item.published_at || item.created_at,
          publishedLabel: formatDate(item.published_at || item.created_at, locale),
          tags: item.club_name
            ? [
                {
                  label: `#${normalizeLabel(item.club_name).replace(/\s+/g, '')}`,
                  href: '/vida-academica/noticias'
                }
              ]
            : []
        })),
    [filteredNews, locale]
  );
  const highlightedEvents = useMemo<NewsHighlightItem[]>(
    () =>
      [...filteredEvents]
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
          image: item.image ? resolveInfoCulturaAssetUrl(item.image) : '',
          imageAlt: item.title,
          publishedAt: item.start_date || item.event_date,
          publishedLabel: formatDate(item.start_date || item.event_date, locale),
          tags: item.categories.map((category) => ({
            label: `#${normalizeLabel(category.name).replace(/\s+/g, '')}`,
            href: '/vida-academica/eventos'
          }))
        })),
    [filteredEvents, locale]
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
        <div className={`${container} ${sectionSpace}`}>
          {isLoading ? (
            <p className="text-sm text-slate-600">
              {getLocaleText(locale, 'A carregar clube...', 'Loading club...')}
            </p>
          ) : loadError ? (
            <p className="text-sm text-slate-600">{loadError}</p>
          ) : (
            <>
              <h2 className={blockTitle}>{getLocaleText(locale, 'Aqui podes:', 'Here you can:')}</h2>
              <div className="space-y-4">
                {description
                  .split('\n\n')
                  .filter((para) => para.trim().length > 0)
                  .map((para, idx) => (
                    <p key={idx} className={blockText}>
                      {para.trim()}
                    </p>
                  ))}
              </div>

              {club?.image ? (
                <img
                  src={resolveInfoCulturaAssetUrl(club.image)}
                  alt={title}
                  className="mx-auto mb-8 mt-8 aspect-[3/1] w-full max-w-5xl rounded-sm object-cover shadow-xl"
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
                <p className="mb-8 rounded-sm bg-green-50 px-4 py-3 text-sm text-green-700">
                  {registrationFeedback}
                </p>
              ) : null}

              {filteredNews.length === 0 &&
              filteredBooks.length === 0 &&
              filteredSessions.length === 0 &&
              filteredEvents.length === 0 ? (
                <p className="mt-8 text-sm text-slate-600">
                  {getLocaleText(
                    locale,
                    'Ainda não existem conteúdos publicados para este clube.',
                    'There are no published contents for this club yet.'
                  )}
                </p>
              ) : null}

              {highlightedNews.length > 0 || highlightedEvents.length > 0 ? (
                <section className="mb-12 mt-12 bg-white">
                  <div className="grid w-full grid-cols-1 gap-12 xl:grid-cols-2 xl:gap-14">
                    <NewsHighlightsSection
                      title={getLocaleText(locale, 'Notícias', 'News')}
                      viewAllHref="/vida-academica/noticias"
                      viewAllInternal
                      items={highlightedNews}
                      className="w-full"
                    />
                    <NewsHighlightsSection
                      title={getLocaleText(locale, 'Eventos', 'Events')}
                      viewAllHref="/vida-academica/eventos"
                      viewAllInternal
                      items={highlightedEvents}
                      className="w-full"
                    />
                  </div>
                </section>
              ) : null}

              {filteredSessions.length > 0 ? (
                <section className="mt-12">
                  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#dd8609]">
                        {getLocaleText(locale, 'Sessões', 'Sessions')}
                      </p>
                      <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-black xl:text-4xl">
                        {getLocaleText(locale, 'Atividades em destaque', 'Featured activities')}
                      </h2>
                    </div>
                    <Link to="/laboratorio-cultural/agenda" className={adminBtnSecondary}>
                      {getLocaleText(locale, 'Explorar agenda', 'Explore agenda')}
                    </Link>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    {filteredSessions.slice(0, 4).map((item) => (
                      <article key={item.id} className="bg-white py-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#dd8609]">
                          {formatDate(item.session_date, locale)}
                        </p>
                        <h3 className="mt-2 text-2xl font-bold text-slate-900">{item.title}</h3>
                        <p className="mt-1 text-sm font-semibold text-slate-500">{item.name}</p>
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{item.description}</p>
                        <Link
                          to={`/laboratorio-cultural/sessoes/${item.id}`}
                          className="mt-4 inline-flex text-sm font-bold text-[#dd8609] hover:underline"
                        >
                          {getLocaleText(locale, 'Ver detalhe', 'View details')}
                        </Link>
                      </article>
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
                  'Livros selecionados para apoiar as atividades e recomendações deste clube.',
                  'Books selected to support this club activities and recommendations.'
                )}
                detailBaseHref="/laboratorio-cultural/livros"
                limit={10}
              />
            </>
          )}
        </div>
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
