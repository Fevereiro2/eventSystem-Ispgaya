import {
  ContentPayload,
  BookPayload,
  CategoryPayload,
  ClubPayload,
  EventPayload,
  InfoCulturaAdminCollectionPage,
  InfoCulturaAdminNotification,
  InfoCulturaBook,
  InfoCulturaCategory,
  InfoCulturaClub,
  InfoCulturaDashboardStats,
  InfoCulturaEvent,
  InfoCulturaNews,
  InfoCulturaNewsStatus,
  InfoCulturaRegistration,
  InfoCulturaRegistrationPage,
  InfoCulturaRegistrationStatus,
  InfoCulturaSession,
  NewsPayload,
  SessionPayload,
  InfoCulturaUser,
} from './types';
import {
  normalizeItemResponse,
  normalizeItemsResponse,
  request,
  requestBlob,
  ApiBulkDeleteResponse,
  ApiBulkEventResponse,
  ApiBulkNewsResponse,
  ApiBulkRegistrationResponse,
  ApiImageUploadResponse,
  ApiItemResponse,
} from './client';
import { CulturalItem } from '../data/culturalContent';

export async function fetchAdminContent(token: string): Promise<CulturalItem[]> {
  const data = await request<{ items: CulturalItem[] } | CulturalItem[]>('/content/admin/', {}, token);
  return normalizeItemsResponse(data);
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

export async function fetchAdminDashboard(token: string): Promise<InfoCulturaDashboardStats> {
  return request<InfoCulturaDashboardStats>('/dashboard/admin/', {}, token);
}

export async function fetchAdminNotifications(token: string): Promise<InfoCulturaAdminNotification[]> {
  return request<InfoCulturaAdminNotification[]>('/dashboard/admin/notifications/', {}, token);
}

export async function fetchAdminNewsStatuses(token: string): Promise<InfoCulturaNewsStatus[]> {
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
  return request<InfoCulturaRegistrationStatus[]>('/registrations/admin/statuses/', {}, token);
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
  const data = await request<{ registration: InfoCulturaRegistration }>(
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
  const data = await request<{ user: InfoCulturaUser }>(
    `/clubs/admin/${clubId}/users/${userId}/assign/`,
    {
      method: 'POST'
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
  const data = await request<{ user: InfoCulturaUser }>(
    `/clubs/admin/${clubId}/users/${userId}/remove/`,
    {
      method: 'POST'
    },
    token
  );

  return data.user;
}
