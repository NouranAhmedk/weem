import { APIRequestContext, request } from '@playwright/test';
import { API_BASE_URL } from '../utils/app-config';

/**
 * Base API Client
 * Handles HTTP requests with authentication and error handling
 */
export class ApiClient {
  private context?: APIRequestContext;
  private authToken?: string;

  constructor() {}

  /**
   * Initialize API context
   */
  async init(): Promise<void> {
    this.context = await request.newContext({
      baseURL: API_BASE_URL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Get headers with authentication
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * GET request
   */
  async get(endpoint: string, params?: Record<string, any>): Promise<any> {
    if (!this.context) await this.init();

    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    const response = await this.context!.get(url, {
      headers: this.getHeaders(),
    });

    return {
      status: response.status(),
      data: await response.json().catch(() => null),
      headers: response.headers(),
    };
  }

  /**
   * POST request
   */
  async post(endpoint: string, data?: any): Promise<any> {
    if (!this.context) await this.init();

    const response = await this.context!.post(endpoint, {
      headers: this.getHeaders(),
      data,
    });

    return {
      status: response.status(),
      data: await response.json().catch(() => null),
      headers: response.headers(),
    };
  }

  /**
   * PUT request
   */
  async put(endpoint: string, data?: any): Promise<any> {
    if (!this.context) await this.init();

    const response = await this.context!.put(endpoint, {
      headers: this.getHeaders(),
      data,
    });

    return {
      status: response.status(),
      data: await response.json().catch(() => null),
      headers: response.headers(),
    };
  }

  /**
   * DELETE request
   */
  async delete(endpoint: string): Promise<any> {
    if (!this.context) await this.init();

    const response = await this.context!.delete(endpoint, {
      headers: this.getHeaders(),
    });

    return {
      status: response.status(),
      data: await response.json().catch(() => null),
      headers: response.headers(),
    };
  }

  /**
   * Dispose API context
   */
  async dispose(): Promise<void> {
    if (this.context) {
      await this.context.dispose();
    }
  }
}


