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

export class DataValidator {
  private validEventTypes = [
    'customer.created',
    'customer.updated', 
    'customer.deleted',
    'order.created',
    'order.updated',
    'order.cancelled',
    'inventory.updated',
    'price.changed',
    'territory.updated',
    'product.created',
    'product.updated',
    'product.deleted'
  ];

  private validSources = [
    'flutter-app',
    'b2b-portal', 
    'b2c-ecommerce',
    'admin-dashboard',
    'erp-system',
    'crm-system',
    'system'
  ];

  validateSyncEvent(event: SyncEvent): boolean {
    try {
      // Check required fields
      if (!event.id || !event.type || !event.source || !event.data) {
        return false;
      }

      // Validate event type
      if (!this.validEventTypes.includes(event.type)) {
        return false;
      }

      // Validate source
      if (!this.validSources.includes(event.source)) {
        return false;
      }

      // Validate target array
      if (!Array.isArray(event.target)) {
        return false;
      }

      // Validate priority
      if (!['high', 'medium', 'low'].includes(event.priority)) {
        return false;
      }

      // Validate timestamp
      if (!(event.timestamp instanceof Date) || isNaN(event.timestamp.getTime())) {
        return false;
      }

      // Validate retry count
      if (typeof event.retryCount !== 'number' || event.retryCount < 0) {
        return false;
      }

      // Validate data based on event type
      return this.validateEventData(event.type, event.data);
    } catch (error) {
      return false;
    }
  }

  private validateEventData(eventType: string, data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    switch (eventType) {
      case 'customer.created':
      case 'customer.updated':
        return this.validateCustomerData(data);
      
      case 'order.created':
      case 'order.updated':
        return this.validateOrderData(data);
      
      case 'product.created':
      case 'product.updated':
        return this.validateProductData(data);
      
      case 'inventory.updated':
        return this.validateInventoryData(data);
      
      case 'price.changed':
        return this.validatePriceData(data);
      
      case 'territory.updated':
        return this.validateTerritoryData(data);
      
      default:
        return true; // Allow unknown event types with basic validation
    }
  }

  private validateCustomerData(data: any): boolean {
    return !!(data.id && data.name && data.email);
  }

  private validateOrderData(data: any): boolean {
    return !!(data.id && data.customerId && data.items && Array.isArray(data.items));
  }

  private validateProductData(data: any): boolean {
    return !!(data.id && data.name && data.price !== undefined);
  }

  private validateInventoryData(data: any): boolean {
    return !!(data.productId && data.quantity !== undefined);
  }

  private validatePriceData(data: any): boolean {
    return !!(data.productId && data.price !== undefined);
  }

  private validateTerritoryData(data: any): boolean {
    return !!(data.id && data.name);
  }

  validateApiResponse(response: any): boolean {
    return response && typeof response === 'object' && response.success !== false;
  }

  sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = { ...data };
    
    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    delete sanitized.apiKey;
    
    return sanitized;
  }
}
