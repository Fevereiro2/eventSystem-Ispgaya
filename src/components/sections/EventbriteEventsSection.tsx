import { useEffect, useState } from 'react';
import { useLocale } from '../../i18n/locale';

interface EventbriteEvent {
  id: string;
  name: string;
  status: string;
  url: string;
  created: string;
  start: string;
  end: string;
}

export default function EventbriteEventsSection() {
  const { locale } = useLocale();
  const [events, setEvents] = useState<EventbriteEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventbriteEvents = async () => {
      try {
        const response = await fetch(
          'http://127.0.0.1:8001/api/events/eventbrite/public/'
        );

        if (!response.ok) {
          throw new Error(`Erro ao carregar eventos: ${response.status}`);
        }

        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchEventbriteEvents();
  }, []);

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold text-slate-900 lg:text-3xl">Eventos Eventbrite</h2>
          <p className="mt-2 text-base leading-8 text-slate-700 lg:text-lg">A carregar eventos...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold text-slate-900 lg:text-3xl">Eventos Eventbrite</h2>
          <p className="mt-2 text-sm text-red-600">Erro: {error}</p>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#dd8609]">
            Eventos ao vivo
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900 lg:text-3xl">
            Eventos Eventbrite
          </h2>
          <p className="mt-2 text-base leading-8 text-slate-700 lg:text-lg">
            Confira os eventos publicados no Eventbrite da nossa organização.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => {
          const startDate = new Date(event.start).toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
          const startTime = new Date(event.start).toLocaleTimeString(locale === 'pt' ? 'pt-PT' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <article
              key={event.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900">{event.name}</h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    event.status === 'live'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {event.status === 'live' ? 'Publicado' : 'Rascunho'}
                </span>
              </div>

              <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <span>📅</span>
                {startDate} às {startTime}
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-700">
                Evento registado no Eventbrite. Clique no botão abaixo para mais informações e ingressos.
              </p>

              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#dd8609] transition-colors hover:text-[#c26900]"
              >
                Ver no Eventbrite
                <span>→</span>
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
