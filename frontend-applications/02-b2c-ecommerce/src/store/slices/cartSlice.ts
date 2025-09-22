import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  title: string;
  description?: string;
  thumbnail?: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  total: number;
  itemCount: number;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
  isLoading: false,
  error: null,
  total: 0,
  itemCount: 0,
};

// For now using synchronous cart operations
// TODO: Implement async thunks for server-side cart management later

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCartSidebar: (state) => {
      state.isOpen = !state.isOpen;
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    addToCart: (state, action: PayloadAction<{ product_id: string; variant_id: string; quantity: number; title: string; unit_price: number }>) => {
      const { product_id, variant_id, quantity, title, unit_price } = action.payload;
      const existingItem = state.items.find(item => item.variant_id === variant_id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id: `item_${Date.now()}`,
          product_id,
          variant_id,
          quantity,
          title,
          unit_price,
        });
      }

      state.itemCount = state.items.reduce((count, item) => count + item.quantity, 0);
      state.total = state.items.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
    },
    updateCartItem: (state, action: PayloadAction<{ variant_id: string; quantity: number }>) => {
      const { variant_id, quantity } = action.payload;
      const item = state.items.find(item => item.variant_id === variant_id);

      if (item) {
        item.quantity = quantity;
        state.itemCount = state.items.reduce((count, item) => count + item.quantity, 0);
        state.total = state.items.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      const variant_id = action.payload;
      state.items = state.items.filter(item => item.variant_id !== variant_id);
      state.itemCount = state.items.reduce((count, item) => count + item.quantity, 0);
      state.total = state.items.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
    },
  },
});

export const { toggleCartSidebar, clearCart, clearError, addToCart, updateCartItem, removeFromCart } = cartSlice.actions;
export default cartSlice.reducer;
