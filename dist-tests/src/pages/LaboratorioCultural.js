import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Footer from '../components/layout/Footer';
import HeaderNav from '../components/layout/HeaderNav';
import BestBooksSection from '../components/sections/BestBooksSection.js';
import NewsHighlightsSection from '../components/ui/NewsHighlightsSection';
import TopBar from '../components/layout/TopBar';
import { fetchPublicBooks, fetchPublicClubs, fetchPublicEvents, fetchPublicNews, fetchPublicSessions, resolveInfoCulturaAssetUrl } from '../api/infoculturaApi';
import { adminBtnSecondary, container, contentEmpty, labResearchGrid, labResearchLink, labResearchSection, labResearchSubcard, labResearchSubtext, labResearchSubtitle, mainContent } from '../styles/ui';
import { getLocaleText, useLocale } from '../i18n/locale.js';
function normalizeLabel(value) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}
function getClubHref(club) {
    const label = normalizeLabel(club.name);
    if (label.includes('tuna')) {
        return '/laboratorio-cultural/tuna';
    }
    if (label.includes('leitura')) {
        return '/laboratorio-cultural/clube-leitura';
    }
    if (label.includes('teatro')) {
        return '/laboratorio-cultural/teatro';
    }
    return `/laboratorio-cultural/clubes/${club.id}`;
}
function matchesSearch(query, ...values) {
    if (!query)
        return true;
    return values.some((value) => normalizeLabel(value || '').includes(query));
}
function getClubNameById(clubs, clubId) {
    if (!clubId)
        return '';
    return clubs.find((club) => club.id === clubId)?.name || '';
}
function ResultCard({ title, meta, description, href, image, status }) {
    return (_jsxs("article", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", children: [image ? (_jsx("img", { src: resolveInfoCulturaAssetUrl(image), alt: title, className: "mb-4 h-40 w-full rounded-xl object-cover" })) : null, _jsxs("div", { className: "mb-3 flex items-start justify-between gap-3", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900", children: title }), status ? (_jsx("span", { className: "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600", children: status })) : null] }), _jsx("p", { className: "mb-2 text-sm text-slate-500", children: meta }), _jsx("p", { className: "mb-4 text-sm leading-6 text-slate-700", children: description }), _jsx(Link, { to: href, className: labResearchLink, children: "Ver detalhe" })] }));
}
function LaboratorioCultural() {
    const { locale } = useLocale();
    const [clubs, setClubs] = useState([]);
    const [newsItems, setNewsItems] = useState([]);
    const [books, setBooks] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [events, setEvents] = useState([]);
    const [searchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    useEffect(() => {
        let active = true;
        async function loadData() {
            try {
                const [nextClubs, nextNews, nextBooks, nextSessions, nextEvents] = await Promise.all([
                    fetchPublicClubs(),
                    fetchPublicNews(),
                    fetchPublicBooks(),
                    fetchPublicSessions(),
                    fetchPublicEvents()
                ]);
                if (!active)
                    return;
                setClubs(nextClubs);
                setNewsItems(nextNews);
                setBooks(nextBooks);
                setSessions(nextSessions);
                setEvents(nextEvents);
            }
            catch (error) {
                if (!active)
                    return;
                const message = error instanceof Error ? error.message : 'Nao foi possivel carregar o laboratorio.';
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
    const normalizedQuery = useMemo(() => normalizeLabel(searchQuery), [searchQuery]);
    const filteredClubs = useMemo(() => clubs.filter((club) => matchesSearch(normalizedQuery, club.name, club.description, club.mission)), [clubs, normalizedQuery]);
    const filteredNews = useMemo(() => newsItems.filter((item) => matchesSearch(normalizedQuery, item.title, item.summary, item.content, item.club_name)), [newsItems, normalizedQuery]);
    const filteredBooks = useMemo(() => books.filter((item) => matchesSearch(normalizedQuery, item.title, item.author, item.summary, item.publisher, item.club_name)), [books, normalizedQuery]);
    const filteredSessions = useMemo(() => sessions.filter((item) => matchesSearch(normalizedQuery, item.name, item.title, item.description, item.club_name)), [sessions, normalizedQuery]);
    const filteredEvents = useMemo(() => events.filter((item) => matchesSearch(normalizedQuery, item.title, item.description, item.city, item.location, getClubNameById(clubs, item.club_id))), [events, clubs, normalizedQuery]);
    const homepageStyleNews = useMemo(() => [...newsItems]
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
        image: resolveInfoCulturaAssetUrl(item.image),
        imageAlt: item.title,
        publishedAt: item.published_at || item.created_at,
        publishedLabel: new Intl.DateTimeFormat('pt-PT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(new Date(item.published_at || item.created_at)),
        tags: item.club_name
            ? [
                {
                    label: `#${normalizeLabel(item.club_name).replace(/\s+/g, '')}`,
                    href: '/vida-academica/noticias'
                }
            ]
            : []
    })), [newsItems]);
    const homepageStyleEvents = useMemo(() => [...events]
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
        image: resolveInfoCulturaAssetUrl(item.image),
        imageAlt: item.title,
        publishedAt: item.start_date || item.event_date,
        publishedLabel: new Intl.DateTimeFormat('pt-PT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(new Date(item.start_date || item.event_date)),
        tags: item.categories.map((category) => ({
            label: `#${normalizeLabel(category.name).replace(/\s+/g, '')}`,
            href: '/vida-academica/eventos'
        }))
    })), [events]);
    const hasSearch = normalizedQuery.length > 0;
    const totalResults = filteredClubs.length +
        filteredNews.length +
        filteredBooks.length +
        filteredSessions.length +
        filteredEvents.length;
    return (_jsxs(_Fragment, { children: [_jsx(TopBar, {}), _jsx(HeaderNav, {}), _jsx(Breadcrumbs, { title: "Laboratorio Cultural", description: "O Laborat\u00F3rio Cultural \u00E9 um espa\u00E7o vivo onde a criatividade ganha forma e a cultura se torna experi\u00EAncia.", parentLabel: "Laboratorio Cultural", parentHref: "/laboratorio-cultural", currentLabel: "Laboratorio Cultural", currentHref: "/laboratorio-cultural" }), _jsx("main", { className: mainContent, children: _jsx("section", { className: labResearchSection, children: _jsxs("div", { className: `${container} px-4 sm:px-6 xl:px-8`, children: [_jsx("article", { className: labResearchSubcard, children: _jsx("div", { className: "overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#fff7ec_0%,#ffffff_46%,#f6f8fb_100%)]", children: _jsxs("div", { className: "px-5 py-7 sm:px-6 lg:px-7 sm:py-8", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-[#dd8609]", children: "Vis\u00E3o Cultural" }), _jsx("h3", { className: "mt-4 font-heading text-3xl font-semibold text-slate-900 sm:text-4xl", children: "Miss\u00E3o e Objetivos" }), _jsx("p", { className: "mt-4 max-w-2xl text-base leading-8 text-slate-700", children: "O Laborat\u00F3rio Cultural existe para aproximar cultura, comunidade acad\u00E9mica e participa\u00E7\u00E3o. Esta entrada apresenta de forma clara a miss\u00E3o do espa\u00E7o, os seus objetivos e o enquadramento necess\u00E1rio para perceber rapidamente o prop\u00F3sito do Laborat\u00F3rio Cultural sem procurar essa informa\u00E7\u00E3o no meio do resto do conte\u00FAdo." }), _jsx("div", { className: "mt-6 flex flex-wrap gap-3", children: _jsx(Link, { to: "/laboratorio-cultural/roadmap", className: "inline-flex items-center rounded-md bg-[#dd8609] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90", children: "Abrir p\u00E1gina" }) })] }) }) }), isLoading ? _jsx("p", { className: contentEmpty, children: "A carregar laboratorio..." }) : null, !isLoading && loadError ? _jsx("p", { className: contentEmpty, children: loadError }) : null, !isLoading && !loadError ? (_jsxs("div", { className: "mt-10", children: [_jsx("h2", { className: "mb-4 text-2xl font-semibold text-slate-900", children: hasSearch ? 'Clubes encontrados' : 'Clubes ativos' }), filteredClubs.length === 0 ? (_jsx("p", { className: contentEmpty, children: "Ainda nao existem clubes ativos para mostrar." })) : (_jsx("div", { className: labResearchGrid, children: filteredClubs.map((club) => (_jsxs("article", { className: labResearchSubcard, children: [club.image ? (_jsx("img", { src: resolveInfoCulturaAssetUrl(club.image), alt: club.name, className: "mb-4 h-40 w-full rounded-xl object-cover" })) : null, _jsx("h3", { className: labResearchSubtitle, children: club.name }), _jsx("p", { className: labResearchSubtext, children: club.mission ||
                                                        club.description ||
                                                        'Clube cultural disponivel no laboratorio.' }), _jsx(Link, { to: getClubHref(club), className: labResearchLink, children: "Ver mais" })] }, club.id))) }))] })) : null, !isLoading && !loadError && hasSearch ? (_jsxs("div", { className: "mt-10 space-y-10", children: [totalResults === 0 ? (_jsx("p", { className: contentEmpty, children: "Nao existem resultados para a pesquisa atual." })) : null, filteredNews.length > 0 ? (_jsxs("section", { children: [_jsx("h2", { className: "mb-4 text-2xl font-semibold text-slate-900", children: "Noticias" }), _jsx("div", { className: "grid gap-6 md:grid-cols-2 xl:grid-cols-3", children: filteredNews.slice(0, 6).map((item) => (_jsx(ResultCard, { title: item.title, meta: item.club_name, description: item.summary, href: `/laboratorio-cultural/noticias/${item.id}`, image: item.image, status: item.news_status_name }, `news-${item.id}`))) })] })) : null, filteredEvents.length > 0 ? (_jsxs("section", { children: [_jsx("h2", { className: "mb-4 text-2xl font-semibold text-slate-900", children: "Eventos" }), _jsx("div", { className: "grid gap-6 md:grid-cols-2 xl:grid-cols-3", children: filteredEvents.slice(0, 6).map((item) => (_jsx(ResultCard, { title: item.title, meta: getClubNameById(clubs, item.club_id), description: item.description, href: `/laboratorio-cultural/eventos/${item.id}`, image: item.image, status: item.status }, `event-${item.id}`))) })] })) : null, filteredSessions.length > 0 ? (_jsxs("section", { children: [_jsx("h2", { className: "mb-4 text-2xl font-semibold text-slate-900", children: "Sessoes" }), _jsx("div", { className: "grid gap-6 md:grid-cols-2 xl:grid-cols-3", children: filteredSessions.slice(0, 6).map((item) => (_jsx(ResultCard, { title: item.title, meta: item.club_name, description: item.description, href: `/laboratorio-cultural/sessoes/${item.id}`, status: item.name }, `session-${item.id}`))) })] })) : null, _jsx(BestBooksSection, { books: filteredBooks, locale: locale, title: getLocaleText(locale, 'Livros', 'Books'), description: getLocaleText(locale, 'Livros filtrados pela pesquisa atual.', 'Books filtered by the current search.'), detailBaseHref: "/laboratorio-cultural/livros", limit: 6 })] })) : null, !isLoading && !loadError && !hasSearch ? (_jsxs("div", { className: "mt-10 space-y-10", children: [homepageStyleNews.length > 0 || homepageStyleEvents.length > 0 ? (_jsx("section", { className: "mt-12 bg-white lg:mt-16 xl:mt-20", children: _jsxs("div", { className: "mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 lg:grid-cols-2", children: [_jsx(NewsHighlightsSection, { title: "Not\u00EDcias", viewAllHref: "/vida-academica/noticias", viewAllInternal: true, items: homepageStyleNews, className: "w-full" }), _jsx(NewsHighlightsSection, { title: "Eventos", viewAllHref: "/vida-academica/eventos", viewAllInternal: true, items: homepageStyleEvents, className: "w-full" })] }) })) : null, _jsx(BestBooksSection, { books: books, locale: locale, title: getLocaleText(locale, 'Livros em destaque', 'Featured books'), description: getLocaleText(locale, 'Alguns dos livros mais relevantes do Laboratório Cultural.', 'Some of the most relevant books from the Cultural Lab.'), viewAllHref: "/laboratorio-cultural", viewAllLabel: getLocaleText(locale, 'Ver laboratório', 'View lab'), detailBaseHref: "/laboratorio-cultural/livros", limit: 6 }), filteredSessions.length > 0 ? (_jsxs("section", { children: [_jsx("h2", { className: "mb-4 text-2xl font-semibold text-slate-900", children: "Sessoes" }), _jsx("div", { className: "grid gap-6 md:grid-cols-2 xl:grid-cols-3", children: filteredSessions.slice(0, 6).map((item) => (_jsx(ResultCard, { title: item.title, meta: item.club_name, description: item.description, href: `/laboratorio-cultural/sessoes/${item.id}`, status: item.name }, `session-overview-${item.id}`))) })] })) : null] })) : null, !isLoading && !loadError ? (_jsx("div", { className: "mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6", children: _jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-semibold text-slate-900", children: "Explorar agenda" }), _jsx("p", { className: "mt-2 text-sm leading-6 text-slate-600", children: "V\u00EA todos os eventos numa p\u00E1gina pr\u00F3pria com filtros e uma leitura geral por calend\u00E1rio." })] }), _jsx(Link, { to: "/laboratorio-cultural/agenda", className: adminBtnSecondary, children: "Ver agenda completa" })] }) })) : null] }) }) }), _jsx(Footer, {})] }));
}
export default LaboratorioCultural;
