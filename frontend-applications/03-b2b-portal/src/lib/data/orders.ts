import { cache } from "react"
import { Order, OrderItem } from '@/types'

// API Gateway configuration
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3001'

export type OrderParams = {
  limit?: number
  offset?: number
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  startDate?: string
  endDate?: string
  organizationId?: string
}

export interface OrderListResponse {
  orders: Order[]
  pagination: {
    count: number
    offset: number
    limit: number
    hasMore: boolean
    totalPages: number
  }
}

export const getB2BOrdersList = cache(async (params: OrderParams = {}): Promise<OrderListResponse> => {
  try {
    // Try API Gateway first
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('start_date', params.startDate);
    if (params.endDate) queryParams.append('end_date', params.endDate);
    if (params.organizationId) queryParams.append('organization_id', params.organizationId);

    const response = await fetch(`${API_GATEWAY_URL}/api/v1/orders?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (response.ok) {
      const data = await response.json();
      return {
        orders: data.orders || [],
        pagination: {
          count: data.count || 0,
          offset: data.offset || 0,
          limit: data.limit || 12,
          hasMore: (data.offset + data.limit) < data.count,
          totalPages: Math.ceil((data.count || 0) / (data.limit || 12))
        }
      }
    } else {
      throw new Error(`API Gateway responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching B2B orders from API Gateway:', error);
    throw new Error('Failed to fetch orders from backend services')
  }
})

export const getB2BOrder = cache(async (orderId: string): Promise<Order | null> => {
  try {
    const response = await fetch(`${API_GATEWAY_URL}/api/v1/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (response.ok) {
      const data = await response.json();
      return data.order || null;
    } else {
      throw new Error(`API Gateway responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching B2B order:', error);
    return null;
  }
})

export const createB2BOrder = async (orderData: {
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
  deliveryDate?: string;
}): Promise<Order> => {
  try {
    const response = await fetch(`${API_GATEWAY_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (response.ok) {
      const data = await response.json();
      return data.order;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create order');
    }
  } catch (error) {
    console.error('Error creating B2B order:', error);
    throw error;
  }
}

export const updateB2BOrderStatus = async (orderId: string, status: Order['status']): Promise<Order> => {
  try {
    const response = await fetch(`${API_GATEWAY_URL}/api/v1/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ status })
    });

    if (response.ok) {
      const data = await response.json();
      return data.order;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update order status');
    }
  } catch (error) {
    console.error('Error updating B2B order status:', error);
    throw error;
  }
}

export const cancelB2BOrder = async (orderId: string, reason?: string): Promise<Order> => {
  try {
    const response = await fetch(`${API_GATEWAY_URL}/api/v1/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ reason })
    });

    if (response.ok) {
      const data = await response.json();
      return data.order;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to cancel order');
    }
  } catch (error) {
    console.error('Error canceling B2B order:', error);
    throw error;
  }
}

export const getB2BOrderInvoice = async (orderId: string): Promise<Blob> => {
  try {
    const response = await fetch(`${API_GATEWAY_URL}/api/v1/orders/${orderId}/invoice`, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf'
      }
    });

    if (response.ok) {
      return await response.blob();
    } else {
      throw new Error(`Failed to download invoice: ${response.status}`);
    }
  } catch (error) {
    console.error('Error downloading B2B order invoice:', error);
    throw error;
  }
}

export const getB2BOrderAnalytics = cache(async (organizationId?: string): Promise<{
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
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
}> => {
  try {
    const queryParams = new URLSearchParams();
    if (organizationId) queryParams.append('organization_id', organizationId);

    const response = await fetch(`${API_GATEWAY_URL}/api/v1/orders/analytics?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (response.ok) {
      const data = await response.json();
      return data.analytics;
    } else {
      throw new Error(`API Gateway responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching B2B order analytics:', error);
    return {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      topProducts: [],
      monthlyTrend: []
    };
  }
})