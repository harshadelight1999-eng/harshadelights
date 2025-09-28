"use client"

import { HttpTypes } from "@medusajs/types"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods?: HttpTypes.StoreCartShippingOption[] | null
}

const Shipping = ({ cart, availableShippingMethods }: ShippingProps) => {
  return (
    <div>
      <h3>Shipping</h3>
      <p>Shipping component - to be implemented</p>
    </div>
  )
}

export default Shipping