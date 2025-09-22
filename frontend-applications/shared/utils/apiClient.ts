import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const MEDUSA_API_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || 'http://localhost:9000';

// Create axios instances for different services
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const medusaClient: AxiosInstance = axios.create({
  baseURL: MEDUSA_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

medusaClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('medusa_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
const handleResponseError = (error: any) => {
  if (error.response?.status === 401) {
    // Handle unauthorized access
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('medusa_token');
      window.location.href = '/auth/login';
    }
  }
  return Promise.reject(error);
};

apiClient.interceptors.response.use(
  (response) => response,
  handleResponseError
);

medusaClient.interceptors.response.use(
  (response) => response,
  handleResponseError
);

// API Service Classes
export class AuthAPI {
  static async login(email: string, password: string) {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  }

  static async register(userData: any) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  }

  static async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  }

  static async refreshToken() {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  }

  static async updateProfile(profileData: any) {
    const response = await apiClient.put('/auth/profile', profileData);
    return response.data;
  }
}

export class ProductsAPI {
  static async getProducts(params?: any) {
    const response = await medusaClient.get('/store/products', { params });
    return response.data;
  }

  static async getProduct(id: string) {
    const response = await medusaClient.get(`/store/products/${id}`);
    return response.data;
  }

  static async getCategories() {
    const response = await medusaClient.get('/store/product-categories');
    return response.data;
  }

  static async searchProducts(query: string) {
    const response = await medusaClient.get('/store/products', {
      params: { q: query }
    });
    return response.data;
  }
}

export class CartAPI {
  static async createCart() {
    const response = await medusaClient.post('/store/carts');
    return response.data;
  }

  static async getCart(cartId: string) {
    const response = await medusaClient.get(`/store/carts/${cartId}`);
    return response.data;
  }

  static async addToCart(cartId: string, item: any) {
    const response = await medusaClient.post(`/store/carts/${cartId}/line-items`, item);
    return response.data;
  }

  static async updateCartItem(cartId: string, lineId: string, quantity: number) {
    const response = await medusaClient.post(`/store/carts/${cartId}/line-items/${lineId}`, {
      quantity
    });
    return response.data;
  }

  static async removeFromCart(cartId: string, lineId: string) {
    const response = await medusaClient.delete(`/store/carts/${cartId}/line-items/${lineId}`);
    return response.data;
  }
}

export class OrdersAPI {
  static async getOrders(customerId: string) {
    const response = await medusaClient.get(`/store/customers/${customerId}/orders`);
    return response.data;
  }

  static async getOrder(orderId: string) {
    const response = await medusaClient.get(`/store/orders/${orderId}`);
    return response.data;
  }

  static async createOrder(cartId: string) {
    const response = await medusaClient.post(`/store/carts/${cartId}/complete`);
    return response.data;
  }
}

export class CustomersAPI {
  static async getCustomer(customerId: string) {
    const response = await medusaClient.get(`/store/customers/${customerId}`);
    return response.data;
  }

  static async updateCustomer(customerId: string, data: any) {
    const response = await medusaClient.post(`/store/customers/${customerId}`, data);
    return response.data;
  }

  static async getAddresses(customerId: string) {
    const response = await medusaClient.get(`/store/customers/${customerId}/addresses`);
    return response.data;
  }

  static async addAddress(customerId: string, address: any) {
    const response = await medusaClient.post(`/store/customers/${customerId}/addresses`, address);
    return response.data;
  }

  static async updateAddress(customerId: string, addressId: string, address: any) {
    const response = await medusaClient.post(`/store/customers/${customerId}/addresses/${addressId}`, address);
    return response.data;
  }

  static async deleteAddress(customerId: string, addressId: string) {
    const response = await medusaClient.delete(`/store/customers/${customerId}/addresses/${addressId}`);
    return response.data;
  }
}

// Business Intelligence API
export class AnalyticsAPI {
  static async getDashboardMetrics(timeRange: string = '30days') {
    const response = await apiClient.get('/analytics/dashboard', {
      params: { timeRange }
    });
    return response.data;
  }

  static async getSalesData(timeRange: string = '12months') {
    const response = await apiClient.get('/analytics/sales', {
      params: { timeRange }
    });
    return response.data;
  }

  static async getProductPerformance(limit: number = 10) {
    const response = await apiClient.get('/analytics/products', {
      params: { limit }
    });
    return response.data;
  }

  static async getCustomerSegments() {
    const response = await apiClient.get('/analytics/customers/segments');
    return response.data;
  }

  static async getRevenueAnalytics(timeRange: string = '12months') {
    const response = await apiClient.get('/analytics/revenue', {
      params: { timeRange }
    });
    return response.data;
  }
}

// ERP Integration API
export class ERPAPI {
  static async syncInventory() {
    const response = await apiClient.post('/erp/sync/inventory');
    return response.data;
  }

  static async syncCustomers() {
    const response = await apiClient.post('/erp/sync/customers');
    return response.data;
  }

  static async syncOrders() {
    const response = await apiClient.post('/erp/sync/orders');
    return response.data;
  }

  static async getERPStatus() {
    const response = await apiClient.get('/erp/status');
    return response.data;
  }
}

// CRM Integration API
export class CRMAPI {
  static async syncCustomerData(customerId: string) {
    const response = await apiClient.post(`/crm/sync/customer/${customerId}`);
    return response.data;
  }

  static async createLead(leadData: any) {
    const response = await apiClient.post('/crm/leads', leadData);
    return response.data;
  }

  static async updateCustomerInteraction(customerId: string, interaction: any) {
    const response = await apiClient.post(`/crm/customers/${customerId}/interactions`, interaction);
    return response.data;
  }

  static async getCRMStatus() {
    const response = await apiClient.get('/crm/status');
    return response.data;
  }
}

// Utility functions
export const handleAPIError = (error: any) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    return {
      status,
      message: data.message || 'An error occurred',
      errors: data.errors || []
    };
  } else if (error.request) {
    // Network error
    return {
      status: 0,
      message: 'Network error. Please check your connection.',
      errors: []
    };
  } else {
    // Other error
    return {
      status: -1,
      message: error.message || 'An unexpected error occurred',
      errors: []
    };
  }
};

export const isAPIError = (error: any): boolean => {
  return error.response || error.request || error.message;
};

export default {
  apiClient,
  medusaClient,
  AuthAPI,
  ProductsAPI,
  CartAPI,
  OrdersAPI,
  CustomersAPI,
  AnalyticsAPI,
  ERPAPI,
  CRMAPI,
  handleAPIError,
  isAPIError
};
