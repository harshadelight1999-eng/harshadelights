import axios, { AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import { syncLogger } from '../utils/logger';
import redisManager from '../utils/redis';
import {
  SyncEvent,
  SyncEventType,
  SystemType,
  SyncStatus
} from '../types';

interface PriceData {
  item_code: string;
  item_name: string;
  price_list: string;
  price: number;
  currency: string;
  valid_from: Date;
  valid_upto?: Date;
  min_qty: number;
  customer_group?: string;
  territory?: string;
  discount_percentage?: number;
  source_system: SystemType;
  last_updated: Date;
}

interface PricingRule {
  item_code: string;
  customer_group?: string;
  territory?: string;
  min_qty: number;
  max_qty?: number;
  rate_or_discount: 'Rate' | 'Discount Percentage';
  rate?: number;
  discount_percentage?: number;
  valid_from: Date;
  valid_upto?: Date;
  priority: number;
}

export class PricingSyncService {
  private erpnextBaseUrl: string;
  private medusaBaseUrl: string;
  private espocrmBaseUrl: string;
  private erpnextHeaders: Record<string, string>;
  private medusaHeaders: Record<string, string>;
  private espocrmHeaders: Record<string, string>;
  private medusaAdminToken: string | null = null;

  constructor() {
    this.erpnextBaseUrl = config.systems.erpnext.url;
    this.medusaBaseUrl = config.systems.medusa.url;
    this.espocrmBaseUrl = config.systems.espocrm.url;

    this.erpnextHeaders = {
      'Authorization': `token ${config.systems.erpnext.apiKey}:${config.systems.erpnext.apiSecret}`,
      'Content-Type': 'application/json'
    };

    this.medusaHeaders = {
      'Content-Type': 'application/json'
    };

    this.espocrmHeaders = {
      'X-Api-Key': config.systems.espocrm.apiKey,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Initialize Medusa authentication
   */
  private async initializeMedusaAuth(): Promise<void> {
    if (this.medusaAdminToken) {
      return; // Already authenticated
    }

    try {
      const response = await axios.post(
        `${this.medusaBaseUrl}/admin/auth`,
        {
          email: config.systems.medusa.username,
          password: config.systems.medusa.password
        },
        {
          headers: this.medusaHeaders,
          timeout: config.systems.medusa.timeout
        }
      );

      if (response.status === 200 && response.data.user) {
        this.medusaAdminToken = response.headers['set-cookie']?.[0] || '';
        this.medusaHeaders['Cookie'] = this.medusaAdminToken;
        syncLogger.info('Medusa authentication successful for pricing sync');
      } else {
        throw new Error('Failed to authenticate with Medusa for pricing sync');
      }
    } catch (error) {
      syncLogger.error('Failed to authenticate with Medusa for pricing sync', error as Error);
      throw error;
    }
  }

  /**
   * Sync pricing data from ERPNext to all systems
   */
  async syncPricingFromERPNext(itemCode: string, priceListName: string = 'Standard Selling'): Promise<void> {
    const startTime = Date.now();
    const lockId = uuidv4();
    const lockResource = `pricing:${itemCode}:${priceListName}`;

    try {
      // Acquire lock to prevent concurrent syncs
      const lockAcquired = await redisManager.setSyncLock(lockResource, lockId, 300);
      if (!lockAcquired) {
        syncLogger.warn(`Pricing sync already in progress for: ${itemCode}`);
        return;
      }

      await this.initializeMedusaAuth();
      syncLogger.priceSync('started', itemCode, 'erpnext', 'all-systems', { priceList: priceListName });

      // Fetch pricing data from ERPNext
      const priceData = await this.fetchPriceFromERPNext(itemCode, priceListName);
      if (!priceData) {
        throw new Error(`Price not found in ERPNext for item: ${itemCode}, price list: ${priceListName}`);
      }

      // Fetch pricing rules
      const pricingRules = await this.fetchPricingRulesFromERPNext(itemCode);

      // Sync to Medusa.js
      await this.syncPriceToMedusa(priceData, pricingRules);

      // Sync to EspoCRM (for sales team reference)
      await this.syncPriceToEspoCRM(priceData);

      // Cache the pricing data
      await this.cachePricingData(itemCode, priceListName, priceData, pricingRules);

      // Check for price changes and alert if significant
      await this.checkPriceChangeAlerts(priceData);

      // Publish pricing update event
      await this.publishSyncEvent(SyncEventType.PRICE_UPDATE, {
        itemCode,
        priceList: priceListName,
        price: priceData.price,
        currency: priceData.currency,
        source: SystemType.ERPNEXT,
        targets: [SystemType.MEDUSA, SystemType.ESPOCRM]
      });

      const duration = Date.now() - startTime;
      syncLogger.performance('pricing-sync-erpnext-to-all', duration, { itemCode, priceList: priceListName });

    } catch (error) {
      syncLogger.error(`Failed to sync pricing for ${itemCode}`, error as Error, { itemCode, priceListName });
      throw error;
    } finally {
      // Always release the lock
      await redisManager.releaseSyncLock(lockResource, lockId);
    }
  }

  /**
   * Batch sync pricing for multiple items
   */
  async batchSyncPricing(itemCodes: string[], priceListName: string = 'Standard Selling'): Promise<{ success: string[]; failed: string[] }> {
    const results = { success: [], failed: [] };
    const batchSize = config.sync.batchSize;

    syncLogger.info(`Starting batch pricing sync for ${itemCodes.length} items`, { priceList: priceListName });

    // Process items in batches
    for (let i = 0; i < itemCodes.length; i += batchSize) {
      const batch = itemCodes.slice(i, i + batchSize);

      const batchPromises = batch.map(async (itemCode) => {
        try {
          await this.syncPricingFromERPNext(itemCode, priceListName);
          results.success.push(itemCode);
          return { itemCode, status: 'success' };
        } catch (error) {
          results.failed.push(itemCode);
          syncLogger.error(`Batch pricing sync failed for item: ${itemCode}`, error as Error);
          return { itemCode, status: 'failed', error: (error as Error).message };
        }
      });

      // Wait for current batch to complete
      await Promise.allSettled(batchPromises);

      // Small delay between batches
      if (i + batchSize < itemCodes.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    syncLogger.info(`Batch pricing sync completed`, {
      total: itemCodes.length,
      success: results.success.length,
      failed: results.failed.length
    });

    return results;
  }

  /**
   * Sync specific price change (for real-time updates)
   */
  async syncPriceChange(itemCode: string, newPrice: number, priceListName: string = 'Standard Selling'): Promise<void> {
    const startTime = Date.now();

    try {
      syncLogger.priceSync('price-change', itemCode, 'erpnext', 'all-systems', {
        newPrice,
        priceList: priceListName
      });

      // Get cached price data
      const cachedPrice = await this.getCachedPricingData(itemCode, priceListName);

      // Check if price actually changed
      if (cachedPrice && Math.abs(cachedPrice.price - newPrice) < 0.01) {
        syncLogger.debug(`Price unchanged for ${itemCode}, skipping sync`);
        return;
      }

      // Perform full sync for the changed price
      await this.syncPricingFromERPNext(itemCode, priceListName);

      const duration = Date.now() - startTime;
      syncLogger.performance('price-change-sync', duration, { itemCode, newPrice });

    } catch (error) {
      syncLogger.error(`Failed to sync price change for ${itemCode}`, error as Error, { itemCode, newPrice });
      throw error;
    }
  }

  /**
   * Fetch price from ERPNext
   */
  private async fetchPriceFromERPNext(itemCode: string, priceListName: string): Promise<PriceData | null> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.erpnextBaseUrl}/api/resource/Item Price`,
        {
          headers: this.erpnextHeaders,
          params: {
            filters: JSON.stringify([
              ['item_code', '=', itemCode],
              ['price_list', '=', priceListName]
            ]),
            fields: JSON.stringify([
              'item_code', 'item_name', 'price_list', 'price_list_rate',
              'currency', 'valid_from', 'valid_upto', 'min_qty',
              'customer_group', 'territory', 'modified'
            ]),
            limit: 1
          },
          timeout: config.systems.erpnext.timeout
        }
      );

      if (response.status === 200 && response.data.data && response.data.data.length > 0) {
        const priceItem = response.data.data[0];

        return {
          item_code: priceItem.item_code,
          item_name: priceItem.item_name || itemCode,
          price_list: priceItem.price_list,
          price: priceItem.price_list_rate || 0,
          currency: priceItem.currency || 'INR',
          valid_from: new Date(priceItem.valid_from || Date.now()),
          valid_upto: priceItem.valid_upto ? new Date(priceItem.valid_upto) : undefined,
          min_qty: priceItem.min_qty || 1,
          customer_group: priceItem.customer_group,
          territory: priceItem.territory,
          source_system: SystemType.ERPNEXT,
          last_updated: new Date(priceItem.modified)
        };
      }

      return null;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      syncLogger.error(`Failed to fetch price from ERPNext: ${itemCode}`, error as Error);
      throw error;
    }
  }

  /**
   * Fetch pricing rules from ERPNext
   */
  private async fetchPricingRulesFromERPNext(itemCode: string): Promise<PricingRule[]> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.erpnextBaseUrl}/api/resource/Pricing Rule`,
        {
          headers: this.erpnextHeaders,
          params: {
            filters: JSON.stringify([
              ['item_code', '=', itemCode],
              ['disable', '=', 0]
            ]),
            fields: JSON.stringify([
              'item_code', 'customer_group', 'territory', 'min_qty', 'max_qty',
              'rate_or_discount', 'rate', 'discount_percentage',
              'valid_from', 'valid_upto', 'priority'
            ])
          },
          timeout: config.systems.erpnext.timeout
        }
      );

      if (response.status === 200 && response.data.data) {
        return response.data.data.map((rule: any) => ({
          item_code: rule.item_code,
          customer_group: rule.customer_group,
          territory: rule.territory,
          min_qty: rule.min_qty || 1,
          max_qty: rule.max_qty,
          rate_or_discount: rule.rate_or_discount as 'Rate' | 'Discount Percentage',
          rate: rule.rate,
          discount_percentage: rule.discount_percentage,
          valid_from: new Date(rule.valid_from),
          valid_upto: rule.valid_upto ? new Date(rule.valid_upto) : undefined,
          priority: rule.priority || 1
        }));
      }

      return [];
    } catch (error) {
      syncLogger.error(`Failed to fetch pricing rules from ERPNext: ${itemCode}`, error as Error);
      return [];
    }
  }

  /**
   * Sync price to Medusa.js
   */
  private async syncPriceToMedusa(priceData: PriceData, pricingRules: PricingRule[]): Promise<void> {
    try {
      // Find product in Medusa
      const medusaProduct = await this.findProductInMedusa(priceData.item_code);
      if (!medusaProduct) {
        syncLogger.warn(`Product not found in Medusa for price sync: ${priceData.item_code}`);
        return;
      }

      // Update variants prices
      for (const variant of medusaProduct.variants || []) {
        await this.updateVariantPriceInMedusa(variant.id, priceData, pricingRules);
      }

      syncLogger.priceSync('updated', priceData.item_code, 'erpnext', 'medusa', {
        medusaProductId: medusaProduct.id,
        price: priceData.price
      });

    } catch (error) {
      syncLogger.error(`Failed to sync price to Medusa: ${priceData.item_code}`, error as Error);
      throw error;
    }
  }

  /**
   * Update variant price in Medusa
   */
  private async updateVariantPriceInMedusa(variantId: string, priceData: PriceData, pricingRules: PricingRule[]): Promise<void> {
    try {
      // Base price
      const basePriceAmount = Math.round(priceData.price * 100); // Convert to cents

      // Calculate tiered pricing based on pricing rules
      const tieredPrices = this.calculateTieredPricing(priceData, pricingRules);

      // Update variant prices
      const priceUpdateData = {
        prices: [
          {
            currency_code: priceData.currency.toLowerCase(),
            amount: basePriceAmount,
            min_quantity: priceData.min_qty
          },
          ...tieredPrices.map(tier => ({
            currency_code: priceData.currency.toLowerCase(),
            amount: Math.round(tier.price * 100),
            min_quantity: tier.min_qty
          }))
        ]
      };

      await axios.post(
        `${this.medusaBaseUrl}/admin/variants/${variantId}`,
        priceUpdateData,
        {
          headers: this.medusaHeaders,
          timeout: config.systems.medusa.timeout
        }
      );

    } catch (error) {
      syncLogger.error(`Failed to update variant price in Medusa: ${variantId}`, error as Error);
      throw error;
    }
  }

  /**
   * Calculate tiered pricing
   */
  private calculateTieredPricing(priceData: PriceData, pricingRules: PricingRule[]): Array<{ price: number; min_qty: number }> {
    const tiers: Array<{ price: number; min_qty: number }> = [];

    // Sort rules by min_qty and priority
    const sortedRules = pricingRules
      .filter(rule => rule.valid_from <= new Date() && (!rule.valid_upto || rule.valid_upto >= new Date()))
      .sort((a, b) => {
        if (a.min_qty !== b.min_qty) return a.min_qty - b.min_qty;
        return b.priority - a.priority; // Higher priority first
      });

    for (const rule of sortedRules) {
      let tierPrice = priceData.price;

      if (rule.rate_or_discount === 'Rate' && rule.rate) {
        tierPrice = rule.rate;
      } else if (rule.rate_or_discount === 'Discount Percentage' && rule.discount_percentage) {
        tierPrice = priceData.price * (1 - rule.discount_percentage / 100);
      }

      // Only add if it's different from base price and provides a benefit
      if (Math.abs(tierPrice - priceData.price) > 0.01 && tierPrice < priceData.price) {
        tiers.push({
          price: tierPrice,
          min_qty: rule.min_qty
        });
      }
    }

    return tiers;
  }

  /**
   * Sync price to EspoCRM
   */
  private async syncPriceToEspoCRM(priceData: PriceData): Promise<void> {
    try {
      // Find product in EspoCRM
      const espocrmProduct = await this.findProductInEspoCRM(priceData.item_code);
      if (!espocrmProduct) {
        syncLogger.warn(`Product not found in EspoCRM for price sync: ${priceData.item_code}`);
        return;
      }

      // Update product price in EspoCRM
      const updateData = {
        unitPrice: priceData.price,
        priceCurrency: priceData.currency,
        priceList: priceData.price_list,
        lastPriceUpdate: new Date().toISOString()
      };

      await axios.put(
        `${this.espocrmBaseUrl}/api/v1/Product/${espocrmProduct.id}`,
        updateData,
        {
          headers: this.espocrmHeaders,
          timeout: config.systems.espocrm.timeout
        }
      );

      syncLogger.priceSync('updated', priceData.item_code, 'erpnext', 'espocrm', {
        espocrmProductId: espocrmProduct.id,
        price: priceData.price
      });

    } catch (error) {
      syncLogger.error(`Failed to sync price to EspoCRM: ${priceData.item_code}`, error as Error);
      throw error;
    }
  }

  /**
   * Find product in Medusa
   */
  private async findProductInMedusa(itemCode: string): Promise<any | null> {
    try {
      const handle = this.generateMedusaHandle(itemCode);

      const response: AxiosResponse = await axios.get(
        `${this.medusaBaseUrl}/admin/products`,
        {
          headers: this.medusaHeaders,
          params: {
            handle,
            limit: 1
          },
          timeout: config.systems.medusa.timeout
        }
      );

      if (response.status === 200 && response.data.products && response.data.products.length > 0) {
        return response.data.products[0];
      }

      // Fallback: search by metadata
      const metadataResponse = await axios.get(
        `${this.medusaBaseUrl}/admin/products`,
        {
          headers: this.medusaHeaders,
          params: {
            limit: 100
          },
          timeout: config.systems.medusa.timeout
        }
      );

      if (metadataResponse.status === 200 && metadataResponse.data.products) {
        const foundProduct = metadataResponse.data.products.find((product: any) =>
          product.metadata?.erpnext_item_code === itemCode
        );
        return foundProduct || null;
      }

      return null;
    } catch (error) {
      syncLogger.error(`Failed to find product in Medusa: ${itemCode}`, error as Error);
      return null;
    }
  }

  /**
   * Find product in EspoCRM
   */
  private async findProductInEspoCRM(itemCode: string): Promise<any | null> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.espocrmBaseUrl}/api/v1/Product`,
        {
          headers: this.espocrmHeaders,
          params: {
            where: JSON.stringify([{
              type: 'equals',
              attribute: 'sku',
              value: itemCode
            }]),
            maxSize: 1
          },
          timeout: config.systems.espocrm.timeout
        }
      );

      if (response.status === 200 && response.data.list && response.data.list.length > 0) {
        return response.data.list[0];
      }

      return null;
    } catch (error) {
      syncLogger.error(`Failed to find product in EspoCRM: ${itemCode}`, error as Error);
      return null;
    }
  }

  /**
   * Generate Medusa handle from item code
   */
  private generateMedusaHandle(itemCode: string): string {
    return itemCode.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Cache pricing data
   */
  private async cachePricingData(itemCode: string, priceListName: string, priceData: PriceData, pricingRules: PricingRule[]): Promise<void> {
    try {
      const cacheKey = `pricing:${itemCode}:${priceListName}`;
      const cacheData = {
        priceData,
        pricingRules,
        cachedAt: new Date().toISOString()
      };

      await redisManager.set(cacheKey, JSON.stringify(cacheData), 3600); // Cache for 1 hour

      // Also cache by item code only for quick lookups
      const itemCacheKey = `pricing:${itemCode}`;
      await redisManager.set(itemCacheKey, JSON.stringify(cacheData), 3600);

    } catch (error) {
      syncLogger.error('Failed to cache pricing data', error as Error, { itemCode, priceListName });
    }
  }

  /**
   * Get cached pricing data
   */
  private async getCachedPricingData(itemCode: string, priceListName: string): Promise<PriceData | null> {
    try {
      const cacheKey = `pricing:${itemCode}:${priceListName}`;
      const cachedData = await redisManager.get(cacheKey);

      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        return parsed.priceData;
      }

      return null;
    } catch (error) {
      syncLogger.error('Failed to get cached pricing data', error as Error, { itemCode, priceListName });
      return null;
    }
  }

  /**
   * Check for significant price changes and send alerts
   */
  private async checkPriceChangeAlerts(priceData: PriceData): Promise<void> {
    try {
      const cachedPrice = await this.getCachedPricingData(priceData.item_code, priceData.price_list);

      if (cachedPrice) {
        const priceChangePercentage = Math.abs(priceData.price - cachedPrice.price) / cachedPrice.price * 100;

        // Alert if price change is more than 10%
        if (priceChangePercentage > 10) {
          await this.publishSyncEvent(SyncEventType.PRICE_UPDATE, {
            itemCode: priceData.item_code,
            itemName: priceData.item_name,
            oldPrice: cachedPrice.price,
            newPrice: priceData.price,
            changePercentage: priceChangePercentage,
            priceList: priceData.price_list,
            alertType: 'significant_price_change',
            severity: priceChangePercentage > 25 ? 'high' : 'medium'
          });

          syncLogger.warn(`Significant price change detected for ${priceData.item_code}`, {
            itemCode: priceData.item_code,
            oldPrice: cachedPrice.price,
            newPrice: priceData.price,
            changePercentage: priceChangePercentage
          });
        }
      }
    } catch (error) {
      syncLogger.error('Failed to check price change alerts', error as Error, { itemCode: priceData.item_code });
    }
  }

  /**
   * Publish sync event
   */
  private async publishSyncEvent(eventType: SyncEventType, data: any): Promise<void> {
    try {
      const event: SyncEvent = {
        id: uuidv4(),
        type: eventType,
        source: data.source || SystemType.ERPNEXT,
        target: data.targets || [SystemType.MEDUSA, SystemType.ESPOCRM],
        data,
        timestamp: new Date(),
        retry_count: 0,
        status: SyncStatus.COMPLETED
      };

      await redisManager.publish('sync:events', JSON.stringify(event));
      syncLogger.info(`Published sync event: ${eventType}`, { event });
    } catch (error) {
      syncLogger.error('Failed to publish sync event', error as Error, { eventType, data });
    }
  }

  /**
   * Get pricing sync status
   */
  async getPricingSyncStatus(itemCode: string, priceListName: string = 'Standard Selling'): Promise<any> {
    try {
      const cachedData = await this.getCachedPricingData(itemCode, priceListName);

      return {
        item_code: itemCode,
        price_list: priceListName,
        current_price: cachedData?.price || null,
        currency: cachedData?.currency || null,
        last_sync: cachedData?.last_updated || null,
        sync_status: cachedData ? 'synced' : 'not_synced',
        valid_from: cachedData?.valid_from || null,
        valid_upto: cachedData?.valid_upto || null
      };
    } catch (error) {
      syncLogger.error(`Failed to get pricing sync status: ${itemCode}`, error as Error);
      throw error;
    }
  }

  /**
   * Sync all active price lists for an item
   */
  async syncAllPriceListsForItem(itemCode: string): Promise<void> {
    try {
      // Get all active price lists from ERPNext
      const response = await axios.get(
        `${this.erpnextBaseUrl}/api/resource/Price List`,
        {
          headers: this.erpnextHeaders,
          params: {
            filters: JSON.stringify([['enabled', '=', 1]]),
            fields: JSON.stringify(['name'])
          },
          timeout: config.systems.erpnext.timeout
        }
      );

      if (response.status === 200 && response.data.data) {
        const priceLists = response.data.data.map((pl: any) => pl.name);

        for (const priceList of priceLists) {
          try {
            await this.syncPricingFromERPNext(itemCode, priceList);
          } catch (error) {
            syncLogger.error(`Failed to sync price list ${priceList} for item ${itemCode}`, error as Error);
          }
        }
      }
    } catch (error) {
      syncLogger.error(`Failed to sync all price lists for item: ${itemCode}`, error as Error);
      throw error;
    }
  }

  /**
   * Health check for external systems
   */
  async healthCheck(): Promise<{ erpnext: boolean; medusa: boolean; espocrm: boolean }> {
    const checks = await Promise.allSettled([
      this.checkERPNextHealth(),
      this.checkMedusaHealth(),
      this.checkEspoCRMHealth()
    ]);

    return {
      erpnext: checks[0].status === 'fulfilled' && checks[0].value,
      medusa: checks[1].status === 'fulfilled' && checks[1].value,
      espocrm: checks[2].status === 'fulfilled' && checks[2].value
    };
  }

  private async checkERPNextHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.erpnextBaseUrl}/api/method/ping`, {
        headers: this.erpnextHeaders,
        timeout: 5000
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  private async checkMedusaHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.medusaBaseUrl}/health`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  private async checkEspoCRMHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.espocrmBaseUrl}/api/v1/App/user`, {
        headers: this.espocrmHeaders,
        timeout: 5000
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}