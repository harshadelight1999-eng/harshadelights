/**
 * Authentication API Service
 * Handles user authentication, token management, and profile operations
 */
import { ApiClient, ApiResponse } from './client';
import { User, LoginResponse, AuthTokens } from '../../types/business';
export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
    customerType?: string;
    companyName?: string;
    gstNumber?: string;
}
export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
export interface ForgotPasswordData {
    email: string;
}
export interface ResetPasswordData {
    token: string;
    password: string;
    confirmPassword: string;
}
export interface Setup2FAResponse {
    qrCode: string;
    secret: string;
    backupCodes: string[];
}
export interface Verify2FAData {
    code: string;
    secret?: string;
}
export interface ApiKeyData {
    name: string;
    permissions: string[];
    expiresAt?: string;
}
export interface ApiKey {
    id: string;
    name: string;
    key: string;
    permissions: string[];
    createdAt: string;
    expiresAt?: string;
    lastUsedAt?: string;
    isActive: boolean;
}
export interface UserSession {
    id: string;
    device: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    lastActiveAt: string;
    isCurrent: boolean;
}
export declare class AuthService {
    private apiClient;
    constructor(apiClient: ApiClient);
    /**
     * Login with email and password
     */
    login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>>;
    /**
     * Register new user account
     */
    register(data: RegisterData): Promise<ApiResponse<LoginResponse>>;
    /**
     * Refresh authentication tokens
     */
    refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>>;
    /**
     * Logout and invalidate tokens
     */
    logout(): Promise<ApiResponse<void>>;
    /**
     * Get current user profile
     */
    getProfile(): Promise<ApiResponse<User>>;
    /**
     * Update user profile
     */
    updateProfile(data: Partial<User>): Promise<ApiResponse<User>>;
    /**
     * Change password
     */
    changePassword(data: ChangePasswordData): Promise<ApiResponse<void>>;
    /**
     * Request password reset
     */
    forgotPassword(data: ForgotPasswordData): Promise<ApiResponse<void>>;
    /**
     * Reset password with token
     */
    resetPassword(data: ResetPasswordData): Promise<ApiResponse<void>>;
    /**
     * Setup 2FA authentication
     */
    setup2FA(): Promise<ApiResponse<Setup2FAResponse>>;
    /**
     * Verify 2FA setup
     */
    verify2FA(data: Verify2FAData): Promise<ApiResponse<{
        backupCodes: string[];
    }>>;
    /**
     * Disable 2FA authentication
     */
    disable2FA(data: {
        password: string;
        code: string;
    }): Promise<ApiResponse<void>>;
    /**
     * Get user API keys
     */
    getApiKeys(): Promise<ApiResponse<ApiKey[]>>;
    /**
     * Create new API key
     */
    createApiKey(data: ApiKeyData): Promise<ApiResponse<ApiKey>>;
    /**
     * Revoke API key
     */
    revokeApiKey(keyId: string): Promise<ApiResponse<void>>;
    /**
     * Get user sessions
     */
    getSessions(): Promise<ApiResponse<UserSession[]>>;
    /**
     * Revoke user session
     */
    revokeSession(sessionId: string): Promise<ApiResponse<void>>;
    /**
     * Revoke all other sessions
     */
    revokeAllOtherSessions(): Promise<ApiResponse<void>>;
    /**
     * Verify email address
     */
    verifyEmail(token: string): Promise<ApiResponse<void>>;
    /**
     * Resend email verification
     */
    resendEmailVerification(): Promise<ApiResponse<void>>;
    /**
     * Check if email is available
     */
    checkEmailAvailability(email: string): Promise<ApiResponse<{
        available: boolean;
    }>>;
}
//# sourceMappingURL=auth.d.ts.map