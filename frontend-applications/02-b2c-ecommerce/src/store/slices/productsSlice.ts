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
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  handle: string;
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

// Enhanced mock data for development - Complete confectionery catalog
const mockProducts: Product[] = [
  // Premium Sweets Collection
  {
    id: '1',
    title: 'Premium Kaju Katli',
    description: 'Handcrafted cashew diamonds made with pure ghee and silver leaf',
    handle: 'premium-kaju-katli',
    thumbnail: '/api/placeholder/300/300',
    images: [],
    variants: [
      { id: '1-v1', title: '250g Box', product_id: '1', inventory_quantity: 50, price: 450, compare_at_price: 500, created_at: '', updated_at: '' },
      { id: '1-v2', title: '500g Box', product_id: '1', inventory_quantity: 30, price: 850, compare_at_price: 950, created_at: '', updated_at: '' }
    ],
    categories: [{ id: 'c1', name: 'Sweets', handle: 'sweets' }],
    created_at: '',
    updated_at: ''
  },
  {
    id: '2',
    title: 'Royal Gulab Jamun',
    description: 'Soft milk solids in aromatic cardamom sugar syrup',
    handle: 'royal-gulab-jamun',
    thumbnail: '/api/placeholder/300/300',
    images: [],
    variants: [
      { id: '2-v1', title: '12 pieces', product_id: '2', inventory_quantity: 40, price: 320, created_at: '', updated_at: '' },
      { id: '2-v2', title: '24 pieces', product_id: '2', inventory_quantity: 25, price: 600, created_at: '', updated_at: '' }
    ],
    categories: [{ id: 'c1', name: 'Sweets', handle: 'sweets' }],
    created_at: '',
    updated_at: ''
  },
  {
    id: '3',
    title: 'Assorted Mithai Box',
    description: 'Premium collection of 8 traditional sweets',
    handle: 'assorted-mithai-box',
    thumbnail: '/api/placeholder/300/300',
    images: [],
    variants: [{ id: '3-v1', title: '1kg Mixed Box', product_id: '3', inventory_quantity: 20, price: 1200, compare_at_price: 1400, created_at: '', updated_at: '' }],
    categories: [{ id: 'c1', name: 'Sweets', handle: 'sweets' }, { id: 'c4', name: 'Gift Boxes', handle: 'gift-boxes' }],
    created_at: '',
    updated_at: ''
  },
  
  // Savory Snacks Collection
  {
    id: '4',
    title: 'Crispy Samosa',
    description: 'Golden triangular pastry with spiced potato and pea filling',
    handle: 'crispy-samosa',
    thumbnail: '/api/placeholder/300/300',
    images: [],
    variants: [
      { id: '4-v1', title: '6 pieces', product_id: '4', inventory_quantity: 100, price: 120, created_at: '', updated_at: '' },
      { id: '4-v2', title: '12 pieces', product_id: '4', inventory_quantity: 80, price: 220, created_at: '', updated_at: '' }
    ],
    categories: [{ id: 'c2', name: 'Snacks', handle: 'snacks' }],
    created_at: '',
    updated_at: ''
  },
  {
    id: '5',
    title: 'Bombay Mix',
    description: 'Crunchy blend of lentils, nuts, and spices',
    handle: 'bombay-mix',
    thumbnail: '/api/placeholder/300/300',
    images: [],
    variants: [
      { id: '5-v1', title: '200g Pack', product_id: '5', inventory_quantity: 60, price: 180, created_at: '', updated_at: '' },
      { id: '5-v2', title: '500g Pack', product_id: '5', inventory_quantity: 35, price: 420, created_at: '', updated_at: '' }
    ],
    categories: [{ id: 'c2', name: 'Snacks', handle: 'snacks' }],
    created_at: '',
    updated_at: ''
  },
  {
    id: '6',
    title: 'Masala Peanuts',
    description: 'Roasted peanuts with aromatic Indian spices',
    handle: 'masala-peanuts',
    thumbnail: '/api/placeholder/300/300',
    images: [],
    variants: [{ id: '6-v1', title: '250g Pack', product_id: '6', inventory_quantity: 75, price: 150, created_at: '', updated_at: '' }],
    categories: [{ id: 'c2', name: 'Snacks', handle: 'snacks' }],
    created_at: '',
    updated_at: ''
  },

  // Beverages Collection
  {
    id: '7',
    title: 'Premium Masala Chai',
    description: 'Authentic blend of black tea with cardamom, ginger, and spices',
    handle: 'premium-masala-chai',
    thumbnail: '/api/placeholder/300/300',
    images: [],
    variants: [
      { id: '7-v1', title: '100g Loose Tea', product_id: '7', inventory_quantity: 90, price: 250, created_at: '', updated_at: '' },
      { id: '7-v2', title: '25 Tea Bags', product_id: '7', inventory_quantity: 70, price: 180, created_at: '', updated_at: '' }
    ],
    categories: [{ id: 'c3', name: 'Beverages', handle: 'beverages' }],
    created_at: '',
    updated_at: ''
  },
  {
    id: '8',
    title: 'Kulfi Falooda Mix',
    description: 'Traditional Indian dessert drink mix with rose and cardamom',
    handle: 'kulfi-falooda-mix',
    thumbnail: '/api/placeholder/300/300',
    images: [],
    variants: [{ id: '8-v1', title: '200g Pack', product_id: '8', inventory_quantity: 45, price: 320, created_at: '', updated_at: '' }],
    categories: [{ id: 'c3', name: 'Beverages', handle: 'beverages' }],
    created_at: '',
    updated_at: ''
  },

  // Gift Boxes Collection
  {
    id: '9',
    title: 'Festival Special Gift Box',
    description: 'Curated selection of sweets and snacks for celebrations',
    handle: 'festival-special-gift-box',
    thumbnail: '/api/placeholder/300/300',
    images: [],
    variants: [
      { id: '9-v1', title: 'Small Gift Box', product_id: '9', inventory_quantity: 25, price: 800, created_at: '', updated_at: '' },
      { id: '9-v2', title: 'Large Gift Box', product_id: '9', inventory_quantity: 15, price: 1500, created_at: '', updated_at: '' }
    ],
    categories: [{ id: 'c4', name: 'Gift Boxes', handle: 'gift-boxes' }],
    created_at: '',
    updated_at: ''
  },
  {
    id: '10',
    title: 'Corporate Gift Hamper',
    description: 'Professional presentation box with premium sweets and snacks',
    handle: 'corporate-gift-hamper',
    thumbnail: '/api/placeholder/300/300',
    images: [],
    variants: [{ id: '10-v1', title: 'Executive Hamper', product_id: '10', inventory_quantity: 12, price: 2200, compare_at_price: 2500, created_at: '', updated_at: '' }],
    categories: [{ id: 'c4', name: 'Gift Boxes', handle: 'gift-boxes' }],
    created_at: '',
    updated_at: ''
  },

  // Seasonal Specials
  {
    id: '11',
    title: 'Diwali Special Dry Fruits',
    description: 'Premium almonds, cashews, and pistachios in decorative box',
    handle: 'diwali-special-dry-fruits',
    thumbnail: '/api/placeholder/300/300',
    images: [],
    variants: [{ id: '11-v1', title: '500g Mixed Pack', product_id: '11', inventory_quantity: 30, price: 1800, created_at: '', updated_at: '' }],
    categories: [{ id: 'c4', name: 'Gift Boxes', handle: 'gift-boxes' }],
    created_at: '',
    updated_at: ''
  },
  {
    id: '12',
    title: 'Holi Color Sweets',
    description: 'Colorful traditional sweets for Holi celebration',
    handle: 'holi-color-sweets',
    thumbnail: '/api/placeholder/300/300',
    images: [],
    variants: [{ id: '12-v1', title: 'Celebration Pack', product_id: '12', inventory_quantity: 20, price: 650, created_at: '', updated_at: '' }],
    categories: [{ id: 'c1', name: 'Sweets', handle: 'sweets' }],
    created_at: '',
    updated_at: ''
  }
];

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
        return data.products || mockProducts;
      } else {
        // Fallback to mock data
        console.warn('API Gateway not available, using mock data');
        return mockProducts;
      }
    } catch (error) {
      // Fallback to mock data if API Gateway is not available
      console.warn('API Gateway error, using mock data:', error);
      return mockProducts;
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
      const response = await fetch(`${apiGatewayUrl}/api/v1/products/featured`);

      if (!response.ok) {
        throw new Error('Failed to get featured products');
      }

      const data = await response.json();
      return data.products;
    } catch (error) {
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
