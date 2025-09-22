// Common types for synchronization services

export interface SyncEvent {
  id: string;
  type: SyncEventType;
  source: SystemType;
  target: SystemType[];
  data: Record<string, any>;
  timestamp: Date;
  retry_count: number;
  status: SyncStatus;
  error_message?: string;
}

export enum SyncEventType {
  CUSTOMER_CREATE = 'customer.create',
  CUSTOMER_UPDATE = 'customer.update',
  CUSTOMER_DELETE = 'customer.delete',
  INVENTORY_UPDATE = 'inventory.update',
  INVENTORY_LOW_STOCK = 'inventory.low_stock',
  ORDER_CREATE = 'order.create',
  ORDER_UPDATE = 'order.update',
  ORDER_CANCEL = 'order.cancel',
  PRICE_UPDATE = 'price.update',
  PRODUCT_CREATE = 'product.create',
  PRODUCT_UPDATE = 'product.update'
}

export enum SystemType {
  ERPNEXT = 'erpnext',
  ESPOCRM = 'espocrm',
  MEDUSA = 'medusa'
}

export enum SyncStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRY = 'retry'
}

// Customer data structures
export interface Customer {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  address: CustomerAddress[];
  customer_type: 'Individual' | 'Company';
  territory: string;
  customer_group: string;
  created_at: Date;
  updated_at: Date;
  source_system: SystemType;
  external_ids: Record<SystemType, string>;
}

export interface CustomerAddress {
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_primary: boolean;
  address_type: 'Billing' | 'Shipping';
}

// Product/Inventory data structures
export interface Product {
  id: string;
  item_code: string;
  item_name: string;
  description: string;
  item_group: string;
  brand?: string;
  unit_of_measure: string;
  stock_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  reorder_level: number;
  price: number;
  currency: string;
  tax_category: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  source_system: SystemType;
  external_ids: Record<SystemType, string>;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  variant_code: string;
  variant_name: string;
  attributes: Record<string, string>;
  stock_quantity: number;
  price: number;
  sku: string;
}

// Order data structures
export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  order_date: Date;
  status: OrderStatus;
  order_type: 'Sales Order' | 'Purchase Order';
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  shipping_amount: number;
  total_amount: number;
  currency: string;
  billing_address: CustomerAddress;
  shipping_address: CustomerAddress;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  created_at: Date;
  updated_at: Date;
  source_system: SystemType;
  external_ids: Record<SystemType, string>;
}

export interface OrderItem {
  id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  tax_percentage: number;
  line_total: number;
}

export enum OrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum FulfillmentStatus {
  NOT_FULFILLED = 'not_fulfilled',
  PARTIALLY_FULFILLED = 'partially_fulfilled',
  FULFILLED = 'fulfilled',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  RETURNED = 'returned'
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Configuration types
export interface SystemConfig {
  url: string;
  apiKey: string;
  apiSecret?: string;
  username?: string;
  password?: string;
  timeout: number;
  retryAttempts: number;
}

export interface SyncConfig {
  batchSize: number;
  retryAttempts: number;
  retryDelay: number;
  enableRealTimeSync: boolean;
  syncIntervals: {
    customer: number;
    inventory: number;
    orders: number;
    pricing: number;
  };
}

// Webhook payload types
export interface WebhookPayload {
  event: SyncEventType;
  data: Record<string, any>;
  source: SystemType;
  timestamp: Date;
  signature?: string;
}

// Queue job types
export interface SyncJob {
  id: string;
  type: SyncEventType;
  data: Record<string, any>;
  source: SystemType;
  targets: SystemType[];
  priority: number;
  attempts: number;
  delay?: number;
}

// Metrics and monitoring types
export interface SyncMetrics {
  total_events: number;
  successful_syncs: number;
  failed_syncs: number;
  average_processing_time: number;
  last_sync_time: Date;
  system_health: Record<SystemType, boolean>;
}

export interface SystemHealth {
  system: SystemType;
  status: 'healthy' | 'degraded' | 'down';
  last_check: Date;
  response_time: number;
  error_rate: number;
}