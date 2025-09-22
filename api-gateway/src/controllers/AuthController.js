/**
 * Authentication Controller for API Gateway
 * Handles HTTP requests for authentication endpoints
 */

const Joi = require('joi');
const { logger } = require("../utils/logger");
const AuthService = require('../services/AuthService');
const { getApiGatewayDB } = require('../config/database');

class AuthController {
  constructor() {
    this.authService = new AuthService(getApiGatewayDB());
  }

  /**
   * User registration endpoint
   */
  async register(req, res) {
    try {
      // Validation schema
      const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        fullName: Joi.string().min(2).max(100).required(),
        userType: Joi.string().valid('internal', 'external', 'service').default('internal'),
        department: Joi.string().max(100).optional(),
        role: Joi.string().valid('administrator', 'user', 'manager', 'analyst', 'readonly').default('user')
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      // Get client information
      const clientInfo = {
        clientIp: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        deviceFingerprint: req.get('X-Device-Fingerprint')
      };

      const result = await this.authService.register(value, clientInfo);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      logger.error('Registration controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * User login endpoint
   */
  async login(req, res) {
    try {
      // Validation schema
      const schema = Joi.object({
        identifier: Joi.string().required(), // email or username
        password: Joi.string().required(),
        totpCode: Joi.string().length(6).pattern(/^[0-9]+$/).optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      // Get client information
      const clientInfo = {
        clientIp: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        deviceFingerprint: req.get('X-Device-Fingerprint')
      };

      const result = await this.authService.login(
        value.identifier,
        value.password,
        value.totpCode,
        clientInfo
      );

      if (result.success) {
        // Set secure HTTP-only cookie for refresh token (optional)
        if (result.tokens && result.tokens.refreshToken) {
          res.cookie('refreshToken', result.tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
          });
        }

        res.status(200).json(result);
      } else {
        const statusCode = result.requiresTwoFactor ? 202 : 401;
        res.status(statusCode).json(result);
      }

    } catch (error) {
      logger.error('Login controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Token refresh endpoint
   */
  async refreshToken(req, res) {
    try {
      let refreshToken = req.body.refreshToken;

      // Also check for refresh token in cookies
      if (!refreshToken && req.cookies.refreshToken) {
        refreshToken = req.cookies.refreshToken;
      }

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token required'
        });
      }

      const clientInfo = {
        clientIp: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        deviceFingerprint: req.get('X-Device-Fingerprint')
      };

      const result = await this.authService.refreshToken(refreshToken, clientInfo);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }

    } catch (error) {
      logger.error('Token refresh controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * User logout endpoint
   */
  async logout(req, res) {
    try {
      const userId = req.user?.userId;
      const tokenId = req.token?.jti;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const result = await this.authService.logout(userId, tokenId);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.status(200).json(result);

    } catch (error) {
      logger.error('Logout controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Setup two-factor authentication
   */
  async setupTwoFactor(req, res) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const result = await this.authService.setupTwoFactor(userId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      logger.error('2FA setup controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Verify and enable two-factor authentication
   */
  async verifyTwoFactor(req, res) {
    try {
      const schema = Joi.object({
        totpCode: Joi.string().length(6).pattern(/^[0-9]+$/).required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const result = await this.authService.verifyAndEnableTwoFactor(userId, value.totpCode);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      logger.error('2FA verification controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(req, res) {
    try {
      const schema = Joi.object({
        password: Joi.string().required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const result = await this.authService.disableTwoFactor(userId, value.password);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      logger.error('2FA disable controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Change password endpoint
   */
  async changePassword(req, res) {
    try {
      const schema = Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(8).required(),
        confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const result = await this.authService.changePassword(
        userId,
        value.currentPassword,
        value.newPassword
      );

      if (result.success) {
        // Clear refresh token cookie since all tokens are revoked
        res.clearCookie('refreshToken');
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      logger.error('Change password controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get user profile
   */
  async getProfile(req, res) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const result = await this.authService.getUserProfile(userId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }

    } catch (error) {
      logger.error('Get profile controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    try {
      const schema = Joi.object({
        fullName: Joi.string().min(2).max(100).optional(),
        department: Joi.string().max(100).optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const result = await this.authService.updateUserProfile(userId, value);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      logger.error('Update profile controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Create API key
   */
  async createApiKey(req, res) {
    try {
      const schema = Joi.object({
        keyName: Joi.string().min(3).max(100).required(),
        keyDescription: Joi.string().max(500).optional(),
        serviceName: Joi.string().max(100).optional(),
        applicationName: Joi.string().max(100).optional(),
        permissions: Joi.array().items(Joi.string()).default([]),
        ipWhitelist: Joi.array().items(Joi.string().ip()).optional(),
        domainWhitelist: Joi.array().items(Joi.string().domain()).optional(),
        rateLimitTier: Joi.string().valid('basic', 'standard', 'premium', 'unlimited').default('standard'),
        expiresAt: Joi.date().iso().greater('now').optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const result = await this.authService.createApiKey(userId, value);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      logger.error('Create API key controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get user's API keys
   */
  async getApiKeys(req, res) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        includeInactive: req.query.includeInactive === 'true'
      };

      const result = await this.authService.getUserApiKeys(userId, options);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      logger.error('Get API keys controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get user's active sessions
   */
  async getSessions(req, res) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const result = await this.authService.getUserSessions(userId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      logger.error('Get sessions controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Revoke user session
   */
  async revokeSession(req, res) {
    try {
      const schema = Joi.object({
        tokenId: Joi.string().uuid().required()
      });

      const { error, value } = schema.validate(req.params);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const result = await this.authService.revokeUserSession(userId, value.tokenId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      logger.error('Revoke session controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(req, res) {
    try {
      res.status(200).json({
        success: true,
        service: 'API Gateway Authentication',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || '1.0.0'
      });
    } catch (error) {
      logger.error('Health check error:', error);
      res.status(500).json({
        success: false,
        error: 'Service unavailable'
      });
    }
  }
}

module.exports = new AuthController();
