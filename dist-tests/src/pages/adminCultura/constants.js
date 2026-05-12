export const TOKEN_KEY = 'ispgaya_cultura_token';
export const NOTIFICATION_READ_KEY = 'ispgaya_cultura_notifications_read';
export const REGISTRATION_PAGE_SIZE = 10;
export const NEWS_PAGE_SIZE = 8;
export const ACTIVITY_PAGE_SIZE = 8;
export const NEWS_WORKFLOW_ORDER = ['draft', 'review', 'published', 'archived'];
export const EVENT_WORKFLOW_ORDER = ['draft', 'review', 'published', 'archived'];
export const WORKFLOW_LABELS = {
    draft: 'Rascunho',
    review: 'Em revisao',
    published: 'Publicado',
    archived: 'Arquivado',
    rascunho: 'Rascunho',
    publicado: 'Publicado'
};
export const initialContentForm = {
    area: 'tuna',
    title: '',
    description: '',
    date: '',
    status: 'rascunho'
};
export const initialUserForm = {
    name: '',
    email: '',
    role: 'club_admin',
    password: ''
};
export const initialClubForm = {
    name: '',
    description: '',
    mission: '',
    image: '',
    is_active: true,
    enable_registrations: false
};
export const initialNewsForm = {
    title: '',
    summary: '',
    image: '',
    content: '',
    news_status: 'draft',
    published_at: '',
    club_id: ''
};
export const initialBookForm = {
    title: '',
    author: '',
    publisher: '',
    publication_year: '',
    cover_image: '',
    summary: '',
    is_featured: false,
    club_id: ''
};
export const initialSessionForm = {
    name: '',
    title: '',
    description: '',
    session_date: '',
    start_date: '',
    end_date: '',
    enable_registrations: false,
    registration_capacity: '',
    club_id: ''
};
export const initialEventForm = {
    title: '',
    description: '',
    event_date: '',
    start_date: '',
    end_date: '',
    image: '',
    is_external: false,
    enable_registrations: false,
    registration_capacity: '',
    status: 'draft',
    city: '',
    location: '',
    club_id: '',
    category_ids: []
};
export const initialCategoryForm = {
    name: '',
    description: ''
};
export const activitySectionByTab = {
    books: 'livros',
    sessions: 'sessoes',
    events: 'eventos'
};
export const activityTabBySection = {
    livros: 'books',
    sessoes: 'sessions',
    eventos: 'events'
};
export const allActivityTabs = ['books', 'sessions', 'events'];
export const adminSections = [
    { id: 'resumo', label: 'Resumo', href: '/infocultura/resumo' },
    { id: 'notificacoes', label: 'Notificacoes', href: '/infocultura/notificacoes' },
    { id: 'newsletters', label: 'Newsletters', href: '/infocultura/newsletters' },
    { id: 'utilizadores', label: 'Utilizadores', href: '/infocultura/utilizadores' },
    { id: 'noticias', label: 'Noticias', href: '/infocultura/noticias' },
    { id: 'livros', label: 'Livros', href: '/infocultura/livros' },
    { id: 'sessoes', label: 'Sessoes', href: '/infocultura/sessoes' },
    { id: 'eventos', label: 'Eventos', href: '/infocultura/eventos' },
    { id: 'conteudos', label: 'Conteudos', href: '/infocultura/conteudos' },
    { id: 'inscricoes', label: 'Inscricoes', href: '/infocultura/inscricoes' },
    { id: 'clubes', label: 'Clubes', href: '/infocultura/clubes' }
];
export const adminSectionGroups = [
    { title: 'Painel', ids: ['resumo', 'notificacoes'] },
    { title: 'Gestao', ids: ['newsletters', 'utilizadores', 'clubes', 'inscricoes'] },
    { title: 'Conteudos', ids: ['noticias', 'livros', 'sessoes', 'eventos', 'conteudos'] }
];
