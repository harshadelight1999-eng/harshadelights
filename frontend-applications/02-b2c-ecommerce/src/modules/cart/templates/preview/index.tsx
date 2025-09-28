"use client"

import { HttpTypes } from "@medusajs/types"

type ItemsPreviewTemplateProps = {
  items?: HttpTypes.StoreCartLineItem[]
  region?: HttpTypes.StoreRegion
}

const ItemsPreviewTemplate = ({ items, region }: ItemsPreviewTemplateProps) => {
  return (
    <div>
      <h3>Cart Preview</h3>
      <p>Cart items preview - to be implemented</p>
    </div>
  )
}

export default ItemsPreviewTemplate