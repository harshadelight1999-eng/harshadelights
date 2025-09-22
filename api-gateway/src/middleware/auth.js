const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const config = require('../config');
const logger = require('../utils/logger');

// Enhanced authentication middleware for cross-application SSO with database integration
class AuthMiddleware {
  constructor(db) {
    this.db = db;
    this.userModel = new User(db);
    this.JWT_SECRET = config.jwt.secret;
    this.JWT_REFRESH_SECRET = config.jwt.refreshSecret;
    this.JWT_EXPIRY = config.jwt.accessExpiresIn;
    this.JWT_REFRESH_EXPIRY = config.jwt.refreshExpiresIn;
    this.JWT_ISSUER = config.jwt.issuer;
    this.JWT_ALGORITHM = config.jwt.algorithm;
  }

  // Generate access and refresh tokens with enhanced security
  async generateTokens(user, deviceInfo = null, ipAddress = null) {
    try {
      const now = Math.floor(Date.now() / 1000);
      const jti = crypto.randomBytes(16).toString('hex'); // Unique token ID

      const payload = {
        jti,
        iss: this.JWT_ISSUER,
        sub: user.id,
        iat: now,
        id: user.id,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id,
        permissions: user.permissions || [],
        applications: user.applications || [],
        email_verified: user.email_verified
      };

      const accessToken = jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: this.JWT_EXPIRY,
        algorithm: this.JWT_ALGORITHM
      });

      // Generate refresh token
      const refreshTokenPayload = {
        jti: crypto.randomBytes(16).toString('hex'),
        iss: this.JWT_ISSUER,
        sub: user.id,
        iat: now,
        tokenType: 'refresh'
      };

      const refreshToken = jwt.sign(refreshTokenPayload, this.JWT_REFRESH_SECRET, {
        expiresIn: this.JWT_REFRESH_EXPIRY,
        algorithm: this.JWT_ALGORITHM
      });

      // Store refresh token hash in database
      const refreshTokenHash = crypto.createHash('sha256')
        .update(refreshToken)
        .digest('hex');

      const expiresAt = new Date(Date.now() + this.parseExpiryToMs(this.JWT_REFRESH_EXPIRY));

      await this.userModel.storeRefreshToken(
        user.id,
        refreshTokenHash,
        deviceInfo,
        ipAddress,
        expiresAt
      );

      logger.info('Tokens generated successfully', {
        userId: user.id,
        jti,
        deviceInfo,
        ipAddress
      });

      return {
        accessToken,
        refreshToken,
        expiresIn: this.parseExpiryToMs(this.JWT_EXPIRY) / 1000,
        tokenType: 'Bearer'
      };
    } catch (error) {
      logger.error('Error generating tokens', {
        error: error.message,
        userId: user.id
      });
      throw error;
    }
  }

  // Verify access token with enhanced validation
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        algorithms: [this.JWT_ALGORITHM],
        issuer: this.JWT_ISSUER
      });

      // Additional validation
      if (!decoded.sub || !decoded.jti) {
        throw new Error('Invalid token structure');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  // Verify refresh token with database validation
  async verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, this.JWT_REFRESH_SECRET, {
        algorithms: [this.JWT_ALGORITHM],
        issuer: this.JWT_ISSUER
      });

      if (!decoded.sub || !decoded.jti || decoded.tokenType !== 'refresh') {
        throw new Error('Invalid refresh token structure');
      }

      // Verify token exists in database and is not revoked
      const tokenHash = crypto.createHash('sha256')
        .update(token)
        .digest('hex');

      const tokenRecord = await this.userModel.verifyRefreshToken(tokenHash);
      if (!tokenRecord) {
        throw new Error('Refresh token revoked or expired');
      }

      return { decoded, tokenRecord };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid refresh token');
      } else {
        throw error;
      }
    }
  }

  // Universal authentication middleware
  authenticate(options = {}) {
    const {
      applications = [],
      roles = [],
      permissions = [],
      optional = false
    } = options;

    return (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
          if (optional) {
            return next();
          }
          return res.status(401).json({
            error: 'Authorization header missing',
            code: 'AUTH_HEADER_MISSING'
          });
        }

        const token = authHeader.startsWith('Bearer ')
          ? authHeader.slice(7)
          : authHeader;

        if (!token) {
          if (optional) {
            return next();
          }
          return res.status(401).json({
            error: 'Token missing',
            code: 'TOKEN_MISSING'
          });
        }

        const decoded = this.verifyToken(token);

        // Check application access
        if (applications.length > 0) {
          const hasAppAccess = applications.some(app =>
            decoded.applications && decoded.applications.includes(app)
          );

          if (!hasAppAccess) {
            return res.status(403).json({
              error: 'Application access denied',
              code: 'APP_ACCESS_DENIED',
              allowedApps: applications
            });
          }
        }

        // Check role access
        if (roles.length > 0 && !roles.includes(decoded.role)) {
          return res.status(403).json({
            error: 'Insufficient role permissions',
            code: 'ROLE_ACCESS_DENIED',
            requiredRoles: roles,
            userRole: decoded.role
          });
        }

        // Check specific permissions
        if (permissions.length > 0) {
          const hasPermission = permissions.some(permission =>
            decoded.permissions && decoded.permissions.includes(permission)
          );

          if (!hasPermission) {
            return res.status(403).json({
              error: 'Insufficient permissions',
              code: 'PERMISSION_DENIED',
              requiredPermissions: permissions,
              userPermissions: decoded.permissions
            });
          }
        }

        // Attach user to request
        req.user = decoded;
        req.authToken = token;

        logger.info('Authentication successful', {
          userId: decoded.id,
          role: decoded.role,
          applications: decoded.applications,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        next();
      } catch (error) {
        logger.error('Authentication failed', {
          error: error.message,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        if (optional) {
          return next();
        }

        res.status(401).json({
          error: 'Authentication failed',
          message: error.message,
          code: 'AUTH_FAILED'
        });
      }
    };
  }

  // Cross-application authorization
  authorizeApplication(allowedApps) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'User not authenticated',
          code: 'USER_NOT_AUTH'
        });
      }

      const userApps = req.user.applications || [];
      const hasAccess = allowedApps.some(app => userApps.includes(app));

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Application access denied',
          code: 'APP_ACCESS_DENIED',
          userApplications: userApps,
          requiredApplications: allowedApps
        });
      }

      next();
    };
  }

  // Role-based authorization
  authorizeRole(allowedRoles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'User not authenticated',
          code: 'USER_NOT_AUTH'
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Role access denied',
          code: 'ROLE_ACCESS_DENIED',
          userRole: req.user.role,
          requiredRoles: allowedRoles
        });
      }

      next();
    };
  }

  // Permission-based authorization
  authorizePermission(requiredPermissions) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'User not authenticated',
          code: 'USER_NOT_AUTH'
        });
      }

      const userPermissions = req.user.permissions || [];
      const hasPermission = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Permission denied',
          code: 'PERMISSION_DENIED',
          userPermissions,
          requiredPermissions
        });
      }

      next();
    };
  }

  // Enhanced token refresh middleware with database validation
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: 'Refresh token required',
          code: 'REFRESH_TOKEN_MISSING'
        });
      }

      // Verify refresh token
      const { decoded, tokenRecord } = await this.verifyRefreshToken(refreshToken);

      // Get user from database
      const user = await this.userModel.findById(decoded.sub);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      if (!user.is_active) {
        return res.status(403).json({
          error: 'Account deactivated',
          code: 'ACCOUNT_DEACTIVATED'
        });
      }

      // Revoke old refresh token
      const oldTokenHash = crypto.createHash('sha256')
        .update(refreshToken)
        .digest('hex');
      await this.userModel.revokeRefreshToken(oldTokenHash);

      // Generate new tokens
      const deviceInfo = req.get('User-Agent') || 'Unknown';
      const ipAddress = req.ip;

      const tokens = await this.generateTokens(user, deviceInfo, ipAddress);

      logger.info('Token refreshed successfully', {
        userId: user.id,
        oldTokenId: tokenRecord.id
      });

      res.json({
        message: 'Token refreshed successfully',
        ...tokens
      });

    } catch (error) {
      logger.error('Token refresh failed', {
        error: error.message,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(401).json({
        error: 'Token refresh failed',
        message: error.message,
        code: 'REFRESH_FAILED'
      });
    }
  }

  // Enhanced CORS handler with security headers
  corsHandler(req, res, next) {
    const allowedOrigins = config.cors.origin;
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', config.cors.methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', config.cors.allowedHeaders.join(', '));
    res.setHeader('Access-Control-Allow-Credentials', config.cors.credentials);
    res.setHeader('Access-Control-Max-Age', '86400');

    // Additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    next();
  }

  // Parse expiry string to milliseconds
  parseExpiryToMs(expiry) {
    const units = {
      's': 1000,
      'm': 60 * 1000,
      'h': 60 * 60 * 1000,
      'd': 24 * 60 * 60 * 1000
    };

    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error('Invalid expiry format');
    }

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }

  // Logout and revoke tokens
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const authHeader = req.headers.authorization;

      // Revoke refresh token if provided
      if (refreshToken) {
        const tokenHash = crypto.createHash('sha256')
          .update(refreshToken)
          .digest('hex');
        await this.userModel.revokeRefreshToken(tokenHash);
      }

      // In a more sophisticated implementation, you would also blacklist the access token
      // For now, we just log the logout
      if (req.user) {
        logger.info('User logout', {
          userId: req.user.id,
          email: req.user.email,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
      }

      res.json({
        message: 'Logout successful'
      });
    } catch (error) {
      logger.error('Logout error', {
        error: error.message,
        userId: req.user?.id
      });

      res.status(500).json({
        error: 'Logout failed',
        message: error.message
      });
    }
  }

  // Application context middleware
  applicationContext(req, res, next) {
    const appContext = req.headers['x-application-context'] || 'unknown';
    req.applicationContext = appContext;

    logger.info('Request context', {
      application: appContext,
      userId: req.user?.id,
      path: req.path,
      method: req.method
    });

    next();
  }
}

module.exports = new AuthMiddleware();