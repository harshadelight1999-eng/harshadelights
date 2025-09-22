import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import config from '../config';
import { syncLogger } from '../utils/logger';
import redisManager from '../utils/redis';
import {
  SyncEvent,
  SyncEventType,
  SystemType,
  SyncMetrics
} from '../types';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  systems?: SystemType[];
}

interface ClientSubscription {
  socketId: string;
  userId: string;
  userRole: string;
  systems: SystemType[];
  subscribedEvents: SyncEventType[];
  connectedAt: Date;
}

export class WebSocketService {
  private io: SocketIOServer;
  private connectedClients: Map<string, ClientSubscription> = new Map();
  private eventSubscriptions: Map<SyncEventType, Set<string>> = new Map();

  constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*", // Configure based on your frontend domains
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.subscribeToRedisEvents();

    syncLogger.info('WebSocket service initialized');
  }

  /**
   * Setup authentication middleware
   */
  private setupMiddleware(): void {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token (you'll need to implement your JWT verification logic)
        const decoded = this.verifyJWTToken(token);
        if (!decoded) {
          return next(new Error('Invalid authentication token'));
        }

        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        socket.systems = decoded.systems || [SystemType.ERPNEXT, SystemType.ESPOCRM, SystemType.MEDUSA];

        syncLogger.info('WebSocket client authenticated', {
          socketId: socket.id,
          userId: socket.userId,
          userRole: socket.userRole
        });

        next();
      } catch (error) {
        syncLogger.error('WebSocket authentication failed', error as Error, {
          socketId: socket.id
        });
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleClientConnection(socket);

      // Handle client disconnection
      socket.on('disconnect', (reason) => {
        this.handleClientDisconnection(socket, reason);
      });

      // Handle subscription to specific events
      socket.on('subscribe', (data) => {
        this.handleEventSubscription(socket, data);
      });

      // Handle unsubscription from events
      socket.on('unsubscribe', (data) => {
        this.handleEventUnsubscription(socket, data);
      });

      // Handle request for sync status
      socket.on('get_sync_status', async (data, callback) => {
        try {
          const status = await this.getSyncStatus(data);
          callback({ success: true, data: status });
        } catch (error) {
          callback({ success: false, error: (error as Error).message });
        }
      });

      // Handle request for queue statistics
      socket.on('get_queue_stats', async (callback) => {
        try {
          const stats = await this.getQueueStats();
          callback({ success: true, data: stats });
        } catch (error) {
          callback({ success: false, error: (error as Error).message });
        }
      });

      // Handle manual sync trigger
      socket.on('trigger_sync', async (data, callback) => {
        try {
          await this.triggerManualSync(socket, data);
          callback({ success: true, message: 'Sync triggered successfully' });
        } catch (error) {
          callback({ success: false, error: (error as Error).message });
        }
      });

      // Handle ping for connection health
      socket.on('ping', (callback) => {
        callback('pong');
      });
    });
  }

  /**
   * Handle new client connection
   */
  private handleClientConnection(socket: AuthenticatedSocket): void {
    const subscription: ClientSubscription = {
      socketId: socket.id,
      userId: socket.userId!,
      userRole: socket.userRole!,
      systems: socket.systems!,
      subscribedEvents: this.getDefaultSubscriptions(socket.userRole!),
      connectedAt: new Date()
    };

    this.connectedClients.set(socket.id, subscription);

    // Subscribe to default events based on user role
    subscription.subscribedEvents.forEach(eventType => {
      if (!this.eventSubscriptions.has(eventType)) {
        this.eventSubscriptions.set(eventType, new Set());
      }
      this.eventSubscriptions.get(eventType)!.add(socket.id);
    });

    // Send welcome message with current sync status
    socket.emit('connected', {
      message: 'Connected to Harsha Delights Sync Service',
      subscribedEvents: subscription.subscribedEvents,
      serverTime: new Date().toISOString()
    });

    // Send initial system health status
    this.sendSystemHealthStatus(socket);

    syncLogger.info('WebSocket client connected', {
      socketId: socket.id,
      userId: socket.userId,
      userRole: socket.userRole,
      subscribedEvents: subscription.subscribedEvents
    });
  }

  /**
   * Handle client disconnection
   */
  private handleClientDisconnection(socket: AuthenticatedSocket, reason: string): void {
    const subscription = this.connectedClients.get(socket.id);
    if (subscription) {
      // Remove from event subscriptions
      subscription.subscribedEvents.forEach(eventType => {
        const subscribers = this.eventSubscriptions.get(eventType);
        if (subscribers) {
          subscribers.delete(socket.id);
          if (subscribers.size === 0) {
            this.eventSubscriptions.delete(eventType);
          }
        }
      });

      this.connectedClients.delete(socket.id);

      syncLogger.info('WebSocket client disconnected', {
        socketId: socket.id,
        userId: subscription.userId,
        reason,
        connectedDuration: Date.now() - subscription.connectedAt.getTime()
      });
    }
  }

  /**
   * Handle event subscription
   */
  private handleEventSubscription(socket: AuthenticatedSocket, data: any): void {
    try {
      const { events } = data;
      const subscription = this.connectedClients.get(socket.id);

      if (!subscription) {
        socket.emit('error', { message: 'Client subscription not found' });
        return;
      }

      // Validate and add new event subscriptions
      const validEvents = events.filter((event: string) =>
        Object.values(SyncEventType).includes(event as SyncEventType)
      );

      validEvents.forEach((eventType: SyncEventType) => {
        if (!subscription.subscribedEvents.includes(eventType)) {
          subscription.subscribedEvents.push(eventType);

          if (!this.eventSubscriptions.has(eventType)) {
            this.eventSubscriptions.set(eventType, new Set());
          }
          this.eventSubscriptions.get(eventType)!.add(socket.id);
        }
      });

      socket.emit('subscription_updated', {
        subscribedEvents: subscription.subscribedEvents,
        message: `Subscribed to ${validEvents.length} new events`
      });

      syncLogger.info('Client subscribed to events', {
        socketId: socket.id,
        userId: subscription.userId,
        newEvents: validEvents
      });

    } catch (error) {
      socket.emit('error', { message: 'Failed to process subscription' });
      syncLogger.error('Failed to handle event subscription', error as Error, { socketId: socket.id });
    }
  }

  /**
   * Handle event unsubscription
   */
  private handleEventUnsubscription(socket: AuthenticatedSocket, data: any): void {
    try {
      const { events } = data;
      const subscription = this.connectedClients.get(socket.id);

      if (!subscription) {
        socket.emit('error', { message: 'Client subscription not found' });
        return;
      }

      // Remove event subscriptions
      events.forEach((eventType: SyncEventType) => {
        const index = subscription.subscribedEvents.indexOf(eventType);
        if (index > -1) {
          subscription.subscribedEvents.splice(index, 1);

          const subscribers = this.eventSubscriptions.get(eventType);
          if (subscribers) {
            subscribers.delete(socket.id);
            if (subscribers.size === 0) {
              this.eventSubscriptions.delete(eventType);
            }
          }
        }
      });

      socket.emit('subscription_updated', {
        subscribedEvents: subscription.subscribedEvents,
        message: `Unsubscribed from ${events.length} events`
      });

      syncLogger.info('Client unsubscribed from events', {
        socketId: socket.id,
        userId: subscription.userId,
        removedEvents: events
      });

    } catch (error) {
      socket.emit('error', { message: 'Failed to process unsubscription' });
      syncLogger.error('Failed to handle event unsubscription', error as Error, { socketId: socket.id });
    }
  }

  /**
   * Subscribe to Redis events for real-time notifications
   */
  private subscribeToRedisEvents(): void {
    try {
      // Subscribe to sync events
      redisManager.subscribe('sync:events', (message: string) => {
        try {
          const event: SyncEvent = JSON.parse(message);
          this.broadcastSyncEvent(event);
        } catch (error) {
          syncLogger.error('Failed to parse sync event', error as Error, { message });
        }
      });

      // Subscribe to notifications
      redisManager.subscribe('sync:notifications', (message: string) => {
        try {
          const notification = JSON.parse(message);
          this.broadcastNotification(notification);
        } catch (error) {
          syncLogger.error('Failed to parse notification', error as Error, { message });
        }
      });

      // Subscribe to system health updates
      redisManager.subscribe('sync:health', (message: string) => {
        try {
          const healthUpdate = JSON.parse(message);
          this.broadcastSystemHealth(healthUpdate);
        } catch (error) {
          syncLogger.error('Failed to parse health update', error as Error, { message });
        }
      });

      syncLogger.info('Subscribed to Redis events for WebSocket broadcasting');

    } catch (error) {
      syncLogger.error('Failed to subscribe to Redis events', error as Error);
    }
  }

  /**
   * Broadcast sync event to subscribed clients
   */
  private broadcastSyncEvent(event: SyncEvent): void {
    const subscribers = this.eventSubscriptions.get(event.type);
    if (!subscribers || subscribers.size === 0) {
      return;
    }

    const eventData = {
      type: 'sync_event',
      event: {
        id: event.id,
        type: event.type,
        source: event.source,
        target: event.target,
        data: event.data,
        timestamp: event.timestamp,
        status: event.status
      }
    };

    subscribers.forEach(socketId => {
      const socket = this.io.sockets.sockets.get(socketId);
      const subscription = this.connectedClients.get(socketId);

      if (socket && subscription) {
        // Check if client has permission to receive this event
        if (this.hasPermissionForEvent(subscription, event)) {
          socket.emit('sync_event', eventData);
        }
      }
    });

    syncLogger.debug('Broadcasted sync event', {
      eventType: event.type,
      subscriberCount: subscribers.size,
      eventId: event.id
    });
  }

  /**
   * Broadcast general notification
   */
  private broadcastNotification(notification: any): void {
    this.io.emit('notification', {
      type: 'notification',
      ...notification
    });

    syncLogger.debug('Broadcasted notification', { type: notification.type });
  }

  /**
   * Broadcast system health update
   */
  private broadcastSystemHealth(healthUpdate: any): void {
    this.io.emit('system_health', {
      type: 'system_health',
      ...healthUpdate
    });

    syncLogger.debug('Broadcasted system health update');
  }

  /**
   * Send system health status to specific client
   */
  private async sendSystemHealthStatus(socket: AuthenticatedSocket): Promise<void> {
    try {
      // Get system health from Redis cache or generate fresh
      const healthData = await this.getSystemHealth();

      socket.emit('system_health', {
        type: 'system_health',
        systems: healthData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      syncLogger.error('Failed to send system health status', error as Error, { socketId: socket.id });
    }
  }

  /**
   * Get default event subscriptions based on user role
   */
  private getDefaultSubscriptions(userRole: string): SyncEventType[] {
    const roleSubscriptions: Record<string, SyncEventType[]> = {
      admin: Object.values(SyncEventType),
      manager: [
        SyncEventType.ORDER_CREATE,
        SyncEventType.ORDER_UPDATE,
        SyncEventType.INVENTORY_LOW_STOCK,
        SyncEventType.CUSTOMER_CREATE,
        SyncEventType.PRICE_UPDATE
      ],
      operator: [
        SyncEventType.ORDER_CREATE,
        SyncEventType.ORDER_UPDATE,
        SyncEventType.INVENTORY_UPDATE,
        SyncEventType.INVENTORY_LOW_STOCK
      ],
      sales: [
        SyncEventType.CUSTOMER_CREATE,
        SyncEventType.CUSTOMER_UPDATE,
        SyncEventType.ORDER_CREATE,
        SyncEventType.ORDER_UPDATE,
        SyncEventType.PRICE_UPDATE
      ]
    };

    return roleSubscriptions[userRole] || [
      SyncEventType.ORDER_CREATE,
      SyncEventType.INVENTORY_LOW_STOCK
    ];
  }

  /**
   * Check if client has permission to receive event
   */
  private hasPermissionForEvent(subscription: ClientSubscription, event: SyncEvent): boolean {
    // Check if user has access to the systems involved in the event
    if (!subscription.systems.includes(event.source)) {
      return false;
    }

    // Additional role-based filtering can be added here
    if (subscription.userRole === 'operator' &&
        [SyncEventType.CUSTOMER_CREATE, SyncEventType.CUSTOMER_UPDATE].includes(event.type)) {
      return false;
    }

    return true;
  }

  /**
   * Verify JWT token (implement your JWT verification logic)
   */
  private verifyJWTToken(token: string): any {
    try {
      // This is a placeholder - implement your actual JWT verification
      // For now, we'll create a mock token verification
      if (token === 'dev-token') {
        return {
          userId: 'dev-user',
          role: 'admin',
          systems: [SystemType.ERPNEXT, SystemType.ESPOCRM, SystemType.MEDUSA]
        };
      }

      // In production, you would verify the JWT token here
      // const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // return decoded;

      return null;
    } catch (error) {
      syncLogger.error('JWT verification failed', error as Error);
      return null;
    }
  }

  /**
   * Get sync status for various systems
   */
  private async getSyncStatus(data: any): Promise<any> {
    try {
      const { type, id } = data;

      switch (type) {
        case 'customer':
          return redisManager.hgetall(`customer:mapping:${id}`);
        case 'product':
          return redisManager.hgetall(`product:mapping:${id}`);
        case 'order':
          return redisManager.hgetall(`order:mapping:${id}`);
        default:
          throw new Error(`Unsupported sync status type: ${type}`);
      }
    } catch (error) {
      syncLogger.error('Failed to get sync status', error as Error, { data });
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  private async getQueueStats(): Promise<any> {
    try {
      // This would integrate with your queue service
      // For now, return cached stats from Redis
      const statsKey = 'sync:queue:stats';
      const cachedStats = await redisManager.get(statsKey);

      if (cachedStats) {
        return JSON.parse(cachedStats);
      }

      return {
        message: 'Queue stats not available',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      syncLogger.error('Failed to get queue stats', error as Error);
      throw error;
    }
  }

  /**
   * Get system health status
   */
  private async getSystemHealth(): Promise<any> {
    try {
      const healthKey = 'sync:system:health';
      const cachedHealth = await redisManager.get(healthKey);

      if (cachedHealth) {
        return JSON.parse(cachedHealth);
      }

      // Default health status if not cached
      return {
        erpnext: { status: 'unknown', last_check: null },
        espocrm: { status: 'unknown', last_check: null },
        medusa: { status: 'unknown', last_check: null },
        redis: { status: 'healthy', last_check: new Date().toISOString() }
      };
    } catch (error) {
      syncLogger.error('Failed to get system health', error as Error);
      throw error;
    }
  }

  /**
   * Trigger manual sync
   */
  private async triggerManualSync(socket: AuthenticatedSocket, data: any): Promise<void> {
    try {
      const subscription = this.connectedClients.get(socket.id);
      if (!subscription) {
        throw new Error('Client subscription not found');
      }

      // Check if user has permission to trigger sync
      if (!['admin', 'manager'].includes(subscription.userRole)) {
        throw new Error('Insufficient permissions to trigger sync');
      }

      // Publish manual sync trigger event
      const triggerEvent = {
        type: 'manual_sync_trigger',
        triggeredBy: subscription.userId,
        data,
        timestamp: new Date().toISOString()
      };

      await redisManager.publish('sync:manual_triggers', JSON.stringify(triggerEvent));

      syncLogger.info('Manual sync triggered', {
        triggeredBy: subscription.userId,
        socketId: socket.id,
        data
      });

    } catch (error) {
      syncLogger.error('Failed to trigger manual sync', error as Error, { socketId: socket.id, data });
      throw error;
    }
  }

  /**
   * Get connected clients information
   */
  getConnectedClients(): ClientSubscription[] {
    return Array.from(this.connectedClients.values());
  }

  /**
   * Get subscription statistics
   */
  getSubscriptionStats(): Record<string, any> {
    const stats: Record<string, any> = {
      totalClients: this.connectedClients.size,
      eventSubscriptions: {},
      roleDistribution: {},
      systemAccess: {}
    };

    // Calculate event subscription stats
    this.eventSubscriptions.forEach((subscribers, eventType) => {
      stats.eventSubscriptions[eventType] = subscribers.size;
    });

    // Calculate role distribution
    this.connectedClients.forEach(subscription => {
      stats.roleDistribution[subscription.userRole] =
        (stats.roleDistribution[subscription.userRole] || 0) + 1;
    });

    // Calculate system access distribution
    this.connectedClients.forEach(subscription => {
      subscription.systems.forEach(system => {
        stats.systemAccess[system] = (stats.systemAccess[system] || 0) + 1;
      });
    });

    return stats;
  }

  /**
   * Broadcast custom message to specific clients
   */
  broadcastToRole(role: string, message: any): void {
    this.connectedClients.forEach((subscription, socketId) => {
      if (subscription.userRole === role) {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.emit('role_message', message);
        }
      }
    });
  }

  /**
   * Broadcast custom message to specific systems
   */
  broadcastToSystem(system: SystemType, message: any): void {
    this.connectedClients.forEach((subscription, socketId) => {
      if (subscription.systems.includes(system)) {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.emit('system_message', message);
        }
      }
    });
  }

  /**
   * Health check for WebSocket service
   */
  healthCheck(): { status: string; connectedClients: number; eventSubscriptions: number } {
    return {
      status: 'healthy',
      connectedClients: this.connectedClients.size,
      eventSubscriptions: this.eventSubscriptions.size
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    syncLogger.info('Shutting down WebSocket service...');

    // Notify all connected clients
    this.io.emit('server_shutdown', {
      message: 'Server is shutting down',
      timestamp: new Date().toISOString()
    });

    // Close all connections
    this.io.close();

    syncLogger.info('WebSocket service shutdown completed');
  }
}