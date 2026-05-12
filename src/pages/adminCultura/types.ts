import { CulturalArea } from '../../data/culturalContent.js';

export type FormState = {
  area: CulturalArea;
  title: string;
  description: string;
  date: string;
  status: 'rascunho' | 'publicado';
};

export type UserFormState = {
  name: string;
  email: string;
  role: string;
  password: string;
};

export type ClubFormState = {
  name: string;
  description: string;
  mission: string;
  image: string;
  is_active: boolean;
  enable_registrations: boolean;
};

export type NewsFormState = {
  title: string;
  summary: string;
  image: string;
  content: string;
  news_status: string;
  published_at: string;
  club_id: string;
};

export type BookFormState = {
  title: string;
  author: string;
  publisher: string;
  publication_year: string;
  cover_image: string;
  summary: string;
  is_featured: boolean;
  club_id: string;
};

export type SessionFormState = {
  name: string;
  title: string;
  description: string;
  session_date: string;
  start_date: string;
  end_date: string;
  enable_registrations: boolean;
  registration_capacity: string;
  club_id: string;
};

export type EventFormState = {
  title: string;
  description: string;
  event_date: string;
  start_date: string;
  end_date: string;
  image: string;
  is_external: boolean;
  enable_registrations: boolean;
  registration_capacity: string;
  status: string;
  city: string;
  location: string;
  club_id: string;
  category_ids: string[];
};

export type CategoryFormState = {
  name: string;
  description: string;
};

export type ActivityTab = 'books' | 'sessions' | 'events';
export type ActivitySection = 'livros' | 'sessoes' | 'eventos';

export type AdminSection =
  | 'resumo'
  | 'notificacoes'
  | 'newsletters'
  | 'utilizadores'
  | 'conteudos'
  | 'noticias'
  | 'livros'
  | 'sessoes'
  | 'eventos'
  | 'atividades'
  | 'clubes'
  | 'inscricoes';

export type UserPage =
  | { mode: 'list' }
  | { mode: 'create' }
  | { mode: 'edit'; userId: number }
  | { mode: 'deactivate'; userId: number };

export type NewsSubpage = 'form' | 'list';
export type ActivitySubpage = 'form' | 'list' | 'categories';
export type ContentSubpage = 'form' | 'list';

export type AdminContextLink = {
  label: string;
  href: string;
};
