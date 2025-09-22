import { logger } from '../utils/logger';
import { CustomerData } from './CustomerSyncService';
import { InventoryData } from './InventorySyncService';
import { OrderData } from './OrderSyncService';
import { PricingData } from './PricingSyncService';

export interface ConflictResolution {
  hasConflicts: boolean;
  resolved: boolean;
  conflicts: ConflictDetail[];
  resolvedData?: any;
}

export interface ConflictDetail {
  field: string;
  sourceValue: any;
  targetValue: any;
  currentValue: any;
  resolution: 'source' | 'target' | 'merge' | 'manual';
  reason: string;
}

export class ConflictResolver {
  private resolutionStrategies: Map<string, Function> = new Map();

  constructor() {
    this.initializeStrategies();
  }

  private initializeStrategies() {
    // Customer conflict resolution strategies
    this.resolutionStrategies.set('customer_email', this.resolveByLatestTimestamp);
    this.resolutionStrategies.set('customer_phone', this.resolveByLatestTimestamp);
    this.resolutionStrategies.set('customer_address', this.resolveByLatestTimestamp);
    this.resolutionStrategies.set('customer_credit_limit', this.resolveByHigherValue);
    this.resolutionStrategies.set('customer_payment_terms', this.resolveBySource);

    // Inventory conflict resolution strategies
    this.resolutionStrategies.set('inventory_quantity', this.resolveByERPNextSource);
    this.resolutionStrategies.set('inventory_reserved', this.resolveBySum);
    this.resolutionStrategies.set('inventory_expiry_date', this.resolveByEarlierDate);
    this.resolutionStrategies.set('inventory_batch_number', this.resolveBySource);

    // Order conflict resolution strategies
    this.resolutionStrategies.set('order_status', this.resolveByOrderStatusPriority);
    this.resolutionStrategies.set('order_amount', this.resolveByHigherValue);
    this.resolutionStrategies.set('order_delivery_date', this.resolveByLatestTimestamp);

    // Pricing conflict resolution strategies
    this.resolutionStrategies.set('price_amount', this.resolveByLatestTimestamp);
    this.resolutionStrategies.set('price_currency', this.resolveBySource);
    this.resolutionStrategies.set('price_valid_from', this.resolveByEarlierDate);
    this.resolutionStrategies.set('price_valid_to', this.resolveByLaterDate);
  }

  public async resolveCustomerConflicts(
    sourceData: CustomerData,
    targetData1: CustomerData | null,
    targetData2: CustomerData | null
  ): Promise<ConflictResolution> {
    const conflicts: ConflictDetail[] = [];
    let resolvedData = { ...sourceData };

    if (!targetData1 && !targetData2) {
      return { hasConflicts: false, resolved: true, conflicts: [], resolvedData };
    }

    const targets = [targetData1, targetData2].filter(Boolean) as CustomerData[];

    // Check email conflicts
    const emailConflicts = this.checkFieldConflicts('email', sourceData.email, targets.map(t => t.email));
    if (emailConflicts.length > 0) {
      const resolution = await this.resolveFieldConflict('customer_email', sourceData.email, emailConflicts);
      conflicts.push({
        field: 'email',
        sourceValue: sourceData.email,
        targetValue: emailConflicts,
        currentValue: resolution.resolvedValue,
        resolution: resolution.strategy,
        reason: resolution.reason
      });
      resolvedData.email = resolution.resolvedValue;
    }

    // Check phone conflicts
    const phoneConflicts = this.checkFieldConflicts('phone', sourceData.phone, targets.map(t => t.phone));
    if (phoneConflicts.length > 0) {
      const resolution = await this.resolveFieldConflict('customer_phone', sourceData.phone, phoneConflicts);
      conflicts.push({
        field: 'phone',
        sourceValue: sourceData.phone,
        targetValue: phoneConflicts,
        currentValue: resolution.resolvedValue,
        resolution: resolution.strategy,
        reason: resolution.reason
      });
      resolvedData.phone = resolution.resolvedValue;
    }

    // Check credit limit conflicts (ERPNext specific)
    if (sourceData.erpnext && targets.some(t => t.erpnext)) {
      const creditLimits = targets
        .filter(t => t.erpnext)
        .map(t => t.erpnext!.credit_limit);

      const creditConflicts = this.checkFieldConflicts('credit_limit', sourceData.erpnext.credit_limit, creditLimits);
      if (creditConflicts.length > 0) {
        const resolution = await this.resolveFieldConflict('customer_credit_limit', sourceData.erpnext.credit_limit, creditConflicts);
        conflicts.push({
          field: 'credit_limit',
          sourceValue: sourceData.erpnext.credit_limit,
          targetValue: creditConflicts,
          currentValue: resolution.resolvedValue,
          resolution: resolution.strategy,
          reason: resolution.reason
        });
        resolvedData.erpnext!.credit_limit = resolution.resolvedValue;
      }
    }

    const hasConflicts = conflicts.length > 0;
    const resolved = conflicts.every(c => c.resolution !== 'manual');

    return {
      hasConflicts,
      resolved,
      conflicts,
      resolvedData: resolved ? resolvedData : undefined
    };
  }

  public async resolveInventoryConflicts(
    sourceData: InventoryData,
    targetData: InventoryData | null
  ): Promise<ConflictResolution> {
    const conflicts: ConflictDetail[] = [];
    let resolvedData = { ...sourceData };

    if (!targetData) {
      return { hasConflicts: false, resolved: true, conflicts: [], resolvedData };
    }

    // Check quantity conflicts
    if (sourceData.actualQty !== targetData.actualQty) {
      const resolution = await this.resolveFieldConflict(
        'inventory_quantity',
        sourceData.actualQty,
        [targetData.actualQty]
      );
      conflicts.push({
        field: 'actualQty',
        sourceValue: sourceData.actualQty,
        targetValue: targetData.actualQty,
        currentValue: resolution.resolvedValue,
        resolution: resolution.strategy,
        reason: resolution.reason
      });
      resolvedData.actualQty = resolution.resolvedValue;
    }

    // Check reserved quantity conflicts
    if (sourceData.reservedQty !== targetData.reservedQty) {
      const resolution = await this.resolveFieldConflict(
        'inventory_reserved',
        sourceData.reservedQty,
        [targetData.reservedQty]
      );
      conflicts.push({
        field: 'reservedQty',
        sourceValue: sourceData.reservedQty,
        targetValue: targetData.reservedQty,
        currentValue: resolution.resolvedValue,
        resolution: resolution.strategy,
        reason: resolution.reason
      });
      resolvedData.reservedQty = resolution.resolvedValue;
    }

    // Check batch conflicts for confectionery products
    if (sourceData.batchNumbers && targetData.batchNumbers) {
      const batchConflicts = this.compareBatchData(sourceData.batchNumbers, targetData.batchNumbers);
      if (batchConflicts.length > 0) {
        // Merge batch data instead of replacing
        resolvedData.batchNumbers = this.mergeBatchData(sourceData.batchNumbers, targetData.batchNumbers);
        conflicts.push({
          field: 'batchNumbers',
          sourceValue: sourceData.batchNumbers,
          targetValue: targetData.batchNumbers,
          currentValue: resolvedData.batchNumbers,
          resolution: 'merge',
          reason: 'Merged batch data to preserve all batch information'
        });
      }
    }

    const hasConflicts = conflicts.length > 0;
    const resolved = conflicts.every(c => c.resolution !== 'manual');

    return {
      hasConflicts,
      resolved,
      conflicts,
      resolvedData: resolved ? resolvedData : undefined
    };
  }

  private checkFieldConflicts(field: string, sourceValue: any, targetValues: any[]): any[] {
    const uniqueTargets = targetValues.filter((value, index, arr) =>
      value !== undefined && value !== null && arr.indexOf(value) === index
    );

    return uniqueTargets.filter(value => value !== sourceValue);
  }

  private async resolveFieldConflict(strategyKey: string, sourceValue: any, conflictValues: any[]): Promise<{
    resolvedValue: any;
    strategy: 'source' | 'target' | 'merge' | 'manual';
    reason: string;
  }> {
    const strategy = this.resolutionStrategies.get(strategyKey);

    if (!strategy) {
      return {
        resolvedValue: sourceValue,
        strategy: 'source',
        reason: 'No strategy found, defaulting to source'
      };
    }

    return await strategy.call(this, sourceValue, conflictValues);
  }

  // Resolution strategy implementations
  private async resolveByLatestTimestamp(sourceValue: any, conflictValues: any[]): Promise<any> {
    return {
      resolvedValue: sourceValue, // Assume source is latest
      strategy: 'source',
      reason: 'Resolved by latest timestamp (source assumed latest)'
    };
  }

  private async resolveByHigherValue(sourceValue: any, conflictValues: any[]): Promise<any> {
    const allValues = [sourceValue, ...conflictValues].filter(v => typeof v === 'number');
    const maxValue = Math.max(...allValues);

    return {
      resolvedValue: maxValue,
      strategy: maxValue === sourceValue ? 'source' : 'target',
      reason: 'Resolved by choosing higher value'
    };
  }

  private async resolveBySource(sourceValue: any, conflictValues: any[]): Promise<any> {
    return {
      resolvedValue: sourceValue,
      strategy: 'source',
      reason: 'Resolved by preferring source system value'
    };
  }

  private async resolveByERPNextSource(sourceValue: any, conflictValues: any[]): Promise<any> {
    return {
      resolvedValue: sourceValue,
      strategy: 'source',
      reason: 'ERPNext is authoritative for inventory quantities'
    };
  }

  private async resolveBySum(sourceValue: any, conflictValues: any[]): Promise<any> {
    const allValues = [sourceValue, ...conflictValues].filter(v => typeof v === 'number');
    const sum = allValues.reduce((acc, val) => acc + val, 0);

    return {
      resolvedValue: sum,
      strategy: 'merge',
      reason: 'Resolved by summing all values'
    };
  }

  private async resolveByEarlierDate(sourceValue: any, conflictValues: any[]): Promise<any> {
    const allDates = [sourceValue, ...conflictValues]
      .filter(v => v instanceof Date || typeof v === 'string')
      .map(v => new Date(v));

    const earliestDate = new Date(Math.min(...allDates.map(d => d.getTime())));

    return {
      resolvedValue: earliestDate,
      strategy: earliestDate.getTime() === new Date(sourceValue).getTime() ? 'source' : 'target',
      reason: 'Resolved by choosing earlier date'
    };
  }

  private async resolveByLaterDate(sourceValue: any, conflictValues: any[]): Promise<any> {
    const allDates = [sourceValue, ...conflictValues]
      .filter(v => v instanceof Date || typeof v === 'string')
      .map(v => new Date(v));

    const latestDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    return {
      resolvedValue: latestDate,
      strategy: latestDate.getTime() === new Date(sourceValue).getTime() ? 'source' : 'target',
      reason: 'Resolved by choosing later date'
    };
  }

  private async resolveByOrderStatusPriority(sourceValue: any, conflictValues: any[]): Promise<any> {
    const statusPriority = {
      'cancelled': 1,
      'draft': 2,
      'pending': 3,
      'confirmed': 4,
      'processing': 5,
      'shipped': 6,
      'delivered': 7,
      'completed': 8
    };

    const allStatuses = [sourceValue, ...conflictValues];
    const highestPriorityStatus = allStatuses.reduce((highest, current) => {
      const currentPriority = statusPriority[current.toLowerCase()] || 0;
      const highestPriority = statusPriority[highest.toLowerCase()] || 0;
      return currentPriority > highestPriority ? current : highest;
    });

    return {
      resolvedValue: highestPriorityStatus,
      strategy: highestPriorityStatus === sourceValue ? 'source' : 'target',
      reason: 'Resolved by order status priority (later stages take precedence)'
    };
  }

  private compareBatchData(sourceBatches: any[], targetBatches: any[]): any[] {
    const sourceIds = new Set(sourceBatches.map(b => b.batchId));
    const targetIds = new Set(targetBatches.map(b => b.batchId));

    const conflicts = [];

    // Find batches with same ID but different data
    for (const sourceBatch of sourceBatches) {
      const targetBatch = targetBatches.find(b => b.batchId === sourceBatch.batchId);
      if (targetBatch) {
        if (JSON.stringify(sourceBatch) !== JSON.stringify(targetBatch)) {
          conflicts.push({
            batchId: sourceBatch.batchId,
            source: sourceBatch,
            target: targetBatch
          });
        }
      }
    }

    return conflicts;
  }

  private mergeBatchData(sourceBatches: any[], targetBatches: any[]): any[] {
    const mergedBatches = [...sourceBatches];
    const sourceIds = new Set(sourceBatches.map(b => b.batchId));

    // Add target batches that don't exist in source
    for (const targetBatch of targetBatches) {
      if (!sourceIds.has(targetBatch.batchId)) {
        mergedBatches.push(targetBatch);
      }
    }

    // For existing batches, prefer source data but merge expiry dates
    for (let i = 0; i < mergedBatches.length; i++) {
      const batch = mergedBatches[i];
      const targetBatch = targetBatches.find(b => b.batchId === batch.batchId);

      if (targetBatch && targetBatch.expiryDate && batch.expiryDate) {
        // Use earlier expiry date for safety
        const sourceExpiry = new Date(batch.expiryDate);
        const targetExpiry = new Date(targetBatch.expiryDate);

        if (targetExpiry < sourceExpiry) {
          mergedBatches[i] = { ...batch, expiryDate: targetBatch.expiryDate };
        }
      }
    }

    return mergedBatches;
  }

  public async logConflictResolution(conflicts: ConflictDetail[], entityType: string, entityId: string): Promise<void> {
    for (const conflict of conflicts) {
      logger.warn(`Conflict resolved for ${entityType} ${entityId}:`, {
        field: conflict.field,
        resolution: conflict.resolution,
        reason: conflict.reason,
        sourceValue: conflict.sourceValue,
        targetValue: conflict.targetValue,
        resolvedValue: conflict.currentValue
      });
    }
  }

  public getConflictSummary(conflicts: ConflictDetail[]): { resolved: number; manual: number; total: number } {
    const resolved = conflicts.filter(c => c.resolution !== 'manual').length;
    const manual = conflicts.filter(c => c.resolution === 'manual').length;

    return {
      resolved,
      manual,
      total: conflicts.length
    };
  }
}