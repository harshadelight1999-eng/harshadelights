import jwt from 'jsonwebtoken';
import { EventEmitter } from 'events';
import Redis from 'ioredis';
import { integrationConfig } from '../config/integration-config';
import { Logger } from '../utils/logger';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'sales_manager' | 'sales_rep' | 'customer' | 'b2b_user';
  permissions: string[];
  territory?: string;
  customerId?: string;
  companyId?: string;
}

interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

interface Session {
  userId: string;
  deviceId: string;
  platform: 'web' | 'mobile' | 'api';
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

export class AuthService extends EventEmitter {
  private redis: Redis;
  private logger: Logger;
  private jwtSecret: string;
  private jwtRefreshSecret: string;
  private tokenExpiry = '15m'; // Access token expires in 15 minutes
  private refreshTokenExpiry = '7d'; // Refresh token expires in 7 days

  constructor() {
    super();
    this.logger = new Logger('AuthService');
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';
    
    this.redis = new Redis({
      host: integrationConfig.realTimeSync.redis.host,
      port: integrationConfig.realTimeSync.redis.port,
      password: integrationConfig.realTimeSync.redis.password,
      db: integrationConfig.realTimeSync.redis.db + 1, // Use different DB for auth
      maxRetriesPerRequest: 1,
      retryDelayOnFailover: 100,
      enableOfflineQueue: false,
      lazyConnect: true,
      connectTimeout: 5000,
      commandTimeout: 3000,
    });

    this.setupRedisListeners();
  }

  private setupRedisListeners(): void {
    this.redis.on('connect', () => {
      this.logger.info('Auth service connected to Redis');
    });

    this.redis.on('error', (error) => {
      this.logger.error('Auth service Redis error:', error);
      // Continue operation without Redis for development
      this.logger.warn('Auth service continuing without Redis in development mode');
    });

    this.redis.on('close', () => {
      this.logger.warn('Auth service Redis connection closed - running in offline mode');
    });
  }

  // Authentication methods
  async authenticateUser(email: string, password: string, platform: string, deviceInfo: any): Promise<AuthToken | null> {
    try {
      // This would typically validate against your user database
      const user = await this.validateCredentials(email, password);
      if (!user) {
        return null;
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Create session
      const session: Session = {
        userId: user.id,
        deviceId: deviceInfo.deviceId || this.generateDeviceId(),
        platform: platform as any,
        ipAddress: deviceInfo.ipAddress || 'unknown',
        userAgent: deviceInfo.userAgent || 'unknown',
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true,
      };

      await this.storeSession(session);
      await this.storeRefreshToken(user.id, refreshToken);

      this.emit('user-authenticated', { user, session });

      return {
        accessToken,
        refreshToken,
        expiresIn: 15 * 60, // 15 minutes in seconds
        tokenType: 'Bearer',
      };
    } catch (error) {
      this.logger.error('Authentication error:', error);
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthToken | null> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret) as any;
      const userId = decoded.userId;

      // Check if refresh token is still valid in Redis
      const storedToken = await this.redis.get(`refresh_token:${userId}`);
      if (storedToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      // Get user data
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // Update stored refresh token
      await this.storeRefreshToken(userId, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 15 * 60,
        tokenType: 'Bearer',
      };
    } catch (error) {
      this.logger.error('Token refresh error:', error);
      throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      
      // Check if user session is still active
      const isActive = await this.isSessionActive(decoded.userId, decoded.sessionId);
      if (!isActive) {
        return null;
      }

      // Update last activity
      await this.updateSessionActivity(decoded.userId, decoded.sessionId);

      return decoded.user;
    } catch (error) {
      this.logger.debug('Token validation failed:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  async logout(userId: string, sessionId?: string): Promise<void> {
    try {
      if (sessionId) {
        // Logout specific session
        await this.deactivateSession(userId, sessionId);
      } else {
        // Logout all sessions
        await this.deactivateAllSessions(userId);
      }

      // Remove refresh token
      await this.redis.del(`refresh_token:${userId}`);

      this.emit('user-logged-out', { userId, sessionId });
    } catch (error) {
      this.logger.error('Logout error:', error);
    }
  }

  // Token generation
  private generateAccessToken(user: User): string {
    const sessionId = this.generateSessionId();
    const payload = {
      userId: user.id,
      sessionId,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
    
    return this.signJWT(payload, this.jwtSecret, this.tokenExpiry);
  }

  private generateRefreshToken(user: User): string {
    const payload = { userId: user.id };
    return this.signJWT(payload, this.jwtRefreshSecret, this.refreshTokenExpiry);
  }

  private signJWT(payload: any, secret: string, expiresIn: string): string {
    // Use type assertion to work around JWT library type issues
    return (jwt.sign as any)(payload, secret, { expiresIn });
  }

  // Session management
  private async storeSession(session: Session): Promise<void> {
    const key = `session:${session.userId}:${session.deviceId}`;
    await this.redis.setex(key, 7 * 24 * 60 * 60, JSON.stringify(session)); // 7 days
  }

  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const key = `refresh_token:${userId}`;
    await this.redis.setex(key, 7 * 24 * 60 * 60, refreshToken); // 7 days
  }

  private async isSessionActive(userId: string, sessionId: string): Promise<boolean> {
    const sessions = await this.getUserSessions(userId);
    return sessions.some(session => 
      session.deviceId === sessionId && session.isActive
    );
  }

  private async updateSessionActivity(userId: string, sessionId: string): Promise<void> {
    const sessions = await this.getUserSessions(userId);
    const session = sessions.find(s => s.deviceId === sessionId);
    
    if (session) {
      session.lastActivity = new Date();
      await this.storeSession(session);
    }
  }

  private async deactivateSession(userId: string, sessionId: string): Promise<void> {
    const key = `session:${userId}:${sessionId}`;
    await this.redis.del(key);
  }

  private async deactivateAllSessions(userId: string): Promise<void> {
    const pattern = `session:${userId}:*`;
    const keys = await this.redis.keys(pattern);
    
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    const pattern = `session:${userId}:*`;
    const keys = await this.redis.keys(pattern);
    const sessions: Session[] = [];

    for (const key of keys) {
      const sessionData = await this.redis.get(key);
      if (sessionData) {
        sessions.push(JSON.parse(sessionData));
      }
    }

    return sessions;
  }

  // User management (would typically integrate with your user database)
  private async validateCredentials(email: string, password: string): Promise<User | null> {
    // This is a mock implementation - replace with actual user validation
    const mockUsers: User[] = [
      {
        id: 'admin-1',
        email: 'admin@harshadelights.com',
        name: 'Admin User',
        role: 'admin',
        permissions: ['*'],
      },
      {
        id: 'sales-mgr-1',
        email: 'sales.manager@harshadelights.com',
        name: 'Sales Manager',
        role: 'sales_manager',
        permissions: ['sales.*', 'customers.*', 'orders.*'],
        territory: 'north',
      },
      {
        id: 'sales-rep-1',
        email: 'sales.rep@harshadelights.com',
        name: 'Sales Representative',
        role: 'sales_rep',
        permissions: ['customers.read', 'customers.update', 'orders.*'],
        territory: 'north-zone-1',
      },
    ];

    // Simple email-based lookup (in real implementation, verify password hash)
    return mockUsers.find(user => user.email === email) || null;
  }

  private async getUserById(userId: string): Promise<User | null> {
    // Mock implementation - replace with actual database lookup
    const mockUsers: User[] = [
      {
        id: 'admin-1',
        email: 'admin@harshadelights.com',
        name: 'Admin User',
        role: 'admin',
        permissions: ['*'],
      },
      {
        id: 'sales-mgr-1',
        email: 'sales.manager@harshadelights.com',
        name: 'Sales Manager',
        role: 'sales_manager',
        permissions: ['sales.*', 'customers.*', 'orders.*'],
        territory: 'north',
      },
      {
        id: 'sales-rep-1',
        email: 'sales.rep@harshadelights.com',
        name: 'Sales Representative',
        role: 'sales_rep',
        permissions: ['customers.read', 'customers.update', 'orders.*'],
        territory: 'north-zone-1',
      },
    ];

    return mockUsers.find(user => user.id === userId) || null;
  }

  // Permission checking
  hasPermission(user: User, permission: string): boolean {
    if (user.permissions.includes('*')) {
      return true; // Admin has all permissions
    }

    return user.permissions.some(userPerm => {
      if (userPerm === permission) return true;
      if (userPerm.endsWith('*')) {
        const prefix = userPerm.slice(0, -1);
        return permission.startsWith(prefix);
      }
      return false;
    });
  }

  // Utility methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cross-platform token validation
  async validateCrossPlatformToken(token: string, platform: string): Promise<User | null> {
    const user = await this.validateToken(token);
    if (!user) return null;

    // Platform-specific validation logic can be added here
    switch (platform) {
      case 'flutter-app':
        // Ensure user has mobile access permissions
        if (!this.hasPermission(user, 'mobile.access')) {
          return null;
        }
        break;
      case 'b2b-portal':
        // Ensure user has B2B portal access
        if (!this.hasPermission(user, 'b2b.access')) {
          return null;
        }
        break;
      case 'b2c-ecommerce':
        // B2C users have different validation
        if (user.role !== 'customer') {
          return null;
        }
        break;
    }

    return user;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const redisStatus = await this.redis.ping();
      const activeSessions = await this.redis.keys('session:*');
      
      return {
        status: 'healthy',
        details: {
          redis: redisStatus === 'PONG' ? 'connected' : 'disconnected',
          activeSessions: activeSessions.length,
          jwtConfigured: !!this.jwtSecret,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  // Cleanup
  destroy(): void {
    this.redis.disconnect();
    this.removeAllListeners();
    this.logger.info('Auth service destroyed');
  }
}

export default AuthService;
