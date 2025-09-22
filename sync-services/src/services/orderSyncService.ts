import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';
import { messageBroker, SyncEvent } from './MessageBroker';
import { config } from '../config';
import { ConflictResolver } from './ConflictResolver';

export interface OrderItem {
  itemCode: string;
  itemName: string;
  quantity: number;
  rate: number;
  amount: number;
  uom: string;
  description?: string;
  discount?: number;
  taxRate?: number;
  warehouse?: string;
  batchNo?: string;
  serialNo?: string;
}

export interface OrderData {
  // Common fields
  id?: string;
  orderNumber: string;
  orderDate: Date;
  customerName: string;
  customerId: string;
  status: 'draft' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  items: OrderItem[];
  totalAmount: number;
  currency: string;

  // Delivery information
  deliveryDate?: Date;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    contactPerson?: string;
    contactNumber?: string;
  };

  // ERPNext specific
  erpnext?: {
    doctype: 'Sales Order' | 'Sales Invoice' | 'Delivery Note';
    company: string;
    territory: string;
    customerGroup: string;
    priceList: string;
    currency: string;
    conversionRate: number;
    grandTotal: number;
    netTotal: number;
    totalTaxesAndCharges: number;
    roundingAdjustment: number;
    paymentTermsTemplate?: string;
    tcName?: string;
    deliveryStatus: 'Not Delivered' | 'Partly Delivered' | 'Fully Delivered';
    billingStatus: 'Not Billed' | 'Partly Billed' | 'Fully Billed';
    perDelivered: number;
    perBilled: number;
  };

  // Medusa.js specific
  medusa?: {
    region_id: string;
    email: string;
    phone?: string;
    shipping_address: any;
    billing_address: any;
    shipping_methods: Array<{
      shipping_option_id: string;
      price: number;
    }>;
    payment_status: 'not_paid' | 'awaiting' | 'captured' | 'partially_refunded' | 'refunded' | 'cancelled';
    fulfillment_status: 'not_fulfilled' | 'partially_fulfilled' | 'fulfilled' | 'partially_shipped' | 'shipped' | 'partially_returned' | 'returned' | 'cancelled';
    cart_id?: string;
    draft_order_id?: string;
    display_id: number;
    tax_rate?: number;
    discount_total: number;
    shipping_total: number;
    tax_total: number;
    refunded_total: number;
    gift_card_total: number;
  };

  // Business specific fields
  orderType: 'retail' | 'wholesale' | 'corporate' | 'special';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  salesPerson?: string;
  specialInstructions?: string;
  refrigerationRequired?: boolean;
  expiryDateSensitive?: boolean;

  // Sync metadata
  lastSyncedAt?: Date;
  version?: number;
  conflictResolved?: boolean;
}

export class OrderSyncService {
  private erpnextClient: AxiosInstance;
  private medusaClient: AxiosInstance;
  private conflictResolver: ConflictResolver;

  constructor() {
    this.erpnextClient = axios.create({
      baseURL: config.erpnext.baseUrl,
      headers: {
        'Authorization': `token ${config.erpnext.apiKey}:${config.erpnext.apiSecret}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.medusaClient = axios.create({
      baseURL: config.medusa.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.medusa.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.conflictResolver = new ConflictResolver();
    this.setupSyncListeners();
  }

  private setupSyncListeners() {
    // Subscribe to order sync events
    messageBroker.subscribeTo('order-sync', this.processOrderSync.bind(this));
  }

  private async processOrderSync(message: any): Promise<any> {
    const { event }: { event: SyncEvent } = message.payload;

    try {
      logger.info(`Processing order sync: ${event.operation} from ${event.source} to ${event.target}`);

      switch (event.operation) {
        case 'create':
          return await this.handleOrderCreate(event);
        case 'update':
          return await this.handleOrderUpdate(event);
        case 'delete':
          return await this.handleOrderDelete(event);
        default:
          throw new Error(`Unknown operation: ${event.operation}`);
      }
    } catch (error) {
      logger.error('Order sync processing failed:', error);
      throw error;
    }
  }

  private async handleOrderCreate(event: SyncEvent): Promise<any> {
    const orderData: OrderData = event.data;

    if (event.target === 'all' || event.target === 'erpnext') {
      await this.createOrderInERPNext(orderData);
    }

    return { success: true, message: 'Order created successfully' };
  }

  private async handleOrderUpdate(event: SyncEvent): Promise<any> {
    const orderData: OrderData = event.data;
    const conflicts: any[] = [];

    // Check for conflicts before updating
    if (event.target === 'all') {
      const erpnextOrder = await this.getOrderFromERPNext(orderData.orderNumber);

      if (erpnextOrder) {
        const conflictResult = await this.conflictResolver.resolveOrderConflicts?.(
          orderData,
          erpnextOrder
        );

        if (conflictResult?.hasConflicts) {
          conflicts.push(...conflictResult.conflicts);
          orderData.conflictResolved = conflictResult.resolved;
        }
      }
    }

    if (event.target === 'all' || event.target === 'erpnext') {
      await this.updateOrderInERPNext(orderData);
    }

    // Trigger inventory reservation updates
    await this.updateInventoryReservations(orderData);

    // Trigger production order if needed
    if (orderData.status === 'confirmed' && this.requiresProduction(orderData)) {
      await this.triggerProductionOrder(orderData);
    }

    return {
      success: true,
      message: 'Order updated successfully',
      conflicts: conflicts.length > 0 ? conflicts : undefined
    };
  }

  private async handleOrderDelete(event: SyncEvent): Promise<any> {
    const orderId = event.data.id;

    if (event.target === 'all' || event.target === 'erpnext') {
      await this.cancelOrderInERPNext(orderId);
    }

    return { success: true, message: 'Order cancelled successfully' };
  }

  // ERPNext operations
  private async createOrderInERPNext(orderData: OrderData): Promise<any> {
    try {
      // Create Sales Order
      const salesOrderData = {
        doctype: 'Sales Order',
        naming_series: 'SAL-ORD-.YYYY.-',
        customer: orderData.customerId,
        order_type: 'Sales',
        transaction_date: orderData.orderDate.toISOString().split('T')[0],
        delivery_date: orderData.deliveryDate?.toISOString().split('T')[0],
        company: orderData.erpnext?.company || 'Harsha Delights',
        territory: orderData.erpnext?.territory || 'All Territories',
        customer_group: orderData.erpnext?.customerGroup || 'All Customer Groups',
        price_list: orderData.erpnext?.priceList || 'Standard Selling',
        currency: orderData.currency,
        conversion_rate: orderData.erpnext?.conversionRate || 1,
        selling_price_list: orderData.erpnext?.priceList || 'Standard Selling',
        ignore_pricing_rule: 0,
        items: orderData.items.map(item => ({
          item_code: item.itemCode,
          item_name: item.itemName,
          description: item.description || item.itemName,
          qty: item.quantity,
          uom: item.uom,
          rate: item.rate,
          amount: item.amount,
          warehouse: item.warehouse || 'Stores - HD',
          delivery_date: orderData.deliveryDate?.toISOString().split('T')[0],
        })),
        taxes_and_charges: 'India GST 18%',
        custom_order_priority: orderData.priority,
        custom_order_type: orderData.orderType,
        custom_special_instructions: orderData.specialInstructions,
        custom_refrigeration_required: orderData.refrigerationRequired ? 1 : 0,
        custom_medusa_order_id: orderData.id,
      };

      // Add delivery address
      if (orderData.deliveryAddress) {
        const addressId = await this.createOrUpdateAddress(orderData.deliveryAddress, orderData.customerName);
        salesOrderData['shipping_address_name'] = addressId;
        salesOrderData['customer_address'] = addressId;
      }

      const response = await this.erpnextClient.post('/api/resource/Sales Order', salesOrderData);

      // Update the order with ERPNext data
      const erpnextOrderData = response.data.data;
      orderData.erpnext = {
        ...orderData.erpnext,
        doctype: 'Sales Order',
        grandTotal: erpnextOrderData.grand_total,
        netTotal: erpnextOrderData.net_total,
        totalTaxesAndCharges: erpnextOrderData.total_taxes_and_charges,
        roundingAdjustment: erpnextOrderData.rounding_adjustment,
        deliveryStatus: erpnextOrderData.delivery_status,
        billingStatus: erpnextOrderData.billing_status,
        perDelivered: erpnextOrderData.per_delivered,
        perBilled: erpnextOrderData.per_billed,
      };

      logger.info(`Sales Order created in ERPNext: ${erpnextOrderData.name}`);

      // Auto-submit if order is confirmed
      if (orderData.status === 'confirmed') {
        await this.submitERPNextDocument('Sales Order', erpnextOrderData.name);
      }

      return erpnextOrderData;
    } catch (error) {
      logger.error('Failed to create order in ERPNext:', error);
      throw new Error(`ERPNext order creation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  private async updateOrderInERPNext(orderData: OrderData): Promise<any> {
    try {
      const erpnextOrder = await this.getOrderFromERPNext(orderData.orderNumber);

      if (!erpnextOrder) {
        return await this.createOrderInERPNext(orderData);
      }

      // Update status mapping
      const statusUpdate = this.mapMedusaToERPNextStatus(orderData.status);

      const updateData: any = {
        delivery_date: orderData.deliveryDate?.toISOString().split('T')[0],
        custom_order_priority: orderData.priority,
        custom_special_instructions: orderData.specialInstructions,
        status: statusUpdate,
      };

      // Update items if order is still in draft
      if (erpnextOrder.docstatus === 0) {
        updateData.items = orderData.items.map(item => ({
          item_code: item.itemCode,
          item_name: item.itemName,
          description: item.description || item.itemName,
          qty: item.quantity,
          uom: item.uom,
          rate: item.rate,
          amount: item.amount,
          warehouse: item.warehouse || 'Stores - HD',
          delivery_date: orderData.deliveryDate?.toISOString().split('T')[0],
        }));
      }

      const response = await this.erpnextClient.put(
        `/api/resource/Sales Order/${erpnextOrder.name}`,
        updateData
      );

      // Handle status transitions
      if (orderData.status === 'confirmed' && erpnextOrder.docstatus === 0) {
        await this.submitERPNextDocument('Sales Order', erpnextOrder.name);
      } else if (orderData.status === 'cancelled') {
        await this.cancelERPNextDocument('Sales Order', erpnextOrder.name);
      }

      logger.info(`Sales Order updated in ERPNext: ${erpnextOrder.name}`);
      return response.data.data;
    } catch (error) {
      logger.error('Failed to update order in ERPNext:', error);
      throw new Error(`ERPNext order update failed: ${error.response?.data?.message || error.message}`);
    }
  }

  private async cancelOrderInERPNext(orderNumber: string): Promise<void> {
    try {
      const erpnextOrder = await this.getOrderFromERPNext(orderNumber);

      if (erpnextOrder) {
        await this.cancelERPNextDocument('Sales Order', erpnextOrder.name);
        logger.info(`Sales Order cancelled in ERPNext: ${erpnextOrder.name}`);
      }
    } catch (error) {
      logger.error('Failed to cancel order in ERPNext:', error);
      throw new Error(`ERPNext order cancellation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  private async getOrderFromERPNext(orderNumber: string): Promise<any> {
    try {
      // Try to find by name or custom field
      const filters = `[["custom_medusa_order_id", "=", "${orderNumber}"]]`;
      const response = await this.erpnextClient.get(`/api/resource/Sales Order?filters=${encodeURIComponent(filters)}&fields=["*"]`);

      if (response.data.data.length > 0) {
        return response.data.data[0];
      }

      // Try direct name lookup
      try {
        const directResponse = await this.erpnextClient.get(`/api/resource/Sales Order/${orderNumber}`);
        return directResponse.data.data;
      } catch (directError) {
        return null;
      }
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      logger.error('Failed to get order from ERPNext:', error);
      throw error;
    }
  }

  // Medusa.js operations
  private async updateOrderStatusInMedusa(orderId: string, status: string): Promise<any> {
    try {
      const response = await this.medusaClient.post(`/admin/orders/${orderId}`, {
        status: this.mapERPNextToMedusaStatus(status),
      });

      logger.info(`Order status updated in Medusa: ${orderId} -> ${status}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to update order status in Medusa:', error);
      throw new Error(`Medusa order status update failed: ${error.response?.data?.message || error.message}`);
    }
  }

  private async createFulfillmentInMedusa(orderId: string, items: OrderItem[]): Promise<any> {
    try {
      const fulfillmentData = {
        items: items.map(item => ({
          item_id: item.itemCode,
          quantity: item.quantity,
        })),
        no_notification: false,
      };

      const response = await this.medusaClient.post(`/admin/orders/${orderId}/fulfillment`, fulfillmentData);

      logger.info(`Fulfillment created in Medusa: ${orderId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to create fulfillment in Medusa:', error);
      throw new Error(`Medusa fulfillment creation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Helper methods
  private async createOrUpdateAddress(address: any, customerName: string): Promise<string> {
    try {
      const addressData = {
        doctype: 'Address',
        address_title: `${customerName} - Delivery`,
        address_type: 'Shipping',
        address_line1: address.street,
        city: address.city,
        state: address.state,
        country: address.country,
        pincode: address.postalCode,
        phone: address.contactNumber,
        links: [{
          link_doctype: 'Customer',
          link_name: customerName,
        }],
      };

      const response = await this.erpnextClient.post('/api/resource/Address', addressData);
      return response.data.data.name;
    } catch (error) {
      logger.error('Failed to create address in ERPNext:', error);
      throw error;
    }
  }

  private async submitERPNextDocument(doctype: string, name: string): Promise<void> {
    try {
      await this.erpnextClient.post(`/api/resource/${doctype}/${name}`, {
        docstatus: 1
      });
      logger.info(`${doctype} ${name} submitted in ERPNext`);
    } catch (error) {
      logger.error(`Failed to submit ${doctype} ${name} in ERPNext:`, error);
      throw error;
    }
  }

  private async cancelERPNextDocument(doctype: string, name: string): Promise<void> {
    try {
      await this.erpnextClient.post(`/api/resource/${doctype}/${name}`, {
        docstatus: 2
      });
      logger.info(`${doctype} ${name} cancelled in ERPNext`);
    } catch (error) {
      logger.error(`Failed to cancel ${doctype} ${name} in ERPNext:`, error);
      throw error;
    }
  }

  private mapMedusaToERPNextStatus(medusaStatus: string): string {
    const statusMap = {
      'draft': 'Draft',
      'pending': 'To Deliver and Bill',
      'confirmed': 'To Deliver and Bill',
      'processing': 'To Deliver and Bill',
      'shipped': 'To Bill',
      'delivered': 'To Bill',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
    };

    return statusMap[medusaStatus] || 'Draft';
  }

  private mapERPNextToMedusaStatus(erpnextStatus: string): string {
    const statusMap = {
      'Draft': 'pending',
      'To Deliver and Bill': 'confirmed',
      'To Bill': 'shipped',
      'To Deliver': 'processing',
      'Completed': 'completed',
      'Cancelled': 'cancelled',
      'Closed': 'completed',
    };

    return statusMap[erpnextStatus] || 'pending';
  }

  private async updateInventoryReservations(orderData: OrderData): Promise<void> {
    try {
      for (const item of orderData.items) {
        // Reserve inventory in ERPNext
        if (orderData.status === 'confirmed' || orderData.status === 'processing') {
          await this.reserveInventoryItem(item.itemCode, item.quantity, item.warehouse);
        } else if (orderData.status === 'cancelled') {
          await this.unreserveInventoryItem(item.itemCode, item.quantity, item.warehouse);
        }
      }

      logger.info(`Inventory reservations updated for order: ${orderData.orderNumber}`);
    } catch (error) {
      logger.error('Failed to update inventory reservations:', error);
    }
  }

  private async reserveInventoryItem(itemCode: string, quantity: number, warehouse?: string): Promise<void> {
    try {
      // Create stock reservation entry
      const reservationData = {
        doctype: 'Stock Reservation Entry',
        item_code: itemCode,
        warehouse: warehouse || 'Stores - HD',
        qty: quantity,
        stock_uom: 'Nos',
        voucher_type: 'Sales Order',
        company: 'Harsha Delights',
      };

      await this.erpnextClient.post('/api/resource/Stock Reservation Entry', reservationData);
      logger.info(`Reserved ${quantity} of ${itemCode} in ${warehouse}`);
    } catch (error) {
      logger.error(`Failed to reserve inventory for ${itemCode}:`, error);
    }
  }

  private async unreserveInventoryItem(itemCode: string, quantity: number, warehouse?: string): Promise<void> {
    try {
      // Find and cancel stock reservation
      const filters = `[["item_code", "=", "${itemCode}"], ["warehouse", "=", "${warehouse || 'Stores - HD'}"], ["qty", "=", ${quantity}], ["docstatus", "=", 1]]`;
      const response = await this.erpnextClient.get(`/api/resource/Stock Reservation Entry?filters=${encodeURIComponent(filters)}`);

      if (response.data.data.length > 0) {
        const reservation = response.data.data[0];
        await this.cancelERPNextDocument('Stock Reservation Entry', reservation.name);
        logger.info(`Unreserved ${quantity} of ${itemCode} in ${warehouse}`);
      }
    } catch (error) {
      logger.error(`Failed to unreserve inventory for ${itemCode}:`, error);
    }
  }

  private requiresProduction(orderData: OrderData): boolean {
    // Check if any items require production based on business rules
    return orderData.items.some(item =>
      item.itemCode.startsWith('FG-') || // Finished goods
      item.quantity > 100 || // Large quantities
      orderData.orderType === 'corporate' // Corporate orders
    );
  }

  private async triggerProductionOrder(orderData: OrderData): Promise<void> {
    try {
      const productionItems = orderData.items.filter(item =>
        this.requiresProduction(orderData)
      );

      for (const item of productionItems) {
        const productionOrderData = {
          doctype: 'Production Plan',
          company: 'Harsha Delights',
          posting_date: new Date().toISOString().split('T')[0],
          po_items: [{
            item_code: item.itemCode,
            planned_qty: item.quantity,
            planned_start_date: new Date().toISOString().split('T')[0],
            warehouse: item.warehouse || 'Stores - HD',
          }],
          sales_orders: [{
            sales_order: orderData.orderNumber,
            sales_order_date: orderData.orderDate.toISOString().split('T')[0],
            customer: orderData.customerName,
            grand_total: orderData.totalAmount,
          }],
        };

        await this.erpnextClient.post('/api/resource/Production Plan', productionOrderData);
        logger.info(`Production Plan created for item: ${item.itemCode}`);
      }
    } catch (error) {
      logger.error('Failed to trigger production order:', error);
    }
  }

  // Public API methods
  public async syncOrder(orderData: OrderData, source: 'medusa' | 'erpnext', target: 'medusa' | 'erpnext' | 'all'): Promise<string> {
    const event: SyncEvent = {
      entityType: 'order',
      operation: orderData.id ? 'update' : 'create',
      source,
      target,
      data: orderData,
      metadata: {
        timestamp: new Date().toISOString(),
        correlationId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
    };

    return await messageBroker.publishSyncEvent(event);
  }

  public async syncOrderStatus(orderNumber: string, newStatus: string, source: 'medusa' | 'erpnext'): Promise<void> {
    const orderData = source === 'erpnext'
      ? await this.getOrderFromERPNext(orderNumber)
      : await this.getOrderFromMedusa(orderNumber);

    if (orderData) {
      orderData.status = newStatus;
      orderData.lastSyncedAt = new Date();

      await this.syncOrder(orderData, source, source === 'erpnext' ? 'medusa' : 'erpnext');
    }
  }

  private async getOrderFromMedusa(orderNumber: string): Promise<OrderData | null> {
    try {
      const response = await this.medusaClient.get(`/admin/orders/${orderNumber}`);
      return this.mapMedusaToOrderData(response.data.order);
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      logger.error('Failed to get order from Medusa:', error);
      throw error;
    }
  }

  private mapMedusaToOrderData(medusaOrder: any): OrderData {
    return {
      id: medusaOrder.id,
      orderNumber: medusaOrder.display_id.toString(),
      orderDate: new Date(medusaOrder.created_at),
      customerName: `${medusaOrder.customer.first_name} ${medusaOrder.customer.last_name}`,
      customerId: medusaOrder.customer_id,
      status: medusaOrder.status,
      items: medusaOrder.items.map((item: any) => ({
        itemCode: item.variant.sku,
        itemName: item.title,
        quantity: item.quantity,
        rate: item.unit_price / 100, // Convert from cents
        amount: item.total / 100,
        uom: 'Nos',
        description: item.description,
      })),
      totalAmount: medusaOrder.total / 100,
      currency: medusaOrder.currency_code.toUpperCase(),
      deliveryAddress: {
        street: medusaOrder.shipping_address.address_1,
        city: medusaOrder.shipping_address.city,
        state: medusaOrder.shipping_address.province,
        country: medusaOrder.shipping_address.country_code,
        postalCode: medusaOrder.shipping_address.postal_code,
        contactPerson: `${medusaOrder.shipping_address.first_name} ${medusaOrder.shipping_address.last_name}`,
        contactNumber: medusaOrder.shipping_address.phone,
      },
      orderType: 'retail',
      priority: 'medium',
      medusa: {
        region_id: medusaOrder.region_id,
        email: medusaOrder.email,
        phone: medusaOrder.phone,
        shipping_address: medusaOrder.shipping_address,
        billing_address: medusaOrder.billing_address,
        shipping_methods: medusaOrder.shipping_methods,
        payment_status: medusaOrder.payment_status,
        fulfillment_status: medusaOrder.fulfillment_status,
        display_id: medusaOrder.display_id,
        discount_total: medusaOrder.discount_total / 100,
        shipping_total: medusaOrder.shipping_total / 100,
        tax_total: medusaOrder.tax_total / 100,
        refunded_total: medusaOrder.refunded_total / 100,
        gift_card_total: medusaOrder.gift_card_total / 100,
      },
      lastSyncedAt: new Date(),
      version: 1,
    };
  }

  public async processDeliveryNotification(orderNumber: string, trackingNumber?: string): Promise<void> {
    try {
      const orderData = await this.getOrderFromERPNext(orderNumber);

      if (orderData) {
        // Create delivery note in ERPNext
        await this.createDeliveryNote(orderData, trackingNumber);

        // Update Medusa fulfillment
        if (orderData.erpnext?.medusa_order_id) {
          await this.createFulfillmentInMedusa(orderData.erpnext.medusa_order_id, orderData.items);
        }

        // Sync status update
        await this.syncOrderStatus(orderNumber, 'shipped', 'erpnext');
      }
    } catch (error) {
      logger.error('Failed to process delivery notification:', error);
      throw error;
    }
  }

  private async createDeliveryNote(orderData: any, trackingNumber?: string): Promise<void> {
    try {
      const deliveryNoteData = {
        doctype: 'Delivery Note',
        customer: orderData.customer,
        posting_date: new Date().toISOString().split('T')[0],
        posting_time: new Date().toTimeString().split(' ')[0],
        items: orderData.items.map((item: any) => ({
          item_code: item.item_code,
          item_name: item.item_name,
          qty: item.qty,
          uom: item.uom,
          rate: item.rate,
          warehouse: item.warehouse,
          against_sales_order: orderData.name,
          so_detail: item.name,
        })),
        lr_no: trackingNumber,
        transporter_name: 'Harsha Delights Logistics',
      };

      const response = await this.erpnextClient.post('/api/resource/Delivery Note', deliveryNoteData);
      await this.submitERPNextDocument('Delivery Note', response.data.data.name);

      logger.info(`Delivery Note created: ${response.data.data.name}`);
    } catch (error) {
      logger.error('Failed to create delivery note:', error);
      throw error;
    }
  }
}

export const orderSyncService = new OrderSyncService();