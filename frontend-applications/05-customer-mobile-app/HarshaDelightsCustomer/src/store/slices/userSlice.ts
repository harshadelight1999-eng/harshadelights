// User slice for Redux store

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Address, PaymentMethod } from '../../types';
import { userService } from '../../services/userService';

// User state interface
interface UserState {
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  defaultAddress: Address | null;
  defaultPaymentMethod: PaymentMethod | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: UserState = {
  addresses: [],
  paymentMethods: [],
  defaultAddress: null,
  defaultPaymentMethod: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchAddresses = createAsyncThunk(
  'user/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getAddresses();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch addresses');
    }
  }
);

export const addAddress = createAsyncThunk(
  'user/addAddress',
  async (address: Omit<Address, 'id'>, { rejectWithValue }) => {
    try {
      const response = await userService.addAddress(address);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add address');
    }
  }
);

export const updateAddress = createAsyncThunk(
  'user/updateAddress',
  async ({ id, address }: { id: string; address: Partial<Address> }, { rejectWithValue }) => {
    try {
      const response = await userService.updateAddress(id, address);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update address');
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'user/deleteAddress',
  async (addressId: string, { rejectWithValue }) => {
    try {
      await userService.deleteAddress(addressId);
      return addressId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete address');
    }
  }
);

export const fetchPaymentMethods = createAsyncThunk(
  'user/fetchPaymentMethods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getPaymentMethods();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment methods');
    }
  }
);

export const addPaymentMethod = createAsyncThunk(
  'user/addPaymentMethod',
  async (paymentMethod: Omit<PaymentMethod, 'id'>, { rejectWithValue }) => {
    try {
      const response = await userService.addPaymentMethod(paymentMethod);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add payment method');
    }
  }
);

export const deletePaymentMethod = createAsyncThunk(
  'user/deletePaymentMethod',
  async (paymentMethodId: string, { rejectWithValue }) => {
    try {
      await userService.deletePaymentMethod(paymentMethodId);
      return paymentMethodId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete payment method');
    }
  }
);

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setDefaultAddress: (state, action: PayloadAction<Address>) => {
      state.defaultAddress = action.payload;
      
      // Update isDefault flag for all addresses
      state.addresses = state.addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === action.payload.id,
      }));
    },
    setDefaultPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      state.defaultPaymentMethod = action.payload;
      
      // Update isDefault flag for all payment methods
      state.paymentMethods = state.paymentMethods.map(pm => ({
        ...pm,
        isDefault: pm.id === action.payload.id,
      }));
    },
    resetUserState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch addresses
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = action.payload;
        state.defaultAddress = action.payload.find((addr: Address) => addr.isDefault) || null;
        state.error = null;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add address
    builder
      .addCase(addAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses.push(action.payload);
        
        if (action.payload.isDefault) {
          state.defaultAddress = action.payload;
        }
        
        state.error = null;
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update address
    builder
      .addCase(updateAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedAddress = action.payload;
        const index = state.addresses.findIndex(addr => addr.id === updatedAddress.id);
        
        if (index >= 0) {
          state.addresses[index] = updatedAddress;
          
          if (updatedAddress.isDefault) {
            state.defaultAddress = updatedAddress;
          }
        }
        
        state.error = null;
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete address
    builder
      .addCase(deleteAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedId = action.payload;
        
        state.addresses = state.addresses.filter(addr => addr.id !== deletedId);
        
        if (state.defaultAddress?.id === deletedId) {
          state.defaultAddress = null;
        }
        
        state.error = null;
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch payment methods
    builder
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentMethods = action.payload;
        state.defaultPaymentMethod = action.payload.find((pm: PaymentMethod) => pm.isDefault) || null;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add payment method
    builder
      .addCase(addPaymentMethod.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addPaymentMethod.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentMethods.push(action.payload);
        
        if (action.payload.isDefault) {
          state.defaultPaymentMethod = action.payload;
        }
        
        state.error = null;
      })
      .addCase(addPaymentMethod.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete payment method
    builder
      .addCase(deletePaymentMethod.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePaymentMethod.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedId = action.payload;
        
        state.paymentMethods = state.paymentMethods.filter(pm => pm.id !== deletedId);
        
        if (state.defaultPaymentMethod?.id === deletedId) {
          state.defaultPaymentMethod = null;
        }
        
        state.error = null;
      })
      .addCase(deletePaymentMethod.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  clearError,
  setDefaultAddress,
  setDefaultPaymentMethod,
  resetUserState,
} = userSlice.actions;

// Export reducer
export default userSlice.reducer;

// Selectors
export const selectAddresses = (state: { user: UserState }) => state.user.addresses;
export const selectPaymentMethods = (state: { user: UserState }) => state.user.paymentMethods;
export const selectDefaultAddress = (state: { user: UserState }) => state.user.defaultAddress;
export const selectDefaultPaymentMethod = (state: { user: UserState }) => state.user.defaultPaymentMethod;
export const selectUserLoading = (state: { user: UserState }) => state.user.isLoading;
export const selectUserError = (state: { user: UserState }) => state.user.error;
