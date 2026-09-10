import { config } from '@dekat/web-config';

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.baseUrl = config.apiUrl;
  }

  private clearAuth(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh');
    localStorage.removeItem('auth_user');
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = localStorage.getItem('auth_refresh');
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await fetch(
      `${this.baseUrl}/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`,
      { method: 'POST' }
    );

    if (!response.ok) {
      throw new Error('Refresh failed');
    }

    const result = await response.json();
    const data = result.data;
    if (!data?.accessToken || !data?.refreshToken) {
      throw new Error('Invalid refresh response');
    }

    localStorage.setItem('auth_token', data.accessToken);
    localStorage.setItem('auth_refresh', data.refreshToken);
    return data.accessToken;
  }

  private onRefreshed(token: string): void {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(cb: (token: string) => void): void {
    this.refreshSubscribers.push(cb);
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}, _isRetry = false, responseType?: 'json' | 'blob'): Promise<T> {
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

    if (response.status === 401 && !_isRetry && !isPublic) {
      const refreshToken = localStorage.getItem('auth_refresh');

      if (!refreshToken) {
        this.clearAuth();
        window.location.href = '/login';
        throw new Error('Session expired');
      }

      if (this.isRefreshing) {
        return new Promise<T>((resolve) => {
          this.addRefreshSubscriber((newToken) => {
            resolve(
              this.request<T>(endpoint, {
                method,
                headers: { ...headers, Authorization: `Bearer ${newToken}` },
                body,
              }, true, responseType)
            );
          });
        });
      }

      this.isRefreshing = true;
      try {
        const newToken = await this.refreshAccessToken();
        this.onRefreshed(newToken);
        return this.request<T>(endpoint, {
          method,
          headers: { ...headers, Authorization: `Bearer ${newToken}` },
          body,
        }, true, responseType);
      } catch {
        this.clearAuth();
        window.location.href = '/login';
        throw new Error('Session expired');
      } finally {
        this.isRefreshing = false;
      }
    }

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

    if (responseType === 'blob') {
      return response.blob() as unknown as Promise<T>;
    }

    return response.json();
  }

  async get<T>(endpoint: string, headers?: Record<string, string>, responseType?: 'json' | 'blob'): Promise<T> {
    return this.request<T>(endpoint, { headers }, false, responseType);
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
