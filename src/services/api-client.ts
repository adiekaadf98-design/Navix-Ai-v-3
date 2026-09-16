// Minimal fetch-based API client for preview environment compatibility
// Using native fetch instead of Axios for zero-dependency lightness in client core

const getAuthToken = () => localStorage.getItem('navix_auth_token') || localStorage.getItem('navix_token');

export class ApiClient {
  static async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {})
    };


    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers
    };

    try {
      const response = await fetch(endpoint, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data as T;
    } catch (error: any) {
      console.error(`[ApiClient] Request to ${endpoint} failed:`, error);
      throw error;
    }
  }

  static get<T = any>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  static post<T = any>(endpoint: string, body: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers
    });
  }
}
