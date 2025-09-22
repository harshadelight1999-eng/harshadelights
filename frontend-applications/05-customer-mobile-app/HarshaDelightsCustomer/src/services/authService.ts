// Authentication service for API integration

import { ApiService } from './api';
import { API_ENDPOINTS } from '../constants';
import { User, ApiResponse } from '../types';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  requiresVerification?: boolean;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

interface VerifyOTPRequest {
  email: string;
  otp: string;
  type: 'register' | 'reset_password';
}

interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatar?: string;
}

class AuthService extends ApiService {
  constructor() {
    super();
  }

  // Login user
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.auth.login,
      credentials
    );
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    return this.post<ApiResponse<RegisterResponse>>(
      API_ENDPOINTS.auth.register,
      userData
    );
  }

  // Logout user
  async logout(): Promise<ApiResponse<boolean>> {
    return this.post<ApiResponse<boolean>>(API_ENDPOINTS.auth.logout);
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> {
    return this.post<ApiResponse<RefreshTokenResponse>>(
      API_ENDPOINTS.auth.refresh,
      { refreshToken }
    );
  }

  // Forgot password - send reset email
  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.post<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.auth.forgotPassword,
      { email }
    );
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    return this.post<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.auth.resetPassword,
      { token, newPassword }
    );
  }

  // Verify OTP
  async verifyOTP(
    email: string,
    otp: string,
    type: 'register' | 'reset_password'
  ): Promise<ApiResponse<LoginResponse | { message: string }>> {
    return this.post<ApiResponse<LoginResponse | { message: string }>>(
      API_ENDPOINTS.auth.verifyOTP,
      { email, otp, type }
    );
  }

  // Resend OTP
  async resendOTP(
    email: string,
    type: 'register' | 'reset_password'
  ): Promise<ApiResponse<{ message: string }>> {
    return this.post<ApiResponse<{ message: string }>>(
      '/auth/resend-otp',
      { email, type }
    );
  }

  // Get user profile
  async getProfile(): Promise<ApiResponse<User>> {
    return this.get<ApiResponse<User>>(API_ENDPOINTS.auth.profile);
  }

  // Update user profile
  async updateProfile(userData: UpdateProfileRequest): Promise<ApiResponse<{ user: User }>> {
    return this.put<ApiResponse<{ user: User }>>(
      API_ENDPOINTS.auth.profile,
      userData
    );
  }

  // Change password
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.post<ApiResponse<{ message: string }>>(
      '/auth/change-password',
      { currentPassword, newPassword }
    );
  }

  // Delete account
  async deleteAccount(password: string): Promise<ApiResponse<{ message: string }>> {
    return this.delete<ApiResponse<{ message: string }>>(
      '/auth/delete-account',
      { password }
    );
  }

  // Social login (Google, Facebook, Apple)
  async socialLogin(
    provider: 'google' | 'facebook' | 'apple',
    token: string
  ): Promise<ApiResponse<LoginResponse>> {
    return this.post<ApiResponse<LoginResponse>>(
      `/auth/social/${provider}`,
      { token }
    );
  }

  // Check email availability
  async checkEmailAvailability(email: string): Promise<ApiResponse<{ available: boolean }>> {
    return this.get<ApiResponse<{ available: boolean }>>(
      '/auth/check-email',
      { email }
    );
  }

  // Send verification email
  async sendVerificationEmail(): Promise<ApiResponse<{ message: string }>> {
    return this.post<ApiResponse<{ message: string }>>(
      '/auth/send-verification'
    );
  }

  // Verify email address
  async verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
    return this.post<ApiResponse<{ message: string }>>(
      '/auth/verify-email',
      { token }
    );
  }

  // Enable two-factor authentication
  async enableTwoFactor(): Promise<ApiResponse<{ qrCode: string; secret: string }>> {
    return this.post<ApiResponse<{ qrCode: string; secret: string }>>(
      '/auth/2fa/enable'
    );
  }

  // Verify two-factor authentication setup
  async verifyTwoFactor(token: string): Promise<ApiResponse<{ backupCodes: string[] }>> {
    return this.post<ApiResponse<{ backupCodes: string[] }>>(
      '/auth/2fa/verify',
      { token }
    );
  }

  // Disable two-factor authentication
  async disableTwoFactor(password: string): Promise<ApiResponse<{ message: string }>> {
    return this.post<ApiResponse<{ message: string }>>(
      '/auth/2fa/disable',
      { password }
    );
  }

  // Get login sessions
  async getLoginSessions(): Promise<ApiResponse<{
    sessions: Array<{
      id: string;
      deviceInfo: string;
      ipAddress: string;
      location?: string;
      lastActivity: string;
      isCurrent: boolean;
    }>;
  }>> {
    return this.get<ApiResponse<{
      sessions: Array<{
        id: string;
        deviceInfo: string;
        ipAddress: string;
        location?: string;
        lastActivity: string;
        isCurrent: boolean;
      }>;
    }>>(
      '/auth/sessions'
    );
  }

  // Revoke login session
  async revokeSession(sessionId: string): Promise<ApiResponse<{ message: string }>> {
    return this.delete<ApiResponse<{ message: string }>>(
      '/auth/sessions/:sessionId',
      { sessionId }
    );
  }

  // Revoke all other sessions
  async revokeAllOtherSessions(): Promise<ApiResponse<{ message: string }>> {
    return this.post<ApiResponse<{ message: string }>>(
      '/auth/sessions/revoke-all'
    );
  }
}

// Create and export singleton instance
export const authService = new AuthService();

// Export the class for testing purposes
export { AuthService };