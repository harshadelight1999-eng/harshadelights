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
export declare class ApiClient {
    private baseURL;
    private defaultTimeout;
    private defaultHeaders;
    private retryAttempts;
    private retryDelay;
    private authToken;
    constructor(config: ApiClientConfig);
    /**
     * Set authentication token for subsequent requests
     */
    setAuthToken(token: string | null): void;
    /**
     * Get current authentication token
     */
    getAuthToken(): string | null;
    /**
     * Build headers for request
     */
    private buildHeaders;
    /**
     * Create AbortController for request timeout
     */
    private createAbortController;
    /**
     * Handle API errors and create standardized error objects
     */
    private handleError;
    /**
     * Sleep utility for retry delays
     */
    private sleep;
    /**
     * Make HTTP request with retry logic
     */
    private makeRequest;
    /**
     * GET request
     */
    get<T = any>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>>;
    /**
     * POST request
     */
    post<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
    /**
     * PUT request
     */
    put<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
    /**
     * PATCH request
     */
    patch<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
    /**
     * DELETE request
     */
    delete<T = any>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>>;
}
/**
 * Create API client instance for different environments
 */
export declare const createApiClient: (config: ApiClientConfig) => ApiClient;
/**
 * Default API client configuration for development
 */
export declare const createDefaultApiClient: (baseURL?: string) => ApiClient;
//# sourceMappingURL=client.d.ts.map