/**
 * API Key Model for API Gateway
 * Handles API key operations for authentication and access control
 */

const crypto = require('crypto');
const { logger } = require("../utils/logger");
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

class ApiKey {
  constructor(db) {
    this.db = db;
    this.tableName = 'api_keys';
  }

  /**
   * Generate a new API key
   * @param {Object} keyData - API key data
   * @returns {Object} Created API key with plain key (one time only)
   */
  async create(keyData) {
    const {
      userId,
      keyName,
      keyDescription = null,
      serviceName = null,
      applicationName = null,
      permissions = [],
      ipWhitelist = null,
      domainWhitelist = null,
      rateLimitTier = 'standard',
      expiresAt = null,
      createdBy
    } = keyData;

    // Validate required fields
    if (!userId || !keyName || !createdBy) {
      throw new Error('User ID, key name, and created by are required');
    }

    // Generate raw API key
    const rawKey = this.generateRawKey();
    const keyPrefix = config.apiKey.prefix;
    const fullKey = `${keyPrefix}${rawKey}`;

    // Hash the key for storage
    const keyHash = await bcrypt.hash(fullKey, 10);

    // Set rate limits based on tier
    const rateLimits = this.getRateLimitsForTier(rateLimitTier);

    const keyRecord = {
      key_id: uuidv4(),
      api_key_hash: keyHash,
      key_name: keyName,
      key_description: keyDescription,
      key_prefix: keyPrefix,
      user_id: userId,
      service_name: serviceName,
      application_name: applicationName,
      permissions: JSON.stringify(permissions),
      ip_whitelist: ipWhitelist ? JSON.stringify(ipWhitelist) : null,
      domain_whitelist: domainWhitelist ? JSON.stringify(domainWhitelist) : null,
      rate_limit_tier: rateLimitTier,
      requests_per_minute: rateLimits.perMinute,
      requests_per_hour: rateLimits.perHour,
      requests_per_day: rateLimits.perDay,
      is_active: true,
      expires_at: expiresAt,
      total_requests: 0,
      successful_requests: 0,
      failed_requests: 0,
      created_by: createdBy,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [createdKey] = await this.db(this.tableName)
      .insert(keyRecord)
      .returning([
        'id', 'key_id', 'key_name', 'key_description', 'key_prefix',
        'user_id', 'service_name', 'application_name', 'permissions',
        'rate_limit_tier', 'is_active', 'expires_at', 'created_at'
      ]);

    // Return the key with the plain text API key (one time only)
    return {
      ...createdKey,
      api_key: fullKey, // This is the only time the plain key is returned
      permissions: JSON.parse(createdKey.permissions)
    };
  }

  /**
   * Validate and retrieve API key information
   * @param {string} apiKey - The API key to validate
   * @param {string} clientIp - Client IP address for validation
   * @returns {Object|null} API key information or null if invalid
   */
  async validateKey(apiKey, clientIp = null) {
    if (!apiKey || !apiKey.startsWith(config.apiKey.prefix)) {
      return null;
    }

    try {
      // Get all active API keys (we need to check hashes)
      const activeKeys = await this.db(this.tableName)
        .where({ is_active: true })
        .where(function() {
          this.whereNull('expires_at')
            .orWhere('expires_at', '>', new Date());
        });

      // Find matching key by comparing hashes
      let matchedKey = null;
      for (const keyRecord of activeKeys) {
        const isMatch = await bcrypt.compare(apiKey, keyRecord.api_key_hash);
        if (isMatch) {
          matchedKey = keyRecord;
          break;
        }
      }

      if (!matchedKey) {
        return null;
      }

      // Validate IP whitelist if configured
      if (matchedKey.ip_whitelist && clientIp) {
        const allowedIps = JSON.parse(matchedKey.ip_whitelist);
        if (!allowedIps.includes(clientIp)) {
          throw new Error('IP address not in whitelist');
        }
      }

      // Update last used timestamp
      await this.updateLastUsed(matchedKey.key_id);

      return {
        ...matchedKey,
        permissions: JSON.parse(matchedKey.permissions || '[]'),
        ip_whitelist: matchedKey.ip_whitelist ? JSON.parse(matchedKey.ip_whitelist) : null,
        domain_whitelist: matchedKey.domain_whitelist ? JSON.parse(matchedKey.domain_whitelist) : null
      };

    } catch (error) {
      logger.error('API Key validation error:', error);
      return null;
    }
  }

  /**
   * Find API key by ID
   * @param {string} keyId - API key UUID
   * @returns {Object|null} API key object or null
   */
  async findById(keyId) {
    const apiKey = await this.db(this.tableName)
      .where({ key_id: keyId })
      .first();

    if (!apiKey) {
      return null;
    }

    return {
      ...apiKey,
      permissions: JSON.parse(apiKey.permissions || '[]'),
      ip_whitelist: apiKey.ip_whitelist ? JSON.parse(apiKey.ip_whitelist) : null,
      domain_whitelist: apiKey.domain_whitelist ? JSON.parse(apiKey.domain_whitelist) : null
    };
  }

  /**
   * Get API keys for a user
   * @param {string} userId - User UUID
   * @param {Object} options - Query options
   * @returns {Object} API keys list with pagination
   */
  async findByUserId(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      includeInactive = false
    } = options;

    const offset = (page - 1) * limit;

    let query = this.db(this.tableName)
      .select([
        'id', 'key_id', 'key_name', 'key_description', 'key_prefix',
        'service_name', 'application_name', 'permissions',
        'rate_limit_tier', 'is_active', 'expires_at',
        'total_requests', 'successful_requests', 'failed_requests',
        'last_used_at', 'created_at', 'updated_at'
      ])
      .where({ user_id: userId });

    if (!includeInactive) {
      query = query.where({ is_active: true });
    }

    // Get total count
    const countQuery = query.clone();
    const [{ count }] = await countQuery.count('* as count');
    const total = parseInt(count);

    // Get paginated results
    const apiKeys = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Parse JSON fields
    const processedKeys = apiKeys.map(key => ({
      ...key,
      permissions: JSON.parse(key.permissions || '[]')
    }));

    return {
      apiKeys: processedKeys,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Update API key
   * @param {string} keyId - API key UUID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated API key
   */
  async update(keyId, updateData) {
    const allowedFields = [
      'key_name',
      'key_description',
      'permissions',
      'ip_whitelist',
      'domain_whitelist',
      'rate_limit_tier',
      'is_active',
      'expires_at'
    ];

    const filteredData = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        if (key === 'permissions' || key === 'ip_whitelist' || key === 'domain_whitelist') {
          filteredData[key] = Array.isArray(updateData[key])
            ? JSON.stringify(updateData[key])
            : updateData[key];
        } else {
          filteredData[key] = updateData[key];
        }
      }
    });

    // Update rate limits if tier changed
    if (filteredData.rate_limit_tier) {
      const rateLimits = this.getRateLimitsForTier(filteredData.rate_limit_tier);
      filteredData.requests_per_minute = rateLimits.perMinute;
      filteredData.requests_per_hour = rateLimits.perHour;
      filteredData.requests_per_day = rateLimits.perDay;
    }

    filteredData.updated_at = new Date();

    const [updatedKey] = await this.db(this.tableName)
      .where({ key_id: keyId })
      .update(filteredData)
      .returning([
        'id', 'key_id', 'key_name', 'key_description',
        'permissions', 'rate_limit_tier', 'is_active',
        'expires_at', 'updated_at'
      ]);

    return {
      ...updatedKey,
      permissions: JSON.parse(updatedKey.permissions || '[]')
    };
  }

  /**
   * Deactivate API key
   * @param {string} keyId - API key UUID
   * @returns {boolean} Success status
   */
  async deactivate(keyId) {
    const updatedRows = await this.db(this.tableName)
      .where({ key_id: keyId })
      .update({
        is_active: false,
        updated_at: new Date()
      });

    return updatedRows > 0;
  }

  /**
   * Delete API key
   * @param {string} keyId - API key UUID
   * @returns {boolean} Success status
   */
  async delete(keyId) {
    const deletedRows = await this.db(this.tableName)
      .where({ key_id: keyId })
      .del();

    return deletedRows > 0;
  }

  /**
   * Update usage statistics
   * @param {string} keyId - API key UUID
   * @param {boolean} success - Whether the request was successful
   * @returns {void}
   */
  async updateUsageStats(keyId, success = true) {
    const incrementField = success ? 'successful_requests' : 'failed_requests';

    await this.db(this.tableName)
      .where({ key_id: keyId })
      .increment('total_requests', 1)
      .increment(incrementField, 1)
      .update({ updated_at: new Date() });
  }

  /**
   * Update last used timestamp
   * @param {string} keyId - API key UUID
   * @returns {void}
   */
  async updateLastUsed(keyId) {
    await this.db(this.tableName)
      .where({ key_id: keyId })
      .update({
        last_used_at: new Date(),
        updated_at: new Date()
      });
  }

  /**
   * Get expired API keys
   * @returns {Array} List of expired API keys
   */
  async getExpiredKeys() {
    return await this.db(this.tableName)
      .where('expires_at', '<', new Date())
      .where({ is_active: true });
  }

  /**
   * Cleanup expired API keys
   * @returns {number} Number of keys deactivated
   */
  async cleanupExpiredKeys() {
    const updatedRows = await this.db(this.tableName)
      .where('expires_at', '<', new Date())
      .where({ is_active: true })
      .update({
        is_active: false,
        updated_at: new Date()
      });

    return updatedRows;
  }

  /**
   * Generate raw API key
   * @returns {string} Random API key
   */
  generateRawKey() {
    const keyLength = config.apiKey.length;
    return crypto.randomBytes(keyLength).toString('hex');
  }

  /**
   * Get rate limits for tier
   * @param {string} tier - Rate limit tier
   * @returns {Object} Rate limit configuration
   */
  getRateLimitsForTier(tier) {
    const tiers = {
      basic: {
        perMinute: config.rateLimit.tiers.basic,
        perHour: config.rateLimit.tiers.basic * 60,
        perDay: config.rateLimit.tiers.basic * 60 * 24
      },
      standard: {
        perMinute: config.rateLimit.tiers.standard,
        perHour: config.rateLimit.tiers.standard * 60,
        perDay: config.rateLimit.tiers.standard * 60 * 24
      },
      premium: {
        perMinute: config.rateLimit.tiers.premium,
        perHour: config.rateLimit.tiers.premium * 60,
        perDay: config.rateLimit.tiers.premium * 60 * 24
      },
      unlimited: {
        perMinute: 0, // 0 means unlimited
        perHour: 0,
        perDay: 0
      }
    };

    return tiers[tier] || tiers.standard;
  }

  /**
   * Check if API key has permission
   * @param {Array} keyPermissions - API key permissions
   * @param {string} requiredPermission - Required permission
   * @returns {boolean} Has permission
   */
  hasPermission(keyPermissions, requiredPermission) {
    if (!keyPermissions || !Array.isArray(keyPermissions)) {
      return false;
    }

    // Check for wildcard permission
    if (keyPermissions.includes('*')) {
      return true;
    }

    // Check for exact match
    if (keyPermissions.includes(requiredPermission)) {
      return true;
    }

    // Check for pattern match (e.g., 'customers:*' matches 'customers:read')
    return keyPermissions.some(permission => {
      if (permission.endsWith(':*')) {
        const basePermission = permission.slice(0, -2);
        return requiredPermission.startsWith(basePermission + ':');
      }
      return false;
    });
  }
}

module.exports = ApiKey;
