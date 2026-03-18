import { CulturalArea, CulturalItem } from './culturalContent';

const API_BASE = (
  import.meta.env.VITE_INFOCULTURA_API || 'http://127.0.0.1:8001/api'
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

export type InfoCulturaUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  club_id?: number | null;
  club_name?: string | null;
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
  is_active: boolean;
  enable_registrations?: boolean | null;
  created_at: string;
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

  return data.token;
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

export async function fetchAdminNewsStatuses(
  token: string
): Promise<InfoCulturaNewsStatus[]> {
  return request<InfoCulturaNewsStatus[]>('/news/admin/statuses/', {}, token);
}

export async function fetchAdminNews(token: string): Promise<InfoCulturaNews[]> {
  return request<InfoCulturaNews[]>('/news/admin/', {}, token);
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
