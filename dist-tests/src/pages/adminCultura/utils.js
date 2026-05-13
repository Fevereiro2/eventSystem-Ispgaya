import { activitySectionByTab, allActivityTabs, NOTIFICATION_READ_KEY, WORKFLOW_LABELS } from './constants.js';
export function getDefaultActivityOrdering(tab) {
    if (tab === 'books')
        return 'featured';
    if (tab === 'sessions')
        return 'date_asc';
    return 'date_asc';
}
export function normalizeWorkflowStatus(value) {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'rascunho')
        return 'draft';
    if (normalized === 'publicado')
        return 'published';
    return normalized;
}
export function getWorkflowStatusLabel(value) {
    return WORKFLOW_LABELS[normalizeWorkflowStatus(value)] || value;
}
export function getWorkflowStatusOptions(order, currentValue) {
    const normalizedCurrent = normalizeWorkflowStatus(currentValue || '');
    const nextValues = [...order];
    if (normalizedCurrent && !nextValues.includes(normalizedCurrent)) {
        nextValues.push(normalizedCurrent);
    }
    return nextValues;
}
export function downloadBlobFile(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}
export function escapeCsvValue(value) {
    const text = value === null || value === undefined ? '' : String(value);
    if (/[",\n;]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
}
export function getStoredReadNotificationIds() {
    if (typeof window === 'undefined')
        return [];
    try {
        const raw = window.localStorage.getItem(NOTIFICATION_READ_KEY);
        if (!raw)
            return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed))
            return [];
        return parsed.filter((value) => typeof value === 'string');
    }
    catch {
        return [];
    }
}
export function isWithinDateRange(value, fromDate, toDate) {
    const target = value ? value.slice(0, 10) : '';
    if (fromDate && (!target || target < fromDate)) {
        return false;
    }
    if (toDate && (!target || target > toDate)) {
        return false;
    }
    return true;
}
export function normalizeClubName(value) {
    return (value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
}
export function getAllowedActivityTabs(user) {
    if (!user)
        return allActivityTabs;
    if (user.role === 'superadmin')
        return allActivityTabs;
    const clubName = normalizeClubName(user.club_name);
    if (clubName.includes('teatro')) {
        return ['sessions', 'events'];
    }
    if (clubName.includes('tuna')) {
        return ['sessions', 'events'];
    }
    if (clubName.includes('leitura')) {
        return allActivityTabs;
    }
    return allActivityTabs;
}
export function getDefaultActivityTab(user) {
    return getAllowedActivityTabs(user)[0] || 'sessions';
}
export function getNewsSubpage(pathname) {
    if (pathname === '/infocultura/noticias/nova')
        return 'form';
    if (pathname === '/infocultura/noticias/registadas')
        return 'list';
    return null;
}
export function getActivitySubpage(pathname) {
    if (pathname.endsWith('/novo'))
        return 'form';
    if (pathname.endsWith('/registados'))
        return 'list';
    if (pathname.endsWith('/categorias'))
        return 'categories';
    return null;
}
export function getContentSubpage(pathname) {
    if (pathname === '/infocultura/conteudos/novo')
        return 'form';
    if (pathname === '/infocultura/conteudos/registados')
        return 'list';
    return null;
}
export function getNewsRoute(page) {
    return page === 'form' ? '/infocultura/noticias/nova' : '/infocultura/noticias/registadas';
}
export function getActivityRoute(tab, page) {
    if (page === 'categories') {
        return '/infocultura/eventos/categorias';
    }
    return `/infocultura/${activitySectionByTab[tab]}/${page === 'form' ? 'novo' : 'registados'}`;
}
export function getContentRoute(page) {
    return page === 'form' ? '/infocultura/conteudos/novo' : '/infocultura/conteudos/registados';
}
export function getAdminSectionHref(section) {
    switch (section) {
        case 'resumo':
            return '/infocultura/resumo';
        case 'metricas':
            return '/infocultura/metricas';
        case 'notificacoes':
            return '/infocultura/notificacoes';
        case 'newsletters':
            return '/infocultura/newsletters';
        case 'utilizadores':
            return '/infocultura/utilizadores';
        case 'conteudos':
            return '/infocultura/conteudos';
        case 'noticias':
            return '/infocultura/noticias';
        case 'livros':
            return '/infocultura/livros';
        case 'sessoes':
            return '/infocultura/sessoes';
        case 'eventos':
            return '/infocultura/eventos';
        case 'atividades':
            return '/infocultura/atividades';
        case 'inscricoes':
            return '/infocultura/inscricoes';
        case 'clubes':
            return '/infocultura/clubes';
    }
}
export function isActivitySection(section) {
    return section === 'livros' || section === 'sessoes' || section === 'eventos' || section === 'atividades';
}
export function getAdminSection(pathname) {
    if (pathname === '/infocultura' || pathname === '/infocultura/' || pathname === '/infocultura/resumo') {
        return 'resumo';
    }
    if (pathname === '/infocultura/metricas' || pathname.startsWith('/infocultura/metricas/')) {
        return 'metricas';
    }
    if (pathname === '/infocultura/utilizadores' ||
        pathname.startsWith('/infocultura/utilizadores/')) {
        return 'utilizadores';
    }
    if (pathname === '/infocultura/conteudos' || pathname.startsWith('/infocultura/conteudos/')) {
        return 'conteudos';
    }
    if (pathname === '/infocultura/noticias' || pathname.startsWith('/infocultura/noticias/')) {
        return 'noticias';
    }
    if (pathname === '/infocultura/notificacoes') {
        return 'notificacoes';
    }
    if (pathname === '/infocultura/newsletters' || pathname.startsWith('/infocultura/newsletters/')) {
        return 'newsletters';
    }
    if (pathname === '/infocultura/livros' || pathname.startsWith('/infocultura/livros/')) {
        return 'livros';
    }
    if (pathname === '/infocultura/sessoes' || pathname.startsWith('/infocultura/sessoes/')) {
        return 'sessoes';
    }
    if (pathname === '/infocultura/eventos' || pathname.startsWith('/infocultura/eventos/')) {
        return 'eventos';
    }
    if (pathname === '/infocultura/atividades') {
        return 'atividades';
    }
    if (pathname === '/infocultura/inscricoes') {
        return 'inscricoes';
    }
    if (pathname === '/infocultura/clubes') {
        return 'clubes';
    }
    return null;
}
export function getUserPage(pathname) {
    if (pathname === '/infocultura/utilizadores') {
        return { mode: 'list' };
    }
    if (pathname === '/infocultura/utilizadores/novo') {
        return { mode: 'create' };
    }
    const editMatch = pathname.match(/^\/infocultura\/utilizadores\/(\d+)\/editar\/?$/);
    if (editMatch) {
        return { mode: 'edit', userId: Number(editMatch[1]) };
    }
    const deactivateMatch = pathname.match(/^\/infocultura\/utilizadores\/(\d+)\/desativar\/?$/);
    if (deactivateMatch) {
        return { mode: 'deactivate', userId: Number(deactivateMatch[1]) };
    }
    return null;
}
export function sortUsers(list) {
    return [...list].sort((a, b) => {
        if (a.is_active !== b.is_active) {
            return a.is_active ? -1 : 1;
        }
        return a.name.localeCompare(b.name) || a.email.localeCompare(b.email);
    });
}
export function sortUsersByOrder(list, ordering) {
    const sorted = [...list];
    switch (ordering) {
        case 'newest':
            return sorted.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
        case 'oldest':
            return sorted.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
        case 'name_desc':
            return sorted.sort((a, b) => b.name.localeCompare(a.name) || b.email.localeCompare(a.email));
        case 'email_asc':
            return sorted.sort((a, b) => a.email.localeCompare(b.email) || a.name.localeCompare(b.name));
        case 'email_desc':
            return sorted.sort((a, b) => b.email.localeCompare(a.email) || b.name.localeCompare(a.name));
        case 'name_asc':
            return sorted.sort((a, b) => a.name.localeCompare(b.name) || a.email.localeCompare(b.email));
        default:
            return sortUsers(sorted);
    }
}
export function sortClubs(list) {
    return [...list].sort((a, b) => {
        if (a.is_active !== b.is_active) {
            return a.is_active ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
    });
}
export function sortClubsByOrder(list, ordering) {
    const sorted = [...list];
    switch (ordering) {
        case 'newest':
            return sorted.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
        case 'oldest':
            return sorted.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
        case 'name_desc':
            return sorted.sort((a, b) => b.name.localeCompare(a.name));
        case 'registrations_open':
            return sorted.sort((a, b) => Number(Boolean(b.enable_registrations)) - Number(Boolean(a.enable_registrations)) ||
                a.name.localeCompare(b.name));
        case 'name_asc':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        default:
            return sortClubs(sorted);
    }
}
export function formatAdminDateTime(value) {
    if (!value)
        return 'Sem data';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return new Intl.DateTimeFormat('pt-PT', {
        dateStyle: 'short',
        timeStyle: 'short'
    }).format(date);
}
export function toDateInputValue(value) {
    if (!value)
        return '';
    return value.slice(0, 10);
}
export function toDateTimeLocalValue(value) {
    if (!value)
        return '';
    return value.slice(0, 16);
}
