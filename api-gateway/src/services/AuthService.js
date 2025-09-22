/**
 * Authentication Service for API Gateway
 * Handles authentication logic and user management
 */

const speakeasy = require('speakeasy');
const { logger } = require("../utils/logger");
const QRCode = require('qrcode');
const config = require('../config');
const User = require('../models/User');
const JwtToken = require('../models/JwtToken');
const ApiKey = require('../models/ApiKey');

class AuthService {
  constructor(db) {
    this.db = db;
    this.userModel = new User(db);
    this.jwtTokenModel = new JwtToken(db);
    this.apiKeyModel = new ApiKey(db);
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {Object} clientInfo - Client information
   * @returns {Object} Registration result
   */
  async register(userData, clientInfo = {}) {
    try {
      // Create user
      const user = await this.userModel.create(userData);

      // Generate initial token pair
      const tokens = await this.jwtTokenModel.generateTokenPair(user, clientInfo);

      return {
        success: true,
        user: {
          id: user.id,
          userId: user.user_id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          userType: user.user_type,
          isVerified: user.is_verified,
          createdAt: user.created_at
        },
        tokens,
        message: 'User registered successfully'
      };

    } catch (error) {
      logger.error('Registration error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Authenticate user with credentials
   * @param {string} identifier - Email or username
   * @param {string} password - Password
   * @param {string} totpCode - TOTP code (if 2FA enabled)
   * @param {Object} clientInfo - Client information
   * @returns {Object} Authentication result
   */
  async login(identifier, password, totpCode = null, clientInfo = {}) {
    try {
      // Authenticate user
      const user = await this.userModel.authenticate(identifier, password);

      if (!user) {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      // Check if 2FA is enabled
      if (user.two_factor_enabled) {
        if (!totpCode) {
          return {
            success: false,
            requiresTwoFactor: true,
            error: 'Two-factor authentication code required'
          };
        }

        // Verify TOTP code
        const isValidTotp = await this.verifyTotpCode(user.user_id, totpCode);
        if (!isValidTotp) {
          return {
            success: false,
            error: 'Invalid two-factor authentication code'
          };
        }
      }

      // Revoke existing access tokens (single session mode)
      await this.jwtTokenModel.revokeUserTokens(user.user_id, 'access');

      // Generate new token pair
      const tokens = await this.jwtTokenModel.generateTokenPair(user, clientInfo);

      return {
        success: true,
        user: {
          id: user.id,
          userId: user.user_id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          userType: user.user_type,
          department: user.department,
          rateLimitTier: user.rate_limit_tier,
          twoFactorEnabled: user.two_factor_enabled,
          lastLogin: user.last_login_at
        },
        tokens,
        message: 'Authentication successful'
      };

    } catch (error) {
      logger.error('Login error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @param {Object} clientInfo - Client information
   * @returns {Object} Refresh result
   */
  async refreshToken(refreshToken, clientInfo = {}) {
    try {
      const result = await this.jwtTokenModel.refreshAccessToken(refreshToken, clientInfo);

      if (!result) {
        return {
          success: false,
          error: 'Invalid or expired refresh token'
        };
      }

      return {
        success: true,
        tokens: result,
        message: 'Token refreshed successfully'
      };

    } catch (error) {
      logger.error('Token refresh error:', error);
      return {
        success: false,
        error: 'Token refresh failed'
      };
    }
  }

  /**
   * Logout user (revoke tokens)
   * @param {string} userId - User ID
   * @param {string} tokenId - Specific token ID to revoke (optional)
   * @returns {Object} Logout result
   */
  async logout(userId, tokenId = null) {
    try {
      let revokedCount = 0;

      if (tokenId) {
        // Revoke specific token
        const success = await this.jwtTokenModel.revokeToken(tokenId, userId, 'User logout');
        revokedCount = success ? 1 : 0;
      } else {
        // Revoke all user tokens
        revokedCount = await this.jwtTokenModel.revokeUserTokens(userId, null, userId);
      }

      return {
        success: true,
        revokedTokens: revokedCount,
        message: 'Logout successful'
      };

    } catch (error) {
      logger.error('Logout error:', error);
      return {
        success: false,
        error: 'Logout failed'
      };
    }
  }

  /**
   * Setup two-factor authentication
   * @param {string} userId - User ID
   * @returns {Object} 2FA setup result with QR code
   */
  async setupTwoFactor(userId) {
    try {
      const user = await this.userModel.findByUserId(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Generate TOTP secret
      const secret = speakeasy.generateSecret({
        name: `${config.totp.serviceName} (${user.email})`,
        issuer: config.totp.issuer,
        length: 32
      });

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      // Store secret (but don't enable 2FA yet)
      await this.userModel.updateTwoFactor(userId, secret.base32, false);

      return {
        success: true,
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32,
        message: 'Two-factor authentication setup initiated. Please verify with a TOTP code to complete setup.'
      };

    } catch (error) {
      logger.error('2FA setup error:', error);
      return {
        success: false,
        error: '2FA setup failed'
      };
    }
  }

  /**
   * Verify and enable two-factor authentication
   * @param {string} userId - User ID
   * @param {string} totpCode - TOTP verification code
   * @returns {Object} Verification result
   */
  async verifyAndEnableTwoFactor(userId, totpCode) {
    try {
      const user = await this.userModel.findByUserId(userId);
      if (!user || !user.two_factor_secret) {
        return {
          success: false,
          error: 'Two-factor authentication not set up'
        };
      }

      // Verify TOTP code
      const verified = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token: totpCode,
        window: config.totp.window
      });

      if (!verified) {
        return {
          success: false,
          error: 'Invalid verification code'
        };
      }

      // Enable 2FA
      await this.userModel.updateTwoFactor(userId, user.two_factor_secret, true);

      return {
        success: true,
        message: 'Two-factor authentication enabled successfully'
      };

    } catch (error) {
      logger.error('2FA verification error:', error);
      return {
        success: false,
        error: '2FA verification failed'
      };
    }
  }

  /**
   * Disable two-factor authentication
   * @param {string} userId - User ID
   * @param {string} password - User password for verification
   * @returns {Object} Disable result
   */
  async disableTwoFactor(userId, password) {
    try {
      const user = await this.userModel.findByUserId(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Verify password
      const authResult = await this.userModel.authenticate(user.email, password);
      if (!authResult) {
        return {
          success: false,
          error: 'Invalid password'
        };
      }

      // Disable 2FA
      await this.userModel.updateTwoFactor(userId, null, false);

      return {
        success: true,
        message: 'Two-factor authentication disabled'
      };

    } catch (error) {
      logger.error('2FA disable error:', error);
      return {
        success: false,
        error: '2FA disable failed'
      };
    }
  }

  /**
   * Verify TOTP code
   * @param {string} userId - User ID
   * @param {string} totpCode - TOTP code
   * @returns {boolean} Verification result
   */
  async verifyTotpCode(userId, totpCode) {
    try {
      const user = await this.userModel.findByUserId(userId);
      if (!user || !user.two_factor_enabled || !user.two_factor_secret) {
        return false;
      }

      return speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token: totpCode,
        window: config.totp.window
      });

    } catch (error) {
      logger.error('TOTP verification error:', error);
      return false;
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object} Change result
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      await this.userModel.changePassword(userId, currentPassword, newPassword);

      // Revoke all existing tokens to force re-login
      await this.jwtTokenModel.revokeUserTokens(userId, null, userId);

      return {
        success: true,
        message: 'Password changed successfully. Please log in again.'
      };

    } catch (error) {
      logger.error('Password change error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create API key for user
   * @param {string} userId - User ID
   * @param {Object} keyData - API key data
   * @returns {Object} API key creation result
   */
  async createApiKey(userId, keyData) {
    try {
      const apiKey = await this.apiKeyModel.create({
        ...keyData,
        userId,
        createdBy: userId
      });

      return {
        success: true,
        apiKey: {
          keyId: apiKey.key_id,
          keyName: apiKey.key_name,
          keyDescription: apiKey.key_description,
          apiKey: apiKey.api_key, // Only returned once
          keyPrefix: apiKey.key_prefix,
          permissions: apiKey.permissions,
          rateLimitTier: apiKey.rate_limit_tier,
          expiresAt: apiKey.expires_at,
          createdAt: apiKey.created_at
        },
        message: 'API key created successfully. Save the key securely - it will not be shown again.'
      };

    } catch (error) {
      logger.error('API key creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate API key
   * @param {string} apiKey - API key
   * @param {string} clientIp - Client IP address
   * @returns {Object|null} API key information or null
   */
  async validateApiKey(apiKey, clientIp) {
    try {
      return await this.apiKeyModel.validateKey(apiKey, clientIp);
    } catch (error) {
      logger.error('API key validation error:', error);
      return null;
    }
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @param {string} type - Token type ('access' or 'refresh')
   * @returns {Object|null} Decoded token or null
   */
  async verifyJwtToken(token, type = 'access') {
    try {
      return await this.jwtTokenModel.verifyToken(token, type);
    } catch (error) {
      logger.error('JWT verification error:', error);
      return null;
    }
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Object} User profile
   */
  async getUserProfile(userId) {
    try {
      const user = await this.userModel.findByUserId(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const { password_hash, salt, two_factor_secret, ...profile } = user;

      return {
        success: true,
        profile
      };

    } catch (error) {
      logger.error('Get profile error:', error);
      return {
        success: false,
        error: 'Failed to retrieve profile'
      };
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Profile update data
   * @returns {Object} Update result
   */
  async updateUserProfile(userId, updateData) {
    try {
      const updatedUser = await this.userModel.update(userId, updateData);

      return {
        success: true,
        user: updatedUser,
        message: 'Profile updated successfully'
      };

    } catch (error) {
      logger.error('Profile update error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user's API keys
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Object} API keys list
   */
  async getUserApiKeys(userId, options = {}) {
    try {
      const result = await this.apiKeyModel.findByUserId(userId, options);

      return {
        success: true,
        ...result
      };

    } catch (error) {
      logger.error('Get API keys error:', error);
      return {
        success: false,
        error: 'Failed to retrieve API keys'
      };
    }
  }

  /**
   * Get user's active sessions
   * @param {string} userId - User ID
   * @returns {Object} Active sessions
   */
  async getUserSessions(userId) {
    try {
      const tokens = await this.jwtTokenModel.getUserTokens(userId, {
        tokenType: 'access',
        includeRevoked: false
      });

      const sessions = tokens.map(token => ({
        tokenId: token.token_id,
        issuedAt: token.issued_at,
        expiresAt: token.expires_at,
        lastUsedAt: token.last_used_at,
        clientIp: token.client_ip,
        userAgent: token.user_agent,
        usageCount: token.usage_count
      }));

      return {
        success: true,
        sessions
      };

    } catch (error) {
      logger.error('Get sessions error:', error);
      return {
        success: false,
        error: 'Failed to retrieve sessions'
      };
    }
  }

  /**
   * Revoke user session
   * @param {string} userId - User ID
   * @param {string} tokenId - Token ID to revoke
   * @returns {Object} Revoke result
   */
  async revokeUserSession(userId, tokenId) {
    try {
      const success = await this.jwtTokenModel.revokeToken(tokenId, userId, 'User revoked session');

      return {
        success,
        message: success ? 'Session revoked successfully' : 'Failed to revoke session'
      };

    } catch (error) {
      logger.error('Revoke session error:', error);
      return {
        success: false,
        error: 'Failed to revoke session'
      };
    }
  }
}

module.exports = AuthService;
