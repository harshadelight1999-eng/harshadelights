/**
 * JWT Token Model for API Gateway
 * Handles JWT token operations for session management
 */

const jwt = require('jsonwebtoken');
const { logger } = require("../utils/logger");
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const config = require('../config');

class JwtToken {
  constructor(db) {
    this.db = db;
    this.tableName = 'jwt_tokens';
  }

  /**
   * Generate access and refresh token pair
   * @param {Object} user - User object
   * @param {Object} clientInfo - Client information (IP, user agent, etc.)
   * @returns {Object} Token pair with metadata
   */
  async generateTokenPair(user, clientInfo = {}) {
    const {
      clientIp = null,
      userAgent = null,
      deviceFingerprint = null
    } = clientInfo;

    // Generate token IDs
    const accessTokenId = uuidv4();
    const refreshTokenId = uuidv4();

    // Token payload
    const tokenPayload = {
      userId: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
      userType: user.user_type,
      rateLimitTier: user.rate_limit_tier
    };

    // Generate access token
    const accessToken = jwt.sign(
      {
        ...tokenPayload,
        jti: accessTokenId,
        type: 'access'
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.accessExpiresIn,
        issuer: config.jwt.issuer,
        algorithm: config.jwt.algorithm
      }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      {
        userId: user.user_id,
        jti: refreshTokenId,
        type: 'refresh'
      },
      config.jwt.refreshSecret,
      {
        expiresIn: config.jwt.refreshExpiresIn,
        issuer: config.jwt.issuer,
        algorithm: config.jwt.algorithm
      }
    );

    // Calculate expiration times
    const accessExpiresAt = new Date(Date.now() + this.parseExpiryTime(config.jwt.accessExpiresIn));
    const refreshExpiresAt = new Date(Date.now() + this.parseExpiryTime(config.jwt.refreshExpiresIn));

    // Hash tokens for storage
    const accessTokenHash = this.hashToken(accessToken);
    const refreshTokenHash = this.hashToken(refreshToken);

    // Store tokens in database
    const accessTokenRecord = {
      token_id: accessTokenId,
      user_id: user.user_id,
      token_hash: accessTokenHash,
      token_type: 'access',
      scope: JSON.stringify({
        permissions: ['read', 'write'],
        resources: ['api']
      }),
      issued_at: new Date(),
      expires_at: accessExpiresAt,
      is_revoked: false,
      client_ip: clientIp,
      user_agent: userAgent,
      device_fingerprint: deviceFingerprint,
      usage_count: 0
    };

    const refreshTokenRecord = {
      token_id: refreshTokenId,
      user_id: user.user_id,
      token_hash: refreshTokenHash,
      token_type: 'refresh',
      scope: JSON.stringify({
        permissions: ['refresh'],
        resources: ['auth']
      }),
      issued_at: new Date(),
      expires_at: refreshExpiresAt,
      is_revoked: false,
      client_ip: clientIp,
      user_agent: userAgent,
      device_fingerprint: deviceFingerprint,
      usage_count: 0
    };

    // Insert both tokens
    await this.db(this.tableName).insert([accessTokenRecord, refreshTokenRecord]);

    return {
      accessToken,
      refreshToken,
      accessTokenId,
      refreshTokenId,
      expiresIn: Math.floor(this.parseExpiryTime(config.jwt.accessExpiresIn) / 1000), // seconds
      refreshExpiresIn: Math.floor(this.parseExpiryTime(config.jwt.refreshExpiresIn) / 1000), // seconds
      tokenType: 'Bearer'
    };
  }

  /**
   * Verify and decode JWT token
   * @param {string} token - JWT token
   * @param {string} type - Token type ('access' or 'refresh')
   * @returns {Object|null} Decoded token or null if invalid
   */
  async verifyToken(token, type = 'access') {
    try {
      // Determine which secret to use
      const secret = type === 'access' ? config.jwt.secret : config.jwt.refreshSecret;

      // Verify JWT signature and decode
      const decoded = jwt.verify(token, secret, {
        issuer: config.jwt.issuer,
        algorithms: [config.jwt.algorithm]
      });

      // Check if token type matches
      if (decoded.type !== type) {
        return null;
      }

      // Check database for token validity
      const tokenHash = this.hashToken(token);
      const tokenRecord = await this.db(this.tableName)
        .where({
          token_id: decoded.jti,
          token_hash: tokenHash,
          token_type: type,
          is_revoked: false
        })
        .where('expires_at', '>', new Date())
        .first();

      if (!tokenRecord) {
        return null;
      }

      // Update usage count and last used timestamp
      await this.updateTokenUsage(decoded.jti);

      return {
        ...decoded,
        tokenRecord
      };

    } catch (error) {
      logger.error('Token verification error:', error.message);
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @param {Object} clientInfo - Client information
   * @returns {Object|null} New token pair or null if invalid
   */
  async refreshAccessToken(refreshToken, clientInfo = {}) {
    // Verify refresh token
    const decodedRefresh = await this.verifyToken(refreshToken, 'refresh');
    if (!decodedRefresh) {
      return null;
    }

    // Get user information
    const userModel = require('./User');
    const userInstance = new userModel(this.db);
    const user = await userInstance.findByUserId(decodedRefresh.userId);

    if (!user || !user.is_active) {
      return null;
    }

    // Revoke old access tokens for this user
    await this.revokeUserTokens(user.user_id, 'access');

    // Generate new access token (keep the same refresh token)
    const accessTokenId = uuidv4();

    const tokenPayload = {
      userId: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
      userType: user.user_type,
      rateLimitTier: user.rate_limit_tier
    };

    const accessToken = jwt.sign(
      {
        ...tokenPayload,
        jti: accessTokenId,
        type: 'access'
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.accessExpiresIn,
        issuer: config.jwt.issuer,
        algorithm: config.jwt.algorithm
      }
    );

    const accessExpiresAt = new Date(Date.now() + this.parseExpiryTime(config.jwt.accessExpiresIn));
    const accessTokenHash = this.hashToken(accessToken);

    // Store new access token
    const accessTokenRecord = {
      token_id: accessTokenId,
      user_id: user.user_id,
      token_hash: accessTokenHash,
      token_type: 'access',
      scope: JSON.stringify({
        permissions: ['read', 'write'],
        resources: ['api']
      }),
      issued_at: new Date(),
      expires_at: accessExpiresAt,
      is_revoked: false,
      client_ip: clientInfo.clientIp || decodedRefresh.tokenRecord.client_ip,
      user_agent: clientInfo.userAgent || decodedRefresh.tokenRecord.user_agent,
      device_fingerprint: clientInfo.deviceFingerprint || decodedRefresh.tokenRecord.device_fingerprint,
      usage_count: 0
    };

    await this.db(this.tableName).insert(accessTokenRecord);

    return {
      accessToken,
      accessTokenId,
      expiresIn: Math.floor(this.parseExpiryTime(config.jwt.accessExpiresIn) / 1000),
      tokenType: 'Bearer'
    };
  }

  /**
   * Revoke token(s)
   * @param {string} tokenId - Token ID to revoke
   * @param {string} revokedBy - User who revoked the token
   * @param {string} reason - Revocation reason
   * @returns {boolean} Success status
   */
  async revokeToken(tokenId, revokedBy = null, reason = null) {
    const updatedRows = await this.db(this.tableName)
      .where({ token_id: tokenId })
      .update({
        is_revoked: true,
        revoked_at: new Date(),
        revoked_by: revokedBy,
        revocation_reason: reason
      });

    return updatedRows > 0;
  }

  /**
   * Revoke all tokens for a user
   * @param {string} userId - User ID
   * @param {string} tokenType - Token type ('access', 'refresh', or null for all)
   * @param {string} revokedBy - User who revoked the tokens
   * @returns {number} Number of tokens revoked
   */
  async revokeUserTokens(userId, tokenType = null, revokedBy = null) {
    let query = this.db(this.tableName)
      .where({ user_id: userId, is_revoked: false });

    if (tokenType) {
      query = query.where({ token_type: tokenType });
    }

    const updatedRows = await query.update({
      is_revoked: true,
      revoked_at: new Date(),
      revoked_by: revokedBy,
      revocation_reason: tokenType ? `Bulk revocation of ${tokenType} tokens` : 'Bulk revocation of all tokens'
    });

    return updatedRows;
  }

  /**
   * Get user's active tokens
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Array} List of active tokens
   */
  async getUserTokens(userId, options = {}) {
    const {
      tokenType = null,
      includeRevoked = false,
      limit = 50
    } = options;

    let query = this.db(this.tableName)
      .select([
        'token_id', 'token_type', 'issued_at', 'expires_at',
        'is_revoked', 'revoked_at', 'client_ip', 'user_agent',
        'device_fingerprint', 'usage_count', 'last_used_at'
      ])
      .where({ user_id: userId });

    if (tokenType) {
      query = query.where({ token_type: tokenType });
    }

    if (!includeRevoked) {
      query = query.where({ is_revoked: false });
    }

    return await query
      .orderBy('issued_at', 'desc')
      .limit(limit);
  }

  /**
   * Update token usage statistics
   * @param {string} tokenId - Token ID
   * @returns {void}
   */
  async updateTokenUsage(tokenId) {
    await this.db(this.tableName)
      .where({ token_id: tokenId })
      .increment('usage_count', 1)
      .update({ last_used_at: new Date() });
  }

  /**
   * Cleanup expired tokens
   * @param {number} batchSize - Number of tokens to process in each batch
   * @returns {number} Number of tokens cleaned up
   */
  async cleanupExpiredTokens(batchSize = 1000) {
    const deletedRows = await this.db(this.tableName)
      .where('expires_at', '<', new Date())
      .limit(batchSize)
      .del();

    return deletedRows;
  }

  /**
   * Get token statistics
   * @param {Object} filters - Optional filters
   * @returns {Object} Token statistics
   */
  async getTokenStats(filters = {}) {
    const {
      userId = null,
      fromDate = null,
      toDate = null
    } = filters;

    let query = this.db(this.tableName);

    if (userId) {
      query = query.where({ user_id: userId });
    }

    if (fromDate) {
      query = query.where('issued_at', '>=', fromDate);
    }

    if (toDate) {
      query = query.where('issued_at', '<=', toDate);
    }

    const stats = await query
      .select([
        this.db.raw('COUNT(*) as total_tokens'),
        this.db.raw('COUNT(*) FILTER (WHERE token_type = \'access\') as access_tokens'),
        this.db.raw('COUNT(*) FILTER (WHERE token_type = \'refresh\') as refresh_tokens'),
        this.db.raw('COUNT(*) FILTER (WHERE is_revoked = false) as active_tokens'),
        this.db.raw('COUNT(*) FILTER (WHERE is_revoked = true) as revoked_tokens'),
        this.db.raw('COUNT(*) FILTER (WHERE expires_at < NOW()) as expired_tokens'),
        this.db.raw('AVG(usage_count) as avg_usage_count')
      ])
      .first();

    return {
      totalTokens: parseInt(stats.total_tokens),
      accessTokens: parseInt(stats.access_tokens),
      refreshTokens: parseInt(stats.refresh_tokens),
      activeTokens: parseInt(stats.active_tokens),
      revokedTokens: parseInt(stats.revoked_tokens),
      expiredTokens: parseInt(stats.expired_tokens),
      averageUsageCount: parseFloat(stats.avg_usage_count) || 0
    };
  }

  /**
   * Hash token for secure storage
   * @param {string} token - Token to hash
   * @returns {string} Hashed token
   */
  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Parse expiry time string to milliseconds
   * @param {string} expiryString - Expiry string (e.g., '15m', '7d')
   * @returns {number} Milliseconds
   */
  parseExpiryTime(expiryString) {
    const units = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000
    };

    const match = expiryString.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid expiry format: ${expiryString}`);
    }

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }

  /**
   * Validate token format
   * @param {string} token - Token to validate
   * @returns {boolean} Is valid format
   */
  isValidTokenFormat(token) {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    return parts.length === 3;
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header value
   * @returns {string|null} Extracted token or null
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader || typeof authHeader !== 'string') {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }
}

module.exports = JwtToken;
