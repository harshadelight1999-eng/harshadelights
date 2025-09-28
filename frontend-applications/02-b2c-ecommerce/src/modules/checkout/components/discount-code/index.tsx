"use client"

import { HttpTypes } from "@medusajs/types"

type DiscountCodeProps = {
  cart: HttpTypes.StoreCart
}

const DiscountCode = ({ cart }: DiscountCodeProps) => {
  return (
    <div>
      <h3>Discount Code</h3>
      <p>Discount code component - to be implemented</p>
    </div>
  )
}

export default DiscountCode