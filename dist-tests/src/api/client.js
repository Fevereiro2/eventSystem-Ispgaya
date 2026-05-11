const API_BASE = (import.meta.env.VITE_INFOCULTURA_API || 'http://127.0.0.1:8001/api').replace(/\/$/, '');
const ACCESS_TOKEN_STORAGE_KEY = 'ispgaya_cultura_token';
export class InfoCulturaApiError extends Error {
    constructor(message, status) {
        super(message);
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = 'InfoCulturaApiError';
        this.status = status;
    }
}
export function getStoredAccessToken() {
    if (typeof window === 'undefined')
        return '';
    return sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || '';
}
export function setStoredAccessToken(token) {
    if (typeof window === 'undefined')
        return;
    if (token) {
        sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
    }
    else {
        sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    }
}
function extractApiErrorMessage(body) {
    if (!body || typeof body !== 'object')
        return null;
    const typedBody = body;
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
                .filter((item) => typeof item === 'string' && item.trim().length > 0)
                .map((item) => (field === 'non_field_errors' ? item : `${field}: ${item}`));
        }
        return [];
    })
        .filter(Boolean);
    return fieldMessages.length > 0 ? fieldMessages.join(' ') : null;
}
let refreshTokenPromise = null;
async function refreshInfoCulturaToken() {
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
        const body = (await response.json());
        const nextToken = body.token || '';
        setStoredAccessToken(nextToken);
        return nextToken || null;
    })();
    try {
        return await refreshTokenPromise;
    }
    finally {
        refreshTokenPromise = null;
    }
}
export async function request(path, options = {}, token, allowRefresh = true) {
    const headers = new Headers(options.headers);
    const resolvedToken = getStoredAccessToken() || token;
    const isFormDataBody = typeof FormData !== 'undefined' && options.body instanceof FormData;
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
    if (response.status === 401 &&
        allowRefresh &&
        path !== '/auth/login/' &&
        path !== '/auth/refresh/' &&
        path !== '/auth/logout/') {
        const refreshedToken = await refreshInfoCulturaToken();
        if (refreshedToken) {
            return request(path, options, refreshedToken, false);
        }
    }
    if (!response.ok) {
        let message = 'Erro ao comunicar com o servidor.';
        try {
            const body = (await response.json());
            const extractedMessage = extractApiErrorMessage(body);
            if (extractedMessage) {
                message = extractedMessage;
            }
        }
        catch {
            // ignore parse errors and use default message
        }
        throw new InfoCulturaApiError(message, response.status);
    }
    if (response.status === 204) {
        return undefined;
    }
    return (await response.json());
}
export async function requestBlob(path, options = {}, token, allowRefresh = true) {
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
    if (response.status === 401 &&
        allowRefresh &&
        path !== '/auth/refresh/' &&
        path !== '/auth/logout/') {
        const refreshedToken = await refreshInfoCulturaToken();
        if (refreshedToken) {
            return requestBlob(path, options, refreshedToken, false);
        }
    }
    if (!response.ok) {
        let message = 'Erro ao comunicar com o servidor.';
        try {
            const body = (await response.json());
            const extractedMessage = extractApiErrorMessage(body);
            if (extractedMessage) {
                message = extractedMessage;
            }
        }
        catch {
            // ignore
        }
        throw new InfoCulturaApiError(message, response.status);
    }
    return response.blob();
}
function getApiOrigin() {
    try {
        return new URL(API_BASE).origin;
    }
    catch {
        if (typeof window !== 'undefined') {
            return window.location.origin;
        }
        return '';
    }
}
export function resolveInfoCulturaAssetUrl(value) {
    if (!value)
        return '';
    if (/^https?:\/\//i.test(value))
        return value;
    if (value.startsWith('/')) {
        return `${getApiOrigin()}${value}`;
    }
    return `${getApiOrigin()}/${value.replace(/^\/+/, '')}`;
}
export function isInfoCulturaAuthError(error) {
    return error instanceof InfoCulturaApiError && (error.status === 401 || error.status === 403);
}
export function normalizeItemsResponse(data) {
    if (Array.isArray(data)) {
        return data;
    }
    if (data && Array.isArray(data.items)) {
        return data.items;
    }
    if (data && 'results' in data && Array.isArray(data.results)) {
        return data.results;
    }
    return [];
}
export function normalizeItemResponse(data) {
    if ('item' in data) {
        return data.item;
    }
    return data;
}
