/**
 * Standardized API Client for Harsha Delights Backend Integration
 * Provides type-safe HTTP client with authentication, error handling, and retry logic
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  code?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retryAttempts?: number;
  skipAuth?: boolean;
}

export class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultHeaders: Record<string, string>;
  private retryAttempts: number;
  private retryDelay: number;
  private authToken: string | null = null;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, ''); // Remove trailing slash
    this.defaultTimeout = config.timeout || 10000; // 10 seconds default
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.defaultHeaders,
    };
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000; // 1 second default
  }

  /**
   * Set authentication token for subsequent requests
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  /**
   * Get current authentication token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Build headers for request
   */
  private buildHeaders(config?: RequestConfig): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...config?.headers };

    // Add authorization header if token is available and not skipped
    if (this.authToken && !config?.skipAuth) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Create AbortController for request timeout
   */
  private createAbortController(timeout?: number): AbortController {
    const controller = new AbortController();
    const timeoutMs = timeout || this.defaultTimeout;

    setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    return controller;
  }

  /**
   * Handle API errors and create standardized error objects
   */
  private async handleError(response: Response): Promise<ApiError> {
    let errorData: any = {};

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
      } else {
        errorData = { message: await response.text() };
      }
    } catch {
      errorData = { message: 'Failed to parse error response' };
    }

    return {
      message: errorData.message || errorData.error || `HTTP ${response.status}`,
      status: response.status,
      code: errorData.code,
      details: errorData,
    };
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(
    method: string,
    endpoint: string,
    body?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.buildHeaders(config);
    const maxAttempts = config?.retryAttempts ?? this.retryAttempts;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const controller = this.createAbortController(config?.timeout);

        const requestInit: RequestInit = {
          method,
          headers,
          signal: controller.signal,
        };

        // Add body for non-GET requests
        if (body && method !== 'GET') {
          requestInit.body = JSON.stringify(body);
        }

        const response = await fetch(url, requestInit);

        // Handle non-2xx responses
        if (!response.ok) {
          const error = await this.handleError(response);

          // Don't retry for client errors (4xx) except 401, 408, 429
          if (
            response.status >= 400 &&
            response.status < 500 &&
            ![401, 408, 429].includes(response.status)
          ) {
            throw error;
          }

          // Retry for server errors (5xx) and specific client errors
          if (attempt === maxAttempts - 1) {
            throw error;
          }

          await this.sleep(this.retryDelay * (attempt + 1)); // Exponential backoff
          continue;
        }

        // Parse successful response
        const contentType = response.headers.get('content-type');
        let data: T;

        if (contentType && contentType.includes('application/json')) {
          const jsonResponse = await response.json();

          // Handle API Gateway response format
          if (jsonResponse.success !== undefined) {
            return jsonResponse as ApiResponse<T>;
          }

          // Direct data response
          data = jsonResponse;
        } else {
          data = (await response.text()) as any;
        }

        return {
          success: true,
          data,
        };

      } catch (error) {
        // Handle fetch errors (network issues, timeouts, etc.)
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            const timeoutError: ApiError = {
              message: 'Request timeout',
              status: 408,
              code: 'TIMEOUT',
            };

            if (attempt === maxAttempts - 1) {
              throw timeoutError;
            }
          } else if (error.name === 'TypeError') {
            // Network error
            const networkError: ApiError = {
              message: 'Network error - please check your connection',
              status: 0,
              code: 'NETWORK_ERROR',
            };

            if (attempt === maxAttempts - 1) {
              throw networkError;
            }
          }
        }

        // Re-throw API errors immediately
        if ('status' in error) {
          throw error;
        }

        // Retry for network/timeout errors
        if (attempt === maxAttempts - 1) {
          throw error;
        }

        await this.sleep(this.retryDelay * (attempt + 1));
      }
    }

    // This should never be reached
    throw new Error('Unexpected error in API client');
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, undefined, config);
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, data, config);
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', endpoint, data, config);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PATCH', endpoint, data, config);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', endpoint, undefined, config);
  }
}

/**
 * Create API client instance for different environments
 */
export const createApiClient = (config: ApiClientConfig): ApiClient => {
  return new ApiClient(config);
};

/**
 * Default API client configuration for development
 */
export const createDefaultApiClient = (baseURL = 'http://localhost:3000/api/v1'): ApiClient => {
  return createApiClient({
    baseURL,
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
    defaultHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
};