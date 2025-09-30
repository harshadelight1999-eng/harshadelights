/**
 * Harsha Delights API Services
 * Centralized API client and services for all frontend applications
 */
export { ApiClient, createApiClient, createDefaultApiClient } from './client';
export type { ApiResponse, ApiError, ApiClientConfig, RequestConfig } from './client';
export { AuthService } from './auth';
export { ProductsService } from './products';
export * from '../../types/business';
import { createDefaultApiClient } from './client';
import { AuthService } from './auth';
import { ProductsService } from './products';
/**
 * API Services Factory
 * Creates configured API service instances
 */
export declare class ApiServices {
    auth: AuthService;
    products: ProductsService;
    constructor(baseURL?: string);
    /**
     * Get the underlying API client for direct access
     */
    getClient(): ReturnType<typeof createDefaultApiClient>;
    /**
     * Set authentication token for all services
     */
    setAuthToken(token: string | null): void;
    /**
     * Get current authentication token
     */
    getAuthToken(): string | null;
}
/**
 * Create API services with custom configuration
 */
export declare const createApiServices: (baseURL?: string) => ApiServices;
/**
 * Default API services instance for development
 */
export declare const api: ApiServices;
/**
 * Environment-specific API configurations
 */
export declare const API_ENDPOINTS: {
    readonly development: "http://localhost:3000/api/v1";
    readonly staging: "https://staging-api.harshadelights.com/api/v1";
    readonly production: "https://api.harshadelights.com/api/v1";
};
/**
 * Get API base URL for current environment
 */
export declare const getApiBaseURL: () => string;
/**
 * Create environment-aware API services
 */
export declare const createEnvironmentApiServices: () => ApiServices;
/**
 * Authentication helpers
 */
export declare const authHelpers: {
    /**
     * Store authentication tokens in localStorage
     */
    storeTokens: (accessToken: string, refreshToken: string) => void;
    /**
     * Get stored access token
     */
    getStoredAccessToken: () => string | null;
    /**
     * Get stored refresh token
     */
    getStoredRefreshToken: () => string | null;
    /**
     * Clear stored tokens
     */
    clearStoredTokens: () => void;
    /**
     * Check if user is authenticated
     */
    isAuthenticated: () => boolean;
    /**
     * Initialize API services with stored token
     */
    initializeWithStoredToken: (apiServices: ApiServices) => void;
};
/**
 * Error handling helpers
 */
export declare const errorHelpers: {
    /**
     * Check if error is authentication error
     */
    isAuthError: (error: any) => boolean;
    /**
     * Check if error is validation error
     */
    isValidationError: (error: any) => boolean;
    /**
     * Check if error is network error
     */
    isNetworkError: (error: any) => boolean;
    /**
     * Get user-friendly error message
     */
    getErrorMessage: (error: any) => string;
};
/**
 * Request helpers for common operations
 */
export declare const requestHelpers: {
    /**
     * Handle API response with automatic error handling
     */
    handleResponse: <T>(apiCall: () => Promise<ApiResponse<T>>) => Promise<T>;
    /**
     * Retry API call with exponential backoff
     */
    retryApiCall: <T>(apiCall: () => Promise<ApiResponse<T>>, maxRetries?: number, baseDelay?: number) => Promise<T>;
};
//# sourceMappingURL=index.d.ts.map