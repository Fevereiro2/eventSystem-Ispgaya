import {
  ActivitySection,
  ActivityTab,
  AdminSection,
  BookFormState,
  CategoryFormState,
  ClubFormState,
  EventFormState,
  FormState,
  NewsFormState,
  SessionFormState,
  UserFormState
} from './types';

export const TOKEN_KEY = 'ispgaya_cultura_token';
export const NOTIFICATION_READ_KEY = 'ispgaya_cultura_notifications_read';
export const REGISTRATION_PAGE_SIZE = 10;
export const NEWS_PAGE_SIZE = 8;
export const ACTIVITY_PAGE_SIZE = 8;
export const NEWS_WORKFLOW_ORDER = ['draft', 'review', 'published', 'archived'];
export const EVENT_WORKFLOW_ORDER = ['draft', 'review', 'published', 'archived'];

export const WORKFLOW_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  review: 'Em revisao',
  published: 'Publicado',
  archived: 'Arquivado',
  rascunho: 'Rascunho',
  publicado: 'Publicado'
};

export const initialContentForm: FormState = {
  area: 'tuna',
  title: '',
  description: '',
  date: '',
  status: 'rascunho'
};

export const initialUserForm: UserFormState = {
  name: '',
  email: '',
  role: 'club_admin',
  password: ''
};

export const initialClubForm: ClubFormState = {
  name: '',
  description: '',
  mission: '',
  image: '',
  is_active: true,
  enable_registrations: false
};

export const initialNewsForm: NewsFormState = {
  title: '',
  summary: '',
  image: '',
  content: '',
  news_status: 'draft',
  published_at: '',
  club_id: ''
};

export const initialBookForm: BookFormState = {
  title: '',
  author: '',
  publisher: '',
  publication_year: '',
  cover_image: '',
  summary: '',
  is_featured: false,
  club_id: ''
};

export const initialSessionForm: SessionFormState = {
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

export const initialEventForm: EventFormState = {
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

export const initialCategoryForm: CategoryFormState = {
  name: '',
  description: ''
};

export const activitySectionByTab: Record<ActivityTab, ActivitySection> = {
  books: 'livros',
  sessions: 'sessoes',
  events: 'eventos'
};

export const activityTabBySection: Record<ActivitySection, ActivityTab> = {
  livros: 'books',
  sessoes: 'sessions',
  eventos: 'events'
};

export const allActivityTabs: ActivityTab[] = ['books', 'sessions', 'events'];

export const adminSections: { id: AdminSection; label: string; href: string }[] = [
  { id: 'resumo', label: 'Resumo', href: '/infocultura/resumo' },
  { id: 'notificacoes', label: 'Notificacoes', href: '/infocultura/notificacoes' },
  { id: 'utilizadores', label: 'Utilizadores', href: '/infocultura/utilizadores' },
  { id: 'noticias', label: 'Noticias', href: '/infocultura/noticias' },
  { id: 'livros', label: 'Livros', href: '/infocultura/livros' },
  { id: 'sessoes', label: 'Sessoes', href: '/infocultura/sessoes' },
  { id: 'eventos', label: 'Eventos', href: '/infocultura/eventos' },
  { id: 'conteudos', label: 'Conteudos', href: '/infocultura/conteudos' },
  { id: 'inscricoes', label: 'Inscricoes', href: '/infocultura/inscricoes' },
  { id: 'clubes', label: 'Clubes', href: '/infocultura/clubes' }
];

export const adminSectionGroups: {
  title: string;
  ids: AdminSection[];
}[] = [
  { title: 'Painel', ids: ['resumo', 'notificacoes'] },
  { title: 'Gestao', ids: ['utilizadores', 'clubes', 'inscricoes'] },
  { title: 'Conteudos', ids: ['noticias', 'livros', 'sessoes', 'eventos', 'conteudos'] }
];
