const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('epim_token');
}

export function setToken(token: string) {
  localStorage.setItem('epim_token', token);
}

export function clearToken() {
  localStorage.removeItem('epim_token');
}

function authHeaders(options: RequestInit): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'Error de API');
  }
  return res.json();
}

function wrapNetworkError(err: unknown): Error {
  if (err instanceof TypeError && /fetch/i.test(err.message)) {
    return new Error(
      'No se pudo conectar con la API. Compruebe NEXT_PUBLIC_API_URL en producción; el módulo Comercial usa rutas /api/comercial en este sitio.',
    );
  }
  if (err instanceof Error) return err;
  return new Error('Error de red desconocido');
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, { ...options, headers: authHeaders(options) });
    return parseJsonResponse<T>(res);
  } catch (err) {
    throw wrapNetworkError(err);
  }
}

/** Rutas BFF en el mismo origen (p. ej. snapshot comercial en Vercel solo-web). */
export async function webApiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    const res = await fetch(path, { ...options, headers: authHeaders(options) });
    return parseJsonResponse<T>(res);
  } catch (err) {
    throw wrapNetworkError(err);
  }
}

export { API_URL };
