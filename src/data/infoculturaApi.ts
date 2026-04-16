import { CulturalArea, CulturalItem } from './culturalContent';

const API_BASE = (
  import.meta.env.VITE_INFOCULTURA_API || 'http://127.0.0.1:8001/api'
).replace(/\/$/, '');
const ACCESS_TOKEN_STORAGE_KEY = 'ispgaya_cultura_token';

type ContentPayload = {
  area: CulturalArea;
  title: string;
  description: string;
  date: string;
  status: 'rascunho' | 'publicado';
};

type ApiListResponse = {
  items: CulturalItem[];
};

type ApiItemResponse = {
  item: CulturalItem;
};

type ApiLoginResponse = {
  token: string;
  user: InfoCulturaUser;
};

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

export type InfoCulturaEditorialHistory = {
  content_type: string;
  object_id: number;
  from_status?: string | null;
  to_status: string;
  actor_user_id?: number | null;
  actor_name: string;
  created_at?: string | null;
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

export type InfoCulturaAdminNotification = {
  id: string;
  kind: string;
  level: 'warning' | 'info' | 'success' | string;
  title: string;
  message: string;
  href: string;
  created_at?: string | null;
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

export type BookPayload = {
  title: string;
  author: string;
  publisher: string;
  publication_year: number;
  cover_image: string;
  summary: string;
  is_featured: boolean;
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

type ApiMeResponse = {
  user: InfoCulturaUser;
};

type ApiUserResponse = {
  user: InfoCulturaUser;
};

type ApiRegistrationResponse = {
  registration: InfoCulturaRegistration;
};

type ApiBulkNewsResponse = {
  items: InfoCulturaNews[];
  updated: number;
};

type ApiBulkEventResponse = {
  items: InfoCulturaEvent[];
  updated: number;
};

type ApiBulkRegistrationResponse = {
  items: InfoCulturaRegistration[];
  updated: number;
};

type ApiBulkDeleteResponse = {
  deleted: number;
};

type ApiImageUploadResponse = {
  path: string;
};

type ApiPublicRegistrationResponse = {
  message: string;
  status: string;
  registration_id: number;
};

export class InfoCulturaApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'InfoCulturaApiError';
    this.status = status;
  }
}

function extractApiErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;

  const typedBody = body as Record<string, unknown>;

  if (typeof typedBody.message === 'string' && typedBody.message.trim()) {
    return typedBody.message;
  }

  const fieldMessages = Object.entries(typedBody)
    .flatMap(([field, value]) => {
      if (typeof value === 'string' && value.trim()) {
        return [`${field}: ${value}`];
      }

      if (Array.isArray(value)) {
        return value
          .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
          .map((item) =>
            field === 'non_field_errors' ? item : `${field}: ${item}`
          );
      }

      return [];
    })
    .filter(Boolean);

  return fieldMessages.length > 0 ? fieldMessages.join(' ') : null;
}

function getStoredAccessToken(): string {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || '';
}

function setStoredAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  if (token) {
    sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  } else {
    sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }
}

let refreshTokenPromise: Promise<string | null> | null = null;

async function refreshInfoCulturaToken(): Promise<string | null> {
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = (async () => {
    const response = await fetch(`${API_BASE}/auth/refresh/`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      setStoredAccessToken('');
      return null;
    }

    const body = (await response.json()) as { token?: string };
    const nextToken = body.token || '';
    setStoredAccessToken(nextToken);
    return nextToken || null;
  })();

  try {
    return await refreshTokenPromise;
  } finally {
    refreshTokenPromise = null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
  allowRefresh = true
): Promise<T> {
  const headers = new Headers(options.headers);
  const resolvedToken = getStoredAccessToken() || token;
  const isFormDataBody =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (!headers.has('Content-Type') && options.body && !isFormDataBody) {
    headers.set('Content-Type', 'application/json');
  }

  if (resolvedToken) {
    headers.set('Authorization', `Token ${resolvedToken}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  if (
    response.status === 401 &&
    allowRefresh &&
    path !== '/auth/login/' &&
    path !== '/auth/refresh/' &&
    path !== '/auth/logout/'
  ) {
    const refreshedToken = await refreshInfoCulturaToken();
    if (refreshedToken) {
      return request<T>(path, options, refreshedToken, false);
    }
  }

  if (!response.ok) {
    let message = 'Erro ao comunicar com o servidor.';

    try {
      const body = (await response.json()) as unknown;
      const extractedMessage = extractApiErrorMessage(body);
      if (extractedMessage) {
        message = extractedMessage;
      }
    } catch {
      // ignore parse errors and use default message
    }

    throw new InfoCulturaApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function requestBlob(
  path: string,
  options: RequestInit = {},
  token?: string,
  allowRefresh = true
): Promise<Blob> {
  const headers = new Headers(options.headers);
  const resolvedToken = getStoredAccessToken() || token;
  if (resolvedToken) {
    headers.set('Authorization', `Token ${resolvedToken}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  if (
    response.status === 401 &&
    allowRefresh &&
    path !== '/auth/refresh/' &&
    path !== '/auth/logout/'
  ) {
    const refreshedToken = await refreshInfoCulturaToken();
    if (refreshedToken) {
      return requestBlob(path, options, refreshedToken, false);
    }
  }

  if (!response.ok) {
    let message = 'Erro ao comunicar com o servidor.';
    try {
      const body = (await response.json()) as unknown;
      const extractedMessage = extractApiErrorMessage(body);
      if (extractedMessage) {
        message = extractedMessage;
      }
    } catch {
      // ignore
    }
    throw new InfoCulturaApiError(message, response.status);
  }

  return response.blob();
}

function getApiOrigin(): string {
  try {
    return new URL(API_BASE).origin;
  } catch {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }

    return '';
  }
}

export function resolveInfoCulturaAssetUrl(value?: string | null): string {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) {
    return `${getApiOrigin()}${value}`;
  }

  return `${getApiOrigin()}/${value.replace(/^\/+/, '')}`;
}

export function isInfoCulturaAuthError(error: unknown): error is InfoCulturaApiError {
  return error instanceof InfoCulturaApiError && (error.status === 401 || error.status === 403);
}

function normalizeItemsResponse(data: ApiListResponse | CulturalItem[]): CulturalItem[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.items)) {
    return data.items;
  }

  if (data && 'results' in data && Array.isArray(data.results)) {
    return data.results as CulturalItem[];
  }

  return [];
}

function normalizeItemResponse(data: ApiItemResponse | CulturalItem): CulturalItem {
  if ('item' in data) {
    return data.item;
  }

  return data;
}

export async function loginInfoCultura(username: string, password: string): Promise<string> {
  const data = await request<ApiLoginResponse>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });

  setStoredAccessToken(data.token);
  return data.token;
}

export async function logoutInfoCultura(): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout/`, {
      method: 'POST',
      credentials: 'include'
    });
  } finally {
    setStoredAccessToken('');
  }
}

export async function fetchInfoCulturaMe(token: string): Promise<InfoCulturaUser> {
  const data = await request<ApiMeResponse>('/auth/me/', {}, token);
  return data.user;
}

export async function fetchAdminUsers(token: string): Promise<InfoCulturaUser[]> {
  return request<InfoCulturaUser[]>('/auth/users/', {}, token);
}

export async function fetchAdminUser(token: string, id: number): Promise<InfoCulturaUser> {
  return request<InfoCulturaUser>(`/auth/users/${id}/`, {}, token);
}

export async function fetchAdminRoles(token: string): Promise<InfoCulturaRole[]> {
  return request<InfoCulturaRole[]>('/auth/roles/', {}, token);
}

export async function createAdminUser(
  token: string,
  payload: UserPayload
): Promise<InfoCulturaUser> {
  return request<InfoCulturaUser>(
    '/auth/users/',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    token
  );
}

export async function updateAdminUser(
  token: string,
  id: number,
  payload: UserPayload
): Promise<InfoCulturaUser> {
  return request<InfoCulturaUser>(
    `/auth/users/${id}/`,
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    },
    token
  );
}

export async function deactivateAdminUser(
  token: string,
  id: number
): Promise<InfoCulturaUser> {
  const data = await request<ApiUserResponse>(
    `/auth/users/${id}/deactivate/`,
    {
      method: 'POST'
    },
    token
  );

  return data.user;
}

export async function fetchAdminContent(token: string): Promise<CulturalItem[]> {
  const data = await request<ApiListResponse | CulturalItem[]>('/content/admin/', {}, token);
  return normalizeItemsResponse(data);
}

export async function fetchPublicContent(area: CulturalArea): Promise<CulturalItem[]> {
  const data = await request<ApiListResponse | CulturalItem[]>(`/content/?area=${area}`);
  return normalizeItemsResponse(data);
}

export async function fetchPublicClubs(): Promise<InfoCulturaClub[]> {
  return request<InfoCulturaClub[]>('/clubs/');
}

export async function fetchPublicClub(id: number): Promise<InfoCulturaClub> {
  return request<InfoCulturaClub>(`/clubs/${id}/`);
}

export async function createClubRegistration(
  clubId: number,
  payload: ClubRegistrationPayload
): Promise<void> {
  await request<void>(`/clubs/${clubId}/registrations/`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function fetchPublicNewsStatuses(): Promise<InfoCulturaNewsStatus[]> {
  return request<InfoCulturaNewsStatus[]>('/news/statuses/');
}

export async function fetchPublicNews(clubId?: number): Promise<InfoCulturaNews[]> {
  const query = typeof clubId === 'number' ? `?club_id=${clubId}` : '';
  return request<InfoCulturaNews[]>(`/news/${query}`);
}

export async function fetchPublicNewsItem(id: number): Promise<InfoCulturaNews> {
  return request<InfoCulturaNews>(`/news/${id}/`);
}

export async function fetchPublicBooks(clubId?: number): Promise<InfoCulturaBook[]> {
  const query = typeof clubId === 'number' ? `?club_id=${clubId}` : '';
  return request<InfoCulturaBook[]>(`/books/${query}`);
}

export async function fetchPublicBookItem(id: number): Promise<InfoCulturaBook> {
  return request<InfoCulturaBook>(`/books/${id}/`);
}

export async function fetchPublicSessions(clubId?: number): Promise<InfoCulturaSession[]> {
  const query = typeof clubId === 'number' ? `?club_id=${clubId}` : '';
  return request<InfoCulturaSession[]>(`/sessions/${query}`);
}

export async function fetchPublicSessionItem(id: number): Promise<InfoCulturaSession> {
  return request<InfoCulturaSession>(`/sessions/${id}/`);
}

export async function fetchPublicCategories(): Promise<InfoCulturaCategory[]> {
  return request<InfoCulturaCategory[]>('/categories/');
}

export async function fetchPublicEvents(filters?: {
  clubId?: number;
  categoryId?: number;
  city?: string;
  state?: 'upcoming' | 'ongoing' | 'past';
  dateFrom?: string;
  dateTo?: string;
}): Promise<InfoCulturaEvent[]> {
  const search = new URLSearchParams();
  if (typeof filters?.clubId === 'number') {
    search.set('club_id', String(filters.clubId));
  }
  if (typeof filters?.categoryId === 'number') {
    search.set('category_id', String(filters.categoryId));
  }
  if (filters?.city?.trim()) {
    search.set('city', filters.city.trim());
  }
  if (filters?.state) {
    search.set('state', filters.state);
  }
  if (filters?.dateFrom) {
    search.set('date_from', filters.dateFrom);
  }
  if (filters?.dateTo) {
    search.set('date_to', filters.dateTo);
  }
  const query = search.toString();
  return request<InfoCulturaEvent[]>(`/events/${query ? `?${query}` : ''}`);
}

export async function fetchPublicEventItem(id: number): Promise<InfoCulturaEvent> {
  return request<InfoCulturaEvent>(`/events/${id}/`);
}

export async function createSessionRegistration(
  sessionId: number,
  payload: ClubRegistrationPayload
): Promise<ApiPublicRegistrationResponse> {
  return request<ApiPublicRegistrationResponse>(`/sessions/${sessionId}/registrations/`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function createEventRegistration(
  eventId: number,
  payload: ClubRegistrationPayload
): Promise<ApiPublicRegistrationResponse> {
  return request<ApiPublicRegistrationResponse>(`/events/${eventId}/registrations/`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function downloadSessionCalendar(sessionId: number): Promise<Blob> {
  return requestBlob(`/sessions/${sessionId}/calendar/`);
}

export async function downloadEventCalendar(eventId: number): Promise<Blob> {
  return requestBlob(`/events/${eventId}/calendar/`);
}

export async function createAdminContent(
  token: string,
  payload: ContentPayload
): Promise<CulturalItem> {
  const data = await request<ApiItemResponse | CulturalItem>(
    '/content/admin/',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    token
  );

  return normalizeItemResponse(data);
}

export async function updateAdminContent(
  token: string,
  id: string,
  payload: ContentPayload
): Promise<CulturalItem> {
  const data = await request<ApiItemResponse | CulturalItem>(
    `/content/admin/${id}/`,
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    },
    token
  );

  return normalizeItemResponse(data);
}

export async function deleteAdminContent(token: string, id: string): Promise<void> {
  await request<void>(
    `/content/admin/${id}/`,
    {
      method: 'DELETE'
    },
    token
  );
}

export async function fetchAdminClubs(token: string): Promise<InfoCulturaClub[]> {
  return request<InfoCulturaClub[]>('/clubs/admin/', {}, token);
}

export async function fetchAdminDashboard(
  token: string
): Promise<InfoCulturaDashboardStats> {
  return request<InfoCulturaDashboardStats>('/dashboard/admin/', {}, token);
}

export async function fetchAdminNotifications(
  token: string
): Promise<InfoCulturaAdminNotification[]> {
  return request<InfoCulturaAdminNotification[]>(
    '/dashboard/admin/notifications/',
    {},
    token
  );
}

export async function fetchAdminNewsStatuses(
  token: string
): Promise<InfoCulturaNewsStatus[]> {
  return request<InfoCulturaNewsStatus[]>('/news/admin/statuses/', {}, token);
}

export async function fetchAdminNews(
  token: string,
  filters?: {
    clubId?: number;
    status?: string;
    search?: string;
    ordering?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
    exportMode?: 'csv';
  }
): Promise<InfoCulturaAdminCollectionPage<InfoCulturaNews>> {
  const search = new URLSearchParams();
  if (typeof filters?.clubId === 'number') {
    search.set('club_id', String(filters.clubId));
  }
  if (filters?.status && filters.status !== 'all') {
    search.set('status', filters.status);
  }
  if (filters?.search?.trim()) {
    search.set('search', filters.search.trim());
  }
  if (filters?.ordering?.trim()) {
    search.set('ordering', filters.ordering.trim());
  }
  if (filters?.dateFrom) {
    search.set('date_from', filters.dateFrom);
  }
  if (filters?.dateTo) {
    search.set('date_to', filters.dateTo);
  }
  if (typeof filters?.page === 'number' && filters.page > 0) {
    search.set('page', String(filters.page));
  }
  if (typeof filters?.pageSize === 'number' && filters.pageSize > 0) {
    search.set('page_size', String(filters.pageSize));
  }
  if (filters?.exportMode === 'csv') {
    search.set('export', 'csv');
  }
  const query = search.toString();
  return request<InfoCulturaAdminCollectionPage<InfoCulturaNews>>(
    `/news/admin/${query ? `?${query}` : ''}`,
    {},
    token
  );
}

export async function fetchAdminRegistrationStatuses(
  token: string
): Promise<InfoCulturaRegistrationStatus[]> {
  return request<InfoCulturaRegistrationStatus[]>(
    '/registrations/admin/statuses/',
    {},
    token
  );
}

export async function fetchAdminRegistrations(
  token: string,
  filters?: {
    clubId?: number;
    status?: string;
    search?: string;
    ordering?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
    exportMode?: 'csv';
  }
): Promise<InfoCulturaRegistrationPage> {
  const search = new URLSearchParams();

  if (typeof filters?.clubId === 'number') {
    search.set('club_id', String(filters.clubId));
  }

  if (filters?.status && filters.status !== 'all') {
    search.set('status', filters.status);
  }

  if (filters?.search?.trim()) {
    search.set('search', filters.search.trim());
  }
  if (filters?.ordering?.trim()) {
    search.set('ordering', filters.ordering.trim());
  }
  if (filters?.dateFrom) {
    search.set('date_from', filters.dateFrom);
  }
  if (filters?.dateTo) {
    search.set('date_to', filters.dateTo);
  }

  if (typeof filters?.page === 'number' && filters.page > 0) {
    search.set('page', String(filters.page));
  }

  if (typeof filters?.pageSize === 'number' && filters.pageSize > 0) {
    search.set('page_size', String(filters.pageSize));
  }
  if (filters?.exportMode === 'csv') {
    search.set('export', 'csv');
  }

  const query = search.toString();
  return request<InfoCulturaRegistrationPage>(
    `/registrations/admin/${query ? `?${query}` : ''}`,
    {},
    token
  );
}

export async function exportAdminRegistrationsCsv(
  token: string,
  filters?: {
    clubId?: number;
    status?: string;
    search?: string;
    ordering?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<Blob> {
  const search = new URLSearchParams();
  if (typeof filters?.clubId === 'number') {
    search.set('club_id', String(filters.clubId));
  }
  if (filters?.status && filters.status !== 'all') {
    search.set('status', filters.status);
  }
  if (filters?.search?.trim()) {
    search.set('search', filters.search.trim());
  }
  if (filters?.ordering?.trim()) {
    search.set('ordering', filters.ordering.trim());
  }
  if (filters?.dateFrom) {
    search.set('date_from', filters.dateFrom);
  }
  if (filters?.dateTo) {
    search.set('date_to', filters.dateTo);
  }
  search.set('export', 'csv');
  return requestBlob(`/registrations/admin/?${search.toString()}`, {}, token);
}

export async function updateAdminRegistrationStatus(
  token: string,
  registrationId: number,
  status: string
): Promise<InfoCulturaRegistration> {
  const data = await request<ApiRegistrationResponse>(
    `/registrations/admin/${registrationId}/status/`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status })
    },
    token
  );

  return data.registration;
}

export async function bulkUpdateAdminRegistrationStatus(
  token: string,
  ids: number[],
  status: string
): Promise<InfoCulturaRegistration[]> {
  const data = await request<ApiBulkRegistrationResponse>(
    '/registrations/admin/bulk-status/',
    {
      method: 'POST',
      body: JSON.stringify({ ids, status })
    },
    token
  );

  return data.items;
}

export async function createAdminNews(
  token: string,
  payload: NewsPayload
): Promise<InfoCulturaNews> {
  return request<InfoCulturaNews>(
    '/news/admin/',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    token
  );
}

export async function updateAdminNews(
  token: string,
  id: number,
  payload: NewsPayload
): Promise<InfoCulturaNews> {
  return request<InfoCulturaNews>(
    `/news/admin/${id}/`,
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    },
    token
  );
}

export async function deleteAdminNews(token: string, id: number): Promise<void> {
  await request<void>(
    `/news/admin/${id}/`,
    {
      method: 'DELETE'
    },
    token
  );
}

export async function exportAdminNewsCsv(
  token: string,
  filters?: {
    clubId?: number;
    status?: string;
    search?: string;
    ordering?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<Blob> {
  const search = new URLSearchParams();
  if (typeof filters?.clubId === 'number') {
    search.set('club_id', String(filters.clubId));
  }
  if (filters?.status && filters.status !== 'all') {
    search.set('status', filters.status);
  }
  if (filters?.search?.trim()) {
    search.set('search', filters.search.trim());
  }
  if (filters?.ordering?.trim()) {
    search.set('ordering', filters.ordering.trim());
  }
  if (filters?.dateFrom) {
    search.set('date_from', filters.dateFrom);
  }
  if (filters?.dateTo) {
    search.set('date_to', filters.dateTo);
  }
  search.set('export', 'csv');
  return requestBlob(`/news/admin/?${search.toString()}`, {}, token);
}

export async function bulkUpdateAdminNewsStatus(
  token: string,
  ids: number[],
  status: string
): Promise<InfoCulturaNews[]> {
  const data = await request<ApiBulkNewsResponse>(
    '/news/admin/bulk-status/',
    {
      method: 'POST',
      body: JSON.stringify({ ids, status })
    },
    token
  );

  return data.items;
}

export async function bulkDeleteAdminNews(token: string, ids: number[]): Promise<number> {
  const data = await request<ApiBulkDeleteResponse>(
    '/news/admin/bulk-delete/',
    {
      method: 'POST',
      body: JSON.stringify({ ids })
    },
    token
  );

  return data.deleted;
}

export async function uploadAdminImage(
  token: string,
  file: File,
  folder: 'news' | 'events' | 'books' | 'clubs'
): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  body.append('folder', folder);

  const data = await request<ApiImageUploadResponse>(
    '/uploads/images/',
    {
      method: 'POST',
      body
    },
    token
  );

  return data.path;
}

export async function fetchAdminBooks(
  token: string,
  filters?: {
    clubId?: number;
    search?: string;
    ordering?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
    exportMode?: 'csv';
  }
): Promise<InfoCulturaAdminCollectionPage<InfoCulturaBook>> {
  const search = new URLSearchParams();
  if (typeof filters?.clubId === 'number') {
    search.set('club_id', String(filters.clubId));
  }
  if (filters?.search?.trim()) {
    search.set('search', filters.search.trim());
  }
  if (filters?.ordering?.trim()) {
    search.set('ordering', filters.ordering.trim());
  }
  if (filters?.dateFrom) {
    search.set('date_from', filters.dateFrom);
  }
  if (filters?.dateTo) {
    search.set('date_to', filters.dateTo);
  }
  if (typeof filters?.page === 'number' && filters.page > 0) {
    search.set('page', String(filters.page));
  }
  if (typeof filters?.pageSize === 'number' && filters.pageSize > 0) {
    search.set('page_size', String(filters.pageSize));
  }
  if (filters?.exportMode === 'csv') {
    search.set('export', 'csv');
  }
  const query = search.toString();
  return request<InfoCulturaAdminCollectionPage<InfoCulturaBook>>(
    `/books/admin/${query ? `?${query}` : ''}`,
    {},
    token
  );
}

export async function createAdminBook(
  token: string,
  payload: BookPayload
): Promise<InfoCulturaBook> {
  return request<InfoCulturaBook>(
    '/books/admin/',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    token
  );
}

export async function updateAdminBook(
  token: string,
  id: number,
  payload: BookPayload
): Promise<InfoCulturaBook> {
  return request<InfoCulturaBook>(
    `/books/admin/${id}/`,
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    },
    token
  );
}

export async function deleteAdminBook(token: string, id: number): Promise<void> {
  await request<void>(
    `/books/admin/${id}/`,
    {
      method: 'DELETE'
    },
    token
  );
}

export async function exportAdminBooksCsv(
  token: string,
  filters?: {
    clubId?: number;
    search?: string;
    ordering?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<Blob> {
  const search = new URLSearchParams();
  if (typeof filters?.clubId === 'number') {
    search.set('club_id', String(filters.clubId));
  }
  if (filters?.search?.trim()) {
    search.set('search', filters.search.trim());
  }
  if (filters?.ordering?.trim()) {
    search.set('ordering', filters.ordering.trim());
  }
  if (filters?.dateFrom) {
    search.set('date_from', filters.dateFrom);
  }
  if (filters?.dateTo) {
    search.set('date_to', filters.dateTo);
  }
  search.set('export', 'csv');
  return requestBlob(`/books/admin/?${search.toString()}`, {}, token);
}

export async function bulkDeleteAdminBooks(token: string, ids: number[]): Promise<number> {
  const data = await request<ApiBulkDeleteResponse>(
    '/books/admin/bulk-delete/',
    {
      method: 'POST',
      body: JSON.stringify({ ids })
    },
    token
  );

  return data.deleted;
}

export async function fetchAdminSessions(
  token: string,
  filters?: {
    clubId?: number;
    search?: string;
    ordering?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
    exportMode?: 'csv';
  }
): Promise<InfoCulturaAdminCollectionPage<InfoCulturaSession>> {
  const search = new URLSearchParams();
  if (typeof filters?.clubId === 'number') {
    search.set('club_id', String(filters.clubId));
  }
  if (filters?.search?.trim()) {
    search.set('search', filters.search.trim());
  }
  if (filters?.ordering?.trim()) {
    search.set('ordering', filters.ordering.trim());
  }
  if (filters?.dateFrom) {
    search.set('date_from', filters.dateFrom);
  }
  if (filters?.dateTo) {
    search.set('date_to', filters.dateTo);
  }
  if (typeof filters?.page === 'number' && filters.page > 0) {
    search.set('page', String(filters.page));
  }
  if (typeof filters?.pageSize === 'number' && filters.pageSize > 0) {
    search.set('page_size', String(filters.pageSize));
  }
  if (filters?.exportMode === 'csv') {
    search.set('export', 'csv');
  }
  const query = search.toString();
  return request<InfoCulturaAdminCollectionPage<InfoCulturaSession>>(
    `/sessions/admin/${query ? `?${query}` : ''}`,
    {},
    token
  );
}

export async function createAdminSession(
  token: string,
  payload: SessionPayload
): Promise<InfoCulturaSession> {
  return request<InfoCulturaSession>(
    '/sessions/admin/',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    token
  );
}

export async function updateAdminSession(
  token: string,
  id: number,
  payload: SessionPayload
): Promise<InfoCulturaSession> {
  return request<InfoCulturaSession>(
    `/sessions/admin/${id}/`,
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    },
    token
  );
}

export async function deleteAdminSession(token: string, id: number): Promise<void> {
  await request<void>(
    `/sessions/admin/${id}/`,
    {
      method: 'DELETE'
    },
    token
  );
}

export async function exportAdminSessionsCsv(
  token: string,
  filters?: {
    clubId?: number;
    search?: string;
    ordering?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<Blob> {
  const search = new URLSearchParams();
  if (typeof filters?.clubId === 'number') {
    search.set('club_id', String(filters.clubId));
  }
  if (filters?.search?.trim()) {
    search.set('search', filters.search.trim());
  }
  if (filters?.ordering?.trim()) {
    search.set('ordering', filters.ordering.trim());
  }
  if (filters?.dateFrom) {
    search.set('date_from', filters.dateFrom);
  }
  if (filters?.dateTo) {
    search.set('date_to', filters.dateTo);
  }
  search.set('export', 'csv');
  return requestBlob(`/sessions/admin/?${search.toString()}`, {}, token);
}

export async function fetchAdminEvents(
  token: string,
  filters?: {
    clubId?: number;
    categoryId?: number;
    status?: string;
    search?: string;
    ordering?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
    exportMode?: 'csv';
  }
): Promise<InfoCulturaAdminCollectionPage<InfoCulturaEvent>> {
  const search = new URLSearchParams();
  if (typeof filters?.clubId === 'number') {
    search.set('club_id', String(filters.clubId));
  }
  if (typeof filters?.categoryId === 'number') {
    search.set('category_id', String(filters.categoryId));
  }
  if (filters?.status && filters.status !== 'all') {
    search.set('status', filters.status);
  }
  if (filters?.search?.trim()) {
    search.set('search', filters.search.trim());
  }
  if (filters?.ordering?.trim()) {
    search.set('ordering', filters.ordering.trim());
  }
  if (filters?.dateFrom) {
    search.set('date_from', filters.dateFrom);
  }
  if (filters?.dateTo) {
    search.set('date_to', filters.dateTo);
  }
  if (typeof filters?.page === 'number' && filters.page > 0) {
    search.set('page', String(filters.page));
  }
  if (typeof filters?.pageSize === 'number' && filters.pageSize > 0) {
    search.set('page_size', String(filters.pageSize));
  }
  if (filters?.exportMode === 'csv') {
    search.set('export', 'csv');
  }
  const query = search.toString();
  return request<InfoCulturaAdminCollectionPage<InfoCulturaEvent>>(
    `/events/admin/${query ? `?${query}` : ''}`,
    {},
    token
  );
}

export async function createAdminEvent(
  token: string,
  payload: EventPayload
): Promise<InfoCulturaEvent> {
  return request<InfoCulturaEvent>(
    '/events/admin/',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    token
  );
}

export async function updateAdminEvent(
  token: string,
  id: number,
  payload: EventPayload
): Promise<InfoCulturaEvent> {
  return request<InfoCulturaEvent>(
    `/events/admin/${id}/`,
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    },
    token
  );
}

export async function deleteAdminEvent(token: string, id: number): Promise<void> {
  await request<void>(
    `/events/admin/${id}/`,
    {
      method: 'DELETE'
    },
    token
  );
}

export async function exportAdminEventsCsv(
  token: string,
  filters?: {
    clubId?: number;
    categoryId?: number;
    status?: string;
    search?: string;
    ordering?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<Blob> {
  const search = new URLSearchParams();
  if (typeof filters?.clubId === 'number') {
    search.set('club_id', String(filters.clubId));
  }
  if (typeof filters?.categoryId === 'number') {
    search.set('category_id', String(filters.categoryId));
  }
  if (filters?.status && filters.status !== 'all') {
    search.set('status', filters.status);
  }
  if (filters?.search?.trim()) {
    search.set('search', filters.search.trim());
  }
  if (filters?.ordering?.trim()) {
    search.set('ordering', filters.ordering.trim());
  }
  if (filters?.dateFrom) {
    search.set('date_from', filters.dateFrom);
  }
  if (filters?.dateTo) {
    search.set('date_to', filters.dateTo);
  }
  search.set('export', 'csv');
  return requestBlob(`/events/admin/?${search.toString()}`, {}, token);
}

export async function bulkUpdateAdminEventStatus(
  token: string,
  ids: number[],
  status: string
): Promise<InfoCulturaEvent[]> {
  const data = await request<ApiBulkEventResponse>(
    '/events/admin/bulk-status/',
    {
      method: 'POST',
      body: JSON.stringify({ ids, status })
    },
    token
  );

  return data.items;
}

export async function bulkDeleteAdminEvents(token: string, ids: number[]): Promise<number> {
  const data = await request<ApiBulkDeleteResponse>(
    '/events/admin/bulk-delete/',
    {
      method: 'POST',
      body: JSON.stringify({ ids })
    },
    token
  );

  return data.deleted;
}

export async function fetchAdminCategories(token: string): Promise<InfoCulturaCategory[]> {
  return request<InfoCulturaCategory[]>('/categories/admin/', {}, token);
}

export async function createAdminCategory(
  token: string,
  payload: CategoryPayload
): Promise<InfoCulturaCategory> {
  return request<InfoCulturaCategory>(
    '/categories/admin/',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    token
  );
}

export async function updateAdminCategory(
  token: string,
  id: number,
  payload: CategoryPayload
): Promise<InfoCulturaCategory> {
  return request<InfoCulturaCategory>(
    `/categories/admin/${id}/`,
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    },
    token
  );
}

export async function deleteAdminCategory(token: string, id: number): Promise<void> {
  await request<void>(
    `/categories/admin/${id}/`,
    {
      method: 'DELETE'
    },
    token
  );
}

export async function createAdminClub(
  token: string,
  payload: ClubPayload
): Promise<InfoCulturaClub> {
  return request<InfoCulturaClub>(
    '/clubs/admin/',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    token
  );
}

export async function updateAdminClub(
  token: string,
  id: number,
  payload: ClubPayload
): Promise<InfoCulturaClub> {
  return request<InfoCulturaClub>(
    `/clubs/admin/${id}/`,
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    },
    token
  );
}

export async function deleteAdminClub(token: string, id: number): Promise<void> {
  await request<void>(
    `/clubs/admin/${id}/`,
    {
      method: 'DELETE'
    },
    token
  );
}

export async function assignUserToClub(
  token: string,
  clubId: number,
  userId: number
): Promise<InfoCulturaUser> {
  const data = await request<ApiUserResponse>(
    `/clubs/admin/${clubId}/members/`,
    {
      method: 'POST',
      body: JSON.stringify({ user_id: userId })
    },
    token
  );

  return data.user;
}

export async function removeUserFromClub(
  token: string,
  clubId: number,
  userId: number
): Promise<InfoCulturaUser> {
  const data = await request<ApiUserResponse>(
    `/clubs/admin/${clubId}/members/${userId}/`,
    {
      method: 'DELETE'
    },
    token
  );

  return data.user;
}
