import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  handle: string;
  thumbnail?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  categories: ProductCategory[];
  confectionery?: ProductConfectionery;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  product_id: string;
  inventory_quantity: number;
  price: number;
  compare_at_price?: number;
  weight?: number;
  weight_unit?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  handle: string;
}

export interface ProductConfectionery {
  category_type: string;
  subcategory: string;
  ingredients: string[];
  is_organic: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_sugar_free: boolean;
  shelf_life_days: string;
  storage_instructions: string;
  taste_profile: string;
  texture: string;
}

export interface ProductsState {
  products: Product[];
  featuredProducts: Product[];
  currentProduct: Product | null;
  categories: ProductCategory[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
  filters: {
    category?: string;
    search?: string;
    priceRange?: [number, number];
  };
}

const initialState: ProductsState = {
  products: [],
  featuredProducts: [],
  currentProduct: null,
  categories: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  },
  filters: {},
};

// Note: Mock data removed - now using real API integration

// Async thunks for products operations
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: { limit?: number; offset?: number; q?: string; category_id?: string[] } = {}, { rejectWithValue }) => {
    try {
      // Try to fetch from API Gateway first
      const apiGatewayUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiGatewayUrl}/api/v1/products?` + new URLSearchParams({
        limit: (params.limit || 12).toString(),
        page: Math.floor((params.offset || 0) / (params.limit || 12) + 1).toString(),
        ...(params.q && { search: params.q }),
        ...(params.category_id && { category: params.category_id[0] }) // Use first category for now
      }));

      if (response.ok) {
        const data = await response.json();
        return data.products || [];
      } else {
        throw new Error(`API Gateway responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('API Gateway error:', error);
      throw error;
    }
  }
);

export const getProducts = createAsyncThunk(
  'products/getProducts',
  async ({ page = 1, limit = 20, category, search }: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string
  } = {}, { rejectWithValue }) => {
    try {
      const apiGatewayUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(category && { category }),
        ...(search && { search }),
      });

      const response = await fetch(`${apiGatewayUrl}/api/v1/products?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to get products');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Failed to get products');
    }
  }
);

export const getProduct = createAsyncThunk(
  'products/getProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      const apiGatewayUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiGatewayUrl}/api/v1/products/${productId}`);

      if (!response.ok) {
        throw new Error('Failed to get product');
      }

      const data = await response.json();
      return data.product;
    } catch (error) {
      return rejectWithValue('Failed to get product');
    }
  }
);

export const getCategories = createAsyncThunk(
  'products/getCategories',
  async (_, { rejectWithValue }) => {
    try {
      const apiGatewayUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiGatewayUrl}/api/v1/categories`);

      if (!response.ok) {
        throw new Error('Failed to get categories');
      }

      const data = await response.json();
      return data.categories;
    } catch (error) {
      return rejectWithValue('Failed to get categories');
    }
  }
);

export const getFeaturedProducts = createAsyncThunk(
  'products/getFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const apiGatewayUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      console.log('🔍 Fetching featured products from:', apiGatewayUrl);
      const response = await fetch(`${apiGatewayUrl}/api/v1/products/featured`);

      console.log('📡 Response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to get featured products');
      }

      const data = await response.json();
      console.log('✅ Featured products data:', data);
      return data.products;
    } catch (error) {
      console.error('❌ Featured products error:', error);
      return rejectWithValue('Failed to get featured products');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ProductsState['filters']>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(getProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getFeaturedProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFeaturedProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featuredProducts = action.payload;
      })
      .addCase(getFeaturedProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearFilters, clearError } = productsSlice.actions;
export default productsSlice.reducer;
