export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  tier: 'premium' | 'standard' | 'basic';
  status: 'active' | 'inactive' | 'suspended';
  creditLimit: number;
  outstandingBalance: number;
  territory?: string;
  salesRep?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  itemCode: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  stockQuantity: number;
  unit: string;
  warehouse: string;
  isActive: boolean;
  images: string[];
  specifications: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: 'draft' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  orderDate: Date;
  deliveryDate?: Date;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  itemCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
  taxRate: number;
}

export interface Territory {
  id: string;
  name: string;
  description: string;
  salesRep: string;
  customers: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceList {
  id: string;
  name: string;
  currency: string;
  isActive: boolean;
  validFrom: Date;
  validTo?: Date;
  items: PriceListItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceListItem {
  itemCode: string;
  price: number;
  minQuantity: number;
  maxQuantity?: number;
}

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    orderCount: number;
    revenue: number;
  }>;
  periodStart: Date;
  periodEnd: Date;
}

export interface SyncEvent {
  id: string;
  type: string;
  source: string;
  target: string;
  data: any;
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retryCount: number;
  error?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  platform: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
