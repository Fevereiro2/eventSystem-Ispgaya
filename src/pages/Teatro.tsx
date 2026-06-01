import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  createClubRegistration,
  fetchPublicClubs,
  fetchPublicEvents,
  fetchPublicNews,
  fetchPublicPhotos,
  fetchPublicSessions,
  InfoCulturaClub,
  InfoCulturaEvent,
  InfoCulturaNews,
  InfoCulturaPhoto,
  InfoCulturaSession,
  resolveInfoCulturaAssetUrl
} from '../api/infoculturaApi.js';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ClubCallToAction from '../components/ui/ClubCallToAction';
import ClubRegistrationModal, { ClubRegistrationFormData } from '../components/ui/ClubRegistrationModal';
import NewsHighlightsSection, { type NewsHighlightItem } from '../components/ui/NewsHighlightsSection';
import PhotoCarousel from '../components/ui/PhotoCarousel';
import Footer from '../components/layout/Footer';
import HeaderNav from '../components/layout/HeaderNav';
import TopBar from '../components/layout/TopBar';
import heroImage from '../assets/19825874_uqliU.jpeg';
import {
  adminBtnSecondary,
  blockText,
  blockTitle,
  container,
  mainContent,
  sectionSpace
} from '../styles/ui';
import { getLocaleText, useLocale } from '../i18n/locale.js';
import { buildClubPhotoSectionAliases, filterPhotosBySections } from '../utils/photoSections';

function normalizeClubName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function formatPublicDate(value: string, locale: 'pt' | 'en') {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function Teatro() {
  const { locale } = useLocale();
  const [club, setClub] = useState<InfoCulturaClub | null>(null);
  const [newsItems, setNewsItems] = useState<InfoCulturaNews[]>([]);
  const [events, setEvents] = useState<InfoCulturaEvent[]>([]);
  const [sessions, setSessions] = useState<InfoCulturaSession[]>([]);
  const [photos, setPhotos] = useState<InfoCulturaPhoto[]>([]);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [registrationFeedback, setRegistrationFeedback] = useState('');

  useEffect(() => {
    let active = true;

    async function loadPageData() {
      try {
        const clubs = await fetchPublicClubs();
        if (!active) return;

        const theatreClub = clubs.find((item) => normalizeClubName(item.name).includes('teatro')) || null;
        setClub(theatreClub);

        if (!theatreClub) {
          setNewsItems([]);
          setEvents([]);
          setSessions([]);
          return;
        }

        const [nextNews, nextEvents, nextSessions, nextPhotos] = await Promise.all([
          fetchPublicNews(theatreClub.id),
          fetchPublicEvents({ clubId: theatreClub.id }),
          fetchPublicSessions(theatreClub.id),
          fetchPublicPhotos()
        ]);

        if (!active) return;
        setNewsItems(nextNews);
        setEvents(nextEvents);
        setSessions(nextSessions);
        setPhotos(nextPhotos);
      } catch {
        if (!active) return;
        setClub(null);
        setNewsItems([]);
        setEvents([]);
        setSessions([]);
      }
    }

    void loadPageData();

    return () => {
      active = false;
    };
  }, []);

  const highlightedNews = useMemo<NewsHighlightItem[]>(
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
          image: item.image ? resolveInfoCulturaAssetUrl(item.image) : '',
          imageAlt: item.title,
          publishedAt: item.published_at || item.created_at,
          publishedLabel: formatPublicDate(item.published_at || item.created_at, locale),
          tags: [{ label: '#clubedeteatro', href: '/vida-academica/noticias' }]
        })),
    [newsItems, locale]
  );

  const highlightedEvents = useMemo<NewsHighlightItem[]>(
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
          image: item.image ? resolveInfoCulturaAssetUrl(item.image) : '',
          imageAlt: item.title,
          publishedAt: item.start_date || item.event_date,
          publishedLabel: formatPublicDate(item.start_date || item.event_date, locale),
          tags: item.categories.map((category) => ({
            label: `#${normalizeClubName(category.name).replace(/\s+/g, '')}`,
            href: '/vida-academica/eventos'
          }))
        })),
    [events, locale]
  );

  const highlightedItems = useMemo(
    () => [
      ...events.slice(0, 2).map((item) => ({
        id: `event-${item.id}`,
        title: item.title,
        description: item.description,
        date: item.start_date || item.event_date,
        href: `/laboratorio-cultural/eventos/${item.id}`,
        image: item.image
      })),
      ...sessions.slice(0, 2).map((item) => ({
        id: `session-${item.id}`,
        title: item.title,
        description: item.description,
        date: item.start_date || item.session_date,
        href: `/laboratorio-cultural/sessoes/${item.id}`,
        image: ''
      }))
    ],
    [events, sessions]
  );
  const clubPhotoItems = useMemo(
    () =>
      filterPhotosBySections(
        photos,
        buildClubPhotoSectionAliases(club?.name, ['teatro', 'clube teatro', 'clube de teatro'])
      ).map((photo) => ({
        id: photo.id,
        title: photo.title,
        caption: photo.caption,
        image: photo.image,
        alt_text: photo.alt_text,
      })),
    [photos, club?.name]
  );

  async function handleSubmitRegistration(data: ClubRegistrationFormData) {
    if (!club) {
      setRegistrationError(getLocaleText(locale, 'Clube de Teatro não encontrado.', 'Theatre Club not found.'));
      return;
    }

    setIsSubmittingRegistration(true);
    setRegistrationError('');

    try {
      await createClubRegistration(club.id, data);
      setRegistrationFeedback(
        getLocaleText(
          locale,
          'Inscrição enviada com sucesso. Aguarda validação pela equipa do clube.',
          'Registration sent successfully. Wait for club validation.'
        )
      );
      setIsRegistrationModalOpen(false);
    } catch (error) {
      setRegistrationError(
        error instanceof Error
          ? error.message
          : getLocaleText(locale, 'Não foi possível enviar a inscrição.', 'Unable to submit the registration.')
      );
    } finally {
      setIsSubmittingRegistration(false);
    }
  }

  return (
    <>
      <TopBar />
      <HeaderNav />
      <Breadcrumbs
        title={getLocaleText(locale, 'Clube de Teatro', 'Theatre Club')}
        description={getLocaleText(
          locale,
          'Um espaço para experimentar palco, expressão, criatividade e trabalho coletivo.',
          'A space to explore stage work, expression, creativity and collective practice.'
        )}
        currentLabel={getLocaleText(locale, 'Clube de Teatro', 'Theatre Club')}
        currentHref="/laboratorio-cultural/teatro"
      />

      <main className={mainContent}>
        <div className={`${container} ${sectionSpace}`}>
          <h2 className={blockTitle}>{getLocaleText(locale, 'Aqui podes:', 'Here you can:')}</h2>
          <p className={blockText}>
            {getLocaleText(
              locale,
              'Participar em ensaios, explorar técnicas de representação, criar personagens, trabalhar voz e movimento e colaborar em apresentações abertas à comunidade académica.',
              'Join rehearsals, explore acting techniques, create characters, work on voice and movement, and collaborate in performances open to the academic community.'
            )}
          </p>

          <img
            className="mx-auto mb-8 mt-8 aspect-[3/1] w-full max-w-5xl rounded-sm object-cover shadow-xl"
            src={club?.image ? resolveInfoCulturaAssetUrl(club.image) : heroImage}
            alt={getLocaleText(locale, 'Clube de Teatro', 'Theatre Club')}
          />

          <p className={`${blockText} mb-8`}>
            {getLocaleText(
              locale,
              'Se gostas de comunicar, improvisar, construir cenas e ganhar confiança perante o público, este é o teu espaço dentro do Laboratório Cultural.',
              'If you enjoy communicating, improvising, building scenes and gaining confidence in front of an audience, this is your space in the Cultural Laboratory.'
            )}
          </p>

          {clubPhotoItems.length > 0 ? (
            <section className="mb-12 mt-12">
              <div className="mb-5">
                <h2 className={blockTitle}>
                  {getLocaleText(locale, 'Momentos do Laboratório Cultural', 'Cultural Lab moments')}
                </h2>
                <p className={blockText}>
                  {getLocaleText(
                    locale,
                    'Galeria visual com imagens das criações, ensaios e apresentações do clube.',
                    'Visual gallery with images from the club creations, rehearsals and performances.'
                  )}
                </p>
              </div>
              <PhotoCarousel items={clubPhotoItems} />
            </section>
          ) : null}

        </div>

        <ClubCallToAction
          locale={locale}
          enabled={Boolean(club?.enable_registrations)}
          onClick={() => {
            setRegistrationFeedback('');
            setRegistrationError('');
            setIsRegistrationModalOpen(true);
          }}
          statusText={
            club?.enable_registrations
              ? undefined
              : getLocaleText(
                  locale,
                  'As inscrições deste clube estão encerradas neste momento.',
                  'Registrations for this club are currently closed.'
                )
          }
        />

        <div className={`${container} ${sectionSpace}`}>
          {registrationFeedback ? (
            <p className="mb-8 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {registrationFeedback}
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

          <section className="mt-12">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#dd8609]">
                  {getLocaleText(locale, 'Palco', 'Stage')}
                </p>
                <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-black xl:text-4xl">
                  {getLocaleText(locale, 'Atividades em destaque', 'Featured activities')}
                </h2>
              </div>
              <Link to="/laboratorio-cultural/agenda" className={adminBtnSecondary}>
                {getLocaleText(locale, 'Explorar agenda', 'Explore agenda')}
              </Link>
            </div>

            {highlightedItems.length > 0 ? (
              <div className="grid gap-6 lg:grid-cols-2">
                {highlightedItems.map((item) => (
                  <article key={item.id} className="bg-white py-5">
                    {item.image ? (
                      <img
                        src={resolveInfoCulturaAssetUrl(item.image)}
                        alt={item.title}
                        className="mb-5 aspect-[16/9] w-full rounded-sm object-cover shadow-xl"
                      />
                    ) : null}
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#dd8609]">
                      {formatPublicDate(item.date, locale)}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{item.description}</p>
                    <Link to={item.href} className="mt-4 inline-flex text-sm font-bold text-[#dd8609] hover:underline">
                      {getLocaleText(locale, 'Ver detalhe', 'View details')}
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                {getLocaleText(
                  locale,
                  'Ainda não existem atividades publicadas para este clube.',
                  'There are no published activities for this club yet.'
                )}
              </p>
            )}
          </section>
        </div>
      </main>

      <ClubRegistrationModal
        clubName={getLocaleText(locale, 'Clube de Teatro', 'Theatre Club')}
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

export default Teatro;
