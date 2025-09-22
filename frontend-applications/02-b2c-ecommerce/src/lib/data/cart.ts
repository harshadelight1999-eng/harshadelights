import medusa from "@/lib/medusa"
import { cache } from "react"

export type CartWithCheckoutStep = any & {
  checkout_step: "address" | "delivery" | "payment" | "review"
}

export const getCart = cache(async (cartId: string) => {
  try {
    const { cart } = await medusa.store.cart.retrieve(cartId)
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
    const { cart } = await medusa.store.cart.lineItem.create(cartId, items)
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
    const { cart } = await medusa.store.cart.lineItem.update(cartId, lineId, {
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
    const { cart } = await medusa.store.cart.lineItem.delete(cartId, lineId)
    return cart
  } catch (error) {
    console.error('Error removing line item:', error)
    throw error
  }
}

export const addShippingMethod = async (cartId: string, shippingMethodId: string) => {
  try {
    const { cart } = await medusa.store.cart.shippingMethod.create(cartId, {
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
    const { cart } = await medusa.store.cart.paymentMethod.create(cartId, {
      provider_id: providerId,
    })
    return cart
  } catch (error) {
    console.error('Error adding payment method:', error)
    throw error
  }
}

export const completeCart = async (cartId: string) => {
  try {
    const { order } = await medusa.store.cart.complete(cartId)
    return order
  } catch (error) {
    console.error('Error completing cart:', error)
    throw error
  }
}

export const initiatePaymentSession = async (cart: any, data: any) => {
  try {
    const response = await medusa.store.cart.paymentSession.create(cart.id, data)
    return response
  } catch (error) {
    console.error('Error initiating payment session:', error)
    throw error
  }
}

export const getShippingOptions = async (cartId: string) => {
  try {
    const { shipping_options } = await medusa.store.cart.shippingOption.list(cartId)
    return shipping_options
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