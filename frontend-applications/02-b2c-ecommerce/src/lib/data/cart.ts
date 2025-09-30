import medusa from "@/lib/medusa"
import { cache } from "react"

export type CartWithCheckoutStep = any & {
  checkout_step: "address" | "delivery" | "payment" | "review"
}

export const getCart = cache(async (cartId: string) => {
  try {
    const cart = await medusa.store.cart.retrieve(cartId)
    return cart
  } catch (error) {
    console.error('Error fetching cart:', error)
    return null
  }
})

export const createCart = async (regionId?: string) => {
  try {
    const { cart } = await medusa.store.cart.create({
      region_id: regionId,
    })
    return cart
  } catch (error) {
    console.error('Error creating cart:', error)
    throw error
  }
}

export const addToCart = async (cartId: string, items: any[]) => {
  try {
    const { cart } = await medusa.store.cart.createLineItem(cartId, items[0])
    return cart
  } catch (error) {
    console.error('Error adding to cart:', error)
    throw error
  }
}

export const updateLineItem = async (
  cartId: string,
  lineId: string,
  quantity: number
) => {
  try {
    const { cart } = await medusa.store.cart.updateLineItem(cartId, lineId, {
      quantity,
    })
    return cart
  } catch (error) {
    console.error('Error updating line item:', error)
    throw error
  }
}

export const removeLineItem = async (cartId: string, lineId: string) => {
  try {
    const response = await medusa.store.cart.deleteLineItem(cartId, lineId)
    return response
  } catch (error) {
    console.error('Error removing line item:', error)
    throw error
  }
}

export const addShippingMethod = async (cartId: string, shippingMethodId: string) => {
  try {
    const { cart } = await medusa.store.cart.addShippingMethod(cartId, {
      option_id: shippingMethodId,
    })
    return cart
  } catch (error) {
    console.error('Error adding shipping method:', error)
    throw error
  }
}

export const addPaymentMethod = async (cartId: string, providerId: string) => {
  try {
    // For now, use a simple approach while the Medusa v2 payment API stabilizes
    // TODO: Update to proper Medusa v2 payment session API when available
    const { cart } = await medusa.store.cart.retrieve(cartId)
    
    // In a real implementation, you would:
    // 1. Create payment sessions via the correct Medusa v2 API
    // 2. Handle payment provider setup
    // 3. Return the updated cart with payment session
    
    console.log(`Setting up payment method ${providerId} for cart ${cartId}`)
    return cart
  } catch (error) {
    console.error('Error adding payment method:', error)
    throw error
  }
}

export const completeCart = async (cartId: string) => {
  try {
    const response = await medusa.store.cart.complete(cartId)
    return response
  } catch (error) {
    console.error('Error completing cart:', error)
    throw error
  }
}

export const initiatePaymentSession = async (cartId: string, providerId: string) => {
  try {
    // For now, use a simple approach while the Medusa v2 payment API stabilizes
    // TODO: Update to proper Medusa v2 payment session API when available
    const { cart } = await medusa.store.cart.retrieve(cartId)
    
    // In a real implementation, you would:
    // 1. Initialize payment sessions via the correct Medusa v2 API
    // 2. Set up the payment provider (Stripe, etc.)
    // 3. Return the payment session details
    
    console.log(`Initiating payment session with ${providerId} for cart ${cartId}`)
    return cart
  } catch (error) {
    console.error('Error initiating payment session:', error)
    throw error
  }
}

export const getShippingOptions = async (cartId: string) => {
  try {
    // For now, use a simple approach while the Medusa v2 shipping API stabilizes
    // TODO: Update to proper Medusa v2 shipping options API when available
    const { cart } = await medusa.store.cart.retrieve(cartId)
    
    // In a real implementation, you would:
    // 1. Get shipping options via the correct Medusa v2 API
    // 2. Calculate shipping costs based on cart contents and destination
    // 3. Return available shipping methods
    
    console.log(`Getting shipping options for cart ${cartId}`)
    
    // Return mock shipping options for now
    return [
      {
        id: 'standard',
        name: 'Standard Delivery',
        price: 500, // ₹5 in paisa
        description: '3-5 business days'
      },
      {
        id: 'express',
        name: 'Express Delivery', 
        price: 1000, // ₹10 in paisa
        description: '1-2 business days'
      }
    ]
  } catch (error) {
    console.error('Error fetching shipping options:', error)
    return []
  }
}

export const updateBillingAddress = async (cartId: string, address: any) => {
  try {
    const { cart } = await medusa.store.cart.update(cartId, {
      billing_address: address,
    })
    return cart
  } catch (error) {
    console.error('Error updating billing address:', error)
    throw error
  }
}

export const updateShippingAddress = async (cartId: string, address: any) => {
  try {
    const { cart } = await medusa.store.cart.update(cartId, {
      shipping_address: address,
    })
    return cart
  } catch (error) {
    console.error('Error updating shipping address:', error)
    throw error
  }
}

export const setAddresses = async (cartId: string, addresses: { shipping?: any, billing?: any }) => {
  try {
    const promises = []
    
    if (addresses.shipping) {
      promises.push(updateShippingAddress(cartId, addresses.shipping))
    }
    
    if (addresses.billing) {
      promises.push(updateBillingAddress(cartId, addresses.billing))
    }
    
    await Promise.all(promises)
    return true
  } catch (error) {
    console.error('Error setting addresses:', error)
    throw error
  }
}

export const applyPromotions = async (codes: string[]) => {
  try {
    // Note: This would need to be updated with actual cart ID from context
    // For now, implementing a basic structure
    const response = await medusa.store.cart.update('cart_id', {
      promo_codes: codes,
    })
    return response.cart
  } catch (error) {
    console.error('Error applying promotions:', error)
    throw error
  }
}

export const placeOrder = async () => {
  try {
    // Note: This would need actual cart ID from context
    const response = await medusa.store.cart.complete('cart_id')
    return response
  } catch (error) {
    console.error('Error placing order:', error)
    throw error
  }
}

export const setShippingMethod = async (cartId: string, shippingMethodId: string) => {
  try {
    const { cart } = await medusa.store.cart.addShippingMethod(cartId, {
      option_id: shippingMethodId,
    })
    return cart
  } catch (error) {
    console.error('Error setting shipping method:', error)
    throw error
  }
}