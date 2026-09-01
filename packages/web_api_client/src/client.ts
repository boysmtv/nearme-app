import { config } from '@dekat/web-config';

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiUrl;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', headers = {}, body } = options;

    const isPublic = endpoint.startsWith('/public/') || endpoint.startsWith('/auth/');
    const token = localStorage.getItem('auth_token');
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...(!isPublic && token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body: body ? (isFormData ? (body as unknown as BodyInit) : JSON.stringify(body)) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
      const msg = (error as Record<string, unknown>).message as string | undefined
        || (error as Record<string, unknown>).error as string | undefined
        || (error as Record<string, unknown>).msg as string | undefined
        || (error as Record<string, unknown>).detail as string | undefined
        || `HTTP error ${response.status}`;
      throw new Error(msg);
    }

    // Bundle B: ics returns text/calendar
    if (endpoint.endsWith('/ics')) {
      const text = await response.text();
      return text as unknown as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { headers });
  }

  async post<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, headers });
  }

  async put<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, headers });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient();
