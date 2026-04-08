import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import ClubRegistrationModal, {
  ClubRegistrationFormData
} from '../components/ClubRegistrationModal';
import Footer from '../components/Footer';
import HeaderNav from '../components/HeaderNav';
import TopBar from '../components/TopBar';
import {
  createEventRegistration,
  createSessionRegistration,
  downloadEventCalendar,
  downloadSessionCalendar,
  fetchPublicBookItem,
  fetchPublicEventItem,
  fetchPublicNewsItem,
  fetchPublicSessionItem,
  InfoCulturaBook,
  InfoCulturaEvent,
  InfoCulturaNews,
  InfoCulturaSession,
  resolveInfoCulturaAssetUrl
} from '../data/infoculturaApi';
import {
  adminBtnPrimary,
  adminBtnSecondary,
  blockText,
  blockTitle,
  container,
  contentCard,
  contentEmpty,
  contentSection,
  mainContent
} from '../styles/ui';

type EntryKind = 'news' | 'session' | 'event' | 'book';

type CulturalEntryDetailProps = {
  kind: EntryKind;
};

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

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function CulturalEntryDetail({ kind }: CulturalEntryDetailProps) {
  const params = useParams();
  const itemId =
    kind === 'news'
      ? params.newsId
      : kind === 'session'
        ? params.sessionId
        : kind === 'event'
          ? params.eventId
          : params.bookId;
  const [entry, setEntry] = useState<
    InfoCulturaNews | InfoCulturaSession | InfoCulturaEvent | InfoCulturaBook | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [registrationFeedback, setRegistrationFeedback] = useState('');
  const [isDownloadingCalendar, setIsDownloadingCalendar] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadEntry() {
      if (!itemId) {
        setLoadError('Conteudo invalido.');
        setIsLoading(false);
        return;
      }

      try {
        const parsedId = Number(itemId);
        const nextEntry =
          kind === 'news'
            ? await fetchPublicNewsItem(parsedId)
            : kind === 'session'
              ? await fetchPublicSessionItem(parsedId)
              : kind === 'event'
                ? await fetchPublicEventItem(parsedId)
                : await fetchPublicBookItem(parsedId);

        if (!active) return;
        setEntry(nextEntry);
      } catch (error) {
        if (!active) return;
        const message =
          error instanceof Error ? error.message : 'Nao foi possivel carregar o detalhe.';
        setLoadError(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadEntry();

    return () => {
      active = false;
    };
  }, [itemId, kind]);

  const title = entry?.title || 'Detalhe';
  const clubId = entry && 'club_id' in entry ? entry.club_id : undefined;
  const clubName = entry && 'club_name' in entry ? entry.club_name : undefined;
  const image: string =
    entry && 'image' in entry
      ? String(entry.image || '')
      : entry && 'cover_image' in entry
        ? String(entry.cover_image || '')
        : '';
  const activityEntry =
    entry && (kind === 'event' || kind === 'session')
      ? (entry as InfoCulturaEvent | InfoCulturaSession)
      : null;
  const canRegister = Boolean(activityEntry?.enable_registrations);
  const registrationState = activityEntry?.registration_state || 'closed';
  const calendarLinks = useMemo(() => {
    if (!entry || (kind !== 'event' && kind !== 'session')) {
      return null;
    }

    return {
      google:
        'google_calendar_url' in entry && entry.google_calendar_url ? entry.google_calendar_url : '',
      outlook:
        'outlook_calendar_url' in entry && entry.outlook_calendar_url
          ? entry.outlook_calendar_url
          : ''
    };
  }, [entry, kind]);

  async function handleSubmitRegistration(data: ClubRegistrationFormData) {
    if (!entry || (kind !== 'event' && kind !== 'session')) return;

    setIsSubmittingRegistration(true);
    setRegistrationError('');

    try {
      const response =
        kind === 'event'
          ? await createEventRegistration(entry.id, data)
          : await createSessionRegistration(entry.id, data);
      setRegistrationFeedback(
        response.status === 'waitlist'
          ? 'Inscricao enviada. Ficaste em lista de espera e vais receber confirmacao por email.'
          : 'Inscricao enviada com sucesso. Vais receber confirmacao por email.'
      );
      setIsRegistrationModalOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel enviar a inscricao.';
      setRegistrationError(message);
    } finally {
      setIsSubmittingRegistration(false);
    }
  }

  async function handleDownloadCalendar() {
    if (!entry || (kind !== 'event' && kind !== 'session')) return;

    setIsDownloadingCalendar(true);
    try {
      const blob =
        kind === 'event'
          ? await downloadEventCalendar(entry.id)
          : await downloadSessionCalendar(entry.id);
      downloadBlob(blob, `${kind === 'event' ? 'evento' : 'sessao'}-${entry.id}.ics`);
    } catch (error) {
      setRegistrationError(
        error instanceof Error ? error.message : 'Nao foi possivel descarregar o calendario.'
      );
    } finally {
      setIsDownloadingCalendar(false);
    }
  }

  const registrationSummary = activityEntry
    ? {
        confirmed: activityEntry.confirmed_registrations || 0,
        waitlist: activityEntry.waitlist_registrations || 0,
        remaining:
          activityEntry.remaining_slots === undefined ? null : activityEntry.remaining_slots
      }
    : null;

  return (
    <>
      <TopBar />
      <HeaderNav />
      <Breadcrumbs
        title={title}
        description="Detalhe publico do conteudo cultural."
        parentLabel="Laboratorio Cultural"
        parentHref="/laboratorio-cultural"
        currentLabel={title}
        currentHref="#"
      />

      <main className={mainContent}>
        <section className={contentSection}>
          <div className={container}>
            <div className={contentCard}>
              {isLoading ? <p className={contentEmpty}>A carregar detalhe...</p> : null}
              {loadError ? <p className={contentEmpty}>{loadError}</p> : null}
              {!isLoading && !loadError && entry ? (
                <>
                  {image ? (
                    <img
                      src={resolveInfoCulturaAssetUrl(image)}
                      alt={title}
                      className="mb-6 h-72 w-full rounded-2xl object-cover"
                    />
                  ) : null}
                  <h2 className={blockTitle}>{title}</h2>
                  <p className={blockText}>
                    {clubName ? `${clubName} · ` : ''}
                    {'author' in entry
                      ? `${entry.author} · ${entry.publication_year}`
                      : 'published_at' in entry
                      ? formatDate(entry.published_at || entry.created_at)
                      : 'session_date' in entry
                        ? formatDate(entry.start_date)
                        : formatDate(entry.start_date)}
                  </p>
                  {'author' in entry && entry.publisher ? (
                    <p className={blockText}>Editora: {entry.publisher}</p>
                  ) : null}
                  {'summary' in entry ? (
                    <p className={blockText}>{entry.summary}</p>
                  ) : null}
                  {'description' in entry ? (
                    <p className={blockText}>{entry.description}</p>
                  ) : null}
                  {'content' in entry ? (
                    <div className="mt-6 whitespace-pre-wrap text-slate-700">{entry.content}</div>
                  ) : null}
                  {'categories' in entry && entry.categories.length > 0 ? (
                    <p className={blockText}>
                      Categorias: {entry.categories.map((category) => category.name).join(', ')}
                    </p>
                  ) : null}
                  {'location' in entry ? (
                    <p className={blockText}>
                      Local: {entry.location || entry.city || 'Local por definir'}
                    </p>
                  ) : null}
                  {(kind === 'event' || kind === 'session') && registrationSummary ? (
                    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <h3 className="text-lg font-semibold text-slate-900">Participacao</h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Confirmadas: {registrationSummary.confirmed} · Lista de espera:{' '}
                        {registrationSummary.waitlist}
                        {registrationSummary.remaining !== null
                          ? ` · Vagas restantes: ${registrationSummary.remaining}`
                          : ''}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Estado das inscricoes:{' '}
                        {registrationState === 'open'
                          ? 'Abertas'
                          : registrationState === 'waitlist'
                            ? 'Lista de espera'
                            : 'Encerradas'}
                      </p>
                    </div>
                  ) : null}
                  {(kind === 'event' || kind === 'session') && registrationFeedback ? (
                    <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      {registrationFeedback}
                    </p>
                  ) : null}
                  <div className="mt-8 flex flex-wrap gap-3">
                    {kind !== 'book' && kind !== 'news' ? (
                      <>
                        {calendarLinks?.google ? (
                          <a
                            href={calendarLinks.google}
                            target="_blank"
                            rel="noreferrer"
                            className={adminBtnSecondary}
                          >
                            Google Calendar
                          </a>
                        ) : null}
                        {calendarLinks?.outlook ? (
                          <a
                            href={calendarLinks.outlook}
                            target="_blank"
                            rel="noreferrer"
                            className={adminBtnSecondary}
                          >
                            Outlook
                          </a>
                        ) : null}
                        <button
                          type="button"
                          className={adminBtnSecondary}
                          onClick={() => void handleDownloadCalendar()}
                          disabled={isDownloadingCalendar}
                        >
                          {isDownloadingCalendar ? 'A descarregar...' : 'Descarregar .ics'}
                        </button>
                        {canRegister && registrationState !== 'closed' ? (
                          <button
                            type="button"
                            className={adminBtnPrimary}
                            onClick={() => {
                              setRegistrationFeedback('');
                              setRegistrationError('');
                              setIsRegistrationModalOpen(true);
                            }}
                          >
                            {registrationState === 'waitlist'
                              ? 'Entrar em lista de espera'
                              : 'Inscrever-me'}
                          </button>
                        ) : null}
                      </>
                    ) : null}
                    {clubId ? (
                      <Link
                        to={`/laboratorio-cultural/clubes/${clubId}`}
                        className={adminBtnSecondary}
                      >
                        Ver clube
                      </Link>
                    ) : null}
                    <Link to="/laboratorio-cultural" className={adminBtnSecondary}>
                      Voltar ao laboratorio
                    </Link>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </section>
      </main>

      {(kind === 'event' || kind === 'session') && entry ? (
        <ClubRegistrationModal
          clubName={title}
          entityLabel={kind === 'event' ? 'evento' : 'sessao'}
          kickerLabel={kind === 'event' ? 'Evento' : 'Sessao'}
          helperText={
            kind === 'event'
              ? 'Preenche os teus dados para enviar a inscricao para este evento.'
              : 'Preenche os teus dados para enviar a inscricao para esta sessao.'
          }
          submitLabel={registrationState === 'waitlist' ? 'Entrar em espera' : 'Enviar inscricao'}
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
      ) : null}

      <Footer />
    </>
  );
}

export default CulturalEntryDetail;
