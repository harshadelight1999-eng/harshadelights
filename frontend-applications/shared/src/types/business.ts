/**
 * Business Domain Types for Harsha Delights
 * Shared TypeScript interfaces for consistent data structures
 */

// Base entities
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Customer Management
export type CustomerType =
  | 'individual'
  | 'shop_owner'
  | 'wholesaler'
  | 'distributor'
  | 'event_planner'
  | 'restaurant'
  | 'hotel'
  | 'catering'
  | 'retailer'
  | 'international';

export type CustomerTier = 'gold' | 'silver' | 'bronze' | 'regular';

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  landmark?: string;
  type?: 'home' | 'office' | 'warehouse' | 'shop';
}

export interface Customer extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  customerType: CustomerType;
  tier: CustomerTier;
  companyName?: string;
  gstNumber?: string;
  addresses: Address[];
  creditLimit: number; // in paise
  creditUsed: number; // in paise
  paymentTerms: number; // days
  discountPercentage: number;
  language: 'en' | 'hi' | 'gu' | 'mr';
  isActive: boolean;
  notes?: string;
}

// Product Management
export type ProductCategory =
  | 'sweets'
  | 'chocolates'
  | 'namkeens'
  | 'dry_fruits'
  | 'buns'
  | 'cookies'
  | 'raw_materials'
  | 'gift_boxes'
  | 'seasonal';

export type ProductStatus = 'active' | 'inactive' | 'discontinued';

export interface ProductVariant {
  id: string;
  sku: string;
  weight: number; // in grams
  unit: 'piece' | 'kg' | 'gram' | 'box' | 'packet';
  price: number; // in paise
  compareAtPrice?: number; // in paise
  costPrice: number; // in paise
  barcode?: string;
  inventory: {
    quantity: number;
    reservedQuantity: number;
    lowStockThreshold: number;
  };
}

export interface Product extends BaseEntity {
  title: string;
  description: string;
  category: ProductCategory;
  subCategory?: string;
  status: ProductStatus;
  images: string[];
  variants: ProductVariant[];
  ingredients: string[];
  allergens: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar: number;
  };
  shelfLife: number; // days
  storageInstructions: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isOrganic: boolean;
  minimumOrderQuantity: number;
  maxOrderQuantity?: number;
  rating?: number;
  reviewCount: number;
}

// Inventory Management
export interface BatchInfo {
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  quantity: number;
  supplierInfo?: {
    name: string;
    contactInfo: string;
  };
  qualityGrade: 'A' | 'B' | 'C';
  notes?: string;
}

export interface Inventory extends BaseEntity {
  productId: string;
  variantId: string;
  warehouseLocation: string;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  damagedQuantity: number;
  batches: BatchInfo[];
  lastUpdated: string;
  reorderPoint: number;
  maxStockLevel: number;
}

// Order Management
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'returned';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'partially_paid'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'upi'
  | 'bank_transfer'
  | 'cheque'
  | 'credit'
  | 'wallet';

export interface OrderItem {
  productId: string;
  variantId: string;
  productTitle: string;
  variantTitle: string;
  quantity: number;
  unitPrice: number; // in paise
  totalPrice: number; // in paise
  discountAmount: number; // in paise
  taxAmount: number; // in paise
  weight: number; // in grams
  batchNumber?: string;
}

export interface ShippingInfo {
  method: 'pickup' | 'delivery' | 'courier';
  address?: Address;
  estimatedDeliveryDate?: string;
  trackingNumber?: string;
  cost: number; // in paise
  courierPartner?: string;
  instructions?: string;
}

export interface Order extends BaseEntity {
  orderNumber: string;
  customerId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    type: CustomerType;
  };
  items: OrderItem[];
  subtotal: number; // in paise
  discountAmount: number; // in paise
  taxAmount: number; // in paise
  shippingCost: number; // in paise
  totalAmount: number; // in paise
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  shippingInfo: ShippingInfo;
  notes?: string;
  internalNotes?: string;
  estimatedDeliveryDate?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  refundAmount?: number; // in paise
  source: 'website' | 'phone' | 'whatsapp' | 'b2b_portal' | 'mobile_app' | 'manual';
}

// Pricing Management
export interface PricingRule extends BaseEntity {
  name: string;
  description: string;
  customerTypes: CustomerType[];
  customerTiers: CustomerTier[];
  productCategories: ProductCategory[];
  specificProducts?: string[]; // product IDs
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  minimumQuantity?: number;
  minimumOrderValue?: number; // in paise
  validFrom: string;
  validTo?: string;
  isActive: boolean;
  priority: number; // higher number = higher priority
}

// Analytics and Reporting
export interface SalesMetrics {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  totalOrders: number;
  totalRevenue: number; // in paise
  totalQuantitySold: number;
  averageOrderValue: number; // in paise
  topProducts: Array<{
    productId: string;
    productTitle: string;
    quantitySold: number;
    revenue: number; // in paise
  }>;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    orderCount: number;
    totalSpent: number; // in paise
  }>;
  salesByCategory: Array<{
    category: ProductCategory;
    revenue: number; // in paise
    orderCount: number;
  }>;
}

// Authentication and User Management
export type UserRole = 'admin' | 'manager' | 'sales' | 'inventory' | 'customer_service' | 'accountant';

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: string;
  phone?: string;
  department?: string;
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  success: boolean;
  message?: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: ValidationError[];
}