import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ClubRegistrationModal from '../components/ui/ClubRegistrationModal';
import Footer from '../components/layout/Footer';
import HeaderNav from '../components/layout/HeaderNav';
import TopBar from '../components/layout/TopBar';
import { createEventRegistration, createSessionRegistration, downloadEventCalendar, downloadSessionCalendar, fetchPublicBookItem, fetchPublicEvents, fetchPublicEventItem, fetchPublicNews, fetchPublicNewsItem, fetchPublicSessionItem, resolveInfoCulturaAssetUrl } from '../api/infoculturaApi';
import { adminBtnPrimary, adminBtnSecondary, blockText, blockTitle, container, contentCard, contentEmpty, contentSection, mainContent } from '../styles/ui';
function formatDate(value) {
    if (!value)
        return 'Sem data';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return new Intl.DateTimeFormat('pt-PT', {
        dateStyle: 'medium',
        timeStyle: value.includes('T') ? 'short' : undefined
    }).format(date);
}
function downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}
function estimateReadingTime(text) {
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 220));
    return `${minutes} minuto${minutes === 1 ? '' : 's'} de leitura`;
}
function CulturalEntryDetail({ kind }) {
    const params = useParams();
    const itemId = kind === 'news'
        ? params.newsId
        : kind === 'session'
            ? params.sessionId
            : kind === 'event'
                ? params.eventId
                : params.bookId;
    const [entry, setEntry] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
    const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false);
    const [registrationError, setRegistrationError] = useState('');
    const [registrationFeedback, setRegistrationFeedback] = useState('');
    const [isDownloadingCalendar, setIsDownloadingCalendar] = useState(false);
    const [relatedEvents, setRelatedEvents] = useState([]);
    const [relatedNews, setRelatedNews] = useState([]);
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
                const nextEntry = kind === 'news'
                    ? await fetchPublicNewsItem(parsedId)
                    : kind === 'session'
                        ? await fetchPublicSessionItem(parsedId)
                        : kind === 'event'
                            ? await fetchPublicEventItem(parsedId)
                            : await fetchPublicBookItem(parsedId);
                if (!active)
                    return;
                setEntry(nextEntry);
            }
            catch (error) {
                if (!active)
                    return;
                const message = error instanceof Error ? error.message : 'Nao foi possivel carregar o detalhe.';
                setLoadError(message);
            }
            finally {
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
    useEffect(() => {
        if (kind !== 'event' || !entry || !('id' in entry)) {
            setRelatedEvents([]);
            return;
        }
        let active = true;
        async function loadRelatedEvents() {
            try {
                const items = await fetchPublicEvents();
                if (!active)
                    return;
                const currentEvent = entry;
                const currentCategoryIds = new Set(currentEvent.category_ids);
                const nextItems = items
                    .filter((item) => item.id !== currentEvent.id)
                    .sort((left, right) => {
                    const leftMatches = left.category_ids.filter((id) => currentCategoryIds.has(id)).length;
                    const rightMatches = right.category_ids.filter((id) => currentCategoryIds.has(id)).length;
                    if (rightMatches !== leftMatches) {
                        return rightMatches - leftMatches;
                    }
                    const leftTime = new Date(left.start_date || left.event_date).getTime();
                    const rightTime = new Date(right.start_date || right.event_date).getTime();
                    return rightTime - leftTime;
                })
                    .slice(0, 3);
                setRelatedEvents(nextItems);
            }
            catch {
                if (!active)
                    return;
                setRelatedEvents([]);
            }
        }
        void loadRelatedEvents();
        return () => {
            active = false;
        };
    }, [entry, kind]);
    useEffect(() => {
        if (kind !== 'news' || !entry || !('id' in entry)) {
            setRelatedNews([]);
            return;
        }
        let active = true;
        async function loadRelatedNews() {
            try {
                const items = await fetchPublicNews();
                if (!active)
                    return;
                const currentNews = entry;
                const nextItems = items
                    .filter((item) => item.id !== currentNews.id)
                    .sort((left, right) => {
                    const clubWeightLeft = left.club_id === currentNews.club_id ? 1 : 0;
                    const clubWeightRight = right.club_id === currentNews.club_id ? 1 : 0;
                    if (clubWeightRight !== clubWeightLeft) {
                        return clubWeightRight - clubWeightLeft;
                    }
                    const leftTime = new Date(left.published_at || left.created_at).getTime();
                    const rightTime = new Date(right.published_at || right.created_at).getTime();
                    return rightTime - leftTime;
                })
                    .slice(0, 3);
                setRelatedNews(nextItems);
            }
            catch {
                if (!active)
                    return;
                setRelatedNews([]);
            }
        }
        void loadRelatedNews();
        return () => {
            active = false;
        };
    }, [entry, kind]);
    const title = entry?.title || 'Detalhe';
    const clubId = entry && 'club_id' in entry ? entry.club_id : undefined;
    const clubName = entry && 'club_name' in entry ? entry.club_name : undefined;
    const image = entry && 'image' in entry
        ? String(entry.image || '')
        : entry && 'cover_image' in entry
            ? String(entry.cover_image || '')
            : '';
    const activityEntry = entry && (kind === 'event' || kind === 'session')
        ? entry
        : null;
    const canRegister = Boolean(activityEntry?.enable_registrations);
    const registrationState = activityEntry?.registration_state || 'closed';
    const calendarLinks = useMemo(() => {
        if (!entry || (kind !== 'event' && kind !== 'session')) {
            return null;
        }
        return {
            google: 'google_calendar_url' in entry && entry.google_calendar_url ? entry.google_calendar_url : '',
            outlook: 'outlook_calendar_url' in entry && entry.outlook_calendar_url
                ? entry.outlook_calendar_url
                : ''
        };
    }, [entry, kind]);
    async function handleSubmitRegistration(data) {
        if (!entry || (kind !== 'event' && kind !== 'session'))
            return;
        setIsSubmittingRegistration(true);
        setRegistrationError('');
        try {
            const response = kind === 'event'
                ? await createEventRegistration(entry.id, data)
                : await createSessionRegistration(entry.id, data);
            setRegistrationFeedback(response.status === 'waitlist'
                ? 'Inscricao enviada. Ficaste em lista de espera e vais receber confirmacao por email.'
                : 'Inscricao enviada com sucesso. Vais receber confirmacao por email.');
            setIsRegistrationModalOpen(false);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Nao foi possivel enviar a inscricao.';
            setRegistrationError(message);
        }
        finally {
            setIsSubmittingRegistration(false);
        }
    }
    async function handleDownloadCalendar() {
        if (!entry || (kind !== 'event' && kind !== 'session'))
            return;
        setIsDownloadingCalendar(true);
        try {
            const blob = kind === 'event'
                ? await downloadEventCalendar(entry.id)
                : await downloadSessionCalendar(entry.id);
            downloadBlob(blob, `${kind === 'event' ? 'evento' : 'sessao'}-${entry.id}.ics`);
        }
        catch (error) {
            setRegistrationError(error instanceof Error ? error.message : 'Nao foi possivel descarregar o calendario.');
        }
        finally {
            setIsDownloadingCalendar(false);
        }
    }
    const registrationSummary = activityEntry
        ? {
            confirmed: activityEntry.confirmed_registrations || 0,
            waitlist: activityEntry.waitlist_registrations || 0,
            remaining: activityEntry.remaining_slots === undefined ? null : activityEntry.remaining_slots
        }
        : null;
    const eventEntry = kind === 'event' && entry ? entry : null;
    const newsEntry = kind === 'news' && entry ? entry : null;
    const eventReadingTime = eventEntry ? estimateReadingTime(eventEntry.description || '') : '';
    const newsReadingTime = newsEntry
        ? estimateReadingTime(`${newsEntry.summary || ''} ${newsEntry.content || ''}`)
        : '';
    const currentUrl = typeof window !== 'undefined'
        ? window.location.href
        : kind === 'event' && entry
            ? `/vida-academica/eventos/${entry.id}`
            : '#';
    return (_jsxs(_Fragment, { children: [_jsx(TopBar, {}), _jsx(HeaderNav, {}), _jsx(Breadcrumbs, { title: title, description: "Detalhe publico do conteudo cultural.", parentLabel: "Laboratorio Cultural", parentHref: "/laboratorio-cultural", currentLabel: title, currentHref: "#" }), _jsx("main", { className: mainContent, children: _jsx("section", { className: contentSection, children: _jsxs("div", { className: container, children: [isLoading ? _jsx("p", { className: contentEmpty, children: "A carregar detalhe..." }) : null, loadError ? _jsx("p", { className: contentEmpty, children: loadError }) : null, !isLoading && !loadError && eventEntry ? (_jsxs("section", { className: "mx-auto max-w-4xl px-4 pb-10 sm:px-6 lg:px-0", children: [_jsxs(Link, { to: "/vida-academica/eventos", className: "mt-6 flex items-center text-sm font-medium text-gray-500", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "mt-0.5 h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M7 16l-4-4m0 0l4-4m-4 4h18" }) }), _jsx("span", { className: "ml-2", children: "Voltar" })] }), _jsxs("article", { children: [_jsxs("div", { className: "mt-4", children: [_jsx("h1", { className: "font-heading text-3xl font-bold leading-tight tracking-tight lg:text-4xl lg:leading-snug", children: eventEntry.title }), _jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-3 font-medium text-gray-500 md:gap-5 md:flex-nowrap", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }), _jsx("span", { className: "ml-2 capitalize", children: formatDate(eventEntry.start_date) })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsx("span", { className: "ml-2", children: eventReadingTime })] })] })] }), image ? (_jsx("div", { className: "my-8", children: _jsx("img", { className: "aspect-[16/9] w-full rounded object-cover shadow-xl", src: resolveInfoCulturaAssetUrl(image), alt: eventEntry.title }) })) : null, _jsx("div", { className: "max-w-none whitespace-pre-wrap text-slate-700", children: _jsx("p", { children: eventEntry.description }) }), eventEntry.categories.length > 0 ? (_jsx("div", { className: "mt-4 flex flex-wrap items-center gap-2", children: eventEntry.categories.map((category) => (_jsxs("span", { className: "inline-block rounded-sm bg-orange-50 px-3 py-1.5 text-sm font-semibold tracking-wide text-orange-600", children: ["#", category.name.toLowerCase().replace(/\s+/g, '')] }, category.id))) })) : null, _jsxs("div", { className: "mt-6 flex flex-wrap items-start justify-between gap-4 lg:flex-nowrap", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold uppercase tracking-tight text-gray-500", children: "Partilha" }), _jsxs("div", { className: "mt-3 flex items-end gap-4", children: [_jsx("a", { href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, target: "_blank", rel: "noopener noreferrer", className: "inline-flex text-gray-700", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: _jsx("path", { d: "M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" }) }) }), _jsx("a", { href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`, target: "_blank", rel: "noopener noreferrer", className: "inline-flex text-gray-700", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: _jsx("path", { d: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" }) }) }), _jsx("a", { href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}`, target: "_blank", rel: "noopener noreferrer", className: "inline-flex text-gray-700", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: _jsx("path", { d: "M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" }) }) })] })] }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [calendarLinks?.google ? (_jsx("a", { href: calendarLinks.google, target: "_blank", rel: "noreferrer", className: adminBtnSecondary, children: "Google Calendar" })) : null, calendarLinks?.outlook ? (_jsx("a", { href: calendarLinks.outlook, target: "_blank", rel: "noreferrer", className: adminBtnSecondary, children: "Outlook" })) : null, _jsx("button", { type: "button", className: adminBtnSecondary, onClick: () => void handleDownloadCalendar(), disabled: isDownloadingCalendar, children: isDownloadingCalendar ? 'A descarregar...' : 'Descarregar .ics' }), canRegister && registrationState !== 'closed' ? (_jsx("button", { type: "button", className: adminBtnPrimary, onClick: () => {
                                                                    setRegistrationFeedback('');
                                                                    setRegistrationError('');
                                                                    setIsRegistrationModalOpen(true);
                                                                }, children: registrationState === 'waitlist' ? 'Entrar em lista de espera' : 'Inscrever-me' })) : null] })] }), (kind === 'event' || kind === 'session') && registrationSummary ? (_jsxs("div", { className: "mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Participa\u00E7\u00E3o" }), _jsxs("p", { className: "mt-2 text-sm text-slate-600", children: ["Confirmadas: ", registrationSummary.confirmed, " \u00B7 Lista de espera: ", registrationSummary.waitlist, registrationSummary.remaining !== null ? ` · Vagas restantes: ${registrationSummary.remaining}` : ''] }), _jsxs("p", { className: "mt-2 text-sm text-slate-600", children: ["Estado das inscri\u00E7\u00F5es: ", registrationState === 'open' ? 'Abertas' : registrationState === 'waitlist' ? 'Lista de espera' : 'Encerradas'] }), _jsxs("p", { className: "mt-2 text-sm text-slate-600", children: ["Local: ", eventEntry.location || eventEntry.city || 'Local por definir'] })] })) : null, (kind === 'event' || kind === 'session') && registrationFeedback ? (_jsx("p", { className: "mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700", children: registrationFeedback })) : null, relatedEvents.length > 0 ? (_jsxs("div", { className: "mt-10", children: [_jsx("h3", { className: "font-heading text-2xl font-bold", children: "Relacionados" }), _jsx("div", { className: "mt-3 flex flex-wrap justify-between gap-5 md:flex-nowrap", children: relatedEvents.map((item) => (_jsxs("div", { className: "basis-full md:basis-1/3", children: [_jsx("div", { className: "overflow-hidden rounded-sm shadow-xl", children: _jsx(Link, { to: `/vida-academica/eventos/${item.id}`, children: _jsx("img", { className: "aspect-[16/9] w-full object-cover transition-transform duration-300 ease-in-out hover:scale-105", src: resolveInfoCulturaAssetUrl(item.image), alt: item.title }) }) }), _jsx("h4", { className: "mt-4 text-xl font-bold hover:underline underline-offset-2", children: _jsx(Link, { to: `/vida-academica/eventos/${item.id}`, children: item.title.length > 52 ? `${item.title.slice(0, 52)}...` : item.title }) }), _jsx("time", { className: "mt-2 inline-block text-sm font-medium capitalize text-gray-500", dateTime: item.start_date || item.event_date, children: formatDate(item.start_date || item.event_date) })] }, item.id))) })] })) : null] })] })) : null, !isLoading && !loadError && newsEntry ? (_jsxs("section", { className: "mx-auto max-w-4xl px-4 pb-10 sm:px-6 lg:px-0", children: [_jsxs(Link, { to: "/vida-academica/noticias", className: "mt-6 flex items-center text-sm font-medium text-gray-500", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "mt-0.5 h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M7 16l-4-4m0 0l4-4m-4 4h18" }) }), _jsx("span", { className: "ml-2", children: "Voltar" })] }), _jsxs("article", { children: [_jsxs("div", { className: "mt-4", children: [_jsx("h1", { className: "font-heading text-3xl font-bold leading-tight tracking-tight lg:text-4xl lg:leading-snug", children: newsEntry.title }), _jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-3 font-medium text-gray-500 md:gap-5 md:flex-nowrap", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }), _jsx("span", { className: "ml-2 capitalize", children: formatDate(newsEntry.published_at || newsEntry.created_at) })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsx("span", { className: "ml-2", children: newsReadingTime })] })] })] }), image ? (_jsx("div", { className: "my-8", children: _jsx("img", { className: "aspect-[16/9] w-full rounded object-cover shadow-xl", src: resolveInfoCulturaAssetUrl(image), alt: newsEntry.title }) })) : null, _jsxs("div", { className: "max-w-none whitespace-pre-wrap text-slate-700", children: [newsEntry.summary ? _jsx("p", { className: "mb-4", children: newsEntry.summary }) : null, _jsx("p", { children: newsEntry.content })] }), _jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-2", children: [newsEntry.club_name ? (_jsxs("span", { className: "inline-block rounded-sm bg-orange-50 px-3 py-1.5 text-sm font-semibold tracking-wide text-orange-600", children: ["#", newsEntry.club_name.toLowerCase().replace(/\s+/g, '')] })) : null, _jsx("span", { className: "inline-block rounded-sm bg-slate-100 px-3 py-1.5 text-sm font-semibold tracking-wide text-slate-600", children: newsEntry.news_status_name })] }), _jsx("div", { className: "mt-6 flex flex-wrap items-start justify-between gap-4 lg:flex-nowrap", children: _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold uppercase tracking-tight text-gray-500", children: "Partilha" }), _jsxs("div", { className: "mt-3 flex items-end gap-4", children: [_jsx("a", { href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, target: "_blank", rel: "noopener noreferrer", className: "inline-flex text-gray-700", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: _jsx("path", { d: "M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" }) }) }), _jsx("a", { href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`, target: "_blank", rel: "noopener noreferrer", className: "inline-flex text-gray-700", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: _jsx("path", { d: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" }) }) }), _jsx("a", { href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}`, target: "_blank", rel: "noopener noreferrer", className: "inline-flex text-gray-700", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: _jsx("path", { d: "M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" }) }) })] })] }) }), relatedNews.length > 0 ? (_jsxs("div", { className: "mt-10", children: [_jsx("h3", { className: "font-heading text-2xl font-bold", children: "Relacionados" }), _jsx("div", { className: "mt-3 flex flex-wrap justify-between gap-5 md:flex-nowrap", children: relatedNews.map((item) => (_jsxs("div", { className: "basis-full md:basis-1/3", children: [_jsx("div", { className: "overflow-hidden rounded-sm shadow-xl", children: _jsx(Link, { to: `/vida-academica/noticias/${item.id}`, children: _jsx("img", { className: "aspect-[16/9] w-full object-cover transition-transform duration-300 ease-in-out hover:scale-105", src: resolveInfoCulturaAssetUrl(item.image), alt: item.title }) }) }), _jsx("h4", { className: "mt-4 text-xl font-bold hover:underline underline-offset-2", children: _jsx(Link, { to: `/vida-academica/noticias/${item.id}`, children: item.title.length > 52 ? `${item.title.slice(0, 52)}...` : item.title }) }), _jsx("time", { className: "mt-2 inline-block text-sm font-medium capitalize text-gray-500", dateTime: item.published_at || item.created_at, children: formatDate(item.published_at || item.created_at) })] }, item.id))) })] })) : null] })] })) : null, !isLoading && !loadError && entry && !eventEntry && !newsEntry ? (_jsxs("div", { className: contentCard, children: [image ? (_jsx("img", { src: resolveInfoCulturaAssetUrl(image), alt: title, className: "mb-6 h-72 w-full rounded-2xl object-cover" })) : null, _jsx("h2", { className: blockTitle, children: title }), _jsxs("p", { className: blockText, children: [clubName ? `${clubName} · ` : '', 'author' in entry
                                                ? `${entry.author} · ${entry.publication_year}`
                                                : 'published_at' in entry
                                                    ? formatDate(entry.published_at || entry.created_at)
                                                    : 'session_date' in entry
                                                        ? formatDate(entry.start_date)
                                                        : formatDate(entry.start_date)] }), 'author' in entry && entry.publisher ? _jsxs("p", { className: blockText, children: ["Editora: ", entry.publisher] }) : null, 'summary' in entry ? _jsx("p", { className: blockText, children: entry.summary }) : null, 'description' in entry ? _jsx("p", { className: blockText, children: entry.description }) : null, 'content' in entry ? _jsx("div", { className: "mt-6 whitespace-pre-wrap text-slate-700", children: entry.content }) : null, 'categories' in entry && entry.categories.length > 0 ? (_jsxs("p", { className: blockText, children: ["Categorias: ", entry.categories.map((category) => category.name).join(', ')] })) : null, 'location' in entry ? (_jsxs("p", { className: blockText, children: ["Local: ", entry.location || entry.city || 'Local por definir'] })) : null, _jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [clubId ? (_jsx(Link, { to: `/laboratorio-cultural/clubes/${clubId}`, className: adminBtnSecondary, children: "Ver clube" })) : null, _jsx(Link, { to: "/laboratorio-cultural", className: adminBtnSecondary, children: "Voltar ao laboratorio" })] })] })) : null] }) }) }), (kind === 'event' || kind === 'session') && entry ? (_jsx(ClubRegistrationModal, { clubName: title, entityLabel: kind === 'event' ? 'evento' : 'sessao', kickerLabel: kind === 'event' ? 'Evento' : 'Sessao', helperText: kind === 'event'
                    ? 'Preenche os teus dados para enviar a inscricao para este evento.'
                    : 'Preenche os teus dados para enviar a inscricao para esta sessao.', submitLabel: registrationState === 'waitlist' ? 'Entrar em espera' : 'Enviar inscricao', isOpen: isRegistrationModalOpen, isSubmitting: isSubmittingRegistration, submitError: registrationError, onClose: () => {
                    if (!isSubmittingRegistration) {
                        setIsRegistrationModalOpen(false);
                        setRegistrationError('');
                    }
                }, onSubmit: handleSubmitRegistration })) : null, _jsx(Footer, {})] }));
}
export default CulturalEntryDetail;
