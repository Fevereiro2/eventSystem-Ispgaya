import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Footer from '../components/layout/Footer';
import HeaderNav from '../components/layout/HeaderNav';
import TopBar from '../components/layout/TopBar';
import { fetchPublicCategories, fetchPublicClubs, fetchPublicEvents, resolveInfoCulturaAssetUrl } from '../api/infoculturaApi';
import { adminBtnSecondary, adminField, adminFormGridSpaced, adminInput, adminLabel, container, contentEmpty, labResearchLink, mainContent } from '../styles/ui';
import { getLocaleText, useLocale } from '../i18n/locale.js';
function normalizeLabel(value) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}
function getEventTimeState(item) {
    const now = Date.now();
    const start = new Date(item.start_date).getTime();
    const end = new Date(item.end_date).getTime();
    if (!Number.isNaN(end) && end < now)
        return 'past';
    if (!Number.isNaN(start) && start > now)
        return 'upcoming';
    return 'ongoing';
}
function formatMonthLabel(date, locale) {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'pt-PT', {
        month: 'long',
        year: 'numeric'
    }).format(date);
}
function formatDateLabel(value, locale) {
    const safeDate = value.length === 10 ? new Date(`${value}T12:00:00`) : new Date(value);
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(safeDate);
}
function getDateKey(date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('-');
}
function getClubNameById(clubs, clubId) {
    if (!clubId)
        return '';
    return clubs.find((club) => club.id === clubId)?.name || '';
}
function LaboratorioAgendaPage() {
    const { locale } = useLocale();
    const [clubs, setClubs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [events, setEvents] = useState([]);
    const [eventClubFilter, setEventClubFilter] = useState('all');
    const [eventCategoryFilter, setEventCategoryFilter] = useState('all');
    const [eventCityFilter, setEventCityFilter] = useState('all');
    const [eventStateFilter, setEventStateFilter] = useState('all');
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
                if (!active)
                    return;
                setClubs(nextClubs);
                setCategories(nextCategories);
                setEvents(nextEvents);
            }
            catch (error) {
                if (!active)
                    return;
                const message = error instanceof Error ? error.message : getLocaleText(locale, 'Não foi possível carregar a agenda.', 'Unable to load the agenda.');
                setLoadError(message);
            }
            finally {
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
    const eventCities = useMemo(() => Array.from(new Set(events.map((item) => (item.city || item.location || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'pt')), [events]);
    const filteredEvents = useMemo(() => events.filter((item) => {
        const itemDate = item.event_date.slice(0, 10);
        return ((eventClubFilter === 'all' || String(item.club_id || '') === eventClubFilter) &&
            (eventCategoryFilter === 'all' || item.category_ids.includes(Number(eventCategoryFilter))) &&
            (eventCityFilter === 'all' ||
                normalizeLabel(item.city || item.location || '') === normalizeLabel(eventCityFilter)) &&
            (eventStateFilter === 'all' || getEventTimeState(item) === eventStateFilter) &&
            (!selectedDate || itemDate === selectedDate));
    }), [events, eventClubFilter, eventCategoryFilter, eventCityFilter, eventStateFilter, selectedDate]);
    const calendarEventsByDate = useMemo(() => {
        const map = new Map();
        events.forEach((item) => {
            const dateKey = item.event_date.slice(0, 10);
            if ((eventClubFilter !== 'all' && String(item.club_id || '') !== eventClubFilter) ||
                (eventCategoryFilter !== 'all' && !item.category_ids.includes(Number(eventCategoryFilter))) ||
                (eventCityFilter !== 'all' &&
                    normalizeLabel(item.city || item.location || '') !== normalizeLabel(eventCityFilter)) ||
                (eventStateFilter !== 'all' && getEventTimeState(item) !== eventStateFilter)) {
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
        const cells = [];
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
    return (_jsxs(_Fragment, { children: [_jsx(TopBar, {}), _jsx(HeaderNav, {}), _jsx(Breadcrumbs, { title: getLocaleText(locale, 'Agenda Cultural', 'Cultural Agenda'), description: getLocaleText(locale, 'Consulta a agenda geral do Laboratório Cultural, filtra eventos e percorre o calendário de forma visual.', 'Browse the Cultural Lab agenda, filter events and move through the calendar visually.'), parentLabel: getLocaleText(locale, 'Laboratorio Cultural', 'Cultural Lab'), parentHref: "/laboratorio-cultural", currentLabel: getLocaleText(locale, 'Agenda', 'Agenda'), currentHref: "/laboratorio-cultural/agenda" }), _jsx("main", { className: mainContent, children: _jsx("section", { className: "py-12 md:py-14", children: _jsxs("div", { className: container, children: [isLoading ? _jsx("p", { className: contentEmpty, children: getLocaleText(locale, 'A carregar agenda...', 'Loading agenda...') }) : null, loadError ? _jsx("p", { className: contentEmpty, children: loadError }) : null, !isLoading && !loadError ? (_jsxs("div", { className: "space-y-10", children: [_jsx("section", { className: "rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#fff7ec_0%,#ffffff_46%,#f6f8fb_100%)] p-6 shadow-sm md:p-8", children: _jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-[#dd8609]", children: getLocaleText(locale, 'Explorar agenda', 'Explore agenda') }), _jsx("h2", { className: "mt-3 font-heading text-3xl font-semibold text-slate-900", children: getLocaleText(locale, 'Vê todos os eventos por filtro', 'See all events by filter') }), _jsx("p", { className: "mt-3 max-w-3xl text-base leading-8 text-slate-700", children: getLocaleText(locale, 'Filtra por clube, categoria, cidade e estado. Depois navega no calendário para perceber rapidamente o que acontece em cada data.', 'Filter by club, category, city and status. Then browse the calendar to quickly understand what happens on each date.') })] }), _jsx(Link, { to: "/laboratorio-cultural", className: adminBtnSecondary, children: getLocaleText(locale, 'Voltar ao laboratório', 'Back to laboratory') })] }) }), _jsxs("section", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-6", children: [_jsxs("div", { className: adminFormGridSpaced, children: [_jsxs("div", { className: adminField, children: [_jsx("label", { className: adminLabel, htmlFor: "agenda-event-club-filter", children: getLocaleText(locale, 'Clube', 'Club') }), _jsxs("select", { id: "agenda-event-club-filter", className: adminInput, value: eventClubFilter, onChange: (event) => setEventClubFilter(event.target.value), children: [_jsx("option", { value: "all", children: getLocaleText(locale, 'Todos', 'All') }), clubs.map((club) => (_jsx("option", { value: club.id, children: club.name }, club.id)))] })] }), _jsxs("div", { className: adminField, children: [_jsx("label", { className: adminLabel, htmlFor: "agenda-event-category-filter", children: getLocaleText(locale, 'Categoria', 'Category') }), _jsxs("select", { id: "agenda-event-category-filter", className: adminInput, value: eventCategoryFilter, onChange: (event) => setEventCategoryFilter(event.target.value), children: [_jsx("option", { value: "all", children: getLocaleText(locale, 'Todas', 'All') }), categories.map((category) => (_jsx("option", { value: category.id, children: category.name }, category.id)))] })] }), _jsxs("div", { className: adminField, children: [_jsx("label", { className: adminLabel, htmlFor: "agenda-event-city-filter", children: getLocaleText(locale, 'Cidade', 'City') }), _jsxs("select", { id: "agenda-event-city-filter", className: adminInput, value: eventCityFilter, onChange: (event) => setEventCityFilter(event.target.value), children: [_jsx("option", { value: "all", children: getLocaleText(locale, 'Todas', 'All') }), eventCities.map((city) => (_jsx("option", { value: city, children: city }, city)))] })] }), _jsxs("div", { className: adminField, children: [_jsx("label", { className: adminLabel, htmlFor: "agenda-event-state-filter", children: getLocaleText(locale, 'Estado', 'Status') }), _jsxs("select", { id: "agenda-event-state-filter", className: adminInput, value: eventStateFilter, onChange: (event) => setEventStateFilter(event.target.value), children: [_jsx("option", { value: "all", children: getLocaleText(locale, 'Todos', 'All') }), _jsx("option", { value: "upcoming", children: getLocaleText(locale, 'Próximos', 'Upcoming') }), _jsx("option", { value: "ongoing", children: getLocaleText(locale, 'A decorrer', 'Ongoing') }), _jsx("option", { value: "past", children: getLocaleText(locale, 'Concluídos', 'Past') })] })] })] }), _jsxs("div", { className: "mt-5 flex flex-wrap gap-3", children: [_jsx("button", { type: "button", className: adminBtnSecondary, onClick: () => {
                                                            setEventClubFilter('all');
                                                            setEventCategoryFilter('all');
                                                            setEventCityFilter('all');
                                                            setEventStateFilter('all');
                                                            setSelectedDate('');
                                                        }, children: getLocaleText(locale, 'Limpar filtros', 'Clear filters') }), selectedDate ? (_jsx("button", { type: "button", className: adminBtnSecondary, onClick: () => setSelectedDate(''), children: getLocaleText(locale, 'Limpar data', 'Clear date') })) : null] })] }), _jsxs("section", { className: "grid gap-8 xl:grid-cols-[1.1fr_0.9fr]", children: [_jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6", children: [_jsxs("div", { className: "mb-5 flex items-center justify-between gap-4", children: [_jsx("button", { type: "button", onClick: () => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)), className: "inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-[#dd8609] hover:text-[#dd8609]", children: _jsx(ChevronLeft, { className: "h-5 w-5" }) }), _jsx("h2", { className: "font-heading text-2xl font-semibold capitalize text-slate-900", children: formatMonthLabel(visibleMonth, locale) }), _jsx("button", { type: "button", onClick: () => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)), className: "inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-[#dd8609] hover:text-[#dd8609]", children: _jsx(ChevronRight, { className: "h-5 w-5" }) })] }), _jsx("div", { className: "grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 sm:gap-2 sm:text-xs", children: (locale === 'en'
                                                            ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                                                            : ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']).map((day) => (_jsx("div", { className: "py-2", children: day }, day))) }), _jsx("div", { className: "mt-2 grid grid-cols-7 gap-1 sm:gap-2", children: calendarDays.map(({ date, inMonth }) => {
                                                            const dateKey = getDateKey(date);
                                                            const items = calendarEventsByDate.get(dateKey) || [];
                                                            const isSelected = selectedDate === dateKey;
                                                            return (_jsxs("button", { type: "button", onClick: () => setSelectedDate(isSelected ? '' : dateKey), className: `min-h-[72px] rounded-2xl border p-2 text-left transition sm:min-h-[88px] ${isSelected
                                                                    ? 'border-[#dd8609] bg-orange-50'
                                                                    : inMonth
                                                                        ? 'border-slate-200 bg-white hover:border-slate-300'
                                                                        : 'border-slate-100 bg-slate-50 text-slate-400'}`, children: [_jsx("span", { className: "block text-sm font-semibold", children: date.getDate() }), items.length > 0 ? (_jsxs("span", { className: "mt-2 block text-[10px] text-slate-600 sm:text-xs", children: [items.length, " ", getLocaleText(locale, 'evento(s)', 'event(s)')] })) : null] }, dateKey));
                                                        }) })] }), _jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6", children: [_jsx("div", { className: "flex items-start justify-between gap-4", children: _jsxs("div", { children: [_jsx("h2", { className: "font-heading text-2xl font-semibold text-slate-900", children: selectedDate ? `${getLocaleText(locale, 'Eventos em', 'Events on')} ${formatDateLabel(selectedDate, locale)}` : getLocaleText(locale, 'Visão geral filtrada', 'Filtered overview') }), _jsx("p", { className: "mt-2 text-sm leading-6 text-slate-600", children: selectedDate
                                                                        ? getLocaleText(locale, 'Selecionaste um dia específico no calendário.', 'You selected a specific day in the calendar.')
                                                                        : getLocaleText(locale, 'Seleciona uma data para reduzir a agenda a um dia.', 'Select a date to narrow the agenda to one day.') })] }) }), _jsx("div", { className: "mt-6 space-y-4", children: filteredEvents.length === 0 ? (_jsx("p", { className: contentEmpty, children: getLocaleText(locale, 'Não existem eventos para os filtros atuais.', 'There are no events for the current filters.') })) : (filteredEvents.map((item) => (_jsxs("article", { className: "overflow-hidden rounded-2xl border border-slate-200 bg-slate-50", children: [item.image ? (_jsx("img", { src: resolveInfoCulturaAssetUrl(item.image), alt: item.title, className: "h-32 w-full object-cover sm:h-40" })) : null, _jsxs("div", { className: "p-5", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900", children: item.title }), _jsx("span", { className: "rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600", children: getEventTimeState(item) === 'upcoming'
                                                                                        ? getLocaleText(locale, 'Próximo', 'Upcoming')
                                                                                        : getEventTimeState(item) === 'ongoing'
                                                                                            ? getLocaleText(locale, 'A decorrer', 'Ongoing')
                                                                                            : getLocaleText(locale, 'Concluído', 'Past') })] }), _jsxs("p", { className: "mt-2 text-sm text-slate-500", children: [getClubNameById(clubs, item.club_id), " \u00B7 ", formatDateLabel(item.event_date, locale)] }), _jsx("p", { className: "mt-3 text-sm leading-6 text-slate-700", children: item.description }), _jsx("div", { className: "mt-4", children: _jsx(Link, { to: `/laboratorio-cultural/eventos/${item.id}`, className: labResearchLink, children: getLocaleText(locale, 'Ver detalhe', 'View details') }) })] })] }, item.id)))) })] })] })] })) : null] }) }) }), _jsx(Footer, {})] }));
}
export default LaboratorioAgendaPage;
