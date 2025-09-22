// Cart slice for Redux store

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Cart, CartItem, Product, CartItemCustomization } from '../../types';
import { cartService } from '../../services/cartService';

// Cart state interface
interface CartState {
  cart: Cart | null;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
  isOfflineMode: boolean;
  pendingSyncItems: CartItem[];
}

// Initial state
const initialState: CartState = {
  cart: null,
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,
  itemCount: 0,
  isLoading: false,
  error: null,
  isOfflineMode: false,
  pendingSyncItems: [],
};

// Helper functions
const calculateTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => {
    const itemPrice = item.product.price * item.quantity;
    const customizationPrice = item.customizations?.reduce(
      (customSum, customization) => customSum + (customization.additionalPrice || 0),
      0
    ) || 0;
    return sum + itemPrice + customizationPrice;
  }, 0);

  const tax = subtotal * 0.06; // 6% GST
  const total = subtotal + tax;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { subtotal, tax, total, itemCount };
};

// Async thunks for cart operations
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (
    item: {
      product: Product;
      quantity: number;
      customizations?: CartItemCustomization[];
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { cart: CartState };

      // Check if running in offline mode
      if (state.cart.isOfflineMode) {
        return { ...item, id: `offline_${Date.now()}`, addedAt: new Date().toISOString() };
      }

      const response = await cartService.addToCart(item);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add item to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async (
    { itemId, quantity, customizations }: {
      itemId: string;
      quantity: number;
      customizations?: CartItemCustomization[];
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { cart: CartState };

      if (state.cart.isOfflineMode) {
        return { itemId, quantity, customizations };
      }

      const response = await cartService.updateCartItem(itemId, { quantity, customizations });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart item');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { cart: CartState };

      if (state.cart.isOfflineMode) {
        return itemId;
      }

      await cartService.removeFromCart(itemId);
      return itemId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item from cart');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { cart: CartState };

      if (!state.cart.isOfflineMode) {
        await cartService.clearCart();
      }

      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

export const validateCart = createAsyncThunk(
  'cart/validateCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.validateCart();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Cart validation failed');
    }
  }
);

export const syncOfflineCart = createAsyncThunk(
  'cart/syncOfflineCart',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { cart: CartState };
      const pendingItems = state.cart.pendingSyncItems;

      if (pendingItems.length === 0) {
        return [];
      }

      const syncPromises = pendingItems.map((item) =>
        cartService.addToCart({
          product: item.product,
          quantity: item.quantity,
          customizations: item.customizations,
        })
      );

      const responses = await Promise.all(syncPromises);
      return responses.map((response) => response.data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sync offline cart');
    }
  }
);

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setOfflineMode: (state, action: PayloadAction<boolean>) => {
      state.isOfflineMode = action.payload;
    },
    addOfflineItem: (state, action: PayloadAction<CartItem>) => {
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.product.id === action.payload.product.id &&
          JSON.stringify(item.customizations) === JSON.stringify(action.payload.customizations)
      );

      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }

      state.pendingSyncItems.push(action.payload);
      const totals = calculateTotals(state.items);
      Object.assign(state, totals);
    },
    updateOfflineItem: (state, action: PayloadAction<{
      itemId: string;
      quantity: number;
      customizations?: CartItemCustomization[];
    }>) => {
      const itemIndex = state.items.findIndex(item => item.id === action.payload.itemId);
      if (itemIndex >= 0) {
        state.items[itemIndex].quantity = action.payload.quantity;
        if (action.payload.customizations) {
          state.items[itemIndex].customizations = action.payload.customizations;
        }

        const totals = calculateTotals(state.items);
        Object.assign(state, totals);
      }
    },
    removeOfflineItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.pendingSyncItems = state.pendingSyncItems.filter(item => item.id !== action.payload);

      const totals = calculateTotals(state.items);
      Object.assign(state, totals);
    },
    clearOfflineCart: (state) => {
      state.items = [];
      state.pendingSyncItems = [];
      state.subtotal = 0;
      state.tax = 0;
      state.total = 0;
      state.itemCount = 0;
    },
    resetCartState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
        state.items = action.payload.items;

        const totals = calculateTotals(action.payload.items);
        Object.assign(state, totals);

        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add to cart
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;

        if (state.isOfflineMode) {
          const newItem = action.payload as CartItem;
          const existingItemIndex = state.items.findIndex(
            (item) =>
              item.product.id === newItem.product.id &&
              JSON.stringify(item.customizations) === JSON.stringify(newItem.customizations)
          );

          if (existingItemIndex >= 0) {
            state.items[existingItemIndex].quantity += newItem.quantity;
          } else {
            state.items.push(newItem);
          }

          state.pendingSyncItems.push(newItem);
        } else {
          const newItem = action.payload as CartItem;
          const existingItemIndex = state.items.findIndex(item => item.id === newItem.id);

          if (existingItemIndex >= 0) {
            state.items[existingItemIndex] = newItem;
          } else {
            state.items.push(newItem);
          }
        }

        const totals = calculateTotals(state.items);
        Object.assign(state, totals);

        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update cart item
    builder
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;

        if (state.isOfflineMode) {
          const { itemId, quantity, customizations } = action.payload as any;
          const itemIndex = state.items.findIndex(item => item.id === itemId);

          if (itemIndex >= 0) {
            state.items[itemIndex].quantity = quantity;
            if (customizations) {
              state.items[itemIndex].customizations = customizations;
            }
          }
        } else {
          const updatedItem = action.payload as CartItem;
          const itemIndex = state.items.findIndex(item => item.id === updatedItem.id);

          if (itemIndex >= 0) {
            state.items[itemIndex] = updatedItem;
          }
        }

        const totals = calculateTotals(state.items);
        Object.assign(state, totals);

        state.error = null;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Remove from cart
    builder
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const itemId = action.payload as string;

        state.items = state.items.filter(item => item.id !== itemId);
        state.pendingSyncItems = state.pendingSyncItems.filter(item => item.id !== itemId);

        const totals = calculateTotals(state.items);
        Object.assign(state, totals);

        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Clear cart
    builder
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.isLoading = false;
        state.cart = null;
        state.items = [];
        state.pendingSyncItems = [];
        state.subtotal = 0;
        state.tax = 0;
        state.total = 0;
        state.itemCount = 0;
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Validate cart
    builder
      .addCase(validateCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(validateCart.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update items with validation results (e.g., price changes, availability)
        const validationResults = action.payload;

        state.items = state.items.map(item => {
          const validationResult = validationResults.find((result: any) => result.itemId === item.id);
          if (validationResult) {
            return {
              ...item,
              product: {
                ...item.product,
                price: validationResult.currentPrice,
                inStock: validationResult.inStock,
              },
            };
          }
          return item;
        });

        const totals = calculateTotals(state.items);
        Object.assign(state, totals);

        state.error = null;
      })
      .addCase(validateCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Sync offline cart
    builder
      .addCase(syncOfflineCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(syncOfflineCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const syncedItems = action.payload as CartItem[];

        // Replace offline items with synced items
        const offlineItemIds = state.pendingSyncItems.map(item => item.id);
        state.items = state.items.filter(item => !offlineItemIds.includes(item.id));
        state.items.push(...syncedItems);

        state.pendingSyncItems = [];
        state.isOfflineMode = false;

        const totals = calculateTotals(state.items);
        Object.assign(state, totals);

        state.error = null;
      })
      .addCase(syncOfflineCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  clearError,
  setOfflineMode,
  addOfflineItem,
  updateOfflineItem,
  removeOfflineItem,
  clearOfflineCart,
  resetCartState,
} = cartSlice.actions;

// Export reducer
export default cartSlice.reducer;

// Selectors
export const selectCart = (state: { cart: CartState }) => state.cart.cart;
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartSubtotal = (state: { cart: CartState }) => state.cart.subtotal;
export const selectCartTax = (state: { cart: CartState }) => state.cart.tax;
export const selectCartTotal = (state: { cart: CartState }) => state.cart.total;
export const selectCartItemCount = (state: { cart: CartState }) => state.cart.itemCount;
export const selectCartLoading = (state: { cart: CartState }) => state.cart.isLoading;
export const selectCartError = (state: { cart: CartState }) => state.cart.error;
export const selectIsOfflineMode = (state: { cart: CartState }) => state.cart.isOfflineMode;
export const selectPendingSyncItems = (state: { cart: CartState }) => state.cart.pendingSyncItems;