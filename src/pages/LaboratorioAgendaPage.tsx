import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import Footer from '../components/Footer';
import HeaderNav from '../components/HeaderNav';
import TopBar from '../components/TopBar';
import {
  fetchPublicCategories,
  fetchPublicClubs,
  fetchPublicEvents,
  InfoCulturaCategory,
  InfoCulturaClub,
  InfoCulturaEvent,
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
  labResearchLink,
  mainContent
} from '../styles/ui';

function normalizeLabel(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getEventTimeState(item: InfoCulturaEvent): 'upcoming' | 'ongoing' | 'past' {
  const now = Date.now();
  const start = new Date(item.start_date).getTime();
  const end = new Date(item.end_date).getTime();

  if (!Number.isNaN(end) && end < now) return 'past';
  if (!Number.isNaN(start) && start > now) return 'upcoming';
  return 'ongoing';
}

function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat('pt-PT', {
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function formatDateLabel(value: string): string {
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(value));
}

function getClubNameById(clubs: InfoCulturaClub[], clubId?: number | null): string {
  if (!clubId) return '';
  return clubs.find((club) => club.id === clubId)?.name || '';
}

function LaboratorioAgendaPage() {
  const [clubs, setClubs] = useState<InfoCulturaClub[]>([]);
  const [categories, setCategories] = useState<InfoCulturaCategory[]>([]);
  const [events, setEvents] = useState<InfoCulturaEvent[]>([]);
  const [eventClubFilter, setEventClubFilter] = useState('all');
  const [eventCategoryFilter, setEventCategoryFilter] = useState('all');
  const [eventCityFilter, setEventCityFilter] = useState('all');
  const [eventStateFilter, setEventStateFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'past'>(
    'all'
  );
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [nextClubs, nextCategories, nextEvents] = await Promise.all([
          fetchPublicClubs(),
          fetchPublicCategories(),
          fetchPublicEvents()
        ]);

        if (!active) return;
        setClubs(nextClubs);
        setCategories(nextCategories);
        setEvents(nextEvents);
      } catch (error) {
        if (!active) return;
        const message =
          error instanceof Error ? error.message : 'Não foi possível carregar a agenda.';
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

  const eventCities = useMemo(
    () =>
      Array.from(
        new Set(events.map((item) => (item.city || item.location || '').trim()).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b, 'pt')),
    [events]
  );

  const filteredEvents = useMemo(
    () =>
      events.filter((item) => {
        const itemDate = item.event_date.slice(0, 10);
        return (
          (eventClubFilter === 'all' || String(item.club_id || '') === eventClubFilter) &&
          (eventCategoryFilter === 'all' || item.category_ids.includes(Number(eventCategoryFilter))) &&
          (eventCityFilter === 'all' ||
            normalizeLabel(item.city || item.location || '') === normalizeLabel(eventCityFilter)) &&
          (eventStateFilter === 'all' || getEventTimeState(item) === eventStateFilter) &&
          (!selectedDate || itemDate === selectedDate)
        );
      }),
    [events, eventClubFilter, eventCategoryFilter, eventCityFilter, eventStateFilter, selectedDate]
  );

  const calendarEventsByDate = useMemo(() => {
    const map = new Map<string, InfoCulturaEvent[]>();

    events.forEach((item) => {
      const dateKey = item.event_date.slice(0, 10);

      if (
        (eventClubFilter !== 'all' && String(item.club_id || '') !== eventClubFilter) ||
        (eventCategoryFilter !== 'all' && !item.category_ids.includes(Number(eventCategoryFilter))) ||
        (eventCityFilter !== 'all' &&
          normalizeLabel(item.city || item.location || '') !== normalizeLabel(eventCityFilter)) ||
        (eventStateFilter !== 'all' && getEventTimeState(item) !== eventStateFilter)
      ) {
        return;
      }

      const currentItems = map.get(dateKey) || [];
      currentItems.push(item);
      map.set(dateKey, currentItems);
    });

    return map;
  }, [events, eventClubFilter, eventCategoryFilter, eventCityFilter, eventStateFilter]);

  const calendarDays = useMemo(() => {
    const monthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const monthEnd = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
    const startWeekday = (monthStart.getDay() + 6) % 7;
    const totalDays = monthEnd.getDate();
    const cells: Array<{ date: Date; inMonth: boolean }> = [];

    for (let index = 0; index < startWeekday; index += 1) {
      cells.push({
        date: new Date(monthStart.getFullYear(), monthStart.getMonth(), index - startWeekday + 1),
        inMonth: false
      });
    }

    for (let day = 1; day <= totalDays; day += 1) {
      cells.push({
        date: new Date(monthStart.getFullYear(), monthStart.getMonth(), day),
        inMonth: true
      });
    }

    while (cells.length % 7 !== 0) {
      const lastDate = cells[cells.length - 1]?.date || monthEnd;
      cells.push({
        date: new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + 1),
        inMonth: false
      });
    }

    return cells;
  }, [visibleMonth]);

  return (
    <>
      <TopBar />
      <HeaderNav />
      <Breadcrumbs
        title="Agenda Cultural"
        description="Consulta a agenda geral do Laboratório Cultural, filtra eventos e percorre o calendário de forma visual."
        parentLabel="Laboratorio Cultural"
        parentHref="/laboratorio-cultural"
        currentLabel="Agenda"
        currentHref="/laboratorio-cultural/agenda"
      />

      <main className={mainContent}>
        <section className="py-12 md:py-14">
          <div className={container}>
            {isLoading ? <p className={contentEmpty}>A carregar agenda...</p> : null}
            {loadError ? <p className={contentEmpty}>{loadError}</p> : null}

            {!isLoading && !loadError ? (
              <div className="space-y-10">
                <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#fff7ec_0%,#ffffff_46%,#f6f8fb_100%)] p-6 shadow-sm md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#dd8609]">
                        Explorar agenda
                      </p>
                      <h2 className="mt-3 font-heading text-3xl font-semibold text-slate-900">
                        Vê todos os eventos por filtro
                      </h2>
                      <p className="mt-3 max-w-3xl text-base leading-8 text-slate-700">
                        Filtra por clube, categoria, cidade e estado. Depois navega no calendário
                        para perceber rapidamente o que acontece em cada data.
                      </p>
                    </div>
                    <Link to="/laboratorio-cultural" className={adminBtnSecondary}>
                      Voltar ao laboratório
                    </Link>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <div className={adminFormGridSpaced}>
                    <div className={adminField}>
                      <label className={adminLabel} htmlFor="agenda-event-club-filter">
                        Clube
                      </label>
                      <select
                        id="agenda-event-club-filter"
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
                      <label className={adminLabel} htmlFor="agenda-event-category-filter">
                        Categoria
                      </label>
                      <select
                        id="agenda-event-category-filter"
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
                      <label className={adminLabel} htmlFor="agenda-event-city-filter">
                        Cidade
                      </label>
                      <select
                        id="agenda-event-city-filter"
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
                      <label className={adminLabel} htmlFor="agenda-event-state-filter">
                        Estado
                      </label>
                      <select
                        id="agenda-event-state-filter"
                        className={adminInput}
                        value={eventStateFilter}
                        onChange={(event) =>
                          setEventStateFilter(
                            event.target.value as 'all' | 'upcoming' | 'ongoing' | 'past'
                          )
                        }
                      >
                        <option value="all">Todos</option>
                        <option value="upcoming">Próximos</option>
                        <option value="ongoing">A decorrer</option>
                        <option value="past">Concluídos</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className={adminBtnSecondary}
                      onClick={() => {
                        setEventClubFilter('all');
                        setEventCategoryFilter('all');
                        setEventCityFilter('all');
                        setEventStateFilter('all');
                        setSelectedDate('');
                      }}
                    >
                      Limpar filtros
                    </button>
                    {selectedDate ? (
                      <button
                        type="button"
                        className={adminBtnSecondary}
                        onClick={() => setSelectedDate('')}
                      >
                        Limpar data
                      </button>
                    ) : null}
                  </div>
                </section>

                <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleMonth(
                            (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
                          )
                        }
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-[#dd8609] hover:text-[#dd8609]"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <h2 className="font-heading text-2xl font-semibold capitalize text-slate-900">
                        {formatMonthLabel(visibleMonth)}
                      </h2>
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleMonth(
                            (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
                          )
                        }
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-[#dd8609] hover:text-[#dd8609]"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
                        <div key={day} className="py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 grid grid-cols-7 gap-2">
                      {calendarDays.map(({ date, inMonth }) => {
                        const dateKey = date.toISOString().slice(0, 10);
                        const items = calendarEventsByDate.get(dateKey) || [];
                        const isSelected = selectedDate === dateKey;

                        return (
                          <button
                            key={dateKey}
                            type="button"
                            onClick={() => setSelectedDate(isSelected ? '' : dateKey)}
                            className={`min-h-[88px] rounded-2xl border p-2 text-left transition ${
                              isSelected
                                ? 'border-[#dd8609] bg-orange-50'
                                : inMonth
                                  ? 'border-slate-200 bg-white hover:border-slate-300'
                                  : 'border-slate-100 bg-slate-50 text-slate-400'
                            }`}
                          >
                            <span className="block text-sm font-semibold">{date.getDate()}</span>
                            {items.length > 0 ? (
                              <span className="mt-2 block text-xs text-slate-600">
                                {items.length} evento(s)
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-heading text-2xl font-semibold text-slate-900">
                          {selectedDate ? `Eventos em ${formatDateLabel(selectedDate)}` : 'Visão geral filtrada'}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {selectedDate
                            ? 'Selecionaste um dia específico no calendário.'
                            : 'Seleciona uma data para reduzir a agenda a um dia.'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      {filteredEvents.length === 0 ? (
                        <p className={contentEmpty}>Não existem eventos para os filtros atuais.</p>
                      ) : (
                        filteredEvents.map((item) => (
                          <article
                            key={item.id}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                          >
                            {item.image ? (
                              <img
                                src={resolveInfoCulturaAssetUrl(item.image)}
                                alt={item.title}
                                className="h-40 w-full object-cover"
                              />
                            ) : null}
                            <div className="p-5">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                                  {getEventTimeState(item) === 'upcoming'
                                    ? 'Próximo'
                                    : getEventTimeState(item) === 'ongoing'
                                      ? 'A decorrer'
                                      : 'Concluído'}
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-slate-500">
                                {getClubNameById(clubs, item.club_id)} · {formatDateLabel(item.event_date)}
                              </p>
                              <p className="mt-3 text-sm leading-6 text-slate-700">{item.description}</p>
                              <div className="mt-4">
                                <Link to={`/laboratorio-cultural/eventos/${item.id}`} className={labResearchLink}>
                                  Ver detalhe
                                </Link>
                              </div>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default LaboratorioAgendaPage;
