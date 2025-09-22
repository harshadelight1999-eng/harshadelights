/**
 * Harsha Delights API Services
 * Centralized API client and services for all frontend applications
 */

// Core API client
export { ApiClient, createApiClient, createDefaultApiClient } from './client';
export type { ApiResponse, ApiError, ApiClientConfig, RequestConfig } from './client';

// API Services
export { AuthService } from './auth';
export { ProductsService } from './products';

// Business types
export * from '../../types/business';

// Service instances and configuration
import { createDefaultApiClient } from './client';
import { AuthService } from './auth';
import { ProductsService } from './products';

/**
 * API Services Factory
 * Creates configured API service instances
 */
export class ApiServices {
  public auth: AuthService;
  public products: ProductsService;

  constructor(baseURL?: string) {
    const client = createDefaultApiClient(baseURL);

    this.auth = new AuthService(client);
    this.products = new ProductsService(client);
  }

  /**
   * Get the underlying API client for direct access
   */
  getClient(): ReturnType<typeof createDefaultApiClient> {
    return this.auth['apiClient'] || this.products['apiClient'];
  }

  /**
   * Set authentication token for all services
   */
  setAuthToken(token: string | null): void {
    this.getClient().setAuthToken(token);
  }

  /**
   * Get current authentication token
   */
  getAuthToken(): string | null {
    return this.getClient().getAuthToken();
  }
}

/**
 * Create API services with custom configuration
 */
export const createApiServices = (baseURL?: string): ApiServices => {
  return new ApiServices(baseURL);
};

/**
 * Default API services instance for development
 */
export const api = createApiServices();

/**
 * Environment-specific API configurations
 */
export const API_ENDPOINTS = {
  development: 'http://localhost:3000/api/v1',
  staging: 'https://staging-api.harshadelights.com/api/v1',
  production: 'https://api.harshadelights.com/api/v1',
} as const;

/**
 * Get API base URL for current environment
 */
export const getApiBaseURL = (): string => {
  if (typeof window === 'undefined') {
    // Server-side: use environment variable or default to development
    return process.env.NEXT_PUBLIC_API_URL || API_ENDPOINTS.development;
  }

  // Client-side: detect environment from hostname
  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return API_ENDPOINTS.development;
  } else if (hostname.includes('staging')) {
    return API_ENDPOINTS.staging;
  } else {
    return API_ENDPOINTS.production;
  }
};

/**
 * Create environment-aware API services
 */
export const createEnvironmentApiServices = (): ApiServices => {
  return createApiServices(getApiBaseURL());
};

/**
 * Authentication helpers
 */
export const authHelpers = {
  /**
   * Store authentication tokens in localStorage
   */
  storeTokens: (accessToken: string, refreshToken: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_access_token', accessToken);
      localStorage.setItem('auth_refresh_token', refreshToken);
    }
  },

  /**
   * Get stored access token
   */
  getStoredAccessToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_access_token');
    }
    return null;
  },

  /**
   * Get stored refresh token
   */
  getStoredRefreshToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_refresh_token');
    }
    return null;
  },

  /**
   * Clear stored tokens
   */
  clearStoredTokens: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_access_token');
      localStorage.removeItem('auth_refresh_token');
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!authHelpers.getStoredAccessToken();
  },

  /**
   * Initialize API services with stored token
   */
  initializeWithStoredToken: (apiServices: ApiServices): void => {
    const token = authHelpers.getStoredAccessToken();
    if (token) {
      apiServices.setAuthToken(token);
    }
  },
};

/**
 * Error handling helpers
 */
export const errorHelpers = {
  /**
   * Check if error is authentication error
   */
  isAuthError: (error: any): boolean => {
    return error?.status === 401 || error?.code === 'UNAUTHORIZED';
  },

  /**
   * Check if error is validation error
   */
  isValidationError: (error: any): boolean => {
    return error?.status === 400 || error?.code === 'VALIDATION_ERROR';
  },

  /**
   * Check if error is network error
   */
  isNetworkError: (error: any): boolean => {
    return error?.code === 'NETWORK_ERROR' || error?.status === 0;
  },

  /**
   * Get user-friendly error message
   */
  getErrorMessage: (error: any): string => {
    if (errorHelpers.isNetworkError(error)) {
      return 'Please check your internet connection and try again.';
    }

    if (errorHelpers.isAuthError(error)) {
      return 'Your session has expired. Please log in again.';
    }

    if (error?.message) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  },
};

/**
 * Request helpers for common operations
 */
export const requestHelpers = {
  /**
   * Handle API response with automatic error handling
   */
  handleResponse: async <T>(
    apiCall: () => Promise<ApiResponse<T>>
  ): Promise<T> => {
    try {
      const response = await apiCall();

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'API request failed');
      }
    } catch (error) {
      // Log error for debugging
      console.error('API request failed:', error);
      throw error;
    }
  },

  /**
   * Retry API call with exponential backoff
   */
  retryApiCall: async <T>(
    apiCall: () => Promise<ApiResponse<T>>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> => {
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await requestHelpers.handleResponse(apiCall);
      } catch (error) {
        lastError = error;

        // Don't retry for client errors (4xx) except specific cases
        if (error?.status >= 400 && error?.status < 500 &&
            ![401, 408, 429].includes(error?.status)) {
          throw error;
        }

        // Wait before retrying
        if (attempt < maxRetries - 1) {
          await new Promise(resolve =>
            setTimeout(resolve, baseDelay * Math.pow(2, attempt))
          );
        }
      }
    }

    throw lastError;
  },
};