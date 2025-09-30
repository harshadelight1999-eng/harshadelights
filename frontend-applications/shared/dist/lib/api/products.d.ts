/**
 * Products API Service
 * Handles product catalog, inventory, and product-related operations
 */
import { ApiClient, ApiResponse } from './client';
import { Product, ProductCategory, ProductStatus, PaginatedResponse, ApiFilters } from '../../types/business';
export interface ProductFilters extends ApiFilters {
    category?: ProductCategory;
    status?: ProductStatus;
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
    isOrganic?: boolean;
    priceMin?: number;
    priceMax?: number;
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
        price: number;
        compareAtPrice?: number;
        costPrice: number;
        barcode?: string;
        lowStockThreshold: number;
    }>;
}
export interface UpdateProductData extends Partial<CreateProductData> {
}
export interface ProductSearchResponse {
    products: Product[];
    facets: {
        categories: Array<{
            category: ProductCategory;
            count: number;
        }>;
        priceRanges: Array<{
            min: number;
            max: number;
            count: number;
        }>;
        tags: Array<{
            tag: string;
            count: number;
        }>;
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
export declare class ProductsService {
    private apiClient;
    constructor(apiClient: ApiClient);
    /**
     * Get paginated list of products
     */
    getProducts(filters?: ProductFilters): Promise<ApiResponse<PaginatedResponse<Product>>>;
    /**
     * Get single product by ID
     */
    getProduct(productId: string): Promise<ApiResponse<Product>>;
    /**
     * Get product by slug
     */
    getProductBySlug(slug: string): Promise<ApiResponse<Product>>;
    /**
     * Search products with advanced filtering
     */
    searchProducts(query: string, filters?: ProductFilters): Promise<ApiResponse<ProductSearchResponse>>;
    /**
     * Get product recommendations
     */
    getProductRecommendations(productId: string): Promise<ApiResponse<ProductRecommendations>>;
    /**
     * Get products by category
     */
    getProductsByCategory(category: ProductCategory, filters?: Omit<ProductFilters, 'category'>): Promise<ApiResponse<PaginatedResponse<Product>>>;
    /**
     * Get featured products
     */
    getFeaturedProducts(limit?: number): Promise<ApiResponse<Product[]>>;
    /**
     * Get bestselling products
     */
    getBestsellingProducts(limit?: number): Promise<ApiResponse<Product[]>>;
    /**
     * Get new arrivals
     */
    getNewArrivals(limit?: number): Promise<ApiResponse<Product[]>>;
    /**
     * Create new product (admin only)
     */
    createProduct(data: CreateProductData): Promise<ApiResponse<Product>>;
    /**
     * Update product (admin only)
     */
    updateProduct(productId: string, data: UpdateProductData): Promise<ApiResponse<Product>>;
    /**
     * Delete product (admin only)
     */
    deleteProduct(productId: string): Promise<ApiResponse<void>>;
    /**
     * Update product status (admin only)
     */
    updateProductStatus(productId: string, status: ProductStatus): Promise<ApiResponse<Product>>;
    /**
     * Upload product images
     */
    uploadProductImages(productId: string, images: File[]): Promise<ApiResponse<string[]>>;
    /**
     * Delete product image
     */
    deleteProductImage(productId: string, imageUrl: string): Promise<ApiResponse<void>>;
    /**
     * Get product reviews
     */
    getProductReviews(productId: string, filters?: {
        page?: number;
        limit?: number;
        rating?: number;
    }): Promise<ApiResponse<PaginatedResponse<ProductReview>>>;
    /**
     * Create product review
     */
    createProductReview(productId: string, data: CreateReviewData): Promise<ApiResponse<ProductReview>>;
    /**
     * Update product review
     */
    updateProductReview(productId: string, reviewId: string, data: Partial<CreateReviewData>): Promise<ApiResponse<ProductReview>>;
    /**
     * Delete product review
     */
    deleteProductReview(productId: string, reviewId: string): Promise<ApiResponse<void>>;
    /**
     * Mark review as helpful
     */
    markReviewHelpful(productId: string, reviewId: string): Promise<ApiResponse<void>>;
    /**
     * Get product categories
     */
    getCategories(): Promise<ApiResponse<Array<{
        category: ProductCategory;
        count: number;
    }>>>;
    /**
     * Get product tags
     */
    getTags(): Promise<ApiResponse<Array<{
        tag: string;
        count: number;
    }>>>;
    /**
     * Check product availability
     */
    checkAvailability(productId: string, variantId: string, quantity: number): Promise<ApiResponse<{
        available: boolean;
        maxQuantity: number;
    }>>;
}
//# sourceMappingURL=products.d.ts.map