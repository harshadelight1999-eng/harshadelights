/**
 * Authentication API Service
 * Handles user authentication, token management, and profile operations
 */

import { ApiClient, ApiResponse } from './client';
import {
  User,
  LoginResponse,
  AuthTokens,
  ApiErrorResponse,
} from '../../types/business';

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

export class AuthService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    return this.apiClient.post<LoginResponse>('/auth/login', credentials, {
      skipAuth: true,
    });
  }

  /**
   * Register new user account
   */
  async register(data: RegisterData): Promise<ApiResponse<LoginResponse>> {
    return this.apiClient.post<LoginResponse>('/auth/register', data, {
      skipAuth: true,
    });
  }

  /**
   * Refresh authentication tokens
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    return this.apiClient.post<AuthTokens>(
      '/auth/refresh',
      { refreshToken },
      { skipAuth: true }
    );
  }

  /**
   * Logout and invalidate tokens
   */
  async logout(): Promise<ApiResponse<void>> {
    return this.apiClient.post<void>('/auth/logout');
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    return this.apiClient.get<User>('/auth/profile');
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.apiClient.put<User>('/auth/profile', data);
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<ApiResponse<void>> {
    return this.apiClient.post<void>('/auth/change-password', data);
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse<void>> {
    return this.apiClient.post<void>('/auth/forgot-password', data, {
      skipAuth: true,
    });
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<ApiResponse<void>> {
    return this.apiClient.post<void>('/auth/reset-password', data, {
      skipAuth: true,
    });
  }

  /**
   * Setup 2FA authentication
   */
  async setup2FA(): Promise<ApiResponse<Setup2FAResponse>> {
    return this.apiClient.post<Setup2FAResponse>('/auth/2fa/setup');
  }

  /**
   * Verify 2FA setup
   */
  async verify2FA(data: Verify2FAData): Promise<ApiResponse<{ backupCodes: string[] }>> {
    return this.apiClient.post<{ backupCodes: string[] }>('/auth/2fa/verify', data);
  }

  /**
   * Disable 2FA authentication
   */
  async disable2FA(data: { password: string; code: string }): Promise<ApiResponse<void>> {
    return this.apiClient.post<void>('/auth/2fa/disable', data);
  }

  /**
   * Get user API keys
   */
  async getApiKeys(): Promise<ApiResponse<ApiKey[]>> {
    return this.apiClient.get<ApiKey[]>('/auth/api-keys');
  }

  /**
   * Create new API key
   */
  async createApiKey(data: ApiKeyData): Promise<ApiResponse<ApiKey>> {
    return this.apiClient.post<ApiKey>('/auth/api-keys', data);
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(keyId: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(`/auth/api-keys/${keyId}`);
  }

  /**
   * Get user sessions
   */
  async getSessions(): Promise<ApiResponse<UserSession[]>> {
    return this.apiClient.get<UserSession[]>('/auth/sessions');
  }

  /**
   * Revoke user session
   */
  async revokeSession(sessionId: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(`/auth/sessions/${sessionId}`);
  }

  /**
   * Revoke all other sessions
   */
  async revokeAllOtherSessions(): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>('/auth/sessions/others');
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return this.apiClient.post<void>('/auth/verify-email', { token }, {
      skipAuth: true,
    });
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(): Promise<ApiResponse<void>> {
    return this.apiClient.post<void>('/auth/resend-verification');
  }

  /**
   * Check if email is available
   */
  async checkEmailAvailability(email: string): Promise<ApiResponse<{ available: boolean }>> {
    return this.apiClient.get<{ available: boolean }>(`/auth/check-email?email=${encodeURIComponent(email)}`, {
      skipAuth: true,
    });
  }
}