import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger';
import { messageBroker } from './MessageBroker';
import { customerSyncService } from './CustomerSyncService';
import { inventorySyncService } from './InventorySyncService';
import { orderSyncService } from './OrderSyncService';
import { webSocketServer } from './WebSocketServer';
import { config } from '../config';

export interface WebhookEvent {
  id: string;
  source: 'erpnext' | 'espocrm' | 'medusa';
  eventType: string;
  timestamp: Date;
  data: any;
  signature?: string;
}

export class WebhookHandler {
  private app: express.Express;
  private webhookSecrets: Map<string, string> = new Map();

  constructor() {
    this.app = express();
    this.setupSecrets();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupSecrets() {
    this.webhookSecrets.set('erpnext', config.webhooks?.erpnext?.secret || 'erpnext-webhook-secret');
    this.webhookSecrets.set('espocrm', config.webhooks?.espocrm?.secret || 'espocrm-webhook-secret');
    this.webhookSecrets.set('medusa', config.webhooks?.medusa?.secret || 'medusa-webhook-secret');
  }

  private setupMiddleware() {
    // Raw body parser for signature verification
    this.app.use('/webhooks', express.raw({ type: 'application/json', limit: '1mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      logger.debug(`Webhook ${req.method} ${req.path}`, {
        headers: req.headers,
        query: req.query,
      });
      next();
    });
  }

  private setupRoutes() {
    // ERPNext webhooks
    this.app.post('/webhooks/erpnext/:eventType', this.handleERPNextWebhook.bind(this));

    // EspoCRM webhooks
    this.app.post('/webhooks/espocrm/:eventType', this.handleEspoCRMWebhook.bind(this));

    // Medusa.js webhooks
    this.app.post('/webhooks/medusa/:eventType', this.handleMedusaWebhook.bind(this));

    // Health check endpoint
    this.app.get('/webhooks/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // Webhook registration endpoint
    this.app.post('/webhooks/register', this.handleWebhookRegistration.bind(this));

    // Error handler
    this.app.use((error: Error, req: Request, res: Response, next: any) => {
      logger.error('Webhook error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    });
  }

  private async handleERPNextWebhook(req: Request, res: Response) {
    try {
      const eventType = req.params.eventType;
      const signature = req.headers['x-frappe-webhook-signature'] as string;

      // Verify signature
      if (!this.verifySignature(req.body, signature, 'erpnext')) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const webhookData = JSON.parse(req.body.toString());

      const event: WebhookEvent = {
        id: this.generateEventId(),
        source: 'erpnext',
        eventType,
        timestamp: new Date(),
        data: webhookData,
        signature,
      };

      await this.processERPNextEvent(event);

      res.status(200).json({
        success: true,
        eventId: event.id,
        timestamp: event.timestamp,
      });
    } catch (error) {
      logger.error('ERPNext webhook processing failed:', error);
      res.status(500).json({
        error: 'Processing failed',
        message: error.message,
      });
    }
  }

  private async handleEspoCRMWebhook(req: Request, res: Response) {
    try {
      const eventType = req.params.eventType;
      const signature = req.headers['x-espocrm-signature'] as string;

      // Verify signature
      if (!this.verifySignature(req.body, signature, 'espocrm')) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const webhookData = JSON.parse(req.body.toString());

      const event: WebhookEvent = {
        id: this.generateEventId(),
        source: 'espocrm',
        eventType,
        timestamp: new Date(),
        data: webhookData,
        signature,
      };

      await this.processEspoCRMEvent(event);

      res.status(200).json({
        success: true,
        eventId: event.id,
        timestamp: event.timestamp,
      });
    } catch (error) {
      logger.error('EspoCRM webhook processing failed:', error);
      res.status(500).json({
        error: 'Processing failed',
        message: error.message,
      });
    }
  }

  private async handleMedusaWebhook(req: Request, res: Response) {
    try {
      const eventType = req.params.eventType;
      const signature = req.headers['x-medusa-signature'] as string;

      // Verify signature
      if (!this.verifySignature(req.body, signature, 'medusa')) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const webhookData = JSON.parse(req.body.toString());

      const event: WebhookEvent = {
        id: this.generateEventId(),
        source: 'medusa',
        eventType,
        timestamp: new Date(),
        data: webhookData,
        signature,
      };

      await this.processMedusaEvent(event);

      res.status(200).json({
        success: true,
        eventId: event.id,
        timestamp: event.timestamp,
      });
    } catch (error) {
      logger.error('Medusa webhook processing failed:', error);
      res.status(500).json({
        error: 'Processing failed',
        message: error.message,
      });
    }
  }

  private async handleWebhookRegistration(req: Request, res: Response) {
    try {
      const { source, eventTypes, callbackUrl } = req.body;

      // Register webhook endpoints with external systems
      const registrationResult = await this.registerWebhookWithSource(source, eventTypes, callbackUrl);

      res.status(200).json({
        success: true,
        registration: registrationResult,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Webhook registration failed:', error);
      res.status(500).json({
        error: 'Registration failed',
        message: error.message,
      });
    }
  }

  private async processERPNextEvent(event: WebhookEvent) {
    logger.info(`Processing ERPNext webhook: ${event.eventType}`, { eventId: event.id });

    switch (event.eventType) {
      case 'customer-created':
      case 'customer-updated':
        await this.handleCustomerEvent(event);
        break;

      case 'item-updated':
      case 'stock-entry-submitted':
        await this.handleInventoryEvent(event);
        break;

      case 'sales-order-submitted':
      case 'sales-order-cancelled':
      case 'delivery-note-submitted':
        await this.handleOrderEvent(event);
        break;

      case 'item-price-updated':
      case 'pricing-rule-updated':
        await this.handlePricingEvent(event);
        break;

      default:
        logger.warn(`Unhandled ERPNext event type: ${event.eventType}`);
    }

    // Broadcast event via WebSocket
    if (webSocketServer) {
      webSocketServer.broadcastSyncEvent({
        type: 'webhook-received',
        source: event.source,
        eventType: event.eventType,
        timestamp: event.timestamp,
      });
    }
  }

  private async processEspoCRMEvent(event: WebhookEvent) {
    logger.info(`Processing EspoCRM webhook: ${event.eventType}`, { eventId: event.id });

    switch (event.eventType) {
      case 'Account.afterSave':
      case 'Contact.afterSave':
        await this.handleCustomerEvent(event);
        break;

      case 'Product.afterSave':
        await this.handlePricingEvent(event);
        break;

      case 'Opportunity.afterSave':
      case 'Quote.afterSave':
        await this.handleOrderEvent(event);
        break;

      default:
        logger.warn(`Unhandled EspoCRM event type: ${event.eventType}`);
    }

    // Broadcast event via WebSocket
    if (webSocketServer) {
      webSocketServer.broadcastSyncEvent({
        type: 'webhook-received',
        source: event.source,
        eventType: event.eventType,
        timestamp: event.timestamp,
      });
    }
  }

  private async processMedusaEvent(event: WebhookEvent) {
    logger.info(`Processing Medusa webhook: ${event.eventType}`, { eventId: event.id });

    switch (event.eventType) {
      case 'customer.created':
      case 'customer.updated':
        await this.handleCustomerEvent(event);
        break;

      case 'product.created':
      case 'product.updated':
      case 'product_variant.created':
      case 'product_variant.updated':
        await this.handleInventoryEvent(event);
        break;

      case 'order.placed':
      case 'order.updated':
      case 'order.canceled':
      case 'order.completed':
        await this.handleOrderEvent(event);
        break;

      case 'product_variant.inventory_quantity_updated':
        await this.handleInventoryEvent(event);
        break;

      default:
        logger.warn(`Unhandled Medusa event type: ${event.eventType}`);
    }

    // Broadcast event via WebSocket
    if (webSocketServer) {
      webSocketServer.broadcastSyncEvent({
        type: 'webhook-received',
        source: event.source,
        eventType: event.eventType,
        timestamp: event.timestamp,
      });
    }
  }

  private async handleCustomerEvent(event: WebhookEvent) {
    try {
      const customerData = this.extractCustomerData(event);

      if (customerData) {
        await customerSyncService.syncCustomer(
          customerData,
          event.source as any,
          event.source === 'erpnext' ? 'espocrm' : 'erpnext'
        );

        // Broadcast customer update
        if (webSocketServer) {
          webSocketServer.broadcastCustomerUpdate({
            eventType: event.eventType,
            customer: customerData,
            source: event.source,
          });
        }
      }
    } catch (error) {
      logger.error('Failed to handle customer event:', error);
      throw error;
    }
  }

  private async handleInventoryEvent(event: WebhookEvent) {
    try {
      const inventoryData = this.extractInventoryData(event);

      if (inventoryData) {
        await inventorySyncService.syncInventory(
          inventoryData,
          event.source as any,
          event.source === 'erpnext' ? 'medusa' : 'erpnext'
        );

        // Broadcast inventory update
        if (webSocketServer) {
          webSocketServer.broadcastInventoryUpdate({
            eventType: event.eventType,
            inventory: inventoryData,
            source: event.source,
          });
        }
      }
    } catch (error) {
      logger.error('Failed to handle inventory event:', error);
      throw error;
    }
  }

  private async handleOrderEvent(event: WebhookEvent) {
    try {
      const orderData = this.extractOrderData(event);

      if (orderData) {
        await orderSyncService.syncOrder(
          orderData,
          event.source as any,
          event.source === 'medusa' ? 'erpnext' : 'medusa'
        );

        // Broadcast order update
        if (webSocketServer) {
          webSocketServer.broadcastOrderUpdate({
            eventType: event.eventType,
            order: orderData,
            source: event.source,
          });
        }
      }
    } catch (error) {
      logger.error('Failed to handle order event:', error);
      throw error;
    }
  }

  private async handlePricingEvent(event: WebhookEvent) {
    try {
      // For pricing events, trigger a full pricing sync
      logger.info('Triggering pricing sync due to webhook event');

      // Use message broker to queue pricing sync
      await messageBroker.publishSyncEvent({
        entityType: 'price',
        operation: 'update',
        source: event.source as any,
        target: 'all',
        data: { eventId: event.id, eventType: event.eventType },
        metadata: {
          timestamp: new Date().toISOString(),
          correlationId: `pricing_webhook_${event.id}`,
        },
      });

      // Broadcast pricing update
      if (webSocketServer) {
        webSocketServer.broadcastPricingUpdate({
          eventType: event.eventType,
          source: event.source,
          triggered: 'full-sync',
        });
      }
    } catch (error) {
      logger.error('Failed to handle pricing event:', error);
      throw error;
    }
  }

  private extractCustomerData(event: WebhookEvent): any {
    // Extract customer data from webhook payload
    switch (event.source) {
      case 'erpnext':
        return {
          id: event.data.name,
          name: event.data.customer_name,
          email: event.data.email_id,
          phone: event.data.mobile_no,
          erpnext: {
            customer_name: event.data.customer_name,
            customer_type: event.data.customer_type,
            customer_group: event.data.customer_group,
            territory: event.data.territory,
            credit_limit: event.data.credit_limit || 0,
            payment_terms: event.data.payment_terms,
            sales_person: event.data.default_sales_partner,
            tax_id: event.data.tax_id,
            is_frozen: event.data.is_frozen === 1,
            disabled: event.data.disabled === 1,
          },
        };

      case 'espocrm':
        return {
          id: event.data.id,
          name: event.data.name,
          email: event.data.emailAddress,
          phone: event.data.phoneNumber,
          espocrm: {
            accountType: event.data.accountType,
            industry: event.data.industry,
            assignedUser: event.data.assignedUserId,
            teams: event.data.teamsIds,
            description: event.data.description,
            website: event.data.website,
          },
        };

      case 'medusa':
        return {
          id: event.data.id,
          name: `${event.data.first_name} ${event.data.last_name}`,
          email: event.data.email,
          phone: event.data.phone,
        };

      default:
        return null;
    }
  }

  private extractInventoryData(event: WebhookEvent): any {
    // Extract inventory data from webhook payload
    switch (event.source) {
      case 'erpnext':
        if (event.eventType === 'stock-entry-submitted') {
          return {
            itemCode: event.data.items?.[0]?.item_code,
            itemName: event.data.items?.[0]?.item_name,
            warehouse: event.data.items?.[0]?.t_warehouse || event.data.items?.[0]?.s_warehouse,
            actualQty: event.data.items?.[0]?.qty || 0,
            reservedQty: 0,
            availableQty: event.data.items?.[0]?.qty || 0,
            projectedQty: event.data.items?.[0]?.qty || 0,
          };
        }
        return null;

      case 'medusa':
        if (event.eventType.includes('product')) {
          return {
            itemCode: event.data.sku,
            itemName: event.data.title,
            warehouse: 'Main Store',
            actualQty: event.data.inventory_quantity || 0,
            reservedQty: 0,
            availableQty: event.data.inventory_quantity || 0,
            projectedQty: event.data.inventory_quantity || 0,
          };
        }
        return null;

      default:
        return null;
    }
  }

  private extractOrderData(event: WebhookEvent): any {
    // Extract order data from webhook payload
    switch (event.source) {
      case 'medusa':
        if (event.eventType.includes('order')) {
          return {
            id: event.data.id,
            orderNumber: event.data.display_id?.toString(),
            orderDate: new Date(event.data.created_at),
            customerName: `${event.data.customer?.first_name} ${event.data.customer?.last_name}`,
            customerId: event.data.customer_id,
            status: event.data.status,
            items: event.data.items?.map((item: any) => ({
              itemCode: item.variant?.sku,
              itemName: item.title,
              quantity: item.quantity,
              rate: item.unit_price / 100,
              amount: item.total / 100,
              uom: 'Nos',
            })) || [],
            totalAmount: event.data.total / 100,
            currency: event.data.currency_code?.toUpperCase(),
            deliveryAddress: event.data.shipping_address,
            orderType: 'retail',
            priority: 'medium',
          };
        }
        return null;

      default:
        return null;
    }
  }

  private verifySignature(payload: Buffer, signature: string, source: string): boolean {
    try {
      const secret = this.webhookSecrets.get(source);
      if (!secret) {
        logger.warn(`No webhook secret configured for source: ${source}`);
        return false;
      }

      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      // Remove algorithm prefix if present (e.g., "sha256=")
      const cleanSignature = signature.replace(/^sha256=/, '');

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(cleanSignature, 'hex')
      );
    } catch (error) {
      logger.error('Signature verification failed:', error);
      return false;
    }
  }

  private generateEventId(): string {
    return `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async registerWebhookWithSource(source: string, eventTypes: string[], callbackUrl: string): Promise<any> {
    // This would typically make API calls to register webhooks with external systems
    // Implementation depends on the specific APIs of ERPNext, EspoCRM, and Medusa

    logger.info(`Registering webhook for ${source}:`, { eventTypes, callbackUrl });

    // Return registration result
    return {
      source,
      eventTypes,
      callbackUrl,
      registeredAt: new Date().toISOString(),
      status: 'registered',
    };
  }

  public getWebhookApp(): express.Express {
    return this.app;
  }

  public async testWebhook(source: string, eventType: string, testData: any): Promise<void> {
    const event: WebhookEvent = {
      id: this.generateEventId(),
      source: source as any,
      eventType,
      timestamp: new Date(),
      data: testData,
    };

    switch (source) {
      case 'erpnext':
        await this.processERPNextEvent(event);
        break;
      case 'espocrm':
        await this.processEspoCRMEvent(event);
        break;
      case 'medusa':
        await this.processMedusaEvent(event);
        break;
      default:
        throw new Error(`Unknown webhook source: ${source}`);
    }

    logger.info(`Test webhook processed: ${source}/${eventType}`);
  }
}

export const webhookHandler = new WebhookHandler();