// Products slice for Redux store

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, ProductCategory, ProductSubcategory, SearchFilters, ApiResponse, Review } from '../../types';
import { productService } from '../../services/productService';

// Products state interface
interface ProductsState {
  products: Product[];
  featuredProducts: Product[];
  trendingProducts: Product[];
  categories: ProductCategory[];
  subcategories: ProductSubcategory[];
  currentProduct: Product | null;
  searchResults: Product[];
  searchQuery: string;
  searchFilters: SearchFilters;
  recommendations: Product[];
  recentlyViewed: Product[];
  isLoading: boolean;
  isFeaturedLoading: boolean;
  isTrendingLoading: boolean;
  isCategoriesLoading: boolean;
  isSearchLoading: boolean;
  isRecommendationsLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Initial state
const initialState: ProductsState = {
  products: [],
  featuredProducts: [],
  trendingProducts: [],
  categories: [],
  subcategories: [],
  currentProduct: null,
  searchResults: [],
  searchQuery: '',
  searchFilters: {},
  recommendations: [],
  recentlyViewed: [],
  isLoading: false,
  isFeaturedLoading: false,
  isTrendingLoading: false,
  isCategoriesLoading: false,
  isSearchLoading: false,
  isRecommendationsLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  searchPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks for product operations
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: { page?: number; limit?: number; categoryId?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getProducts(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await productService.getProductById(productId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getFeaturedProducts();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured products');
    }
  }
);

export const fetchTrendingProducts = createAsyncThunk(
  'products/fetchTrendingProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getTrendingProducts();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trending products');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getCategories();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchSubcategories = createAsyncThunk(
  'products/fetchSubcategories',
  async (categoryId?: string, { rejectWithValue }) => {
    try {
      const response = await productService.getSubcategories(categoryId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subcategories');
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (
    params: {
      query: string;
      filters?: SearchFilters;
      page?: number;
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await productService.searchProducts(params);
      return { ...response.data, query: params.query, filters: params.filters };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const fetchRecommendations = createAsyncThunk(
  'products/fetchRecommendations',
  async (productId?: string, { rejectWithValue }) => {
    try {
      const response = await productService.getRecommendations(productId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recommendations');
    }
  }
);

export const fetchProductReviews = createAsyncThunk(
  'products/fetchProductReviews',
  async (
    params: { productId: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await productService.getProductReviews(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

// Products slice
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSearchFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.searchFilters = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
      state.searchFilters = {};
      state.searchPagination = {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
    },
    addToRecentlyViewed: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      const existingIndex = state.recentlyViewed.findIndex(p => p.id === product.id);

      if (existingIndex >= 0) {
        // Move to front if already exists
        state.recentlyViewed.splice(existingIndex, 1);
      }

      // Add to front and limit to 10 items
      state.recentlyViewed.unshift(product);
      state.recentlyViewed = state.recentlyViewed.slice(0, 10);
    },
    clearRecentlyViewed: (state) => {
      state.recentlyViewed = [];
    },
    setCurrentProduct: (state, action: PayloadAction<Product | null>) => {
      state.currentProduct = action.payload;
    },
    updateProductRating: (state, action: PayloadAction<{ productId: string; newRating: number; newReviewCount: number }>) => {
      const { productId, newRating, newReviewCount } = action.payload;

      // Update in products array
      const productIndex = state.products.findIndex(p => p.id === productId);
      if (productIndex >= 0) {
        state.products[productIndex].ratings.average = newRating;
        state.products[productIndex].ratings.totalReviews = newReviewCount;
      }

      // Update in featured products
      const featuredIndex = state.featuredProducts.findIndex(p => p.id === productId);
      if (featuredIndex >= 0) {
        state.featuredProducts[featuredIndex].ratings.average = newRating;
        state.featuredProducts[featuredIndex].ratings.totalReviews = newReviewCount;
      }

      // Update in trending products
      const trendingIndex = state.trendingProducts.findIndex(p => p.id === productId);
      if (trendingIndex >= 0) {
        state.trendingProducts[trendingIndex].ratings.average = newRating;
        state.trendingProducts[trendingIndex].ratings.totalReviews = newReviewCount;
      }

      // Update in search results
      const searchIndex = state.searchResults.findIndex(p => p.id === productId);
      if (searchIndex >= 0) {
        state.searchResults[searchIndex].ratings.average = newRating;
        state.searchResults[searchIndex].ratings.totalReviews = newReviewCount;
      }

      // Update current product
      if (state.currentProduct?.id === productId) {
        state.currentProduct.ratings.average = newRating;
        state.currentProduct.ratings.totalReviews = newReviewCount;
      }
    },
    resetProductsState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        const { products, pagination } = action.payload;

        if (pagination.page === 1) {
          state.products = products;
        } else {
          state.products.push(...products);
        }

        state.pagination = pagination;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch product by ID
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch featured products
    builder
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.isFeaturedLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.isFeaturedLoading = false;
        state.featuredProducts = action.payload;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.isFeaturedLoading = false;
        state.error = action.payload as string;
      });

    // Fetch trending products
    builder
      .addCase(fetchTrendingProducts.pending, (state) => {
        state.isTrendingLoading = true;
        state.error = null;
      })
      .addCase(fetchTrendingProducts.fulfilled, (state, action) => {
        state.isTrendingLoading = false;
        state.trendingProducts = action.payload;
        state.error = null;
      })
      .addCase(fetchTrendingProducts.rejected, (state, action) => {
        state.isTrendingLoading = false;
        state.error = action.payload as string;
      });

    // Fetch categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isCategoriesLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isCategoriesLoading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isCategoriesLoading = false;
        state.error = action.payload as string;
      });

    // Fetch subcategories
    builder
      .addCase(fetchSubcategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubcategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subcategories = action.payload;
        state.error = null;
      })
      .addCase(fetchSubcategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search products
    builder
      .addCase(searchProducts.pending, (state) => {
        state.isSearchLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isSearchLoading = false;
        const { products, pagination, query, filters } = action.payload;

        if (pagination.page === 1) {
          state.searchResults = products;
        } else {
          state.searchResults.push(...products);
        }

        state.searchPagination = pagination;
        state.searchQuery = query;
        state.searchFilters = filters || {};
        state.error = null;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isSearchLoading = false;
        state.error = action.payload as string;
      });

    // Fetch recommendations
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        state.isRecommendationsLoading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.isRecommendationsLoading = false;
        state.recommendations = action.payload;
        state.error = null;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.isRecommendationsLoading = false;
        state.error = action.payload as string;
      });

    // Fetch product reviews (handled in current product)
    builder
      .addCase(fetchProductReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        // Reviews are typically handled in a separate reviews slice
        // or stored within the current product
        state.error = null;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  clearError,
  setSearchQuery,
  setSearchFilters,
  clearSearchResults,
  addToRecentlyViewed,
  clearRecentlyViewed,
  setCurrentProduct,
  updateProductRating,
  resetProductsState,
} = productsSlice.actions;

// Export reducer
export default productsSlice.reducer;

// Selectors
export const selectProducts = (state: { products: ProductsState }) => state.products.products;
export const selectFeaturedProducts = (state: { products: ProductsState }) => state.products.featuredProducts;
export const selectTrendingProducts = (state: { products: ProductsState }) => state.products.trendingProducts;
export const selectCategories = (state: { products: ProductsState }) => state.products.categories;
export const selectSubcategories = (state: { products: ProductsState }) => state.products.subcategories;
export const selectCurrentProduct = (state: { products: ProductsState }) => state.products.currentProduct;
export const selectSearchResults = (state: { products: ProductsState }) => state.products.searchResults;
export const selectSearchQuery = (state: { products: ProductsState }) => state.products.searchQuery;
export const selectSearchFilters = (state: { products: ProductsState }) => state.products.searchFilters;
export const selectRecommendations = (state: { products: ProductsState }) => state.products.recommendations;
export const selectRecentlyViewed = (state: { products: ProductsState }) => state.products.recentlyViewed;
export const selectProductsLoading = (state: { products: ProductsState }) => state.products.isLoading;
export const selectFeaturedLoading = (state: { products: ProductsState }) => state.products.isFeaturedLoading;
export const selectTrendingLoading = (state: { products: ProductsState }) => state.products.isTrendingLoading;
export const selectCategoriesLoading = (state: { products: ProductsState }) => state.products.isCategoriesLoading;
export const selectSearchLoading = (state: { products: ProductsState }) => state.products.isSearchLoading;
export const selectRecommendationsLoading = (state: { products: ProductsState }) => state.products.isRecommendationsLoading;
export const selectProductsError = (state: { products: ProductsState }) => state.products.error;
export const selectPagination = (state: { products: ProductsState }) => state.products.pagination;
export const selectSearchPagination = (state: { products: ProductsState }) => state.products.searchPagination;