"use client"

import { HttpTypes } from "@medusajs/types"

type CartTotalsProps = {
  cart: HttpTypes.StoreCart
}

const CartTotals = ({ cart }: CartTotalsProps) => {
  return (
    <div>
      <h3>Cart Totals</h3>
      <p>Cart totals component - to be implemented</p>
    </div>
  )
}

export default CartTotals