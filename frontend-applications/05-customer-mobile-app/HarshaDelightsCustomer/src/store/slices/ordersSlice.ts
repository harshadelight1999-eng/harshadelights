// Orders slice for Redux store

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderStatus, Address, PaymentMethod, CartItem } from '../../types';
import { orderService } from '../../services/orderService';

// Orders state interface
interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  recentOrder: Order | null;
  isLoading: boolean;
  isCreatingOrder: boolean;
  isTrackingLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Initial state
const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  recentOrder: null,
  isLoading: false,
  isCreatingOrder: false,
  isTrackingLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks for order operations
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (
    orderData: {
      items: CartItem[];
      shippingAddress: Address;
      billingAddress?: Address;
      paymentMethod: PaymentMethod;
      deliveryDate?: string;
      deliveryTimeSlot?: string;
      specialInstructions?: string;
      couponCode?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await orderService.createOrder(orderData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params: { page?: number; limit?: number; status?: OrderStatus } = {}, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrders(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderById(orderId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
    }
  }
);

export const trackOrder = createAsyncThunk(
  'orders/trackOrder',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await orderService.trackOrder(orderId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to track order');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (
    { orderId, reason }: { orderId: string; reason?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await orderService.cancelOrder(orderId, reason);
      return { orderId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

export const rateOrder = createAsyncThunk(
  'orders/rateOrder',
  async (
    {
      orderId,
      ratings,
    }: {
      orderId: string;
      ratings: Array<{
        productId: string;
        rating: number;
        review?: string;
        images?: string[];
      }>;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await orderService.rateOrder(orderId, ratings);
      return { orderId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to rate order');
    }
  }
);

export const reorderItems = createAsyncThunk(
  'orders/reorderItems',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await orderService.reorderItems(orderId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reorder items');
    }
  }
);

// Orders slice
const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: OrderStatus; timestamp?: string; message?: string }>) => {
      const { orderId, status, timestamp, message } = action.payload;

      // Update in orders array
      const orderIndex = state.orders.findIndex(order => order.id === orderId);
      if (orderIndex >= 0) {
        state.orders[orderIndex].status = status;

        if (state.orders[orderIndex].trackingInfo) {
          state.orders[orderIndex].trackingInfo!.currentStatus = status;

          if (timestamp && message) {
            state.orders[orderIndex].trackingInfo!.statusHistory.push({
              status,
              timestamp,
              message,
            });
          }
        }
      }

      // Update current order if it matches
      if (state.currentOrder?.id === orderId) {
        state.currentOrder.status = status;

        if (state.currentOrder.trackingInfo) {
          state.currentOrder.trackingInfo.currentStatus = status;

          if (timestamp && message) {
            state.currentOrder.trackingInfo.statusHistory.push({
              status,
              timestamp,
              message,
            });
          }
        }
      }

      // Update recent order if it matches
      if (state.recentOrder?.id === orderId) {
        state.recentOrder.status = status;

        if (state.recentOrder.trackingInfo) {
          state.recentOrder.trackingInfo.currentStatus = status;

          if (timestamp && message) {
            state.recentOrder.trackingInfo.statusHistory.push({
              status,
              timestamp,
              message,
            });
          }
        }
      }
    },
    clearRecentOrder: (state) => {
      state.recentOrder = null;
    },
    resetOrdersState: () => initialState,
  },
  extraReducers: (builder) => {
    // Create order
    builder
      .addCase(createOrder.pending, (state) => {
        state.isCreatingOrder = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isCreatingOrder = false;
        const newOrder = action.payload;

        // Add to beginning of orders array
        state.orders.unshift(newOrder);
        state.currentOrder = newOrder;
        state.recentOrder = newOrder;
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isCreatingOrder = false;
        state.error = action.payload as string;
      });

    // Fetch orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        const { orders, pagination } = action.payload;

        if (pagination.page === 1) {
          state.orders = orders;
        } else {
          state.orders.push(...orders);
        }

        state.pagination = pagination;
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch order by ID
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;

        // Update in orders array if it exists
        const orderIndex = state.orders.findIndex(order => order.id === action.payload.id);
        if (orderIndex >= 0) {
          state.orders[orderIndex] = action.payload;
        }

        state.error = null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Track order
    builder
      .addCase(trackOrder.pending, (state) => {
        state.isTrackingLoading = true;
        state.error = null;
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.isTrackingLoading = false;
        const trackingData = action.payload;

        // Update current order with tracking information
        if (state.currentOrder) {
          state.currentOrder.trackingInfo = trackingData;
        }

        // Update in orders array
        const orderIndex = state.orders.findIndex(order => order.id === trackingData.orderId);
        if (orderIndex >= 0) {
          state.orders[orderIndex].trackingInfo = trackingData;
        }

        state.error = null;
      })
      .addCase(trackOrder.rejected, (state, action) => {
        state.isTrackingLoading = false;
        state.error = action.payload as string;
      });

    // Cancel order
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const { orderId } = action.payload;

        // Update order status to cancelled
        const orderIndex = state.orders.findIndex(order => order.id === orderId);
        if (orderIndex >= 0) {
          state.orders[orderIndex].status = 'cancelled';
        }

        if (state.currentOrder?.id === orderId) {
          state.currentOrder.status = 'cancelled';
        }

        if (state.recentOrder?.id === orderId) {
          state.recentOrder.status = 'cancelled';
        }

        state.error = null;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Rate order
    builder
      .addCase(rateOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rateOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        // Order rating is typically reflected in the order details
        // and individual product ratings
        state.error = null;
      })
      .addCase(rateOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Reorder items
    builder
      .addCase(reorderItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reorderItems.fulfilled, (state, action) => {
        state.isLoading = false;
        // Reorder typically adds items to cart or creates a new order
        // This is handled in the cart or by creating a new order
        state.error = null;
      })
      .addCase(reorderItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  clearError,
  setCurrentOrder,
  updateOrderStatus,
  clearRecentOrder,
  resetOrdersState,
} = ordersSlice.actions;

// Export reducer
export default ordersSlice.reducer;

// Selectors
export const selectOrders = (state: { orders: OrdersState }) => state.orders.orders;
export const selectCurrentOrder = (state: { orders: OrdersState }) => state.orders.currentOrder;
export const selectRecentOrder = (state: { orders: OrdersState }) => state.orders.recentOrder;
export const selectOrdersLoading = (state: { orders: OrdersState }) => state.orders.isLoading;
export const selectIsCreatingOrder = (state: { orders: OrdersState }) => state.orders.isCreatingOrder;
export const selectIsTrackingLoading = (state: { orders: OrdersState }) => state.orders.isTrackingLoading;
export const selectOrdersError = (state: { orders: OrdersState }) => state.orders.error;
export const selectOrdersPagination = (state: { orders: OrdersState }) => state.orders.pagination;

// Complex selectors
export const selectOrdersByStatus = (status: OrderStatus) => (state: { orders: OrdersState }) =>
  state.orders.orders.filter(order => order.status === status);

export const selectActiveOrders = (state: { orders: OrdersState }) =>
  state.orders.orders.filter(order =>
    !['delivered', 'cancelled', 'refunded'].includes(order.status)
  );

export const selectCompletedOrders = (state: { orders: OrdersState }) =>
  state.orders.orders.filter(order =>
    ['delivered', 'cancelled', 'refunded'].includes(order.status)
  );