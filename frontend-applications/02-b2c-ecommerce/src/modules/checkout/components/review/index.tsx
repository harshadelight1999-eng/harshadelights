"use client"

import { HttpTypes } from "@medusajs/types"

type ReviewProps = {
  cart: HttpTypes.StoreCart
}

const Review = ({ cart }: ReviewProps) => {
  return (
    <div>
      <h3>Review</h3>
      <p>Review component - to be implemented</p>
    </div>
  )
}

export default Review