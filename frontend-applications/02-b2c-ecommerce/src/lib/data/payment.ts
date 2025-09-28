export const listCartPaymentMethods = async (cartId: string) => {
  try {
    // This would integrate with Medusa cart payment methods API
    // For now, return empty array
    return []
  } catch (error) {
    console.error('Error fetching cart payment methods:', error)
    return []
  }
}

export const createPaymentSession = async (cartId: string, providerId: string) => {
  try {
    // This would integrate with Medusa payment session creation API
    // For now, return mock response
    return { id: 'mock-session-id', status: 'created' }
  } catch (error) {
    console.error('Error creating payment session:', error)
    throw error
  }
}

export const updatePaymentSession = async (cartId: string, sessionId: string, data: any) => {
  try {
    // This would integrate with Medusa payment session update API
    // For now, return mock response
    return { id: sessionId, status: 'updated' }
  } catch (error) {
    console.error('Error updating payment session:', error)
    throw error
  }
}