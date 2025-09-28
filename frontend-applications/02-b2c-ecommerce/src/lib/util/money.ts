interface ConvertToLocaleParams {
  amount: number
  currency_code: string
  locale?: string
}

export const convertToLocale = ({ 
  amount, 
  currency_code, 
  locale = 'en-US' 
}: ConvertToLocaleParams): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency_code.toUpperCase(),
    }).format(amount / 100) // Assuming amount is in smallest currency unit (cents)
  } catch (error) {
    console.error('Error formatting currency:', error)
    return `${currency_code.toUpperCase()} ${(amount / 100).toFixed(2)}`
  }
}

export const formatPrice = (amount: number, currency: string = 'USD'): string => {
  return convertToLocale({ amount, currency_code: currency })
}