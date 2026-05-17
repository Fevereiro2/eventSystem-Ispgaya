import { CulturalArea, CulturalItem } from '../data/culturalContent.js';

export type { CulturalArea, CulturalItem };

export type InfoCulturaUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  club_id?: number | null;
  club_name?: string | null;
  created_at?: string | null;
};

export type InfoCulturaRole = {
  id: number;
  name: string;
  description?: string | null;
};

export type InfoCulturaClub = {
  id: number;
  name: string;
  description: string;
  mission: string;
  image?: string;
  is_active: boolean;
  enable_registrations?: boolean | null;
  created_at: string;
};

export type InfoCulturaCategory = {
  id: number;
  name: string;
  description: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type InfoCulturaNewsStatus = {
  id: number;
  name: string;
  description: string;
};

export type InfoCulturaEditorialHistory = {
  content_type: string;
  object_id: number;
  from_status?: string | null;
  to_status: string;
  actor_user_id?: number | null;
  actor_name: string;
  created_at?: string | null;
};

export type InfoCulturaNews = {
  id: number;
  title: string;
  summary: string;
  image: string;
  content: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  news_status_id: number;
  news_status_name: string;
  club_id: number;
  club_name: string;
  editorial_history?: InfoCulturaEditorialHistory[];
};

export type InfoCulturaNewsletter = {
  id: number;
  title: string;
  subject: string;
  content: string;
  status: string;
  sent_at: string | null;
  created_at: string;
  user_id: number | null;
  user_name: string | null;
};

export type InfoCulturaNewsletterSubscriber = {
  id: number;
  email: string;
  is_active: boolean;
  subscribed_at: string;
};

export type InfoCulturaBook = {
  id: number;
  title: string;
  author: string;
  publisher: string;
  publication_year: number;
  cover_image: string;
  summary: string;
  is_featured: boolean;
  created_at: string | null;
  club_id: number;
  club_name: string;
};

export type InfoCulturaSession = {
  id: number;
  name: string;
  title: string;
  description: string;
  session_date: string;
  start_date: string;
  end_date: string;
  enable_registrations: boolean;
  registration_capacity?: number | null;
  created_at: string | null;
  updated_at: string | null;
  club_id: number;
  club_name: string;
  confirmed_registrations: number;
  waitlist_registrations: number;
  remaining_slots?: number | null;
  registration_state: 'open' | 'waitlist' | 'closed';
  google_calendar_url: string;
  outlook_calendar_url: string;
};

export type InfoCulturaEvent = {
  id: number;
  title: string;
  description: string;
  event_date: string;
  start_date: string;
  end_date: string;
  image: string;
  is_external: boolean;
  enable_registrations: boolean;
  registration_capacity?: number | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  city: string;
  location: string;
  user_id: number;
  club_id?: number | null;
  club_name?: string | null;
  owner_name?: string | null;
  categories: InfoCulturaCategory[];
  category_ids: number[];
  confirmed_registrations: number;
  waitlist_registrations: number;
  remaining_slots?: number | null;
  registration_state: 'open' | 'waitlist' | 'closed';
  google_calendar_url: string;
  outlook_calendar_url: string;
  editorial_history?: InfoCulturaEditorialHistory[];
};

export type InfoCulturaRegistrationStatus = {
  id: number;
  name: string;
  description: string;
};

export type InfoCulturaRegistration = {
  id: number;
  club_id: number;
  club_name: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  status: string;
  created_at: string | null;
};

export type InfoCulturaDashboardRecord = {
  id: number;
  title: string;
  club_name?: string | null;
  date?: string | null;
  status?: string | null;
};

export type InfoCulturaDashboardStats = {
  scope_label: string;
  users_total: number;
  active_users: number;
  clubs_total: number;
  active_clubs: number;
  clubs_with_registrations_open: number;
  news_total: number;
  news_draft: number;
  news_review: number;
  news_published: number;
  books_total: number;
  featured_books: number;
  sessions_total: number;
  upcoming_sessions: number;
  events_total: number;
  events_draft: number;
  events_review: number;
  events_published: number;
  registrations_total: number;
  registrations_pending: number;
  registrations_approved: number;
  registrations_rejected: number;
  latest_news?: InfoCulturaDashboardRecord | null;
  next_session?: InfoCulturaDashboardRecord | null;
  next_event?: InfoCulturaDashboardRecord | null;
};

export type InfoCulturaMetricSeriesPoint = {
  label: string;
  value: number;
  period_start: string | null;
  period_end: string | null;
};

export type InfoCulturaMetricTopPage = {
  title: string;
  page_path: string;
  section: string;
  views: number;
  unique_visitors: number;
  last_viewed_at: string | null;
};

export type InfoCulturaMetricSectionBreakdown = {
  section: string;
  views: number;
};

export type InfoCulturaMetricsOverview = {
  period: string;
  total_views: number;
  unique_pages: number;
  unique_visitors: number;
  clubs_created: number;
  news_created: number;
  top_pages: InfoCulturaMetricTopPage[];
  section_breakdown: InfoCulturaMetricSectionBreakdown[];
  series: InfoCulturaMetricSeriesPoint[];
};

export type InfoCulturaAdminNotification = {
  id: string;
  kind: string;
  level: 'warning' | 'info' | 'success' | string;
  title: string;
  message: string;
  href: string;
  created_at?: string | null;
};

export type InfoCulturaActivityLog = {
  source: 'audit' | 'editorial' | string;
  action: string;
  content_type: string;
  object_id: number | null;
  summary: string;
  actor_user_id: number | null;
  actor_name: string;
  club_id: number | null;
  metadata_json: string | null;
  created_at: string | null;
};

export type UniversitySearchResult = {
  name: string;
  country: string;
  domains: string[];
  web_pages: string[];
};

export type InfoCulturaRegistrationPage = {
  items: InfoCulturaRegistration[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type InfoCulturaAdminCollectionPage<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type UserPayload = {
  name: string;
  email: string;
  role: string;
  password?: string;
  generate_password?: boolean;
  is_active?: boolean;
};

export type ClubPayload = {
  name: string;
  description: string;
  mission?: string;
  image?: string;
  is_active?: boolean;
  enable_registrations?: boolean;
};

export type NewsPayload = {
  title: string;
  summary: string;
  image: string;
  content: string;
  news_status: string;
  published_at?: string | null;
  club_id?: number;
};

export type NewsletterPayload = {
  title: string;
  subject: string;
  content: string;
  status: string;
  sent_at?: string | null;
};

export type NewsletterSubscriberPayload = {
  email: string;
  is_active: boolean;
};

export type MetricViewPayload = {
  kind?: string;
  section: string;
  content_type?: string;
  object_id?: number | null;
  title: string;
  page_path: string;
  locale?: string;
  referrer?: string;
  user_agent?: string;
  visitor_key?: string;
  club_id?: number | null;
};

export type BookPayload = {
  title: string;
  author: string;
  publisher: string;
  publication_year: number;
  cover_image: string;
  summary: string;
  is_featured: boolean;
  created_at?: string | null;
  club_id?: number;
};

export type SessionPayload = {
  name: string;
  title: string;
  description: string;
  session_date: string;
  start_date: string;
  end_date: string;
  enable_registrations?: boolean;
  registration_capacity?: number | null;
  club_id?: number;
};

export type EventPayload = {
  title: string;
  description: string;
  event_date: string;
  start_date: string;
  end_date: string;
  image: string;
  is_external: boolean;
  enable_registrations?: boolean;
  registration_capacity?: number | null;
  status: string;
  city: string;
  location: string;
  club_id?: number;
  category_ids?: number[];
};

export type CategoryPayload = {
  name: string;
  description: string;
};

export type ClubRegistrationPayload = {
  name: string;
  email: string;
  phone?: string;
  message?: string;
};

export type ContentPayload = {
  area: CulturalArea;
  title: string;
  description: string;
  date: string;
  status: 'rascunho' | 'publicado';
};
