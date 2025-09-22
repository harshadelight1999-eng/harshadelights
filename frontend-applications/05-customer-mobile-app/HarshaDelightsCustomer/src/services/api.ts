// API service configuration and interceptors

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '../store';
import { refreshAccessToken, clearTokens } from '../store/slices/authSlice';
import { setNetworkError, setGlobalError } from '../store/slices/appSlice';
import { API_CONFIG, API_ENDPOINTS, ERROR_MESSAGES } from '../constants';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const state = store.getState();
    const token = state.auth.accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.metadata = {
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now(),
    };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful requests in development
    if (__DEV__) {
      const requestId = response.config.metadata?.requestId;
      const duration = Date.now() - (response.config.metadata?.startTime || 0);
      console.log(`✅ API Success [${requestId}]: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log errors in development
    if (__DEV__) {
      const requestId = originalRequest?.metadata?.requestId;
      const duration = Date.now() - (originalRequest?.metadata?.startTime || 0);
      console.error(`❌ API Error [${requestId}]: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} - ${duration}ms`, error.response?.data || error.message);
    }

    // Handle network errors
    if (!error.response) {
      store.dispatch(setNetworkError(ERROR_MESSAGES.network));
      return Promise.reject({
        ...error,
        message: ERROR_MESSAGES.network,
        isNetworkError: true,
      });
    }

    const { status } = error.response;

    // Handle unauthorized errors (401)
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const refreshResult = await store.dispatch(refreshAccessToken());

        if (refreshAccessToken.fulfilled.match(refreshResult)) {
          // Retry the original request with new token
          const state = store.getState();
          const newToken = state.auth.accessToken;

          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        store.dispatch(clearTokens());
        store.dispatch(setGlobalError(ERROR_MESSAGES.unauthorized));
      }
    }

    // Handle other HTTP errors
    let errorMessage = ERROR_MESSAGES.unknown;

    switch (status) {
      case 400:
        errorMessage = error.response.data?.message || ERROR_MESSAGES.validation;
        break;
      case 401:
        errorMessage = ERROR_MESSAGES.unauthorized;
        break;
      case 403:
        errorMessage = ERROR_MESSAGES.unauthorized;
        break;
      case 404:
        errorMessage = ERROR_MESSAGES.notFound;
        break;
      case 408:
        errorMessage = ERROR_MESSAGES.timeout;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorMessage = ERROR_MESSAGES.server;
        break;
      default:
        errorMessage = error.response.data?.message || ERROR_MESSAGES.unknown;
    }

    // Dispatch global error for serious issues
    if (status >= 500) {
      store.dispatch(setGlobalError(errorMessage));
    }

    return Promise.reject({
      ...error,
      message: errorMessage,
      statusCode: status,
    });
  }
);

// API service class
export class ApiService {
  protected baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  protected buildUrl(endpoint: string, params?: Record<string, any>): string {
    let url = this.baseURL + endpoint;

    // Replace path parameters
    if (params) {
      Object.keys(params).forEach(key => {
        const placeholder = `:${key}`;
        if (url.includes(placeholder)) {
          url = url.replace(placeholder, encodeURIComponent(params[key]));
          delete params[key];
        }
      });
    }

    return url;
  }

  protected async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const url = this.buildUrl(endpoint, params);
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const fullUrl = queryParams ? `${url}?${queryParams}` : url;

    return api.get<T>(fullUrl, config);
  }

  protected async post<T>(
    endpoint: string,
    data?: any,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const url = this.buildUrl(endpoint, params);
    return api.post<T>(url, data, config);
  }

  protected async put<T>(
    endpoint: string,
    data?: any,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const url = this.buildUrl(endpoint, params);
    return api.put<T>(url, data, config);
  }

  protected async patch<T>(
    endpoint: string,
    data?: any,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const url = this.buildUrl(endpoint, params);
    return api.patch<T>(url, data, config);
  }

  protected async delete<T>(
    endpoint: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const url = this.buildUrl(endpoint, params);
    return api.delete<T>(url, config);
  }
}

// Upload service for multipart form data
export class UploadService extends ApiService {
  async uploadFile(
    endpoint: string,
    file: {
      uri: string;
      type: string;
      name: string;
    },
    additionalData?: Record<string, any>
  ): Promise<AxiosResponse<any>> {
    const formData = new FormData();

    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async uploadMultipleFiles(
    endpoint: string,
    files: Array<{
      uri: string;
      type: string;
      name: string;
    }>,
    additionalData?: Record<string, any>
  ): Promise<AxiosResponse<any>> {
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append(`files[${index}]`, {
        uri: file.uri,
        type: file.type,
        name: file.name,
      } as any);
    });

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

// Retry utility for failed requests
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = API_CONFIG.retryAttempts,
  delay: number = API_CONFIG.retryDelay
): Promise<T> => {
  let lastError: any;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      if (i === maxRetries) {
        break;
      }

      // Don't retry on client errors (4xx) except 408 (timeout)
      if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 408) {
        break;
      }

      // Exponential backoff
      const waitTime = delay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
};

export default api;