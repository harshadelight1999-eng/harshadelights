import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';
import { messageBroker, SyncEvent } from './MessageBroker';
import { config } from '../config';
import { ConflictResolver } from './ConflictResolver';

export interface BatchData {
  batchId: string;
  quantity: number;
  expiryDate: Date;
  manufacturingDate: Date;
  qualityStatus: 'good' | 'damaged' | 'expired' | 'quarantine';
  warehouse: string;
  supplier?: string;
  costPrice?: number;
}

export interface InventoryData {
  // Common fields
  id?: string;
  itemCode: string;
  itemName: string;
  warehouse: string;
  actualQty: number;
  reservedQty: number;
  availableQty: number;
  projectedQty: number;

  // ERPNext specific
  erpnext?: {
    stockUom: string;
    valuationRate: number;
    stockValue: number;
    reorderLevel: number;
    reorderQty: number;
    maxLevel: number;
    minLevel: number;
    leadTimeDays: number;
    isStockItem: boolean;
    hasBatchNo: boolean;
    hasSerialNo: boolean;
    hasExpiryDate: boolean;
  };

  // Medusa.js specific
  medusa?: {
    variant_id: string;
    product_id: string;
    title: string;
    sku: string;
    allow_backorder: boolean;
    manage_inventory: boolean;
    hs_code?: string;
    origin_country?: string;
    material?: string;
    weight?: number;
    length?: number;
    height?: number;
    width?: number;
  };

  // Confectionery specific data
  batchNumbers?: BatchData[];
  temperatureRequirement?: string;
  storageConditions?: string[];
  shelfLife?: number; // days
  allergenInfo?: string[];
  nutritionalInfo?: {
    calories: number;
    fat: number;
    carbs: number;
    protein: number;
    sugar: number;
  };

  // Sync metadata
  lastSyncedAt?: Date;
  version?: number;
  conflictResolved?: boolean;
}

export class InventorySyncService {
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
    // Subscribe to inventory sync events
    messageBroker.subscribeTo('inventory-sync', this.processInventorySync.bind(this));
  }

  private async processInventorySync(message: any): Promise<any> {
    const { event }: { event: SyncEvent } = message.payload;

    try {
      logger.info(`Processing inventory sync: ${event.operation} from ${event.source} to ${event.target}`);

      switch (event.operation) {
        case 'create':
          return await this.handleInventoryCreate(event);
        case 'update':
          return await this.handleInventoryUpdate(event);
        case 'delete':
          return await this.handleInventoryDelete(event);
        default:
          throw new Error(`Unknown operation: ${event.operation}`);
      }
    } catch (error) {
      logger.error('Inventory sync processing failed:', error);
      throw error;
    }
  }

  private async handleInventoryCreate(event: SyncEvent): Promise<any> {
    const inventoryData: InventoryData = event.data;

    if (event.target === 'all' || event.target === 'medusa') {
      await this.createInventoryInMedusa(inventoryData);
    }

    return { success: true, message: 'Inventory created successfully' };
  }

  private async handleInventoryUpdate(event: SyncEvent): Promise<any> {
    const inventoryData: InventoryData = event.data;
    const conflicts: any[] = [];

    // Check for conflicts if syncing to multiple targets
    if (event.target === 'all') {
      const medusaInventory = await this.getInventoryFromMedusa(inventoryData.itemCode);

      if (medusaInventory) {
        const conflictResult = await this.conflictResolver.resolveInventoryConflicts(
          inventoryData,
          medusaInventory
        );

        if (conflictResult.hasConflicts) {
          conflicts.push(...conflictResult.conflicts);
          inventoryData.conflictResolved = conflictResult.resolved;
        }
      }
    }

    if (event.target === 'all' || event.target === 'medusa') {
      await this.updateInventoryInMedusa(inventoryData);
    }

    return {
      success: true,
      message: 'Inventory updated successfully',
      conflicts: conflicts.length > 0 ? conflicts : undefined
    };
  }

  private async handleInventoryDelete(event: SyncEvent): Promise<any> {
    const itemCode = event.data.itemCode;

    if (event.target === 'all' || event.target === 'medusa') {
      await this.deleteInventoryInMedusa(itemCode);
    }

    return { success: true, message: 'Inventory deleted successfully' };
  }

  // ERPNext operations
  private async getInventoryFromERPNext(itemCode: string, warehouse?: string): Promise<InventoryData | null> {
    try {
      const filters = warehouse ? `[["item_code", "=", "${itemCode}"], ["warehouse", "=", "${warehouse}"]]` : `[["item_code", "=", "${itemCode}"]]`;

      const response = await this.erpnextClient.get(`/api/resource/Bin?filters=${encodeURIComponent(filters)}&fields=["*"]`);

      if (response.data.data.length === 0) {
        return null;
      }

      const binData = response.data.data[0];

      // Get item details
      const itemResponse = await this.erpnextClient.get(`/api/resource/Item/${itemCode}`);
      const itemData = itemResponse.data.data;

      // Get batch data if applicable
      let batchData: BatchData[] = [];
      if (itemData.has_batch_no) {
        batchData = await this.getBatchDataFromERPNext(itemCode, warehouse);
      }

      return this.mapERPNextToInventoryData(binData, itemData, batchData);
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      logger.error('Failed to get inventory from ERPNext:', error);
      throw error;
    }
  }

  private async getBatchDataFromERPNext(itemCode: string, warehouse?: string): Promise<BatchData[]> {
    try {
      const filters = warehouse
        ? `[["item", "=", "${itemCode}"], ["warehouse", "=", "${warehouse}"], ["qty", ">", 0]]`
        : `[["item", "=", "${itemCode}"], ["qty", ">", 0]]`;

      const response = await this.erpnextClient.get(`/api/resource/Stock Ledger Entry?filters=${encodeURIComponent(filters)}&fields=["batch_no", "qty", "warehouse"]&order_by=posting_date desc`);

      const batches: BatchData[] = [];
      const batchMap = new Map<string, number>();

      // Aggregate quantities by batch
      for (const entry of response.data.data) {
        if (entry.batch_no) {
          const currentQty = batchMap.get(entry.batch_no) || 0;
          batchMap.set(entry.batch_no, currentQty + entry.qty);
        }
      }

      // Get batch details
      for (const [batchNo, qty] of batchMap) {
        if (qty > 0) {
          try {
            const batchResponse = await this.erpnextClient.get(`/api/resource/Batch/${batchNo}`);
            const batchDetails = batchResponse.data.data;

            batches.push({
              batchId: batchNo,
              quantity: qty,
              expiryDate: new Date(batchDetails.expiry_date),
              manufacturingDate: new Date(batchDetails.manufacturing_date || batchDetails.creation),
              qualityStatus: this.mapERPNextBatchStatus(batchDetails.batch_qty, qty),
              warehouse: warehouse || 'Main Store',
              supplier: batchDetails.supplier,
            });
          } catch (batchError) {
            logger.warn(`Failed to get batch details for ${batchNo}:`, batchError);
          }
        }
      }

      return batches;
    } catch (error) {
      logger.error('Failed to get batch data from ERPNext:', error);
      return [];
    }
  }

  private mapERPNextBatchStatus(originalQty: number, currentQty: number): 'good' | 'damaged' | 'expired' | 'quarantine' {
    if (currentQty <= 0) return 'expired';
    if (currentQty < originalQty * 0.9) return 'damaged';
    return 'good';
  }

  // Medusa.js operations
  private async createInventoryInMedusa(inventoryData: InventoryData): Promise<any> {
    try {
      // First, check if product variant exists
      let variantId = inventoryData.medusa?.variant_id;

      if (!variantId) {
        // Create or find the product variant
        variantId = await this.findOrCreateMedusaVariant(inventoryData);
      }

      // Update inventory levels for the variant
      const inventoryResponse = await this.medusaClient.post(`/admin/inventory-items`, {
        sku: inventoryData.itemCode,
        origin_country: inventoryData.medusa?.origin_country,
        hs_code: inventoryData.medusa?.hs_code,
        material: inventoryData.medusa?.material,
        weight: inventoryData.medusa?.weight,
        length: inventoryData.medusa?.length,
        height: inventoryData.medusa?.height,
        width: inventoryData.medusa?.width,
      });

      const inventoryItemId = inventoryResponse.data.inventory_item.id;

      // Link inventory item to location
      await this.medusaClient.post(`/admin/inventory-items/${inventoryItemId}/location-levels`, {
        location_id: await this.getMedusaLocationId(inventoryData.warehouse),
        stocked_quantity: inventoryData.actualQty,
        reserved_quantity: inventoryData.reservedQty,
      });

      logger.info(`Inventory created in Medusa: ${inventoryData.itemCode}`);
      return inventoryResponse.data;
    } catch (error) {
      logger.error('Failed to create inventory in Medusa:', error);
      throw new Error(`Medusa inventory creation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  private async updateInventoryInMedusa(inventoryData: InventoryData): Promise<any> {
    try {
      const inventoryItem = await this.findMedusaInventoryItem(inventoryData.itemCode);

      if (!inventoryItem) {
        // Create if not exists
        return await this.createInventoryInMedusa(inventoryData);
      }

      const locationId = await this.getMedusaLocationId(inventoryData.warehouse);

      // Update stock levels
      await this.medusaClient.post(`/admin/inventory-items/${inventoryItem.id}/location-levels/${locationId}`, {
        stocked_quantity: inventoryData.actualQty,
        reserved_quantity: inventoryData.reservedQty,
      });

      // Update variant availability if low stock
      if (inventoryData.availableQty <= (inventoryData.erpnext?.reorderLevel || 0)) {
        await this.updateMedusaVariantAvailability(inventoryData.itemCode, false);
      } else {
        await this.updateMedusaVariantAvailability(inventoryData.itemCode, true);
      }

      logger.info(`Inventory updated in Medusa: ${inventoryData.itemCode}`);
      return { success: true };
    } catch (error) {
      logger.error('Failed to update inventory in Medusa:', error);
      throw new Error(`Medusa inventory update failed: ${error.response?.data?.message || error.message}`);
    }
  }

  private async deleteInventoryInMedusa(itemCode: string): Promise<void> {
    try {
      const inventoryItem = await this.findMedusaInventoryItem(itemCode);

      if (inventoryItem) {
        await this.medusaClient.delete(`/admin/inventory-items/${inventoryItem.id}`);
        logger.info(`Inventory deleted in Medusa: ${itemCode}`);
      }
    } catch (error) {
      logger.error('Failed to delete inventory in Medusa:', error);
      throw new Error(`Medusa inventory deletion failed: ${error.response?.data?.message || error.message}`);
    }
  }

  private async getInventoryFromMedusa(itemCode: string): Promise<InventoryData | null> {
    try {
      const inventoryItem = await this.findMedusaInventoryItem(itemCode);

      if (!inventoryItem) {
        return null;
      }

      // Get location levels
      const locationsResponse = await this.medusaClient.get(`/admin/inventory-items/${inventoryItem.id}/location-levels`);
      const locationLevels = locationsResponse.data.inventory_item.location_levels;

      // Aggregate quantities across all locations
      let totalStocked = 0;
      let totalReserved = 0;

      for (const level of locationLevels) {
        totalStocked += level.stocked_quantity || 0;
        totalReserved += level.reserved_quantity || 0;
      }

      return this.mapMedusaToInventoryData(inventoryItem, totalStocked, totalReserved);
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      logger.error('Failed to get inventory from Medusa:', error);
      throw error;
    }
  }

  // Helper methods
  private async findOrCreateMedusaVariant(inventoryData: InventoryData): Promise<string> {
    try {
      // First try to find existing variant by SKU
      const variantsResponse = await this.medusaClient.get(`/admin/variants?sku=${inventoryData.itemCode}`);

      if (variantsResponse.data.variants.length > 0) {
        return variantsResponse.data.variants[0].id;
      }

      // Create new product and variant
      const productResponse = await this.medusaClient.post('/admin/products', {
        title: inventoryData.itemName,
        handle: inventoryData.itemCode.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        is_giftcard: false,
        discountable: true,
        options: [{ title: 'Default' }],
        variants: [{
          title: inventoryData.itemName,
          sku: inventoryData.itemCode,
          manage_inventory: inventoryData.medusa?.manage_inventory !== false,
          allow_backorder: inventoryData.medusa?.allow_backorder || false,
          options: [{ value: 'Default' }],
        }],
        status: 'published',
        categories: [{ id: await this.getConfectioneryCategoryId() }],
      });

      return productResponse.data.product.variants[0].id;
    } catch (error) {
      logger.error('Failed to find or create Medusa variant:', error);
      throw error;
    }
  }

  private async findMedusaInventoryItem(sku: string): Promise<any> {
    try {
      const response = await this.medusaClient.get(`/admin/inventory-items?sku=${sku}`);
      return response.data.inventory_items[0] || null;
    } catch (error) {
      logger.error('Failed to find Medusa inventory item:', error);
      return null;
    }
  }

  private async getMedusaLocationId(warehouse: string): Promise<string> {
    try {
      const locationsResponse = await this.medusaClient.get('/admin/stock-locations');
      const locations = locationsResponse.data.stock_locations;

      let location = locations.find(loc => loc.name === warehouse);

      if (!location) {
        // Create new location
        const createResponse = await this.medusaClient.post('/admin/stock-locations', {
          name: warehouse,
          address: {
            company: 'Harsha Delights',
            city: 'Mumbai',
            country_code: 'IN',
          },
        });
        location = createResponse.data.stock_location;
      }

      return location.id;
    } catch (error) {
      logger.error('Failed to get Medusa location ID:', error);
      throw error;
    }
  }

  private async updateMedusaVariantAvailability(sku: string, available: boolean): Promise<void> {
    try {
      const variantsResponse = await this.medusaClient.get(`/admin/variants?sku=${sku}`);

      if (variantsResponse.data.variants.length > 0) {
        const variant = variantsResponse.data.variants[0];

        await this.medusaClient.post(`/admin/products/${variant.product_id}/variants/${variant.id}`, {
          manage_inventory: true,
          allow_backorder: !available,
        });
      }
    } catch (error) {
      logger.error('Failed to update Medusa variant availability:', error);
    }
  }

  private async getConfectioneryCategoryId(): Promise<string> {
    try {
      const categoriesResponse = await this.medusaClient.get('/admin/product-categories?q=confectionery');

      if (categoriesResponse.data.product_categories.length > 0) {
        return categoriesResponse.data.product_categories[0].id;
      }

      // Create confectionery category
      const createResponse = await this.medusaClient.post('/admin/product-categories', {
        name: 'Confectionery',
        handle: 'confectionery',
        is_active: true,
        is_internal: false,
      });

      return createResponse.data.product_category.id;
    } catch (error) {
      logger.error('Failed to get confectionery category:', error);
      return '';
    }
  }

  private mapERPNextToInventoryData(binData: any, itemData: any, batchData: BatchData[]): InventoryData {
    return {
      id: `${itemData.item_code}_${binData.warehouse}`,
      itemCode: itemData.item_code,
      itemName: itemData.item_name,
      warehouse: binData.warehouse,
      actualQty: binData.actual_qty || 0,
      reservedQty: binData.reserved_qty || 0,
      availableQty: (binData.actual_qty || 0) - (binData.reserved_qty || 0),
      projectedQty: binData.projected_qty || 0,
      erpnext: {
        stockUom: itemData.stock_uom,
        valuationRate: binData.valuation_rate || 0,
        stockValue: binData.stock_value || 0,
        reorderLevel: itemData.reorder_level || 0,
        reorderQty: itemData.reorder_qty || 0,
        maxLevel: itemData.max_level || 0,
        minLevel: itemData.min_level || 0,
        leadTimeDays: itemData.lead_time_days || 0,
        isStockItem: itemData.is_stock_item === 1,
        hasBatchNo: itemData.has_batch_no === 1,
        hasSerialNo: itemData.has_serial_no === 1,
        hasExpiryDate: itemData.has_expiry_date === 1,
      },
      batchNumbers: batchData,
      shelfLife: itemData.shelf_life_in_days,
      allergenInfo: itemData.allergen_info ? itemData.allergen_info.split(',') : [],
      temperatureRequirement: itemData.temperature_requirement,
      storageConditions: itemData.storage_conditions ? itemData.storage_conditions.split(',') : [],
      lastSyncedAt: new Date(),
      version: 1,
    };
  }

  private mapMedusaToInventoryData(inventoryItem: any, stockedQty: number, reservedQty: number): InventoryData {
    return {
      id: inventoryItem.id,
      itemCode: inventoryItem.sku,
      itemName: inventoryItem.title || inventoryItem.sku,
      warehouse: 'Main Store', // Default warehouse
      actualQty: stockedQty,
      reservedQty: reservedQty,
      availableQty: stockedQty - reservedQty,
      projectedQty: stockedQty - reservedQty,
      medusa: {
        variant_id: inventoryItem.variant?.id,
        product_id: inventoryItem.variant?.product_id,
        title: inventoryItem.title,
        sku: inventoryItem.sku,
        allow_backorder: inventoryItem.variant?.allow_backorder || false,
        manage_inventory: inventoryItem.variant?.manage_inventory !== false,
        hs_code: inventoryItem.hs_code,
        origin_country: inventoryItem.origin_country,
        material: inventoryItem.material,
        weight: inventoryItem.weight,
        length: inventoryItem.length,
        height: inventoryItem.height,
        width: inventoryItem.width,
      },
      lastSyncedAt: new Date(),
      version: 1,
    };
  }

  // Public API methods
  public async syncInventory(inventoryData: InventoryData, source: 'erpnext' | 'medusa', target: 'erpnext' | 'medusa' | 'all'): Promise<string> {
    const event: SyncEvent = {
      entityType: 'inventory',
      operation: inventoryData.id ? 'update' : 'create',
      source,
      target,
      data: inventoryData,
      metadata: {
        timestamp: new Date().toISOString(),
        correlationId: `inventory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
    };

    return await messageBroker.publishSyncEvent(event);
  }

  public async syncAllInventory(warehouse?: string): Promise<void> {
    logger.info(`Starting full inventory sync for warehouse: ${warehouse || 'all'}`);

    try {
      const inventoryItems = await this.getAllInventoryFromERPNext(warehouse);

      const events: SyncEvent[] = inventoryItems.map(item => ({
        entityType: 'inventory',
        operation: 'update',
        source: 'erpnext',
        target: 'medusa',
        data: item,
        metadata: {
          timestamp: new Date().toISOString(),
          correlationId: `bulk_inventory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
      }));

      await messageBroker.publishBatch(events);
      logger.info(`Queued ${inventoryItems.length} inventory items for sync`);
    } catch (error) {
      logger.error('Full inventory sync failed:', error);
      throw error;
    }
  }

  private async getAllInventoryFromERPNext(warehouse?: string): Promise<InventoryData[]> {
    try {
      const filters = warehouse ? `[["warehouse", "=", "${warehouse}"], ["actual_qty", ">", 0]]` : `[["actual_qty", ">", 0]]`;

      const response = await this.erpnextClient.get(`/api/resource/Bin?filters=${encodeURIComponent(filters)}&fields=["*"]&limit_page_length=1000`);

      const inventoryPromises = response.data.data.map(async (binData) => {
        try {
          const itemResponse = await this.erpnextClient.get(`/api/resource/Item/${binData.item_code}`);
          const itemData = itemResponse.data.data;

          let batchData: BatchData[] = [];
          if (itemData.has_batch_no) {
            batchData = await this.getBatchDataFromERPNext(binData.item_code, binData.warehouse);
          }

          return this.mapERPNextToInventoryData(binData, itemData, batchData);
        } catch (error) {
          logger.error(`Failed to get item data for ${binData.item_code}:`, error);
          return null;
        }
      });

      const inventoryItems = await Promise.all(inventoryPromises);
      return inventoryItems.filter(Boolean);
    } catch (error) {
      logger.error('Failed to get all inventory from ERPNext:', error);
      throw error;
    }
  }

  public async syncLowStockItems(): Promise<void> {
    logger.info('Syncing low stock items');

    try {
      const response = await this.erpnextClient.get('/api/resource/Bin?filters=[["actual_qty", "<=", "reorder_level"]]&fields=["*"]');

      for (const binData of response.data.data) {
        const inventoryData = await this.getInventoryFromERPNext(binData.item_code, binData.warehouse);

        if (inventoryData) {
          await this.syncInventory(inventoryData, 'erpnext', 'medusa');

          // Also update availability in Medusa
          await this.updateMedusaVariantAvailability(inventoryData.itemCode, false);
        }
      }

      logger.info(`Synced ${response.data.data.length} low stock items`);
    } catch (error) {
      logger.error('Low stock sync failed:', error);
      throw error;
    }
  }

  public async syncExpiringBatches(daysThreshold: number = 30): Promise<void> {
    logger.info(`Syncing batches expiring within ${daysThreshold} days`);

    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + daysThreshold);

      const response = await this.erpnextClient.get(`/api/resource/Batch?filters=[["expiry_date", "<=", "${expiryDate.toISOString().split('T')[0]}"]]&fields=["*"]`);

      const uniqueItems = new Set();

      for (const batch of response.data.data) {
        if (!uniqueItems.has(batch.item)) {
          uniqueItems.add(batch.item);

          const inventoryData = await this.getInventoryFromERPNext(batch.item);

          if (inventoryData) {
            await this.syncInventory(inventoryData, 'erpnext', 'medusa');
          }
        }
      }

      logger.info(`Synced ${uniqueItems.size} items with expiring batches`);
    } catch (error) {
      logger.error('Expiring batches sync failed:', error);
      throw error;
    }
  }
}

export const inventorySyncService = new InventorySyncService();