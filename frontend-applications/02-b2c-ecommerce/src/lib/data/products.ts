import medusa from "@/lib/medusa"
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

export const getProductsList = cache(async (params: ProductParams = {}) => {
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
    if (params.collection_id) {
      params.collection_id.forEach(id => queryParams.append('collection_id', id));
    }
    if (params.region_id) queryParams.append('region_id', params.region_id);

    const response = await fetch(`${API_GATEWAY_URL}/api/v1/products/medusa?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store' // Disable caching for real-time data
    });

    if (response.ok) {
      const data = await response.json();
      return {
        products: data.products || [],
        pagination: {
          count: data.count || 0,
          offset: data.offset || 0,
          limit: data.limit || 12,
          hasMore: (data.offset + data.limit) < data.count,
          totalPages: Math.ceil((data.count || 0) / (data.limit || 12))
        }
      }
    } else {
      // Try direct Medusa call if API Gateway fails
      console.warn('API Gateway request failed, trying direct Medusa connection');
      throw new Error('API Gateway unavailable');
    }
  } catch (error) {
    console.error('Error fetching products from API Gateway:', error);
    
    // Try direct Medusa call as backup
    try {
      console.log('Attempting direct Medusa connection...');
      const response = await medusa.store.product.list({
        limit: params.limit || 12,
        offset: params.offset || 0,
        order: params.order,
        q: params.q,
        category_id: params.category_id,
        collection_id: params.collection_id,
        region_id: params.region_id,
      })

      const { products, count, offset, limit } = response;

      return {
        products,
        pagination: {
          count,
          offset,
          limit,
          hasMore: (offset + limit) < count,
          totalPages: Math.ceil(count / (limit || 12))
        }
      }
    } catch (medusaError) {
      console.error('Error fetching products from Medusa directly:', medusaError)
      throw new Error('Both API Gateway and Medusa backend are unavailable')
    }
  }
})

export const getProduct = cache(async (id: string) => {
  try {
    const { product } = await medusa.store.product.retrieve(id)
    return product
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
})

export const getProductByHandle = cache(async (handle: string) => {
  try {
    const { products } = await medusa.store.product.list({ handle })
    return products[0] || null
  } catch (error) {
    console.error('Error fetching product by handle:', error)
    return null
  }
})

export const getProductCategories = cache(async () => {
  try {
    // Try API Gateway first
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
      console.warn('API Gateway categories request failed, falling back to direct Medusa');
      throw new Error('API Gateway unavailable');
    }
  } catch (error) {
    console.error('Error fetching categories from API Gateway:', error);
    
    // Fallback to direct Medusa call
    try {
      const { product_categories } = await medusa.store.category.list()
      return product_categories
    } catch (medusaError) {
      console.error('Error fetching categories from Medusa:', medusaError)
      return []
    }
  }
})

export const getCollections = cache(async () => {
  try {
    const { collections } = await medusa.store.collection.list()
    return collections
  } catch (error) {
    console.error('Error fetching collections:', error)
    return []
  }
})

export const getFeaturedProducts = cache(async (limit: number = 8) => {
  try {
    const { products } = await medusa.store.product.list({
      limit,
      is_giftcard: false,
    })
    return products
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
})

export const searchProducts = cache(async (query: string, limit: number = 20) => {
  try {
    const { products } = await medusa.store.product.list({
      q: query,
      limit,
    })
    return products
  } catch (error) {
    console.error('Error searching products:', error)
    return []
  }
})