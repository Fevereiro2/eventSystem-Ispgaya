import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import Footer from '../components/Footer';
import HeaderNav from '../components/HeaderNav';
import TopBar from '../components/TopBar';
import {
  fetchPublicEvents,
  InfoCulturaEvent,
  resolveInfoCulturaAssetUrl
} from '../data/infoculturaApi';
import {
  adminBtnSecondary,
  container,
  contentEmpty,
  contentSection,
  mainContent
} from '../styles/ui';

function formatDate(value?: string | null): string {
  if (!value) return 'Data por definir';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function getEventState(item: InfoCulturaEvent): 'upcoming' | 'ongoing' | 'past' {
  const now = Date.now();
  const start = new Date(item.start_date).getTime();
  const end = new Date(item.end_date).getTime();

  if (!Number.isNaN(end) && end < now) return 'past';
  if (!Number.isNaN(start) && start > now) return 'upcoming';
  return 'ongoing';
}

function getEventStateLabel(item: InfoCulturaEvent): string {
  const state = getEventState(item);
  if (state === 'upcoming') return 'Próximo';
  if (state === 'ongoing') return 'A decorrer';
  return 'Concluído';
}

function EventosPage() {
  const [events, setEvents] = useState<InfoCulturaEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      try {
        const response = await fetchPublicEvents();
        if (!active) return;
        setEvents(response);
      } catch (error) {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar os eventos.');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadEvents();

    return () => {
      active = false;
    };
  }, []);

  const sortedEvents = useMemo(
    () =>
      [...events].sort((left, right) => {
        const leftTime = new Date(left.start_date || left.event_date).getTime();
        const rightTime = new Date(right.start_date || right.event_date).getTime();
        return rightTime - leftTime;
      }),
    [events]
  );

  return (
    <>
      <TopBar />
      <HeaderNav />
      <Breadcrumbs
        title="Eventos"
        description="Agenda pública de eventos."
        parentLabel="Vida Académica"
        parentHref="/vida-academica/eventos"
        currentLabel="Eventos"
        currentHref="/vida-academica/eventos"
      />

      <main className={mainContent}>
        <section className={contentSection}>
          <div className={container}>
            <div className="mx-auto max-w-6xl">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Agenda
                  </p>
                  <h1 className="mt-2 font-heading text-4xl font-semibold text-slate-900">
                    Todos os eventos
                  </h1>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                    Explora os eventos publicados e consulta cada detalhe, datas, local e inscrições.
                  </p>
                </div>

                <Link to="/" className={adminBtnSecondary}>
                  Voltar à home
                </Link>
              </div>

              {isLoading ? <p className={contentEmpty}>A carregar eventos...</p> : null}
              {loadError ? <p className={contentEmpty}>{loadError}</p> : null}
              {!isLoading && !loadError && sortedEvents.length === 0 ? (
                <p className={contentEmpty}>Ainda não existem eventos publicados.</p>
              ) : null}

              {!isLoading && !loadError && sortedEvents.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {sortedEvents.map((item) => (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                      {item.image ? (
                        <img
                          src={resolveInfoCulturaAssetUrl(item.image)}
                          alt={item.title}
                          className="h-52 w-full object-cover"
                        />
                      ) : null}

                      <div className="p-5">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <p className="text-sm font-medium text-slate-500">{formatDate(item.start_date)}</p>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            {getEventStateLabel(item)}
                          </span>
                        </div>

                        <h2 className="text-xl font-semibold text-slate-900">{item.title}</h2>

                        <p className="mt-3 text-sm leading-6 text-slate-700">{item.description}</p>

                        <div className="mt-4 space-y-1 text-sm text-slate-500">
                          <p>{[item.city, item.location].filter(Boolean).join(' · ') || 'Local por definir'}</p>
                          {item.categories.length > 0 ? (
                            <p>{item.categories.map((category) => category.name).join(', ')}</p>
                          ) : null}
                        </div>

                        <div className="mt-5">
                          <Link
                            to={`/vida-academica/eventos/${item.id}`}
                            className="text-sm font-semibold text-[#dd8609] underline-offset-2 hover:underline"
                          >
                            Ver detalhe
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
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

export default EventosPage;
