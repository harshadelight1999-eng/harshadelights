const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const config = require('../config');
const logger = require('../utils/logger');

const router = express.Router();

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development
    return config.app.env === 'development';
  }
});

// Aggressive rate limiting for failed attempts
const strictAuthLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per windowMs for failed attempts
  skipSuccessfulRequests: true,
  message: {
    error: 'Too many failed authentication attempts',
    code: 'STRICT_RATE_LIMIT_EXCEEDED',
    retryAfter: 60 * 60
  }
});

// Initialize auth middleware and user model
let authMiddleware;
let userModel;

// Middleware to initialize dependencies
router.use((req, res, next) => {
  if (!authMiddleware && req.app.locals.db) {
    const AuthMiddleware = require('../middleware/auth');
    authMiddleware = new AuthMiddleware(req.app.locals.db);
    userModel = new User(req.app.locals.db);
  }
  next();
});

// Cross-application login with enhanced security
router.post('/login', authLimiter, strictAuthLimiter, [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('application')
    .optional()
    .isIn(['b2c', 'b2b', 'admin'])
    .withMessage('Invalid application type'),
  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('Remember me must be boolean')
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { email, password, application = 'b2c', rememberMe = false } = req.body;
    const deviceInfo = req.get('User-Agent') || 'Unknown';
    const ipAddress = req.ip;

    // Authenticate user
    const user = await userModel.authenticate(email, password);

    // Check application access
    if (!user.applications.includes(application)) {
      logger.warn('Application access denied', {
        userId: user.id,
        email: user.email,
        requestedApp: application,
        allowedApps: user.applications,
        ip: ipAddress
      });

      return res.status(403).json({
        error: 'Application access denied',
        code: 'APP_ACCESS_DENIED',
        allowedApplications: user.applications
      });
    }

    // Generate tokens
    const tokens = await authMiddleware.generateTokens(user, deviceInfo, ipAddress);

    // Log successful login
    logger.info('User login successful', {
      userId: user.id,
      email: user.email,
      role: user.role,
      application,
      ip: ipAddress,
      deviceInfo
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id,
        applications: user.applications,
        permissions: user.permissions,
        profile: user.profile,
        email_verified: user.email_verified
      },
      ...tokens,
      applicationContext: application
    });

  } catch (error) {
    logger.error('Login error', {
      error: error.message,
      email: req.body.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Don't expose internal error details
    const isAuthError = error.message.includes('Invalid credentials') ||
                       error.message.includes('Account temporarily locked') ||
                       error.message.includes('Account is deactivated');

    if (isAuthError) {
      return res.status(401).json({
        error: error.message,
        code: 'AUTHENTICATION_FAILED'
      });
    }

    res.status(500).json({
      error: 'Login failed',
      code: 'INTERNAL_ERROR',
      message: 'An internal error occurred during login'
    });
  }
});

// Cross-application registration with enhanced validation
router.post('/register', authLimiter, [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least 8 characters with uppercase, lowercase, number, and special character'),
  body('firstName')
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name must be 2-50 characters and contain only letters'),
  body('lastName')
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name must be 2-50 characters and contain only letters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Valid phone number is required'),
  body('company')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be 2-100 characters'),
  body('application')
    .optional()
    .isIn(['b2c', 'b2b'])
    .withMessage('Application must be b2c or b2b'),
  body('organizationType')
    .optional()
    .isIn(['individual', 'business'])
    .withMessage('Organization type must be individual or business')
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      company,
      application = 'b2c',
      organizationType = 'individual'
    } = req.body;

    const deviceInfo = req.get('User-Agent') || 'Unknown';
    const ipAddress = req.ip;

    // Create new user
    const newUser = await userModel.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      company,
      application,
      organizationType
    });

    // Generate tokens
    const tokens = await authMiddleware.generateTokens(newUser, deviceInfo, ipAddress);

    logger.info('User registration successful', {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      application,
      ip: ipAddress
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        organization_id: newUser.organization_id,
        applications: newUser.applications,
        permissions: newUser.permissions,
        profile: newUser.profile,
        email_verified: newUser.email_verified
      },
      ...tokens,
      applicationContext: application
    });

  } catch (error) {
    logger.error('Registration error', {
      error: error.message,
      email: req.body.email,
      ip: req.ip
    });

    // Handle specific errors
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'User already exists with this email',
        code: 'USER_EXISTS'
      });
    }

    if (error.message.includes('Password must')) {
      return res.status(400).json({
        error: error.message,
        code: 'INVALID_PASSWORD'
      });
    }

    res.status(500).json({
      error: 'Registration failed',
      code: 'INTERNAL_ERROR',
      message: 'An internal error occurred during registration'
    });
  }
});

// Token refresh
router.post('/refresh', authLimiter, [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
], async (req, res) => {
  if (!authMiddleware) {
    return res.status(500).json({
      error: 'Authentication service not initialized',
      code: 'SERVICE_ERROR'
    });
  }

  return authMiddleware.refreshToken(req, res);
});

// Get current user profile (cross-application)
router.get('/profile', async (req, res) => {
  try {
    if (!authMiddleware) {
      return res.status(500).json({
        error: 'Authentication service not initialized',
        code: 'SERVICE_ERROR'
      });
    }

    // Use the authenticate middleware
    authMiddleware.authenticate({ optional: false })(req, res, async () => {
      try {
        const user = await userModel.findById(req.user.id);

        if (!user) {
          return res.status(404).json({
            error: 'User not found',
            code: 'USER_NOT_FOUND'
          });
        }

        res.json({
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            organization_id: user.organization_id,
            applications: user.applications,
            permissions: user.permissions,
            profile: user.profile,
            email_verified: user.email_verified,
            last_login_at: user.last_login_at
          }
        });
      } catch (error) {
        logger.error('Profile fetch error', {
          error: error.message,
          userId: req.user?.id
        });

        res.status(500).json({
          error: 'Failed to fetch profile',
          code: 'INTERNAL_ERROR'
        });
      }
    });
  } catch (error) {
    logger.error('Profile route error', { error: error.message });
    res.status(500).json({
      error: 'Profile service error',
      code: 'SERVICE_ERROR'
    });
  }
});

// Update user profile
router.put('/profile', [
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name must be 2-50 characters and contain only letters'),
  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name must be 2-50 characters and contain only letters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Valid phone number is required'),
  body('company')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be 2-100 characters')
], async (req, res) => {
  try {
    if (!authMiddleware) {
      return res.status(500).json({
        error: 'Authentication service not initialized',
        code: 'SERVICE_ERROR'
      });
    }

    // Use the authenticate middleware
    authMiddleware.authenticate({ optional: false })(req, res, async () => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: errors.array()
          });
        }

        // Extract allowed profile fields
        const allowedFields = ['firstName', 'lastName', 'phone', 'company'];
        const profileUpdates = {};

        allowedFields.forEach(field => {
          if (req.body[field] !== undefined) {
            profileUpdates[field] = req.body[field];
          }
        });

        if (Object.keys(profileUpdates).length === 0) {
          return res.status(400).json({
            error: 'No valid fields to update',
            code: 'NO_UPDATES'
          });
        }

        // Update user profile
        const updatedUser = await userModel.updateProfile(req.user.id, {
          profile: profileUpdates
        });

        logger.info('Profile updated', {
          userId: req.user.id,
          updates: Object.keys(profileUpdates)
        });

        res.json({
          message: 'Profile updated successfully',
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            role: updatedUser.role,
            organization_id: updatedUser.organization_id,
            applications: updatedUser.applications,
            permissions: updatedUser.permissions,
            profile: updatedUser.profile,
            email_verified: updatedUser.email_verified
          }
        });
      } catch (error) {
        logger.error('Profile update error', {
          error: error.message,
          userId: req.user?.id
        });

        res.status(500).json({
          error: 'Profile update failed',
          code: 'INTERNAL_ERROR'
        });
      }
    });
  } catch (error) {
    logger.error('Profile update route error', { error: error.message });
    res.status(500).json({
      error: 'Profile update service error',
      code: 'SERVICE_ERROR'
    });
  }
});

// Check application access
router.get('/applications/:app/access', async (req, res) => {
  try {
    if (!authMiddleware) {
      return res.status(500).json({
        error: 'Authentication service not initialized',
        code: 'SERVICE_ERROR'
      });
    }

    const { app } = req.params;
    const validApps = ['b2c', 'b2b', 'admin'];

    if (!validApps.includes(app)) {
      return res.status(400).json({
        error: 'Invalid application',
        code: 'INVALID_APPLICATION',
        validApplications: validApps
      });
    }

    // Use the authenticate middleware
    authMiddleware.authenticate({ optional: false })(req, res, async () => {
      try {
        const userApps = req.user.applications || [];
        const hasAccess = userApps.includes(app);

        res.json({
          application: app,
          hasAccess,
          userApplications: userApps,
          userRole: req.user.role,
          permissions: req.user.permissions,
          userId: req.user.id,
          email: req.user.email
        });
      } catch (error) {
        logger.error('Application access check error', {
          error: error.message,
          userId: req.user?.id,
          application: app
        });

        res.status(500).json({
          error: 'Failed to check application access',
          code: 'INTERNAL_ERROR'
        });
      }
    });
  } catch (error) {
    logger.error('Application access route error', { error: error.message });
    res.status(500).json({
      error: 'Application access service error',
      code: 'SERVICE_ERROR'
    });
  }
});

// Logout (invalidate token)
router.post('/logout', [
  body('refreshToken')
    .optional()
    .notEmpty()
    .withMessage('Refresh token must not be empty if provided')
], async (req, res) => {
  try {
    if (!authMiddleware) {
      return res.status(500).json({
        error: 'Authentication service not initialized',
        code: 'SERVICE_ERROR'
      });
    }

    // Use the authenticate middleware for optional auth
    authMiddleware.authenticate({ optional: true })(req, res, async () => {
      return authMiddleware.logout(req, res);
    });
  } catch (error) {
    logger.error('Logout route error', { error: error.message });
    res.status(500).json({
      error: 'Logout service error',
      code: 'SERVICE_ERROR'
    });
  }
});

// Password change endpoint
router.post('/change-password', [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
    .withMessage('New password must contain at least 8 characters with uppercase, lowercase, number, and special character')
], async (req, res) => {
  try {
    if (!authMiddleware) {
      return res.status(500).json({
        error: 'Authentication service not initialized',
        code: 'SERVICE_ERROR'
      });
    }

    // Use the authenticate middleware
    authMiddleware.authenticate({ optional: false })(req, res, async () => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: errors.array()
          });
        }

        const { currentPassword, newPassword } = req.body;

        // Change password
        await userModel.changePassword(req.user.id, currentPassword, newPassword);

        logger.info('Password changed successfully', {
          userId: req.user.id,
          email: req.user.email
        });

        res.json({
          message: 'Password changed successfully'
        });
      } catch (error) {
        logger.error('Password change error', {
          error: error.message,
          userId: req.user?.id
        });

        if (error.message.includes('Current password is incorrect')) {
          return res.status(400).json({
            error: 'Current password is incorrect',
            code: 'INVALID_CURRENT_PASSWORD'
          });
        }

        res.status(500).json({
          error: 'Password change failed',
          code: 'INTERNAL_ERROR'
        });
      }
    });
  } catch (error) {
    logger.error('Password change route error', { error: error.message });
    res.status(500).json({
      error: 'Password change service error',
      code: 'SERVICE_ERROR'
    });
  }
});

module.exports = router;