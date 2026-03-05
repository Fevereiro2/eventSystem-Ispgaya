import { CulturalArea, CulturalItem } from './culturalContent';

const API_BASE = (
  import.meta.env.VITE_INFOCULTURA_API || 'http://127.0.0.1:8000/api'
).replace(/\/$/, '');

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
  user: {
    id: number;
    username: string;
    is_staff: boolean;
  };
};

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Token ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let message = 'Erro ao comunicar com o servidor.';

    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) {
        message = body.message;
      }
    } catch {
      // ignore parse errors and use default message
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function loginInfoCultura(username: string, password: string): Promise<string> {
  const data = await request<ApiLoginResponse>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });

  return data.token;
}

export async function fetchAdminContent(token: string): Promise<CulturalItem[]> {
  const data = await request<ApiListResponse>('/content/admin/', {}, token);
  return data.items;
}

export async function fetchPublicContent(area: CulturalArea): Promise<CulturalItem[]> {
  const data = await request<ApiListResponse>(`/content/?area=${area}`);
  return data.items;
}

export async function createAdminContent(
  token: string,
  payload: ContentPayload
): Promise<CulturalItem> {
  const data = await request<ApiItemResponse>(
    '/content/admin/',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    token
  );

  return data.item;
}

export async function updateAdminContent(
  token: string,
  id: string,
  payload: ContentPayload
): Promise<CulturalItem> {
  const data = await request<ApiItemResponse>(
    `/content/admin/${id}/`,
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    },
    token
  );

  return data.item;
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
