import { STORAGE_KEYS } from '@/constants/app';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1').replace(
  /\/+$/,
  '',
);

/** Origin serving uploaded files; media URLs from pet-api are root-relative. */
export const API_ORIGIN = BASE_URL.replace(/\/api\/v1$/, '');

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly errors: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    code = 'REQUEST_FAILED',
    errors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export function getAccessToken(): string | null {
  try {
    return (
      sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ??
      localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    );
  } catch {
    return null;
  }
}

export function clearSession(): void {
  for (const store of [sessionStorage, localStorage]) {
    store.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    store.removeItem(STORAGE_KEYS.USER);
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Multipart upload. When set, `body` is ignored and the browser sets Content-Type. */
  formData?: FormData;
  params?: object;
  signal?: AbortSignal;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  if (!params) return url;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      query.set(key, String(value));
    }
  }
  const search = query.toString();
  return search ? `${url}?${search}` : url;
}

function redirectToLogin(): void {
  if (!window.location.pathname.startsWith('/login')) window.location.assign('/login');
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = { Accept: 'application/json' };
  let body: BodyInit | undefined;
  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.params), {
      method: options.method ?? 'GET',
      headers,
      body,
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError('Network connection failed', 0, 'NETWORK_ERROR');
  }

  if (response.status === 204) return undefined as T;

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const payload = data as {
      message?: string;
      detail?: string;
      code?: string;
      errors?: Record<string, string[]>;
    } | null;
    if (response.status === 401) {
      clearSession();
      redirectToLogin();
    }
    throw new ApiError(
      payload?.message || payload?.detail || `Request failed (${response.status})`,
      response.status,
      payload?.code ?? 'REQUEST_FAILED',
      payload?.errors ?? {},
    );
  }
  return data as T;
}
