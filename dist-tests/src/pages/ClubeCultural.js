import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ClubRegistrationModal from '../components/ui/ClubRegistrationModal';
import Footer from '../components/layout/Footer';
import HeaderNav from '../components/layout/HeaderNav';
import TopBar from '../components/layout/TopBar';
import { createClubRegistration, fetchPublicBooks, fetchPublicClub, fetchPublicClubs, fetchPublicCategories, fetchPublicEvents, fetchPublicNews, fetchPublicSessions, resolveInfoCulturaAssetUrl } from '../api/infoculturaApi';
import { adminBtnPrimary, adminBtnSecondary, adminField, adminFormGridSpaced, adminInput, adminLabel, blockTitle, container, contentCard, contentEmpty, contentItemCard, contentItemDate, contentItemDesc, contentItemHeader, contentItemStatus, contentItemTitle, contentItems, contentSection, mainContent } from '../styles/ui';
function normalizeLabel(value) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}
function matchesClubTerms(name, terms) {
    const label = normalizeLabel(name);
    return terms.some((term) => label.includes(normalizeLabel(term)));
}
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
function isOnOrAfterDate(value, fromDate) {
    if (!fromDate || !value)
        return true;
    return value.slice(0, 10) >= fromDate;
}
function ClubeCultural({ pageTitle, pageDescription, routePath, clubSearchTerms }) {
    const { clubId } = useParams();
    const [club, setClub] = useState(null);
    const [newsItems, setNewsItems] = useState([]);
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [events, setEvents] = useState([]);
    const [fromDate, setFromDate] = useState('');
    const [featuredOnly, setFeaturedOnly] = useState(false);
    const [eventCategoryFilter, setEventCategoryFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
    const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false);
    const [registrationError, setRegistrationError] = useState('');
    const [registrationFeedback, setRegistrationFeedback] = useState('');
    useEffect(() => {
        let active = true;
        async function resolveClubId() {
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
                const [nextClub, nextNews, nextBooks, nextCategories, nextSessions, nextEvents] = await Promise.all([
                    fetchPublicClub(resolvedClubId),
                    fetchPublicNews(resolvedClubId),
                    fetchPublicBooks(resolvedClubId),
                    fetchPublicCategories(),
                    fetchPublicSessions(resolvedClubId),
                    fetchPublicEvents({ clubId: resolvedClubId })
                ]);
                if (!active)
                    return;
                setClub(nextClub);
                setNewsItems(nextNews);
                setBooks(nextBooks);
                setCategories(nextCategories);
                setSessions(nextSessions);
                setEvents(nextEvents);
            }
            catch (error) {
                if (!active)
                    return;
                const message = error instanceof Error ? error.message : 'Nao foi possivel carregar o clube.';
                setLoadError(message);
            }
            finally {
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
    const filteredNews = useMemo(() => newsItems.filter((item) => isOnOrAfterDate(item.published_at, fromDate)), [newsItems, fromDate]);
    const filteredSessions = useMemo(() => sessions.filter((item) => isOnOrAfterDate(item.session_date, fromDate)), [sessions, fromDate]);
    const filteredEvents = useMemo(() => events.filter((item) => isOnOrAfterDate(item.event_date, fromDate) &&
        (eventCategoryFilter === 'all' || item.category_ids.includes(Number(eventCategoryFilter)))), [events, fromDate, eventCategoryFilter]);
    const filteredBooks = useMemo(() => books.filter((item) => (featuredOnly ? item.is_featured : true)), [books, featuredOnly]);
    const title = pageTitle || club?.name || 'Clube Cultural';
    const description = pageDescription ||
        club?.mission ||
        club?.description ||
        'Pagina publica do clube cultural.';
    const currentHref = routePath || (clubId ? `/laboratorio-cultural/clubes/${clubId}` : '/laboratorio-cultural');
    async function handleSubmitRegistration(data) {
        if (!club)
            return;
        setIsSubmittingRegistration(true);
        setRegistrationError('');
        try {
            await createClubRegistration(club.id, data);
            setRegistrationFeedback('Inscricao enviada com sucesso. Aguarda validacao pelo clube.');
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
    return (_jsxs(_Fragment, { children: [_jsx(TopBar, {}), _jsx(HeaderNav, {}), _jsx(Breadcrumbs, { title: title, description: description, parentLabel: "Laboratorio Cultural", parentHref: "/laboratorio-cultural", currentLabel: title, currentHref: currentHref }), _jsx("main", { className: mainContent, children: _jsx("section", { className: contentSection, children: _jsx("div", { className: container, children: _jsxs("div", { className: contentCard, children: [club?.image ? (_jsx("img", { src: resolveInfoCulturaAssetUrl(club.image), alt: title, className: "mb-6 h-64 w-full rounded-2xl object-cover" })) : null, _jsx("h2", { className: blockTitle, children: title }), _jsx("div", { className: "my-8 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-8", children: _jsx("div", { className: "space-y-6", children: description
                                            .split('\n\n')
                                            .filter((para) => para.trim().length > 0)
                                            .map((para, idx) => (_jsx("p", { className: "text-base leading-relaxed text-slate-700", children: para.trim() }, idx))) }) }), !isLoading && !loadError && club?.enable_registrations ? (_jsxs("div", { className: "mb-8 flex flex-wrap items-center gap-4", children: [_jsx("button", { type: "button", className: adminBtnPrimary, onClick: () => {
                                                setRegistrationFeedback('');
                                                setRegistrationError('');
                                                setIsRegistrationModalOpen(true);
                                            }, children: "Inscrever-me neste clube" }), _jsx("p", { className: "text-sm text-slate-600", children: "O pedido sera enviado para validacao da equipa do clube." })] })) : null, registrationFeedback ? (_jsx("p", { className: "mb-8 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700", children: registrationFeedback })) : null, !isLoading && !loadError ? (_jsxs("div", { className: `${adminFormGridSpaced} mt-12`, children: [_jsxs("div", { className: adminField, children: [_jsx("label", { className: adminLabel, htmlFor: "club-filter-date", children: "Mostrar a partir de" }), _jsx("input", { id: "club-filter-date", type: "date", className: adminInput, value: fromDate, onChange: (event) => setFromDate(event.target.value) })] }), _jsxs("div", { className: adminField, children: [_jsx("label", { className: adminLabel, htmlFor: "club-filter-featured", children: "Livros em destaque" }), _jsxs("select", { id: "club-filter-featured", className: adminInput, value: featuredOnly ? 'sim' : 'todos', onChange: (event) => setFeaturedOnly(event.target.value === 'sim'), children: [_jsx("option", { value: "todos", children: "Todos" }), _jsx("option", { value: "sim", children: "Apenas destaque" })] })] }), _jsxs("div", { className: adminField, children: [_jsx("label", { className: adminLabel, htmlFor: "club-filter-category", children: "Categoria de evento" }), _jsxs("select", { id: "club-filter-category", className: adminInput, value: eventCategoryFilter, onChange: (event) => setEventCategoryFilter(event.target.value), children: [_jsx("option", { value: "all", children: "Todas" }), categories.map((category) => (_jsx("option", { value: category.id, children: category.name }, category.id)))] })] }), _jsx("div", { className: "flex items-end", children: _jsx("button", { type: "button", className: adminBtnSecondary, onClick: () => {
                                                    setFromDate('');
                                                    setFeaturedOnly(false);
                                                    setEventCategoryFilter('all');
                                                }, children: "Limpar filtros" }) })] })) : null, isLoading ? (_jsx("p", { className: contentEmpty, children: "A carregar clube..." })) : loadError ? (_jsx("p", { className: contentEmpty, children: loadError })) : (_jsxs(_Fragment, { children: [filteredNews.length === 0 &&
                                            filteredBooks.length === 0 &&
                                            filteredSessions.length === 0 &&
                                            filteredEvents.length === 0 ? (_jsx("p", { className: contentEmpty, children: "Ainda nao existem conteudos publicados para os filtros atuais." })) : null, filteredNews.length > 0 ? (_jsxs("div", { className: "mt-8", children: [_jsx("h3", { className: blockTitle, children: "Noticias" }), _jsx("div", { className: contentItems, children: filteredNews.map((item) => (_jsxs("article", { className: contentItemCard, children: [item.image ? (_jsx("img", { src: resolveInfoCulturaAssetUrl(item.image), alt: item.title, className: "mb-4 h-44 w-full rounded-xl object-cover" })) : null, _jsxs("div", { className: contentItemHeader, children: [_jsx("h4", { className: contentItemTitle, children: item.title }), _jsx("span", { className: contentItemStatus, children: item.news_status_name })] }), _jsx("p", { className: contentItemDate, children: formatDate(item.published_at) }), _jsx("p", { className: contentItemDesc, children: item.summary }), _jsx(Link, { to: `/laboratorio-cultural/noticias/${item.id}`, className: adminBtnSecondary, children: "Ver detalhe" })] }, item.id))) })] })) : null, filteredSessions.length > 0 ? (_jsxs("div", { className: "mt-8", children: [_jsx("h3", { className: blockTitle, children: "Sessoes" }), _jsx("div", { className: contentItems, children: filteredSessions.map((item) => (_jsxs("article", { className: contentItemCard, children: [_jsxs("div", { className: contentItemHeader, children: [_jsx("h4", { className: contentItemTitle, children: item.title }), _jsx("span", { className: contentItemStatus, children: item.name })] }), _jsxs("p", { className: contentItemDate, children: [formatDate(item.session_date), " \u00B7 ", formatDate(item.start_date)] }), _jsx("p", { className: contentItemDesc, children: item.description }), _jsx(Link, { to: `/laboratorio-cultural/sessoes/${item.id}`, className: adminBtnSecondary, children: "Ver detalhe" })] }, item.id))) })] })) : null, filteredEvents.length > 0 ? (_jsxs("div", { className: "mt-8", children: [_jsx("h3", { className: blockTitle, children: "Eventos" }), _jsx("div", { className: contentItems, children: filteredEvents.map((item) => (_jsxs("article", { className: contentItemCard, children: [item.image ? (_jsx("img", { src: resolveInfoCulturaAssetUrl(item.image), alt: item.title, className: "mb-4 h-44 w-full rounded-xl object-cover" })) : null, _jsxs("div", { className: contentItemHeader, children: [_jsx("h4", { className: contentItemTitle, children: item.title }), _jsx("span", { className: contentItemStatus, children: item.status })] }), _jsxs("p", { className: contentItemDate, children: [formatDate(item.event_date), " \u00B7", ' ', item.location || item.city || 'Local por definir'] }), _jsx("p", { className: contentItemDesc, children: item.description }), item.categories.length > 0 ? (_jsx("p", { className: contentItemDate, children: item.categories.map((category) => category.name).join(', ') })) : null, _jsx(Link, { to: `/laboratorio-cultural/eventos/${item.id}`, className: adminBtnSecondary, children: "Ver detalhe" })] }, item.id))) })] })) : null, filteredBooks.length > 0 ? (_jsxs("div", { className: "mt-8", children: [_jsx("h3", { className: blockTitle, children: "Livros" }), _jsx("div", { className: contentItems, children: filteredBooks.map((item) => (_jsxs("article", { className: contentItemCard, children: [item.cover_image ? (_jsx("img", { src: resolveInfoCulturaAssetUrl(item.cover_image), alt: item.title, className: "mb-4 h-44 w-full rounded-xl object-cover" })) : null, _jsxs("div", { className: contentItemHeader, children: [_jsx("h4", { className: contentItemTitle, children: item.title }), _jsx("span", { className: contentItemStatus, children: item.is_featured ? 'Destaque' : 'Livro' })] }), _jsxs("p", { className: contentItemDate, children: [item.author, " \u00B7 ", item.publication_year] }), _jsx("p", { className: contentItemDesc, children: item.summary }), _jsx(Link, { to: `/laboratorio-cultural/livros/${item.id}`, className: adminBtnSecondary, children: "Ver detalhe" })] }, item.id))) })] })) : null] }))] }) }) }) }), _jsx(ClubRegistrationModal, { clubName: title, isOpen: isRegistrationModalOpen, isSubmitting: isSubmittingRegistration, submitError: registrationError, onClose: () => {
                    if (!isSubmittingRegistration) {
                        setIsRegistrationModalOpen(false);
                        setRegistrationError('');
                    }
                }, onSubmit: handleSubmitRegistration }), _jsx(Footer, {})] }));
}
export default ClubeCultural;
