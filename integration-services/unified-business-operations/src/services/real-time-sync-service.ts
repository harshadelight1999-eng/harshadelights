import { EventEmitter } from 'events';
import { WebSocketServer, WebSocket } from 'ws';
import Redis from 'ioredis';
import { Server } from 'http';
import { integrationConfig } from '../config/integration-config';
import { Logger } from '../utils/logger';
import { DataValidator } from '../utils/data-validator';
import { ConflictResolver } from '../utils/conflict-resolver';

interface SyncEvent {
  id: string;
  type: string;
  source: string;
  target: string[];
  data: any;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  retryCount: number;
}

interface ConnectedClient {
  id: string;
  type: 'flutter-app' | 'b2b-portal' | 'b2c-ecommerce' | 'admin-dashboard';
  websocket: WebSocket;
  subscriptions: string[];
  lastPing: Date;
}

export class RealTimeSyncService extends EventEmitter {
  private wss: WebSocketServer | null = null;
  private redis: Redis;
  private logger: Logger;
  private dataValidator: DataValidator;
  private conflictResolver: ConflictResolver;
  private connectedClients: Map<string, ConnectedClient> = new Map();
  private syncQueue: SyncEvent[] = [];
  private processingQueue = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.logger = new Logger('RealTimeSyncService');
    this.dataValidator = new DataValidator();
    this.conflictResolver = new ConflictResolver();
    
    // Initialize Redis connection with development fallback
    this.redis = new Redis({
      host: integrationConfig.realTimeSync.redis.host,
      port: integrationConfig.realTimeSync.redis.port,
      password: integrationConfig.realTimeSync.redis.password,
      db: integrationConfig.realTimeSync.redis.db,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableOfflineQueue: false,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
    });

    this.setupRedisListeners();
    this.startHeartbeat();
  }

  // WebSocket Server Setup
  initializeWebSocketServer(server: Server): void {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws',
      clientTracking: true,
    });

    this.wss.on('connection', (ws: WebSocket, request) => {
      this.handleNewConnection(ws, request);
    });

    this.wss.on('error', (error) => {
      this.logger.error('WebSocket server error:', error);
    });

    this.logger.info('Real-time sync WebSocket server initialized');
  }

  private handleNewConnection(ws: WebSocket, request: any): void {
    const clientId = this.generateClientId();
    const clientType = this.determineClientType(request);
    
    const client: ConnectedClient = {
      id: clientId,
      type: clientType,
      websocket: ws,
      subscriptions: [],
      lastPing: new Date(),
    };

    this.connectedClients.set(clientId, client);
    
    ws.on('message', (data) => {
      this.handleClientMessage(clientId, data);
    });

    ws.on('close', () => {
      this.handleClientDisconnection(clientId);
    });

    ws.on('error', (error) => {
      this.logger.error(`WebSocket error for client ${clientId}:`, error);
    });

    ws.on('pong', () => {
      const client = this.connectedClients.get(clientId);
      if (client) {
        client.lastPing = new Date();
      }
    });

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'connection-established',
      clientId: clientId,
      timestamp: new Date().toISOString(),
    });

    this.logger.info(`New ${clientType} client connected: ${clientId}`);
  }

  private handleClientMessage(clientId: string, data: any): void {
    try {
      const message = JSON.parse(data.toString());
      const client = this.connectedClients.get(clientId);
      
      if (!client) {
        this.logger.warn(`Message from unknown client: ${clientId}`);
        return;
      }

      switch (message.type) {
        case 'subscribe':
          this.handleSubscription(clientId, message.channels);
          break;
        case 'unsubscribe':
          this.handleUnsubscription(clientId, message.channels);
          break;
        case 'sync-event':
          this.handleSyncEvent(clientId, message);
          break;
        case 'ping':
          this.sendToClient(clientId, { type: 'pong', timestamp: new Date().toISOString() });
          break;
        default:
          this.logger.warn(`Unknown message type from ${clientId}: ${message.type}`);
      }
    } catch (error) {
      this.logger.error(`Error handling message from ${clientId}:`, error);
    }
  }

  private handleClientDisconnection(clientId: string): void {
    const client = this.connectedClients.get(clientId);
    if (client) {
      this.connectedClients.delete(clientId);
      this.logger.info(`Client disconnected: ${clientId} (${client.type})`);
    }
  }

  // Subscription Management
  private handleSubscription(clientId: string, channels: string[]): void {
    const client = this.connectedClients.get(clientId);
    if (!client) return;

    channels.forEach(channel => {
      if (!client.subscriptions.includes(channel)) {
        client.subscriptions.push(channel);
      }
    });

    this.sendToClient(clientId, {
      type: 'subscription-confirmed',
      channels: channels,
      timestamp: new Date().toISOString(),
    });

    this.logger.debug(`Client ${clientId} subscribed to channels: ${channels.join(', ')}`);
  }

  private handleUnsubscription(clientId: string, channels: string[]): void {
    const client = this.connectedClients.get(clientId);
    if (!client) return;

    channels.forEach(channel => {
      const index = client.subscriptions.indexOf(channel);
      if (index > -1) {
        client.subscriptions.splice(index, 1);
      }
    });

    this.sendToClient(clientId, {
      type: 'unsubscription-confirmed',
      channels: channels,
      timestamp: new Date().toISOString(),
    });
  }

  // Sync Event Handling
  private async handleSyncEvent(clientId: string, message: any): Promise<void> {
    try {
      const client = this.connectedClients.get(clientId);
      if (!client) return;

      const syncEvent: SyncEvent = {
        id: this.generateEventId(),
        type: message.eventType,
        source: client.type,
        target: message.targets || ['all'],
        data: message.data,
        timestamp: new Date(),
        priority: message.priority || 'medium',
        retryCount: 0,
      };

      // Validate the sync event data
      if (!this.dataValidator.validateSyncEvent(syncEvent)) {
        this.sendToClient(clientId, {
          type: 'sync-error',
          error: 'Invalid sync event data',
          eventId: syncEvent.id,
        });
        return;
      }

      // Add to sync queue
      this.addToSyncQueue(syncEvent);

      // Store in Redis for persistence
      await this.storeSyncEvent(syncEvent);

      // Send acknowledgment
      this.sendToClient(clientId, {
        type: 'sync-acknowledged',
        eventId: syncEvent.id,
        timestamp: new Date().toISOString(),
      });

      this.logger.debug(`Sync event received from ${clientId}: ${syncEvent.type}`);
    } catch (error) {
      this.logger.error('Error handling sync event:', error);
    }
  }

  // Sync Queue Management
  private addToSyncQueue(event: SyncEvent): void {
    // Insert based on priority
    const insertIndex = this.syncQueue.findIndex(e => 
      this.getPriorityValue(e.priority) < this.getPriorityValue(event.priority)
    );
    
    if (insertIndex === -1) {
      this.syncQueue.push(event);
    } else {
      this.syncQueue.splice(insertIndex, 0, event);
    }

    // Start processing if not already running
    if (!this.processingQueue) {
      this.processSyncQueue();
    }
  }

  private async processSyncQueue(): Promise<void> {
    this.processingQueue = true;

    while (this.syncQueue.length > 0) {
      const event = this.syncQueue.shift();
      if (!event) continue;

      try {
        await this.processSyncEvent(event);
      } catch (error) {
        this.logger.error(`Error processing sync event ${event.id}:`, error);
        
        // Retry logic
        if (event.retryCount < 3) {
          event.retryCount++;
          this.addToSyncQueue(event);
        } else {
          this.logger.error(`Max retries exceeded for sync event ${event.id}`);
          this.emit('sync-event-failed', event);
        }
      }

      // Small delay to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.processingQueue = false;
  }

  private async processSyncEvent(event: SyncEvent): Promise<void> {
    // Check for conflicts
    const conflicts = await this.conflictResolver.checkForConflicts(event);
    if (conflicts.length > 0) {
      const resolvedEvent = await this.conflictResolver.resolveConflicts(event, conflicts);
      if (!resolvedEvent) {
        throw new Error(`Unable to resolve conflicts for event ${event.id}`);
      }
      event.data = resolvedEvent.data;
    }

    // Broadcast to subscribed clients
    await this.broadcastSyncEvent(event);

    // Store processed event
    await this.markEventAsProcessed(event);

    this.emit('sync-event-processed', event);
  }

  private async broadcastSyncEvent(event: SyncEvent): Promise<void> {
    const channel = this.getChannelForEventType(event.type);
    const message = {
      type: 'sync-update',
      eventType: event.type,
      source: event.source,
      data: event.data,
      timestamp: event.timestamp.toISOString(),
      eventId: event.id,
    };

    // Send to WebSocket clients
    for (const [clientId, client] of this.connectedClients) {
      if (this.shouldReceiveEvent(client, event, channel)) {
        this.sendToClient(clientId, message);
      }
    }

    // Publish to Redis for other service instances
    await this.redis.publish(`sync:${channel}`, JSON.stringify(message));
  }

  private shouldReceiveEvent(client: ConnectedClient, event: SyncEvent, channel: string): boolean {
    // Don't send back to the source
    if (client.type === event.source) return false;

    // Check if client is subscribed to the channel
    if (!client.subscriptions.includes(channel) && !client.subscriptions.includes('all')) {
      return false;
    }

    // Check target filtering
    if (event.target.length > 0 && !event.target.includes('all') && !event.target.includes(client.type)) {
      return false;
    }

    return true;
  }

  // Redis Integration
  private setupRedisListeners(): void {
    this.redis.on('connect', () => {
      this.logger.info('Connected to Redis');
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis error:', error);
      // Continue operation without Redis for development
      this.logger.warn('Continuing without Redis in development mode');
    });

    this.redis.on('close', () => {
      this.logger.warn('Redis connection closed - running in offline mode');
    });

    // Only subscribe to sync channels if Redis is available
    try {
      const subscriber = new Redis({
        host: integrationConfig.realTimeSync.redis.host,
        port: integrationConfig.realTimeSync.redis.port,
        password: integrationConfig.realTimeSync.redis.password,
        db: integrationConfig.realTimeSync.redis.db,
        lazyConnect: true,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
      });

      subscriber.on('error', (error) => {
        this.logger.error('Redis subscriber error:', error);
      });

      subscriber.psubscribe('sync:*').catch((error) => {
        this.logger.error('Failed to subscribe to Redis channels:', error);
      });

      subscriber.on('pmessage', (pattern, channel, message) => {
        this.handleRedisMessage(channel, message);
      });
    } catch (error) {
      this.logger.error('Failed to setup Redis subscriber:', error);
    }
  }

  private handleRedisMessage(channel: string, message: string): void {
    try {
      const syncMessage = JSON.parse(message);
      
      // Broadcast to local WebSocket clients
      for (const [clientId, client] of this.connectedClients) {
        if (client.subscriptions.includes(channel.replace('sync:', '')) || 
            client.subscriptions.includes('all')) {
          this.sendToClient(clientId, syncMessage);
        }
      }
    } catch (error) {
      this.logger.error('Error handling Redis message:', error);
    }
  }

  private async storeSyncEvent(event: SyncEvent): Promise<void> {
    const key = `sync_event:${event.id}`;
    await this.redis.setex(key, 3600, JSON.stringify(event)); // Store for 1 hour
  }

  private async markEventAsProcessed(event: SyncEvent): Promise<void> {
    const key = `sync_processed:${event.id}`;
    await this.redis.setex(key, 86400, JSON.stringify({
      ...event,
      processedAt: new Date().toISOString(),
    })); // Store for 24 hours
  }

  // Utility Methods
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineClientType(request: any): ConnectedClient['type'] {
    const userAgent = request.headers['user-agent'] || '';
    const origin = request.headers.origin || '';

    if (userAgent.includes('Flutter')) return 'flutter-app';
    if (origin.includes('b2b')) return 'b2b-portal';
    if (origin.includes('shop') || origin.includes('store')) return 'b2c-ecommerce';
    return 'admin-dashboard';
  }

  private getPriorityValue(priority: SyncEvent['priority']): number {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 2;
    }
  }

  private getChannelForEventType(eventType: string): string {
    const eventChannelMap: Record<string, string> = {
      'customer.created': 'customer-updates',
      'customer.updated': 'customer-updates',
      'customer.deleted': 'customer-updates',
      'order.created': 'order-updates',
      'order.updated': 'order-updates',
      'order.cancelled': 'order-updates',
      'inventory.updated': 'inventory-updates',
      'price.changed': 'pricing-updates',
      'territory.updated': 'territory-updates',
      'product.created': 'product-updates',
      'product.updated': 'product-updates',
    };

    return eventChannelMap[eventType] || 'general-updates';
  }

  private sendToClient(clientId: string, message: any): void {
    const client = this.connectedClients.get(clientId);
    if (client && client.websocket.readyState === WebSocket.OPEN) {
      client.websocket.send(JSON.stringify(message));
    }
  }

  // Heartbeat Management
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.performHeartbeat();
    }, 30000); // Every 30 seconds
  }

  private performHeartbeat(): void {
    const now = new Date();
    const timeout = 60000; // 1 minute timeout

    for (const [clientId, client] of this.connectedClients) {
      const timeSinceLastPing = now.getTime() - client.lastPing.getTime();
      
      if (timeSinceLastPing > timeout) {
        this.logger.warn(`Client ${clientId} timed out, closing connection`);
        client.websocket.terminate();
        this.connectedClients.delete(clientId);
      } else {
        // Send ping
        if (client.websocket.readyState === WebSocket.OPEN) {
          client.websocket.ping();
        }
      }
    }
  }

  // Public API Methods
  async broadcastToAll(eventType: string, data: any): Promise<void> {
    const event: SyncEvent = {
      id: this.generateEventId(),
      type: eventType,
      source: 'system',
      target: ['all'],
      data: data,
      timestamp: new Date(),
      priority: 'medium',
      retryCount: 0,
    };

    this.addToSyncQueue(event);
  }

  async broadcastToClients(clientTypes: ConnectedClient['type'][], eventType: string, data: any): Promise<void> {
    const event: SyncEvent = {
      id: this.generateEventId(),
      type: eventType,
      source: 'system',
      target: clientTypes,
      data: data,
      timestamp: new Date(),
      priority: 'medium',
      retryCount: 0,
    };

    this.addToSyncQueue(event);
  }

  getConnectedClients(): { [key: string]: { type: string; subscriptions: string[]; connected: string } } {
    const clients: any = {};
    
    for (const [clientId, client] of this.connectedClients) {
      clients[clientId] = {
        type: client.type,
        subscriptions: client.subscriptions,
        connected: client.lastPing.toISOString(),
      };
    }

    return clients;
  }

  async getQueueStatus(): Promise<{ pending: number; processing: boolean }> {
    return {
      pending: this.syncQueue.length,
      processing: this.processingQueue,
    };
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const redisStatus = await this.redis.ping();
      
      return {
        status: 'healthy',
        details: {
          redis: redisStatus === 'PONG' ? 'connected' : 'disconnected',
          connectedClients: this.connectedClients.size,
          queueLength: this.syncQueue.length,
          processing: this.processingQueue,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          connectedClients: this.connectedClients.size,
        },
      };
    }
  }

  // Cleanup
  destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.wss) {
      this.wss.close();
    }

    this.redis.disconnect();
    this.removeAllListeners();
    
    this.logger.info('Real-time sync service destroyed');
  }
}

export default RealTimeSyncService;
