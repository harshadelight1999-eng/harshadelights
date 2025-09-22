/**
 * User Model for Cross-Application Authentication
 * Handles user operations for the users table with multi-application support
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const logger = require('../utils/logger');

class User {
  constructor(db) {
    this.db = db;
    this.tableName = 'users';
    this.refreshTokensTableName = 'refresh_tokens';
    this.userSessionsTableName = 'user_sessions';
  }

  /**
   * Create user table schema
   */
  static async createSchema(knex) {
    try {
      // Users table
      const usersExists = await knex.schema.hasTable('users');
      if (!usersExists) {
        await knex.schema.createTable('users', (table) => {
          table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
          table.string('email').unique().notNullable().index();
          table.string('password_hash').notNullable();
          table.string('role').notNullable().index();
          table.uuid('organization_id').notNullable().index();
          table.specificType('applications', 'text[]').defaultTo('{}');
          table.specificType('permissions', 'text[]').defaultTo('{}');
          table.jsonb('profile').defaultTo('{}');
          table.boolean('email_verified').defaultTo(false);
          table.boolean('two_factor_enabled').defaultTo(false);
          table.string('two_factor_secret');
          table.boolean('is_active').defaultTo(true);
          table.timestamp('last_login_at');
          table.string('password_reset_token');
          table.timestamp('password_reset_expires');
          table.integer('failed_login_attempts').defaultTo(0);
          table.timestamp('locked_until');
          table.timestamps(true, true);

          // Indexes for performance
          table.index(['role', 'organization_id']);
          table.index(['email_verified', 'is_active']);
          table.index('created_at');
        });
      }

      // Refresh tokens table
      const refreshTokensExists = await knex.schema.hasTable('refresh_tokens');
      if (!refreshTokensExists) {
        await knex.schema.createTable('refresh_tokens', (table) => {
          table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
          table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
          table.text('token_hash').notNullable().index();
          table.string('device_info');
          table.string('ip_address');
          table.timestamp('expires_at').notNullable().index();
          table.boolean('is_revoked').defaultTo(false).index();
          table.timestamps(true, true);

          // Indexes
          table.index(['user_id', 'is_revoked']);
        });
      }

      // User sessions table for tracking active sessions
      const userSessionsExists = await knex.schema.hasTable('user_sessions');
      if (!userSessionsExists) {
        await knex.schema.createTable('user_sessions', (table) => {
          table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
          table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
          table.text('access_token_hash').notNullable().index();
          table.string('device_info');
          table.string('ip_address');
          table.string('user_agent');
          table.timestamp('expires_at').notNullable().index();
          table.boolean('is_active').defaultTo(true).index();
          table.timestamps(true, true);

          // Indexes
          table.index(['user_id', 'is_active']);
        });
      }

      logger.info('User database schema created successfully');
    } catch (error) {
      logger.error('Error creating user schema', { error: error.message });
      throw error;
    }
  }

  /**
   * Create a new user for cross-application authentication
   * @param {Object} userData - User data
   * @returns {Object} Created user (without password hash)
   */
  async create(userData) {
    try {
      // Validate required fields
      const requiredFields = ['email', 'password', 'firstName', 'lastName'];
      for (const field of requiredFields) {
        if (!userData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Check if user already exists
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Validate password strength
      this.validatePassword(userData.password);

      // Hash password
      const saltRounds = config.security.bcryptRounds;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      // Determine role and permissions based on application
      const { role, applications, permissions } = this.determineUserAccess(
        userData.application || 'b2c',
        userData.organizationType || 'individual'
      );

      // Create user object
      const newUser = {
        id: uuidv4(),
        email: userData.email.toLowerCase().trim(),
        password_hash: passwordHash,
        role,
        organization_id: userData.organizationId || uuidv4(),
        applications,
        permissions,
        profile: {
          firstName: userData.firstName.trim(),
          lastName: userData.lastName.trim(),
          ...(userData.phone && { phone: userData.phone.trim() }),
          ...(userData.company && { company: userData.company.trim() }),
          ...(userData.address && { address: userData.address })
        },
        email_verified: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Insert user into database
      const [createdUser] = await this.db(this.tableName)
        .insert(newUser)
        .returning('*');

      logger.info('User created successfully', {
        userId: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
        applications: createdUser.applications
      });

      // Return user without password hash
      return this.sanitizeUser(createdUser);
    } catch (error) {
      logger.error('Error creating user', {
        error: error.message,
        email: userData.email
      });
      throw error;
    }
  }

  /**
   * Find user by ID
   * @param {string} id - User UUID
   * @returns {Object|null} User object or null
   */
  async findById(id) {
    try {
      const user = await this.db(this.tableName)
        .where({ id })
        .first();

      return user ? this.sanitizeUser(user) : null;
    } catch (error) {
      logger.error('Error finding user by ID', {
        error: error.message,
        userId: id
      });
      throw error;
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Object|null} User object or null
   */
  async findByEmail(email) {
    try {
      const user = await this.db(this.tableName)
        .where({ email: email.toLowerCase().trim() })
        .first();

      return user ? this.sanitizeUser(user) : null;
    } catch (error) {
      logger.error('Error finding user by email', {
        error: error.message,
        email
      });
      throw error;
    }
  }

  /**
   * Find user by email (with password hash for authentication)
   * @param {string} email - User email
   * @returns {Object|null} User object with password hash or null
   */
  async findByEmailForAuth(email) {
    try {
      const user = await this.db(this.tableName)
        .where({ email: email.toLowerCase().trim() })
        .first();

      return user || null;
    } catch (error) {
      logger.error('Error finding user by email for auth', {
        error: error.message,
        email
      });
      throw error;
    }
  }

  /**
   * Authenticate user with email and password
   * @param {string} email - User email
   * @param {string} password - Plain text password
   * @returns {Object|null} User object (without password) or null
   */
  async authenticate(email, password) {
    try {
      // Get user with password hash for authentication
      const user = await this.findByEmailForAuth(email);

      if (!user) {
        logger.warn('Authentication failed - user not found', { email });
        throw new Error('Invalid credentials');
      }

      // Check if user is active
      if (!user.is_active) {
        logger.warn('Authentication failed - user inactive', {
          userId: user.id,
          email: user.email
        });
        throw new Error('Account is deactivated');
      }

      // Check if account is locked
      if (user.locked_until && new Date() < new Date(user.locked_until)) {
        logger.warn('Authentication failed - account locked', {
          userId: user.id,
          email: user.email,
          lockedUntil: user.locked_until
        });
        throw new Error('Account temporarily locked due to failed login attempts');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        // Increment failed login attempts
        await this.incrementFailedAttempts(user.id);
        logger.warn('Authentication failed - invalid password', {
          userId: user.id,
          email: user.email
        });
        throw new Error('Invalid credentials');
      }

      // Reset failed attempts on successful login
      await this.resetFailedAttempts(user.id);

      // Update last login
      await this.updateLastLogin(user.id);

      logger.info('User authenticated successfully', {
        userId: user.id,
        email: user.email,
        role: user.role,
        applications: user.applications
      });

      return this.sanitizeUser(user);
    } catch (error) {
      logger.error('Authentication error', {
        error: error.message,
        email
      });
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User UUID
   * @param {Object} updates - Profile updates
   * @returns {Object} Updated user
   */
  async updateProfile(userId, updates) {
    try {
      const allowedFields = ['profile'];
      const updateData = {};

      // Only allow profile updates
      if (updates.profile) {
        updateData.profile = updates.profile;
      }

      if (Object.keys(updateData).length === 0) {
        throw new Error('No valid fields to update');
      }

      updateData.updated_at = new Date();

      const [updatedUser] = await this.db(this.tableName)
        .where({ id: userId })
        .update(updateData)
        .returning('*');

      if (!updatedUser) {
        throw new Error('User not found');
      }

      logger.info('User profile updated', {
        userId,
        updatedFields: Object.keys(updateData)
      });

      return this.sanitizeUser(updatedUser);
    } catch (error) {
      logger.error('Error updating user profile', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  /**
   * Change user password
   * @param {string} userId - User UUID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {boolean} Success status
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Get user with password hash
      const user = await this.db(this.tableName)
        .where({ id: userId })
        .first();

      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Validate new password
      this.validatePassword(newPassword);

      // Hash new password
      const saltRounds = config.security.bcryptRounds;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await this.db(this.tableName)
        .where({ id: userId })
        .update({
          password_hash: newPasswordHash,
          updated_at: new Date()
        });

      // Revoke all refresh tokens for this user
      await this.revokeAllRefreshTokens(userId);

      logger.info('Password changed successfully', { userId });
      return true;
    } catch (error) {
      logger.error('Error changing password', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  /**
   * Store refresh token
   * @param {string} userId - User UUID
   * @param {string} tokenHash - Hashed refresh token
   * @param {string} deviceInfo - Device information
   * @param {string} ipAddress - IP address
   * @param {Date} expiresAt - Expiration date
   * @returns {string} Token ID
   */
  async storeRefreshToken(userId, tokenHash, deviceInfo, ipAddress, expiresAt) {
    try {
      const refreshToken = {
        id: uuidv4(),
        user_id: userId,
        token_hash: tokenHash,
        device_info: deviceInfo,
        ip_address: ipAddress,
        expires_at: expiresAt,
        created_at: new Date(),
        updated_at: new Date()
      };

      await this.db(this.refreshTokensTableName).insert(refreshToken);

      logger.info('Refresh token stored', { userId, tokenId: refreshToken.id });
      return refreshToken.id;
    } catch (error) {
      logger.error('Error storing refresh token', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  /**
   * Verify refresh token
   * @param {string} tokenHash - Hashed refresh token
   * @returns {Object|null} Token record or null
   */
  async verifyRefreshToken(tokenHash) {
    try {
      const tokenRecord = await this.db(this.refreshTokensTableName)
        .where({
          token_hash: tokenHash,
          is_revoked: false
        })
        .where('expires_at', '>', new Date())
        .first();

      return tokenRecord || null;
    } catch (error) {
      logger.error('Error verifying refresh token', { error: error.message });
      throw error;
    }
  }

  /**
   * Revoke refresh token
   * @param {string} tokenHash - Hashed refresh token
   */
  async revokeRefreshToken(tokenHash) {
    try {
      await this.db(this.refreshTokensTableName)
        .where({ token_hash: tokenHash })
        .update({
          is_revoked: true,
          updated_at: new Date()
        });

      logger.info('Refresh token revoked');
    } catch (error) {
      logger.error('Error revoking refresh token', { error: error.message });
      throw error;
    }
  }

  /**
   * Revoke all refresh tokens for a user
   * @param {string} userId - User UUID
   */
  async revokeAllRefreshTokens(userId) {
    try {
      await this.db(this.refreshTokensTableName)
        .where({ user_id: userId })
        .update({
          is_revoked: true,
          updated_at: new Date()
        });

      logger.info('All refresh tokens revoked for user', { userId });
    } catch (error) {
      logger.error('Error revoking all refresh tokens', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  /**
   * Increment failed login attempts
   * @param {string} userId - User UUID
   */
  async incrementFailedAttempts(userId) {
    try {
      const user = await this.db(this.tableName)
        .where({ id: userId })
        .first();

      const failedAttempts = (user.failed_login_attempts || 0) + 1;
      const updateData = {
        failed_login_attempts: failedAttempts,
        updated_at: new Date()
      };

      // Lock account after 5 failed attempts for 30 minutes
      if (failedAttempts >= config.security.maxLoginAttempts) {
        updateData.locked_until = new Date(Date.now() + config.security.accountLockTime);
      }

      await this.db(this.tableName)
        .where({ id: userId })
        .update(updateData);

      logger.warn('Failed login attempt recorded', {
        userId,
        attempts: failedAttempts,
        locked: failedAttempts >= config.security.maxLoginAttempts
      });
    } catch (error) {
      logger.error('Error incrementing failed attempts', {
        error: error.message,
        userId
      });
    }
  }

  /**
   * Reset failed login attempts
   * @param {string} userId - User UUID
   */
  async resetFailedAttempts(userId) {
    try {
      await this.db(this.tableName)
        .where({ id: userId })
        .update({
          failed_login_attempts: 0,
          locked_until: null,
          updated_at: new Date()
        });
    } catch (error) {
      logger.error('Error resetting failed attempts', {
        error: error.message,
        userId
      });
    }
  }

  /**
   * Update last login timestamp
   * @param {string} userId - User UUID
   */
  async updateLastLogin(userId) {
    try {
      await this.db(this.tableName)
        .where({ id: userId })
        .update({
          last_login_at: new Date(),
          updated_at: new Date()
        });
    } catch (error) {
      logger.error('Error updating last login', {
        error: error.message,
        userId
      });
    }
  }

  /**
   * Clean up expired tokens
   * @returns {number} Number of deleted tokens
   */
  async cleanupExpiredTokens() {
    try {
      const deletedCount = await this.db(this.refreshTokensTableName)
        .where('expires_at', '<', new Date())
        .del();

      logger.info('Expired refresh tokens cleaned up', { deletedCount });
      return deletedCount;
    } catch (error) {
      logger.error('Error cleaning up expired tokens', { error: error.message });
      throw error;
    }
  }

  /**
   * Helper methods
   */
  sanitizeUser(user) {
    if (!user) return null;

    const { password_hash, two_factor_secret, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  determineUserAccess(application, organizationType) {
    const accessMap = {
      'b2c': {
        role: 'customer',
        applications: ['b2c'],
        permissions: ['view_products', 'place_orders', 'view_orders', 'manage_profile']
      },
      'b2b': {
        individual: {
          role: 'business_user',
          applications: ['b2b', 'b2c'],
          permissions: ['view_products', 'place_orders', 'view_orders', 'manage_profile']
        },
        business: {
          role: 'business_admin',
          applications: ['b2b', 'b2c'],
          permissions: [
            'manage_orders', 'bulk_pricing', 'view_analytics',
            'manage_team', 'view_products', 'place_orders',
            'view_orders', 'manage_profile'
          ]
        }
      }
    };

    if (application === 'b2c') {
      return accessMap.b2c;
    } else if (application === 'b2b') {
      return accessMap.b2b[organizationType] || accessMap.b2b.individual;
    }

    // Default fallback
    return accessMap.b2c;
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @throws {Error} If password doesn't meet requirements
   */
  validatePassword(password) {
    const { security } = config;

    if (password.length < security.password.minLength) {
      throw new Error(`Password must be at least ${security.password.minLength} characters long`);
    }

    if (security.password.requireUppercase && !/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (security.password.requireLowercase && !/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (security.password.requireNumbers && !/\d/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    if (security.password.requireSymbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }
  }
}

module.exports = User;