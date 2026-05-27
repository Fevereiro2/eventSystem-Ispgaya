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
  club_id: string;
  password: string;
  generate_password: boolean;
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
  available_at: string;
  club_id: string;
};

export type SessionFormState = {
  name: string;
  title: string;
  description: string;
  session_date: string;
  start_date: string;
  end_date: string;
  available_at: string;
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
  publish_at: string;
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
  | 'metricas'
  | 'logs'
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
  | { mode: 'profile'; userId: number }
  | { mode: 'edit'; userId: number }
  | { mode: 'deactivate'; userId: number };

export type NewsSubpage = 'form' | 'list';
export type ActivitySubpage = 'form' | 'list' | 'categories';
export type ContentSubpage = 'form' | 'list';

export type AdminContextLink = {
  label: string;
  href: string;
};
