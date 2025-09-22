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

interface Conflict {
  id: string;
  eventId: string;
  type: 'data_conflict' | 'timing_conflict' | 'version_conflict';
  description: string;
  conflictingData: any;
  timestamp: Date;
}

export class ConflictResolver {
  private conflictHistory: Map<string, Conflict[]> = new Map();

  async checkForConflicts(event: SyncEvent): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];
    const entityKey = this.getEntityKey(event);
    
    if (!entityKey) return conflicts;

    // Check for timing conflicts (events happening too close together)
    const timingConflict = this.checkTimingConflicts(event, entityKey);
    if (timingConflict) {
      conflicts.push(timingConflict);
    }

    // Check for data conflicts (conflicting field values)
    const dataConflict = await this.checkDataConflicts(event, entityKey);
    if (dataConflict) {
      conflicts.push(dataConflict);
    }

    // Check for version conflicts
    const versionConflict = this.checkVersionConflicts(event, entityKey);
    if (versionConflict) {
      conflicts.push(versionConflict);
    }

    return conflicts;
  }

  async resolveConflicts(event: SyncEvent, conflicts: Conflict[]): Promise<SyncEvent | null> {
    let resolvedEvent = { ...event };

    for (const conflict of conflicts) {
      switch (conflict.type) {
        case 'timing_conflict':
          resolvedEvent = this.resolveTimingConflict(resolvedEvent, conflict);
          break;
        
        case 'data_conflict':
          resolvedEvent = await this.resolveDataConflict(resolvedEvent, conflict);
          break;
        
        case 'version_conflict':
          resolvedEvent = this.resolveVersionConflict(resolvedEvent, conflict);
          break;
      }

      if (!resolvedEvent) {
        return null; // Unable to resolve
      }
    }

    // Store resolution in history
    this.storeConflictResolution(event, conflicts, resolvedEvent);

    return resolvedEvent;
  }

  private getEntityKey(event: SyncEvent): string | null {
    const data = event.data;
    
    if (data.id) {
      return `${event.type.split('.')[0]}_${data.id}`;
    }
    
    if (data.customerId && event.type.includes('order')) {
      return `order_${data.customerId}_${data.id || 'new'}`;
    }
    
    if (data.productId && event.type.includes('inventory')) {
      return `inventory_${data.productId}`;
    }

    return null;
  }

  private checkTimingConflicts(event: SyncEvent, entityKey: string): Conflict | null {
    const recentEvents = this.getRecentEvents(entityKey, 5000); // 5 seconds
    
    if (recentEvents.length > 0) {
      return {
        id: `timing_${Date.now()}`,
        eventId: event.id,
        type: 'timing_conflict',
        description: 'Multiple events for same entity within short timeframe',
        conflictingData: recentEvents,
        timestamp: new Date(),
      };
    }

    return null;
  }

  private async checkDataConflicts(event: SyncEvent, entityKey: string): Promise<Conflict | null> {
    // This would typically check against a database or cache
    // For now, we'll simulate basic conflict detection
    const existingData = await this.getExistingData(entityKey);
    
    if (existingData && this.hasConflictingFields(event.data, existingData)) {
      return {
        id: `data_${Date.now()}`,
        eventId: event.id,
        type: 'data_conflict',
        description: 'Conflicting field values detected',
        conflictingData: existingData,
        timestamp: new Date(),
      };
    }

    return null;
  }

  private checkVersionConflicts(event: SyncEvent, entityKey: string): Conflict | null {
    const data = event.data;
    
    if (data.version && data.expectedVersion && data.version !== data.expectedVersion) {
      return {
        id: `version_${Date.now()}`,
        eventId: event.id,
        type: 'version_conflict',
        description: 'Version mismatch detected',
        conflictingData: { current: data.version, expected: data.expectedVersion },
        timestamp: new Date(),
      };
    }

    return null;
  }

  private resolveTimingConflict(event: SyncEvent, conflict: Conflict): SyncEvent {
    // For timing conflicts, we typically use "last write wins" with timestamp comparison
    const conflictingEvents = conflict.conflictingData as SyncEvent[];
    const latestEvent = conflictingEvents.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest, event
    );

    if (latestEvent.id === event.id) {
      return event; // Current event is the latest
    }

    // Merge data from the latest event
    return {
      ...event,
      data: { ...event.data, ...latestEvent.data },
      timestamp: new Date(), // Update timestamp to now
    };
  }

  private async resolveDataConflict(event: SyncEvent, conflict: Conflict): Promise<SyncEvent> {
    const existingData = conflict.conflictingData;
    const newData = event.data;

    // Resolution strategy based on event type
    switch (event.type) {
      case 'customer.updated':
        return this.resolveCustomerDataConflict(event, existingData, newData);
      
      case 'order.updated':
        return this.resolveOrderDataConflict(event, existingData, newData);
      
      case 'inventory.updated':
        return this.resolveInventoryDataConflict(event, existingData, newData);
      
      default:
        // Default: merge with new data taking precedence
        return {
          ...event,
          data: { ...existingData, ...newData },
        };
    }
  }

  private resolveVersionConflict(event: SyncEvent, conflict: Conflict): SyncEvent {
    // Increment version and proceed
    return {
      ...event,
      data: {
        ...event.data,
        version: (event.data.version || 0) + 1,
        resolvedConflict: true,
      },
    };
  }

  private resolveCustomerDataConflict(event: SyncEvent, existing: any, incoming: any): SyncEvent {
    // For customer data, preserve critical fields and merge others
    const resolved = {
      ...existing,
      ...incoming,
      // Preserve email if it exists in existing
      email: existing.email || incoming.email,
      // Use latest update timestamp
      updatedAt: new Date().toISOString(),
      // Merge addresses
      addresses: this.mergeArrays(existing.addresses, incoming.addresses, 'id'),
    };

    return { ...event, data: resolved };
  }

  private resolveOrderDataConflict(event: SyncEvent, existing: any, incoming: any): SyncEvent {
    // For orders, be more conservative - don't override critical fields
    const resolved = {
      ...existing,
      // Only allow updates to specific fields
      status: incoming.status || existing.status,
      notes: incoming.notes || existing.notes,
      updatedAt: new Date().toISOString(),
      // Don't allow changes to items or total after creation
      items: existing.items,
      total: existing.total,
    };

    return { ...event, data: resolved };
  }

  private resolveInventoryDataConflict(event: SyncEvent, existing: any, incoming: any): SyncEvent {
    // For inventory, use the most recent quantity update
    const resolved = {
      ...existing,
      ...incoming,
      // Use timestamp to determine which quantity is more recent
      quantity: incoming.timestamp > existing.timestamp ? incoming.quantity : existing.quantity,
      updatedAt: new Date().toISOString(),
    };

    return { ...event, data: resolved };
  }

  private hasConflictingFields(newData: any, existingData: any): boolean {
    const criticalFields = ['id', 'email', 'status', 'total'];
    
    for (const field of criticalFields) {
      if (newData[field] && existingData[field] && newData[field] !== existingData[field]) {
        return true;
      }
    }

    return false;
  }

  private mergeArrays(existing: any[], incoming: any[], keyField: string): any[] {
    if (!existing) return incoming || [];
    if (!incoming) return existing;

    const merged = [...existing];
    
    for (const incomingItem of incoming) {
      const existingIndex = merged.findIndex(item => item[keyField] === incomingItem[keyField]);
      
      if (existingIndex >= 0) {
        merged[existingIndex] = { ...merged[existingIndex], ...incomingItem };
      } else {
        merged.push(incomingItem);
      }
    }

    return merged;
  }

  private getRecentEvents(entityKey: string, timeWindowMs: number): SyncEvent[] {
    // This would typically query a database or cache
    // For now, return empty array
    return [];
  }

  private async getExistingData(entityKey: string): Promise<any | null> {
    // This would typically query the current state from database
    // For now, return null (no existing data)
    return null;
  }

  private storeConflictResolution(original: SyncEvent, conflicts: Conflict[], resolved: SyncEvent): void {
    const entityKey = this.getEntityKey(original);
    if (!entityKey) return;

    const history = this.conflictHistory.get(entityKey) || [];
    history.push(...conflicts);
    
    // Keep only recent conflicts (last 100)
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    this.conflictHistory.set(entityKey, history);
  }

  getConflictHistory(entityKey: string): Conflict[] {
    return this.conflictHistory.get(entityKey) || [];
  }

  clearConflictHistory(entityKey?: string): void {
    if (entityKey) {
      this.conflictHistory.delete(entityKey);
    } else {
      this.conflictHistory.clear();
    }
  }
}
