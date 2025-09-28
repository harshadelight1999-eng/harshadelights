"use client"

import { HttpTypes } from "@medusajs/types"

type AddressesProps = {
  cart: HttpTypes.StoreCart
  customer?: HttpTypes.StoreCustomer | null
}

const Addresses = ({ cart, customer }: AddressesProps) => {
  return (
    <div>
      <h3>Addresses</h3>
      <p>Address component - to be implemented</p>
    </div>
  )
}

export default Addresses