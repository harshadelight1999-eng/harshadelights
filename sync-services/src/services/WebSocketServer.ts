import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from '../utils/logger';
import { messageBroker } from './MessageBroker';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface WebSocketClient {
  id: string;
  userId?: string;
  roles: string[];
  subscriptions: Set<string>;
  connectedAt: Date;
}

export class WebSocketServer {
  private io: SocketIOServer;
  private clients: Map<string, WebSocketClient> = new Map();
  private roomSubscriptions: Map<string, Set<string>> = new Map();

  constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupSocketHandlers();
    this.setupMessageBrokerListeners();
  }

  private setupSocketHandlers() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, config.jwt.secret) as any;
        socket.data.user = decoded;
        next();
      } catch (error) {
        logger.error('WebSocket authentication failed:', error);
        next(new Error('Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      this.handleClientConnection(socket);

      socket.on('subscribe', (data) => {
        this.handleSubscription(socket, data);
      });

      socket.on('unsubscribe', (data) => {
        this.handleUnsubscription(socket, data);
      });

      socket.on('sync-request', (data) => {
        this.handleSyncRequest(socket, data);
      });

      socket.on('disconnect', () => {
        this.handleClientDisconnection(socket);
      });

      socket.on('error', (error) => {
        logger.error(`WebSocket error for client ${socket.id}:`, error);
      });
    });
  }

  private handleClientConnection(socket: any) {
    const client: WebSocketClient = {
      id: socket.id,
      userId: socket.data.user?.userId,
      roles: socket.data.user?.roles || ['user'],
      subscriptions: new Set(),
      connectedAt: new Date(),
    };

    this.clients.set(socket.id, client);

    logger.info(`WebSocket client connected: ${socket.id}`, {
      userId: client.userId,
      roles: client.roles,
    });

    // Send connection acknowledgment
    socket.emit('connected', {
      clientId: socket.id,
      timestamp: new Date().toISOString(),
      supportedChannels: this.getSupportedChannels(client.roles),
    });

    // Auto-subscribe to user-specific channel
    if (client.userId) {
      const userChannel = `user:${client.userId}`;
      client.subscriptions.add(userChannel);
      socket.join(userChannel);
    }

    // Auto-subscribe based on roles
    client.roles.forEach(role => {
      const roleChannel = `role:${role}`;
      client.subscriptions.add(roleChannel);
      socket.join(roleChannel);
    });
  }

  private handleClientDisconnection(socket: any) {
    const client = this.clients.get(socket.id);

    if (client) {
      // Remove from room subscriptions
      client.subscriptions.forEach(subscription => {
        const roomClients = this.roomSubscriptions.get(subscription);
        if (roomClients) {
          roomClients.delete(socket.id);
          if (roomClients.size === 0) {
            this.roomSubscriptions.delete(subscription);
          }
        }
      });

      this.clients.delete(socket.id);

      logger.info(`WebSocket client disconnected: ${socket.id}`, {
        userId: client.userId,
        connectionDuration: Date.now() - client.connectedAt.getTime(),
      });
    }
  }

  private handleSubscription(socket: any, data: { channels: string[] }) {
    const client = this.clients.get(socket.id);
    if (!client) return;

    data.channels.forEach(channel => {
      if (this.canSubscribeToChannel(client, channel)) {
        client.subscriptions.add(channel);
        socket.join(channel);

        // Track room subscriptions
        if (!this.roomSubscriptions.has(channel)) {
          this.roomSubscriptions.set(channel, new Set());
        }
        this.roomSubscriptions.get(channel)!.add(socket.id);

        logger.debug(`Client ${socket.id} subscribed to channel: ${channel}`);
      } else {
        socket.emit('subscription-error', {
          channel,
          error: 'Access denied to channel',
        });
      }
    });

    socket.emit('subscription-updated', {
      subscriptions: Array.from(client.subscriptions),
    });
  }

  private handleUnsubscription(socket: any, data: { channels: string[] }) {
    const client = this.clients.get(socket.id);
    if (!client) return;

    data.channels.forEach(channel => {
      client.subscriptions.delete(channel);
      socket.leave(channel);

      // Update room subscriptions
      const roomClients = this.roomSubscriptions.get(channel);
      if (roomClients) {
        roomClients.delete(socket.id);
        if (roomClients.size === 0) {
          this.roomSubscriptions.delete(channel);
        }
      }

      logger.debug(`Client ${socket.id} unsubscribed from channel: ${channel}`);
    });

    socket.emit('subscription-updated', {
      subscriptions: Array.from(client.subscriptions),
    });
  }

  private handleSyncRequest(socket: any, data: any) {
    const client = this.clients.get(socket.id);
    if (!client) return;

    logger.info(`Sync request from client ${socket.id}:`, data);

    // Validate and process sync request
    if (this.canPerformSync(client, data.operation)) {
      // Emit to appropriate sync service
      this.broadcastSyncEvent({
        type: 'sync-request',
        source: 'websocket',
        clientId: socket.id,
        userId: client.userId,
        data,
        timestamp: new Date().toISOString(),
      });

      socket.emit('sync-request-acknowledged', {
        requestId: data.requestId,
        status: 'processing',
      });
    } else {
      socket.emit('sync-request-error', {
        requestId: data.requestId,
        error: 'Insufficient permissions for sync operation',
      });
    }
  }

  private setupMessageBrokerListeners() {
    // Listen to sync events from message broker
    messageBroker.on('sync-event', (event) => {
      this.broadcastSyncEvent({
        type: 'sync-update',
        event,
        timestamp: new Date().toISOString(),
      });
    });

    messageBroker.on('job-completed', (data) => {
      this.broadcastSyncEvent({
        type: 'sync-completed',
        jobId: data.job.id,
        queue: data.queue,
        result: data.result,
        timestamp: new Date().toISOString(),
      });
    });

    messageBroker.on('job-failed', (data) => {
      this.broadcastSyncEvent({
        type: 'sync-failed',
        jobId: data.job.id,
        queue: data.queue,
        error: data.error.message,
        timestamp: new Date().toISOString(),
      });
    });

    messageBroker.on('queue-error', (data) => {
      this.broadcastSystemAlert({
        type: 'queue-error',
        queue: data.queue,
        error: data.error.message,
        severity: 'high',
        timestamp: new Date().toISOString(),
      });
    });
  }

  private canSubscribeToChannel(client: WebSocketClient, channel: string): boolean {
    // Admin can subscribe to all channels
    if (client.roles.includes('admin')) {
      return true;
    }

    // User-specific channels
    if (channel.startsWith('user:') && channel === `user:${client.userId}`) {
      return true;
    }

    // Role-based channels
    if (channel.startsWith('role:')) {
      const role = channel.replace('role:', '');
      return client.roles.includes(role);
    }

    // Public channels
    const publicChannels = [
      'system:status',
      'inventory:updates',
      'orders:updates',
      'customers:updates',
      'pricing:updates',
    ];

    if (publicChannels.includes(channel)) {
      return true;
    }

    // Manager-only channels
    const managerChannels = [
      'sync:status',
      'system:alerts',
      'admin:notifications',
    ];

    if (managerChannels.includes(channel) && (client.roles.includes('manager') || client.roles.includes('admin'))) {
      return true;
    }

    return false;
  }

  private canPerformSync(client: WebSocketClient, operation: string): boolean {
    // Only managers and admins can trigger sync operations
    return client.roles.includes('manager') || client.roles.includes('admin');
  }

  private getSupportedChannels(roles: string[]): string[] {
    const channels = [
      'system:status',
      'inventory:updates',
      'orders:updates',
      'customers:updates',
      'pricing:updates',
    ];

    if (roles.includes('manager') || roles.includes('admin')) {
      channels.push(
        'sync:status',
        'system:alerts',
        'admin:notifications'
      );
    }

    return channels;
  }

  // Public methods for broadcasting events
  public broadcastSyncEvent(event: any) {
    const channels = this.getEventChannels(event);

    channels.forEach(channel => {
      this.io.to(channel).emit('sync-event', event);
    });

    logger.debug(`Broadcasted sync event to channels: ${channels.join(', ')}`);
  }

  public broadcastInventoryUpdate(data: any) {
    this.io.to('inventory:updates').emit('inventory-update', {
      type: 'inventory-update',
      data,
      timestamp: new Date().toISOString(),
    });
  }

  public broadcastOrderUpdate(data: any) {
    this.io.to('orders:updates').emit('order-update', {
      type: 'order-update',
      data,
      timestamp: new Date().toISOString(),
    });
  }

  public broadcastCustomerUpdate(data: any) {
    this.io.to('customers:updates').emit('customer-update', {
      type: 'customer-update',
      data,
      timestamp: new Date().toISOString(),
    });
  }

  public broadcastPricingUpdate(data: any) {
    this.io.to('pricing:updates').emit('pricing-update', {
      type: 'pricing-update',
      data,
      timestamp: new Date().toISOString(),
    });
  }

  public broadcastSystemAlert(alert: any) {
    this.io.to('system:alerts').emit('system-alert', alert);

    // Also send to admins
    this.io.to('role:admin').emit('system-alert', alert);

    logger.warn('System alert broadcasted:', alert);
  }

  public broadcastToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  public broadcastToRole(role: string, event: string, data: any) {
    this.io.to(`role:${role}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  private getEventChannels(event: any): string[] {
    const channels = ['sync:status'];

    // Determine channels based on event type and entity
    if (event.event) {
      switch (event.event.entityType) {
        case 'customer':
          channels.push('customers:updates');
          break;
        case 'inventory':
        case 'product':
          channels.push('inventory:updates');
          break;
        case 'order':
          channels.push('orders:updates');
          break;
        case 'price':
          channels.push('pricing:updates');
          break;
      }
    }

    // Add system channels for errors and important events
    if (event.type === 'sync-failed' || event.type === 'queue-error') {
      channels.push('system:alerts');
    }

    return channels;
  }

  public getConnectionStats() {
    const stats = {
      totalConnections: this.clients.size,
      activeSubscriptions: this.roomSubscriptions.size,
      clientsByRole: {},
      subscriptionsByChannel: {},
    };

    // Count clients by role
    this.clients.forEach(client => {
      client.roles.forEach(role => {
        stats.clientsByRole[role] = (stats.clientsByRole[role] || 0) + 1;
      });
    });

    // Count subscriptions by channel
    this.roomSubscriptions.forEach((clients, channel) => {
      stats.subscriptionsByChannel[channel] = clients.size;
    });

    return stats;
  }

  public async shutdown() {
    logger.info('Shutting down WebSocket server...');

    // Notify all clients about shutdown
    this.io.emit('server-shutdown', {
      message: 'Server is shutting down',
      timestamp: new Date().toISOString(),
    });

    // Close all connections
    this.io.close();

    logger.info('WebSocket server shutdown complete');
  }
}

export let webSocketServer: WebSocketServer;