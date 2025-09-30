import { cache } from "react"

// API Gateway configuration
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3001'

export type ProductParams = {
  limit?: number
  offset?: number
  order?: string
  q?: string
  category_id?: string[]
  collection_id?: string[]
  tags?: string[]
  region_id?: string
}

// Import types from the main types file
import { ProductWithPricing } from '@/types'

export const getB2BProductsList = cache(async (params: ProductParams = {}): Promise<{
  products: ProductWithPricing[]
  pagination: {
    count: number
    offset: number
    limit: number
    hasMore: boolean
    totalPages: number
  }
}> => {
  try {
    // Try API Gateway first (with Medusa proxy)
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.order) queryParams.append('order', params.order);
    if (params.q) queryParams.append('q', params.q);
    if (params.category_id) {
      params.category_id.forEach(id => queryParams.append('category_id', id));
    }

    const response = await fetch(`${API_GATEWAY_URL}/api/v1/products/medusa?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (response.ok) {
      const data = await response.json();
      const products = data.products || [];
      
      // Transform Medusa products to B2B format
      const b2bProducts: ProductWithPricing[] = products.map((product: any) => ({
        id: product.id,
        sku: product.handle?.toUpperCase() || `HD-${product.id.slice(0, 8).toUpperCase()}`,
        name: product.title,
        description: product.description || '',
        category: product.categories?.[0]?.name || 'General',
        images: product.images?.map((img: any) => img.url) || [product.thumbnail] || [],
        basePrice: product.variants?.[0]?.price || 0,
        customerPrice: Math.round((product.variants?.[0]?.price || 0) * 0.9), // 10% B2B discount
        discount: 10,
        discountType: 'percentage' as const,
        unit: product.variants?.[0]?.weight_unit || 'piece',
        minimumOrderQuantity: 5, // B2B minimum
        inStock: (product.variants?.[0]?.inventory_quantity || 0) > 0,
        stockQuantity: product.variants?.[0]?.inventory_quantity || 0,
        specifications: {
          'Shelf Life': product.confectionery?.shelf_life_days ? `${product.confectionery.shelf_life_days} days` : 'N/A',
          'Storage': product.confectionery?.storage_instructions || 'Store in cool, dry place',
          'Weight': product.variants?.[0]?.weight ? `${product.variants[0].weight}${product.variants[0].weight_unit}` : 'N/A',
          'Ingredients': product.confectionery?.ingredients?.join(', ') || 'See packaging'
        },
        createdAt: product.created_at || new Date().toISOString(),
        updatedAt: product.updated_at || new Date().toISOString()
      }));

      return {
        products: b2bProducts,
        pagination: {
          count: data.count || b2bProducts.length,
          offset: data.offset || 0,
          limit: data.limit || 12,
          hasMore: (data.offset + data.limit) < data.count,
          totalPages: Math.ceil((data.count || b2bProducts.length) / (data.limit || 12))
        }
      }
    } else {
      throw new Error(`API Gateway responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching B2B products from API Gateway:', error);
    throw new Error('Failed to fetch products from backend services')
  }
})

export const getB2BProduct = cache(async (id: string): Promise<ProductWithPricing | null> => {
  try {
    const response = await fetch(`${API_GATEWAY_URL}/api/v1/products/medusa/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (response.ok) {
      const data = await response.json();
      const product = data.product;
      
      if (!product) return null;

      // Transform to B2B format
      return {
        id: product.id,
        sku: product.handle?.toUpperCase() || `HD-${product.id.slice(0, 8).toUpperCase()}`,
        name: product.title,
        description: product.description || '',
        category: product.categories?.[0]?.name || 'General',
        images: product.images?.map((img: any) => img.url) || [product.thumbnail] || [],
        basePrice: product.variants?.[0]?.price || 0,
        customerPrice: Math.round((product.variants?.[0]?.price || 0) * 0.9),
        discount: 10,
        discountType: 'percentage' as const,
        unit: product.variants?.[0]?.weight_unit || 'piece',
        minimumOrderQuantity: 5,
        inStock: (product.variants?.[0]?.inventory_quantity || 0) > 0,
        stockQuantity: product.variants?.[0]?.inventory_quantity || 0,
        specifications: {
          'Shelf Life': product.confectionery?.shelf_life_days ? `${product.confectionery.shelf_life_days} days` : 'N/A',
          'Storage': product.confectionery?.storage_instructions || 'Store in cool, dry place',
          'Weight': product.variants?.[0]?.weight ? `${product.variants[0].weight}${product.variants[0].weight_unit}` : 'N/A',
          'Ingredients': product.confectionery?.ingredients?.join(', ') || 'See packaging'
        },
        createdAt: product.created_at || new Date().toISOString(),
        updatedAt: product.updated_at || new Date().toISOString()
      };
    } else {
      throw new Error(`API Gateway responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching B2B product:', error);
    return null;
  }
})

export const getB2BProductCategories = cache(async () => {
  try {
    const response = await fetch(`${API_GATEWAY_URL}/api/v1/products/medusa/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (response.ok) {
      const data = await response.json();
      return data.product_categories || [];
    } else {
      throw new Error(`API Gateway responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching B2B categories:', error);
    return [];
  }
})