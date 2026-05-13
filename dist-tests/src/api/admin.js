import { normalizeItemResponse, normalizeItemsResponse, request, requestBlob, } from './client.js';
export async function fetchAdminContent(token) {
    const data = await request('/content/admin/', {}, token);
    return normalizeItemsResponse(data);
}
export async function createAdminContent(token, payload) {
    const data = await request('/content/admin/', {
        method: 'POST',
        body: JSON.stringify(payload)
    }, token);
    return normalizeItemResponse(data);
}
export async function updateAdminContent(token, id, payload) {
    const data = await request(`/content/admin/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    }, token);
    return normalizeItemResponse(data);
}
export async function deleteAdminContent(token, id) {
    await request(`/content/admin/${id}/`, {
        method: 'DELETE'
    }, token);
}
export async function fetchAdminClubs(token) {
    return request('/clubs/admin/', {}, token);
}
export async function fetchAdminCategories(token) {
    return request('/categories/admin/', {}, token);
}
export async function createAdminCategory(token, payload) {
    return request('/categories/admin/', {
        method: 'POST',
        body: JSON.stringify(payload)
    }, token);
}
export async function updateAdminCategory(token, id, payload) {
    return request(`/categories/admin/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    }, token);
}
export async function deleteAdminCategory(token, id) {
    await request(`/categories/admin/${id}/`, {
        method: 'DELETE'
    }, token);
}
export async function fetchAdminDashboard(token) {
    return request('/dashboard/admin/', {}, token);
}
export async function fetchAdminNotifications(token) {
    return request('/dashboard/admin/notifications/', {}, token);
}
export async function fetchAdminMetricsOverview(token, filters) {
    const search = new URLSearchParams();
    if (filters?.period) {
        search.set('period', filters.period);
    }
    if (typeof filters?.limit === 'number' && filters.limit > 0) {
        search.set('limit', String(filters.limit));
    }
    const query = search.toString();
    return request(`/metrics/admin/${query ? `?${query}` : ''}`, {}, token);
}
export async function fetchAdminNewsStatuses(token) {
    return request('/news/admin/statuses/', {}, token);
}
export async function fetchAdminNews(token, filters) {
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
    return request(`/news/admin/${query ? `?${query}` : ''}`, {}, token);
}
export async function fetchAdminNewsletters(token, filters) {
    const search = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') {
        search.set('status', filters.status);
    }
    if (filters?.search?.trim()) {
        search.set('search', filters.search.trim());
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
    return request(`/newsletters/admin/${query ? `?${query}` : ''}`, {}, token);
}
export async function createAdminNewsletter(token, payload) {
    return request('/newsletters/admin/', {
        method: 'POST',
        body: JSON.stringify(payload)
    }, token);
}
export async function updateAdminNewsletter(token, id, payload) {
    return request(`/newsletters/admin/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    }, token);
}
export async function deleteAdminNewsletter(token, id) {
    await request(`/newsletters/admin/${id}/`, {
        method: 'DELETE'
    }, token);
}
export async function sendAdminNewsletter(token, id) {
    return request(`/newsletters/admin/${id}/send/`, {
        method: 'POST'
    }, token);
}
export async function fetchAdminNewsletterSubscribers(token, filters) {
    const search = new URLSearchParams();
    if (filters?.search?.trim()) {
        search.set('search', filters.search.trim());
    }
    if (filters?.isActive === true) {
        search.set('is_active', 'true');
    }
    else if (filters?.isActive === false) {
        search.set('is_active', 'false');
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
    return request(`/newsletters/admin/subscribers/${query ? `?${query}` : ''}`, {}, token);
}
export async function createAdminNewsletterSubscriber(token, payload) {
    return request('/newsletters/admin/subscribers/', {
        method: 'POST',
        body: JSON.stringify(payload)
    }, token);
}
export async function updateAdminNewsletterSubscriber(token, id, payload) {
    return request(`/newsletters/admin/subscribers/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    }, token);
}
export async function deleteAdminNewsletterSubscriber(token, id) {
    await request(`/newsletters/admin/subscribers/${id}/`, {
        method: 'DELETE'
    }, token);
}
export async function fetchAdminRegistrationStatuses(token) {
    return request('/registrations/admin/statuses/', {}, token);
}
export async function fetchAdminRegistrations(token, filters) {
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
    return request(`/registrations/admin/${query ? `?${query}` : ''}`, {}, token);
}
export async function exportAdminRegistrationsCsv(token, filters) {
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
export async function updateAdminRegistrationStatus(token, registrationId, status) {
    const data = await request(`/registrations/admin/${registrationId}/status/`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    }, token);
    return data.registration;
}
export async function bulkUpdateAdminRegistrationStatus(token, ids, status) {
    const data = await request('/registrations/admin/bulk-status/', {
        method: 'POST',
        body: JSON.stringify({ ids, status })
    }, token);
    return data.items;
}
export async function createAdminNews(token, payload) {
    return request('/news/admin/', {
        method: 'POST',
        body: JSON.stringify(payload)
    }, token);
}
export async function updateAdminNews(token, id, payload) {
    return request(`/news/admin/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    }, token);
}
export async function deleteAdminNews(token, id) {
    await request(`/news/admin/${id}/`, {
        method: 'DELETE'
    }, token);
}
export async function exportAdminNewsCsv(token, filters) {
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
export async function bulkUpdateAdminNewsStatus(token, ids, status) {
    const data = await request('/news/admin/bulk-status/', {
        method: 'POST',
        body: JSON.stringify({ ids, status })
    }, token);
    return data.items;
}
export async function bulkDeleteAdminNews(token, ids) {
    const data = await request('/news/admin/bulk-delete/', {
        method: 'POST',
        body: JSON.stringify({ ids })
    }, token);
    return data.deleted;
}
export async function uploadAdminImage(token, file, folder) {
    const body = new FormData();
    body.append('file', file);
    body.append('folder', folder);
    const data = await request('/uploads/images/', {
        method: 'POST',
        body
    }, token);
    return data.path;
}
export async function fetchAdminBooks(token, filters) {
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
    return request(`/books/admin/${query ? `?${query}` : ''}`, {}, token);
}
export async function createAdminBook(token, payload) {
    return request('/books/admin/', {
        method: 'POST',
        body: JSON.stringify(payload)
    }, token);
}
export async function updateAdminBook(token, id, payload) {
    return request(`/books/admin/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    }, token);
}
export async function deleteAdminBook(token, id) {
    await request(`/books/admin/${id}/`, {
        method: 'DELETE'
    }, token);
}
export async function exportAdminBooksCsv(token, filters) {
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
export async function bulkDeleteAdminBooks(token, ids) {
    const data = await request('/books/admin/bulk-delete/', {
        method: 'POST',
        body: JSON.stringify({ ids })
    }, token);
    return data.deleted;
}
export async function fetchAdminSessions(token, filters) {
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
    return request(`/sessions/admin/${query ? `?${query}` : ''}`, {}, token);
}
export async function createAdminSession(token, payload) {
    return request('/sessions/admin/', {
        method: 'POST',
        body: JSON.stringify(payload)
    }, token);
}
export async function updateAdminSession(token, id, payload) {
    return request(`/sessions/admin/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    }, token);
}
export async function deleteAdminSession(token, id) {
    await request(`/sessions/admin/${id}/`, {
        method: 'DELETE'
    }, token);
}
export async function exportAdminSessionsCsv(token, filters) {
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
export async function fetchAdminEvents(token, filters) {
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
    return request(`/events/admin/${query ? `?${query}` : ''}`, {}, token);
}
export async function createAdminEvent(token, payload) {
    return request('/events/admin/', {
        method: 'POST',
        body: JSON.stringify(payload)
    }, token);
}
export async function updateAdminEvent(token, id, payload) {
    return request(`/events/admin/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    }, token);
}
export async function deleteAdminEvent(token, id) {
    await request(`/events/admin/${id}/`, {
        method: 'DELETE'
    }, token);
}
export async function exportAdminEventsCsv(token, filters) {
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
export async function bulkUpdateAdminEventStatus(token, ids, status) {
    const data = await request('/events/admin/bulk-status/', {
        method: 'POST',
        body: JSON.stringify({ ids, status })
    }, token);
    return data.items;
}
export async function bulkDeleteAdminEvents(token, ids) {
    const data = await request('/events/admin/bulk-delete/', {
        method: 'POST',
        body: JSON.stringify({ ids })
    }, token);
    return data.deleted;
}
export async function createAdminClub(token, payload) {
    return request('/clubs/admin/', {
        method: 'POST',
        body: JSON.stringify(payload)
    }, token);
}
export async function updateAdminClub(token, id, payload) {
    return request(`/clubs/admin/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    }, token);
}
export async function deleteAdminClub(token, id) {
    await request(`/clubs/admin/${id}/`, {
        method: 'DELETE'
    }, token);
}
export async function assignUserToClub(token, clubId, userId) {
    const data = await request(`/clubs/admin/${clubId}/users/${userId}/assign/`, {
        method: 'POST'
    }, token);
    return data.user;
}
export async function removeUserFromClub(token, clubId, userId) {
    const data = await request(`/clubs/admin/${clubId}/users/${userId}/remove/`, {
        method: 'POST'
    }, token);
    return data.user;
}
