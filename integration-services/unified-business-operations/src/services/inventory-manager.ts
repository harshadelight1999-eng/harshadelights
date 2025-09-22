import { EventEmitter } from 'events';
import { Logger } from '../utils/logger';
import { ERPIntegrationService } from './erp-integration-service';
import { Product } from '../types/business-entities';

export interface InventoryItem {
  productId: string;
  warehouse: string;
  quantity: number;
  reserved: number;
  available: number;
  reorderLevel: number;
  lastUpdated: Date;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  warehouse: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RESERVED' | 'RELEASED';
  quantity: number;
  orderId?: string;
  reason: string;
  timestamp: Date;
}

export interface InventoryReservation {
  productId: string;
  warehouse: string;
  orderId: string;
  quantity: number;
  timestamp: Date;
  expiresAt: Date;
}

export class InventoryManager extends EventEmitter {
  private logger: Logger;
  private erpService: ERPIntegrationService;
  private inventory: Map<string, InventoryItem> = new Map();
  private movements: InventoryMovement[] = [];
  private reservations: Map<string, InventoryReservation> = new Map();

  constructor(erpService: ERPIntegrationService) {
    super();
    this.logger = new Logger('InventoryManager');
    this.erpService = erpService;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.erpService.on('product-updated', this.handleProductUpdate.bind(this));
    this.on('order-created', this.handleOrderCreated.bind(this));
    this.on('order-confirmed', this.handleOrderConfirmed.bind(this));
    this.on('order-cancelled', this.handleOrderCancelled.bind(this));
    this.erpService.on('inventory-updated', this.handleERPInventoryUpdate.bind(this));
  }

  private async handleProductUpdate(product: Product): Promise<void> {
    await this.updateInventoryFromProduct(product);
  }

  private async updateInventoryFromProduct(product: Product): Promise<void> {
    const inventoryKey = `${product.id}_Main Store`;
    const existingItem = this.inventory.get(inventoryKey);

    if (existingItem) {
      existingItem.quantity = product.stockQuantity;
      existingItem.available = product.stockQuantity - existingItem.reserved;
      existingItem.lastUpdated = new Date();
      this.inventory.set(inventoryKey, existingItem);
    } else {
      const inventoryItem: InventoryItem = {
        productId: product.id,
        warehouse: 'Main Store',
        quantity: product.stockQuantity,
        reserved: 0,
        available: product.stockQuantity,
        reorderLevel: 10,
        lastUpdated: new Date(),
      };
      this.inventory.set(inventoryKey, inventoryItem);
    }

    this.emit('inventory-updated', this.inventory.get(inventoryKey));
  }

  private async handleOrderCreated(order: any): Promise<void> {
    // Reserve inventory for order items
    for (const item of order.items) {
      await this.reserveInventory(item.productId, item.quantity, order.id, 'Main Store');
    }
  }

  private async handleOrderConfirmed(order: any): Promise<void> {
    // Convert reservations to actual reductions
    for (const item of order.items) {
      await this.confirmInventoryReduction(item.productId, item.quantity, order.id, 'Main Store');
    }
  }

  private async confirmInventoryReduction(productId: string, quantity: number, orderId: string, warehouse = 'Main Store'): Promise<boolean> {
    try {
      const key = `${productId}_${warehouse}`;
      const item = this.inventory.get(key);

      if (!item) {
        this.logger.error(`Product ${productId} not found in inventory`);
        return false;
      }

      // Reduce reserved and total quantity
      item.reserved -= quantity;
      item.quantity -= quantity;
      item.lastUpdated = new Date();

      this.inventory.set(key, item);

      // Record movement
      this.recordMovement({
        id: `confirm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId,
        warehouse,
        type: 'OUT',
        quantity: -quantity,
        reason: 'Order confirmation',
        orderId,
        timestamp: new Date(),
      });

      this.emit('inventory-confirmed', {
        productId,
        quantity,
        orderId,
        warehouse,
      });

      this.logger.info(`Confirmed inventory reduction for ${productId}: ${quantity} units for order ${orderId}`);
      return true;

    } catch (error) {
      this.logger.error(`Failed to confirm inventory reduction for ${productId}:`, error);
      return false;
    }
  }

  private async handleOrderCancelled(order: any): Promise<void> {
    // Release reservations
    for (const item of order.items) {
      await this.releaseReservation(item.productId, item.quantity, order.id, 'Main Store');
    }
  }

  private async handleERPInventoryUpdate(data: any): Promise<void> {
    await this.syncInventoryFromERP();
  }

  async syncInventoryFromERP(): Promise<void> {
    try {
      this.logger.info('Syncing inventory from ERP...');
      
      const products = await this.erpService.syncProducts();
      
      for (const product of products) {
        const inventoryKey = `${product.id}_Main Store`;

        const inventoryItem: InventoryItem = {
          productId: product.id,
          warehouse: 'Main Store',
          quantity: product.stockQuantity,
          reserved: 0, // Default reserved
          available: product.stockQuantity,
          reorderLevel: 10, // Default reorder level
          lastUpdated: new Date(),
        };

        this.inventory.set(inventoryKey, inventoryItem);
      }

      this.logger.info(`Synced inventory for ${products.length} products`);
      this.emit('inventory-synced', Array.from(this.inventory.values()));

    } catch (error) {
      this.logger.error('Failed to sync inventory from ERP:', error);
      throw error;
    }
  }

  async getInventory(productId: string, warehouse = 'Main Store'): Promise<InventoryItem | null> {
    const key = `${productId}_${warehouse}`;
    return this.inventory.get(key) || null;
  }

  async getAllInventory(): Promise<InventoryItem[]> {
    return Array.from(this.inventory.values());
  }

  async reserveInventory(productId: string, quantity: number, orderId: string, warehouse = 'Main Store'): Promise<boolean> {
    try {
      const key = `${productId}_${warehouse}`;
      const item = this.inventory.get(key);

      if (!item) {
        this.logger.error(`Product ${productId} not found in inventory`);
        return false;
      }

      if (item.available < quantity) {
        this.logger.error(`Insufficient inventory for ${productId}. Available: ${item.available}, Requested: ${quantity}`);
        return false;
      }

      // Update inventory
      item.reserved += quantity;
      item.available -= quantity;
      item.lastUpdated = new Date();

      this.inventory.set(key, item);

      // Record movement
      this.recordMovement({
        id: `reserve_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId,
        warehouse,
        type: 'OUT',
        quantity: -quantity,
        reason: 'Order reservation',
        orderId,
        timestamp: new Date(),
      });

      // Sync to ERP
      await this.erpService.updateInventory(productId, warehouse, -quantity);

      this.emit('inventory-reserved', {
        productId,
        quantity,
        orderId,
        warehouse,
      });

      this.logger.info(`Reserved ${quantity} units of ${productId} for order ${orderId}`);
      return true;

    } catch (error) {
      this.logger.error(`Failed to reserve inventory for ${productId}:`, error);
      return false;
    }
  }

  async releaseReservation(productId: string, quantity: number, orderId: string, warehouse = 'Main Store'): Promise<boolean> {
    try {
      const key = `${productId}_${warehouse}`;
      const item = this.inventory.get(key);

      if (!item) {
        this.logger.error(`Product ${productId} not found in inventory`);
        return false;
      }

      // Update inventory
      item.reserved -= quantity;
      item.available += quantity;
      item.lastUpdated = new Date();

      this.inventory.set(key, item);

      // Record movement
      this.recordMovement({
        id: `release_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId,
        warehouse,
        type: 'IN',
        quantity,
        reason: 'Order cancellation/release',
        orderId,
        timestamp: new Date(),
      });

      // Sync to ERP
      await this.erpService.updateInventory(productId, warehouse, quantity);

      this.emit('inventory-released', {
        productId,
        quantity,
        orderId,
        warehouse,
      });

      this.logger.info(`Released ${quantity} units of ${productId} from order ${orderId}`);
      return true;

    } catch (error) {
      this.logger.error(`Failed to release inventory for ${productId}:`, error);
      return false;
    }
  }

  async validateAvailability(items: Array<{ productId: string; quantity: number; warehouse?: string }>): Promise<{
    available: boolean;
    unavailableItems: string[];
  }> {
    const unavailableItems: string[] = [];

    for (const item of items) {
      const warehouse = item.warehouse || 'Main Store';
      const inventory = await this.getInventory(item.productId, warehouse);

      if (!inventory || inventory.available < item.quantity) {
        unavailableItems.push(item.productId);
      }
    }

    return {
      available: unavailableItems.length === 0,
      unavailableItems,
    };
  }

  async adjustInventory(productId: string, quantity: number, reason: string, warehouse = 'Main Store'): Promise<boolean> {
    try {
      const key = `${productId}_${warehouse}`;
      const item = this.inventory.get(key);

      if (!item) {
        this.logger.error(`Product ${productId} not found in inventory`);
        return false;
      }

      // Update inventory
      item.quantity += quantity;
      item.available += quantity;
      item.lastUpdated = new Date();

      this.inventory.set(key, item);

      // Record movement
      this.recordMovement({
        id: `adjust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId,
        warehouse,
        type: quantity > 0 ? 'IN' : 'OUT',
        quantity,
        reason,
        timestamp: new Date(),
      });

      // Sync to ERP
      await this.erpService.updateInventory(productId, warehouse, quantity);

      this.emit('inventory-adjusted', {
        productId,
        quantity,
        reason,
        warehouse,
      });

      this.logger.info(`Adjusted inventory for ${productId}: ${quantity} units (${reason})`);
      return true;

    } catch (error) {
      this.logger.error(`Failed to adjust inventory for ${productId}:`, error);
      return false;
    }
  }

  async getMovementHistory(productId?: string, limit = 100): Promise<InventoryMovement[]> {
    let movements = this.movements;

    if (productId) {
      movements = movements.filter(m => m.productId === productId);
    }

    return movements
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventory.values())
      .filter(item => item.available <= item.reorderLevel);
  }



  private recordMovement(movement: InventoryMovement): void {
    this.movements.push(movement);
    
    // Keep only last 1000 movements to prevent memory issues
    if (this.movements.length > 1000) {
      this.movements = this.movements.slice(-1000);
    }
  }

  async getInventoryReport(): Promise<{
    totalProducts: number;
    totalQuantity: number;
    lowStockItems: number;
    recentMovements: number;
  }> {
    const allInventory = Array.from(this.inventory.values());
    const lowStockItems = await this.getLowStockItems();
    const recentMovements = this.movements.filter(
      m => m.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    return {
      totalProducts: allInventory.length,
      totalQuantity: allInventory.reduce((sum, item) => sum + item.quantity, 0),
      lowStockItems: lowStockItems.length,
      recentMovements: recentMovements.length,
    };
  }
}

export default InventoryManager;
