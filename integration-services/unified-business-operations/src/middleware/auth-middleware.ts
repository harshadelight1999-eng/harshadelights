import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/auth-service';

export interface AuthenticatedRequest extends Request {
  user?: any;
  session?: any;
}

export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Middleware to validate JWT tokens
  authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No valid authorization header' });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const user = await this.authService.validateToken(token);

      if (!user) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Authentication failed' });
    }
  };

  // Middleware to check specific permissions
  requirePermission = (permission: string) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (!this.authService.hasPermission(req.user, permission)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      next();
    };
  };

  // Middleware to check user roles
  requireRole = (roles: string | string[]) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({ error: 'Insufficient role permissions' });
        return;
      }

      next();
    };
  };

  // Platform-specific authentication
  authenticatePlatform = (platform: string) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          res.status(401).json({ error: 'No valid authorization header' });
          return;
        }

        const token = authHeader.substring(7);
        const user = await this.authService.validateCrossPlatformToken(token, platform);

        if (!user) {
          res.status(401).json({ error: 'Invalid token for this platform' });
          return;
        }

        req.user = user;
        next();
      } catch (error) {
        res.status(401).json({ error: 'Platform authentication failed' });
      }
    };
  };

  // Optional authentication (doesn't fail if no token)
  optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const user = await this.authService.validateToken(token);
        req.user = user;
      }

      next();
    } catch (error) {
      // Continue without authentication
      next();
    }
  };
}

export default AuthMiddleware;
