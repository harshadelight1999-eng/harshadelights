/**
 * Products API Service
 * Handles product catalog, inventory, and product-related operations
 */

import { ApiClient, ApiResponse } from './client';
import {
  Product,
  ProductCategory,
  ProductStatus,
  PaginatedResponse,
  ApiFilters,
} from '../../types/business';

export interface ProductFilters extends ApiFilters {
  category?: ProductCategory;
  status?: ProductStatus;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isOrganic?: boolean;
  priceMin?: number; // in paise
  priceMax?: number; // in paise
  inStock?: boolean;
  tags?: string[];
}

export interface CreateProductData {
  title: string;
  description: string;
  category: ProductCategory;
  subCategory?: string;
  images: string[];
  ingredients: string[];
  allergens: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar: number;
  };
  shelfLife: number;
  storageInstructions: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isOrganic: boolean;
  minimumOrderQuantity: number;
  maxOrderQuantity?: number;
  variants: Array<{
    sku: string;
    weight: number;
    unit: 'piece' | 'kg' | 'gram' | 'box' | 'packet';
    price: number; // in paise
    compareAtPrice?: number; // in paise
    costPrice: number; // in paise
    barcode?: string;
    lowStockThreshold: number;
  }>;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface ProductSearchResponse {
  products: Product[];
  facets: {
    categories: Array<{ category: ProductCategory; count: number }>;
    priceRanges: Array<{ min: number; max: number; count: number }>;
    tags: Array<{ tag: string; count: number }>;
    dietary: {
      vegetarian: number;
      vegan: number;
      glutenFree: number;
      organic: number;
    };
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductRecommendations {
  relatedProducts: Product[];
  frequentlyBoughtTogether: Product[];
  similarProducts: Product[];
}

export interface ProductReview {
  id: string;
  customerId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  createdAt: string;
}

export interface CreateReviewData {
  rating: number;
  title: string;
  comment: string;
  images?: string[];
}

export class ProductsService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Get paginated list of products
   */
  async getProducts(filters?: ProductFilters): Promise<ApiResponse<PaginatedResponse<Product>>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';

    return this.apiClient.get<PaginatedResponse<Product>>(endpoint);
  }

  /**
   * Get single product by ID
   */
  async getProduct(productId: string): Promise<ApiResponse<Product>> {
    return this.apiClient.get<Product>(`/products/${productId}`);
  }

  /**
   * Get product by slug
   */
  async getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
    return this.apiClient.get<Product>(`/products/slug/${slug}`);
  }

  /**
   * Search products with advanced filtering
   */
  async searchProducts(
    query: string,
    filters?: ProductFilters
  ): Promise<ApiResponse<ProductSearchResponse>> {
    const params = new URLSearchParams({ q: query });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    return this.apiClient.get<ProductSearchResponse>(`/products/search?${params.toString()}`);
  }

  /**
   * Get product recommendations
   */
  async getProductRecommendations(productId: string): Promise<ApiResponse<ProductRecommendations>> {
    return this.apiClient.get<ProductRecommendations>(`/products/${productId}/recommendations`);
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    category: ProductCategory,
    filters?: Omit<ProductFilters, 'category'>
  ): Promise<ApiResponse<PaginatedResponse<Product>>> {
    return this.getProducts({ ...filters, category });
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit?: number): Promise<ApiResponse<Product[]>> {
    const params = limit ? `?limit=${limit}` : '';
    return this.apiClient.get<Product[]>(`/products/featured${params}`);
  }

  /**
   * Get bestselling products
   */
  async getBestsellingProducts(limit?: number): Promise<ApiResponse<Product[]>> {
    const params = limit ? `?limit=${limit}` : '';
    return this.apiClient.get<Product[]>(`/products/bestselling${params}`);
  }

  /**
   * Get new arrivals
   */
  async getNewArrivals(limit?: number): Promise<ApiResponse<Product[]>> {
    const params = limit ? `?limit=${limit}` : '';
    return this.apiClient.get<Product[]>(`/products/new-arrivals${params}`);
  }

  /**
   * Create new product (admin only)
   */
  async createProduct(data: CreateProductData): Promise<ApiResponse<Product>> {
    return this.apiClient.post<Product>('/products', data);
  }

  /**
   * Update product (admin only)
   */
  async updateProduct(productId: string, data: UpdateProductData): Promise<ApiResponse<Product>> {
    return this.apiClient.put<Product>(`/products/${productId}`, data);
  }

  /**
   * Delete product (admin only)
   */
  async deleteProduct(productId: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(`/products/${productId}`);
  }

  /**
   * Update product status (admin only)
   */
  async updateProductStatus(
    productId: string,
    status: ProductStatus
  ): Promise<ApiResponse<Product>> {
    return this.apiClient.patch<Product>(`/products/${productId}/status`, { status });
  }

  /**
   * Upload product images
   */
  async uploadProductImages(productId: string, images: File[]): Promise<ApiResponse<string[]>> {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`image_${index}`, image);
    });

    return this.apiClient.post<string[]>(`/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  /**
   * Delete product image
   */
  async deleteProductImage(productId: string, imageUrl: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(`/products/${productId}/images`, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Get product reviews
   */
  async getProductReviews(
    productId: string,
    filters?: { page?: number; limit?: number; rating?: number }
  ): Promise<ApiResponse<PaginatedResponse<ProductReview>>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/products/${productId}/reviews?${queryString}`
      : `/products/${productId}/reviews`;

    return this.apiClient.get<PaginatedResponse<ProductReview>>(endpoint);
  }

  /**
   * Create product review
   */
  async createProductReview(
    productId: string,
    data: CreateReviewData
  ): Promise<ApiResponse<ProductReview>> {
    return this.apiClient.post<ProductReview>(`/products/${productId}/reviews`, data);
  }

  /**
   * Update product review
   */
  async updateProductReview(
    productId: string,
    reviewId: string,
    data: Partial<CreateReviewData>
  ): Promise<ApiResponse<ProductReview>> {
    return this.apiClient.put<ProductReview>(`/products/${productId}/reviews/${reviewId}`, data);
  }

  /**
   * Delete product review
   */
  async deleteProductReview(productId: string, reviewId: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(`/products/${productId}/reviews/${reviewId}`);
  }

  /**
   * Mark review as helpful
   */
  async markReviewHelpful(productId: string, reviewId: string): Promise<ApiResponse<void>> {
    return this.apiClient.post<void>(`/products/${productId}/reviews/${reviewId}/helpful`);
  }

  /**
   * Get product categories
   */
  async getCategories(): Promise<ApiResponse<Array<{ category: ProductCategory; count: number }>>> {
    return this.apiClient.get<Array<{ category: ProductCategory; count: number }>>('/products/categories');
  }

  /**
   * Get product tags
   */
  async getTags(): Promise<ApiResponse<Array<{ tag: string; count: number }>>> {
    return this.apiClient.get<Array<{ tag: string; count: number }>>('/products/tags');
  }

  /**
   * Check product availability
   */
  async checkAvailability(
    productId: string,
    variantId: string,
    quantity: number
  ): Promise<ApiResponse<{ available: boolean; maxQuantity: number }>> {
    return this.apiClient.get<{ available: boolean; maxQuantity: number }>(
      `/products/${productId}/variants/${variantId}/availability?quantity=${quantity}`
    );
  }
}