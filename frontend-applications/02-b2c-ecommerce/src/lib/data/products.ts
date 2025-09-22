import medusa from "@/lib/medusa"
import { cache } from "react"

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
    const { products, count, offset, limit } = await medusa.store.product.list({
      limit: params.limit || 12,
      offset: params.offset || 0,
      order: params.order,
      q: params.q,
      category_id: params.category_id,
      collection_id: params.collection_id,
      tags: params.tags,
      region_id: params.region_id,
    })

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
  } catch (error) {
    console.error('Error fetching products:', error)
    return {
      products: [],
      pagination: {
        count: 0,
        offset: 0,
        limit: 12,
        hasMore: false,
        totalPages: 0
      }
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
    const { product_categories } = await medusa.store.productCategory.list()
    return product_categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
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