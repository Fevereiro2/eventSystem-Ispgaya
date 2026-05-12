import { normalizeItemsResponse, request, requestBlob, } from './client.js';
export async function fetchPublicContent(area) {
    const data = await request(`/content/?area=${area}`);
    return normalizeItemsResponse(data);
}
export async function fetchPublicClubs() {
    return request('/clubs/');
}
export async function fetchPublicClub(id) {
    return request(`/clubs/${id}/`);
}
export async function createClubRegistration(clubId, payload) {
    await request(`/clubs/${clubId}/registrations/`, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}
export async function fetchPublicNewsStatuses() {
    return request('/news/statuses/');
}
export async function fetchPublicNews(clubId) {
    const query = typeof clubId === 'number' ? `?club_id=${clubId}` : '';
    return request(`/news/${query}`);
}
export async function fetchPublicNewsItem(id) {
    return request(`/news/${id}/`);
}
export async function fetchPublicBooks(clubId) {
    const query = typeof clubId === 'number' ? `?club_id=${clubId}` : '';
    return request(`/books/${query}`);
}
export async function fetchPublicBookItem(id) {
    return request(`/books/${id}/`);
}
export async function fetchPublicSessions(clubId) {
    const query = typeof clubId === 'number' ? `?club_id=${clubId}` : '';
    return request(`/sessions/${query}`);
}
export async function fetchPublicSessionItem(id) {
    return request(`/sessions/${id}/`);
}
export async function fetchPublicCategories() {
    return request('/categories/');
}
export async function fetchPublicEvents(filters) {
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
    return request(`/events/${query ? `?${query}` : ''}`);
}
export async function fetchPublicEventItem(id) {
    return request(`/events/${id}/`);
}
export async function createSessionRegistration(sessionId, payload) {
    return request(`/sessions/${sessionId}/registrations/`, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}
export async function createEventRegistration(eventId, payload) {
    return request(`/events/${eventId}/registrations/`, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}
export async function downloadSessionCalendar(sessionId) {
    return requestBlob(`/sessions/${sessionId}/calendar/`);
}
export async function downloadEventCalendar(eventId) {
    return requestBlob(`/events/${eventId}/calendar/`);
}
export async function searchUniversities(filters) {
    const search = new URLSearchParams();
    if (filters?.name?.trim()) {
        search.set('name', filters.name.trim());
    }
    if (filters?.country?.trim()) {
        search.set('country', filters.country.trim());
    }
    if (typeof filters?.limit === 'number' && filters.limit > 0) {
        search.set('limit', String(filters.limit));
    }
    if (typeof filters?.offset === 'number' && filters.offset > 0) {
        search.set('offset', String(filters.offset));
    }
    const query = search.toString();
    const response = await request(`/universities/search/${query ? `?${query}` : ''}`);
    return Array.isArray(response) ? response : response.items || [];
}
