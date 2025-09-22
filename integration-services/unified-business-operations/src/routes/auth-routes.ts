import { Router, Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth-middleware';
import AuthService from '../services/auth-service';
import AuthMiddleware from '../middleware/auth-middleware';

const router = Router();
const authService = new AuthService();
const authMiddleware = new AuthMiddleware();

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, platform = 'web', deviceInfo = {} } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const authResult = await authService.authenticateUser(
      email,
      password,
      platform,
      {
        ...deviceInfo,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      }
    );

    if (!authResult) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.json({
      success: true,
      ...authResult,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Authentication failed' });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const authResult = await authService.refreshAccessToken(refreshToken);

    if (!authResult) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    return res.json({
      success: true,
      ...authResult,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Logout endpoint
router.post('/logout', authMiddleware.authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.body;
    await authService.logout(req.user.id, sessionId);

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Validate token endpoint
router.post('/change-password', authMiddleware.authenticate, async (req: AuthenticatedRequest, res: Response) => {
  res.json({
    valid: true,
    user: req.user,
  });
});

// Get user profile
router.get('/profile', authMiddleware.authenticate, async (req: AuthenticatedRequest, res: Response) => {
  res.json({
    user: req.user,
  });
});

router.put('/profile', authMiddleware.authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Profile update logic would go here
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// Get user sessions
router.get('/sessions', authMiddleware.authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessions = await authService.getUserSessions(req.user.id);
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

// Platform-specific validation endpoints
router.get('/validate/flutter', authMiddleware.authenticatePlatform('flutter-app'), (req: AuthenticatedRequest, res: Response) => {
  res.json({
    valid: true,
    user: req.user,
    platform: 'flutter-app',
  });
});

router.get('/validate/b2b', authMiddleware.authenticatePlatform('b2b-portal'), (req: AuthenticatedRequest, res: Response) => {
  res.json({
    valid: true,
    user: req.user,
    platform: 'b2b-portal',
  });
});

router.get('/validate/b2c', authMiddleware.authenticatePlatform('b2c-ecommerce'), (req: AuthenticatedRequest, res: Response) => {
  res.json({
    valid: true,
    user: req.user,
    platform: 'b2c-ecommerce',
  });
});

export default router;
