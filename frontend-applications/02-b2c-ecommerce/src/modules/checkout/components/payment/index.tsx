"use client"

import { HttpTypes } from "@medusajs/types"

type PaymentProps = {
  cart: HttpTypes.StoreCart
  availablePaymentMethods?: HttpTypes.StoreCartPaymentMethod[] | null
}

const Payment = ({ cart, availablePaymentMethods }: PaymentProps) => {
  return (
    <div>
      <h3>Payment</h3>
      <p>Payment component - to be implemented</p>
    </div>
  )
}

export default Payment