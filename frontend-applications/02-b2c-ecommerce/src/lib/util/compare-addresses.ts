import { HttpTypes } from "@medusajs/types"

/**
 * Compare two addresses to determine if they are the same
 */
const compareAddresses = (
  address1: HttpTypes.StoreCustomerAddress | HttpTypes.StoreCartAddress | null,
  address2: HttpTypes.StoreCustomerAddress | HttpTypes.StoreCartAddress | null
): boolean => {
  if (!address1 || !address2) {
    return false
  }

  return (
    address1.address_1 === address2.address_1 &&
    address1.city === address2.city &&
    address1.postal_code === address2.postal_code &&
    address1.country_code === address2.country_code
  )
}

export default compareAddresses