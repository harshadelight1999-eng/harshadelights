'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { MessageCircle, ShoppingCart } from 'lucide-react'

interface WhatsAppOrderButtonProps {
  variant?: 'default' | 'floating' | 'inline'
  productId?: string
  variantId?: string
  quantity?: number
  className?: string
  children?: React.ReactNode
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function WhatsAppOrderButton({ 
  variant = 'default',
  productId,
  variantId,
  quantity,
  className = '',
  children
}: WhatsAppOrderButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const cartItems = useSelector((state: RootState) => state.cart.items)
  
  const handleWhatsAppOrder = async () => {
    setIsGenerating(true)
    
    try {
      let orderData: any = {}
      
      if (productId) {
        // Single product order
        const response = await fetch(`${API_BASE_URL}/api/v1/whatsapp/generate-quick-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: productId,
            variant_id: variantId,
            quantity: quantity || 1
          })
        })
        
        orderData = await response.json()
      } else {
        // Cart-based order
        if (cartItems.length === 0) {
          alert('Your cart is empty. Please add items before ordering.')
          return
        }
        
        // Prompt for customer details
        const customerName = prompt('Please enter your name:')
        const customerPhone = prompt('Please enter your phone number:')
        const customerAddress = prompt('Please enter your delivery address (optional):')
        
        if (!customerName || !customerPhone) {
          alert('Name and phone number are required.')
          return
        }
        
        const items = cartItems.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          title: item.title,
          price: item.unit_price
        }))
        
        const response = await fetch(`${API_BASE_URL}/api/v1/whatsapp/generate-order-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items,
            customer_details: {
              name: customerName,
              phone: customerPhone,
              address: customerAddress || ''
            }
          })
        })
        
        orderData = await response.json()
      }
      
      if (orderData.success) {
        // Open WhatsApp link
        window.open(orderData.whatsapp_link, '_blank')
      } else {
        alert('Failed to generate WhatsApp order. Please try again.')
      }
      
    } catch (error) {
      console.error('WhatsApp order error:', error)
      alert('Failed to generate WhatsApp order. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Floating button variant
  if (variant === 'floating') {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleWhatsAppOrder}
          disabled={isGenerating}
          className={`bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 ${className}`}
          title="Order via WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    )
  }
  
  // Inline variant
  if (variant === 'inline') {
    return (
      <button
        onClick={handleWhatsAppOrder}
        disabled={isGenerating}
        className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 ${className}`}
      >
        <MessageCircle className="w-4 h-4" />
        <span>{isGenerating ? 'Generating...' : 'Order via WhatsApp'}</span>
      </button>
    )
  }
  
  // Default variant
  return (
    <button
      onClick={handleWhatsAppOrder}
      disabled={isGenerating}
      className={`w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors font-medium disabled:opacity-50 ${className}`}
    >
      <MessageCircle className="w-5 h-5" />
      <span>{isGenerating ? 'Generating Order...' : children || 'Order via WhatsApp'}</span>
    </button>
  )
}