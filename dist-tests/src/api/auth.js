import { request, setStoredAccessToken } from './client.js';
export async function loginInfoCultura(username, password) {
    const data = await request('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
    setStoredAccessToken(data.token);
    return data.token;
}
export async function logoutInfoCultura() {
    try {
        await request('/auth/logout/', { method: 'POST' });
    }
    finally {
        setStoredAccessToken('');
    }
}
export async function fetchInfoCulturaMe(token) {
    const data = await request('/auth/me/', {}, token);
    return data.user;
}
export async function fetchAdminUsers(token) {
    return request('/auth/users/', {}, token);
}
export async function fetchAdminUser(token, id) {
    return request(`/auth/users/${id}/`, {}, token);
}
export async function fetchAdminRoles(token) {
    return request('/auth/roles/', {}, token);
}
export async function createAdminUser(token, payload) {
    return request('/auth/users/', {
        method: 'POST',
        body: JSON.stringify(payload)
    }, token);
}
export async function updateAdminUser(token, id, payload) {
    return request(`/auth/users/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    }, token);
}
export async function deactivateAdminUser(token, id) {
    const data = await request(`/auth/users/${id}/deactivate/`, {
        method: 'POST'
    }, token);
    return data.user;
}
