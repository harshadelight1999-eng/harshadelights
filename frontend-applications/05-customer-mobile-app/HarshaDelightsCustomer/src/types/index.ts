// Core type definitions for Harsha Delights Customer App

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  images: string[];
  category: ProductCategory;
  subcategory?: ProductSubcategory;
  inStock: boolean;
  stockQuantity: number;
  unitOfMeasure: string;
  weight?: number;
  dimensions?: ProductDimensions;
  nutritionalInfo?: NutritionalInfo;
  allergens?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  ratings: ProductRating;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
}

export interface ProductSubcategory {
  id: string;
  name: string;
  categoryId: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'inch';
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize: string;
}

export interface ProductRating {
  average: number;
  totalReviews: number;
  breakdown: {
    [key: number]: number; // star rating -> count
  };
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  customizations?: CartItemCustomization[];
  addedAt: string;
}

export interface CartItemCustomization {
  type: string;
  value: string;
  additionalPrice?: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  currency: string;
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: PaymentMethod;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  specialInstructions?: string;
  trackingInfo?: OrderTrackingInfo;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customizations?: CartItemCustomization[];
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderTrackingInfo {
  currentStatus: OrderStatus;
  statusHistory: OrderStatusUpdate[];
  estimatedDelivery?: string;
  trackingNumber?: string;
}

export interface OrderStatusUpdate {
  status: OrderStatus;
  timestamp: string;
  message: string;
  location?: string;
}

export interface Address {
  id?: string;
  type: 'home' | 'work' | 'other';
  firstName: string;
  lastName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
  id?: string;
  type: 'credit_card' | 'debit_card' | 'cash_on_delivery' | 'digital_wallet';
  provider?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export type NotificationType =
  | 'order_update'
  | 'promotion'
  | 'new_product'
  | 'delivery'
  | 'payment'
  | 'review_request'
  | 'system';

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
}

export interface WishlistItem {
  id: string;
  userId: string;
  product: Product;
  addedAt: string;
}

export interface SearchFilters {
  category?: string;
  subcategory?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  inStock?: boolean;
  dietaryPreferences?: ('vegetarian' | 'vegan' | 'gluten_free')[];
  sortBy?: 'price_low_to_high' | 'price_high_to_low' | 'rating' | 'newest' | 'popularity';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProductDetails: { productId: string };
  Search: { query?: string; filters?: SearchFilters };
  Cart: undefined;
  Checkout: undefined;
  OrderConfirmation: { orderId: string };
  OrderTracking: { orderId: string };
  Profile: undefined;
  Address: undefined;
  AddAddress: { address?: Address };
  PaymentMethods: undefined;
  AddPaymentMethod: undefined;
  OrderHistory: undefined;
  OrderDetails: { orderId: string };
  Wishlist: undefined;
  Reviews: { productId: string };
  WriteReview: { productId: string; orderId?: string };
  Notifications: undefined;
  Settings: undefined;
  Support: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  VerifyOTP: { email: string; type: 'register' | 'reset_password' };
};

export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  Search: undefined;
  Cart: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  ProductDetails: { productId: string };
  CategoryProducts: { categoryId: string; categoryName: string };
};

export type CategoriesStackParamList = {
  CategoriesScreen: undefined;
  CategoryProducts: { categoryId: string; categoryName: string };
  ProductDetails: { productId: string };
};

export type SearchStackParamList = {
  SearchScreen: { query?: string; filters?: SearchFilters };
  ProductDetails: { productId: string };
  SearchFilters: undefined;
};

export type CartStackParamList = {
  CartScreen: undefined;
  Checkout: undefined;
  OrderConfirmation: { orderId: string };
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  OrderHistory: undefined;
  OrderDetails: { orderId: string };
  OrderTracking: { orderId: string };
  Address: undefined;
  AddAddress: { address?: Address };
  PaymentMethods: undefined;
  AddPaymentMethod: undefined;
  Wishlist: undefined;
  Reviews: { productId?: string };
  WriteReview: { productId: string; orderId?: string };
  Notifications: undefined;
  Settings: undefined;
  Support: undefined;
};