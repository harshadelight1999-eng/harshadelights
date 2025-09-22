export interface CartItem {
  id: string
  productId: string
  title: string
  price: number
  quantity: number
  thumbnail?: string
  variant?: {
    id: string
    title: string
    price: number
  }
  metadata?: Record<string, any>
}

export interface Cart {
  id: string
  items: CartItem[]
  total: number
  subtotal: number
  tax: number
  shipping: number
  currency: string
  customerId?: string
  createdAt: Date
  updatedAt: Date
}

export interface AddToCartPayload {
  productId: string
  variantId?: string
  quantity: number
  metadata?: Record<string, any>
}

export interface UpdateCartItemPayload {
  id: string
  quantity: number
}

export interface RemoveFromCartPayload {
  id: string
}