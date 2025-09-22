// API Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User & Organization Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'purchaser' | 'viewer';
  organizationId: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  customerTier: 'gold' | 'silver' | 'bronze';
  creditLimit: number;
  creditUtilized: number;
  paymentTerms: string;
  contactInfo: {
    phone?: string;
    address?: string;
    gstNumber?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Product Types
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  basePrice: number;
  unit: string;
  minimumOrderQuantity: number;
  inStock: boolean;
  stockQuantity: number;
  specifications?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithPricing extends Product {
  customerPrice: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
}

// Order Types
export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  organizationId: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  deliveryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Pricing Types
export interface CustomerPricing {
  productId: string;
  customerPrice: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  effectiveFrom: string;
  effectiveTo?: string;
}

// Account Types
export interface AccountSummary {
  organizationId: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  creditLimit: number;
  creditUtilized: number;
  creditAvailable: number;
  paymentDue: number;
  overdueAmount: number;
}

// Invoice Types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  organizationId: string;
  amount: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidDate?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics Types
export interface PurchaseAnalytics {
  totalSpent: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    totalQuantity: number;
    totalAmount: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    amount: number;
    orders: number;
  }>;
}

// Form Types
export interface QuickOrderForm {
  items: Array<{
    sku: string;
    quantity: number;
  }>;
}

export interface CSVOrderRow {
  sku: string;
  quantity: number;
  productName?: string;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}
