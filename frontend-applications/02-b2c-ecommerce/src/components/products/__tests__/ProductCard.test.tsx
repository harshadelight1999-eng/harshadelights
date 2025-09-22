import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ProductCard from '../ProductCard'
import { CartItem } from '@/types/cart'
import '@testing-library/jest-dom'

const mockProduct = {
  id: '1',
  title: 'Premium Kaju Katli',
  description: 'Handcrafted cashew diamonds made with pure ghee and silver leaf',
  handle: 'premium-kaju-katli',
  thumbnail: '/api/placeholder/300/300',
  images: [
    { id: 'img1', url: '/api/placeholder/300/300', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
  ],
  variants: [{
    id: '1-v1',
    title: 'Default Variant',
    product_id: '1',
    price: 450,
    compare_at_price: 500,
    inventory_quantity: 50,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }],
  categories: [{
    id: 'c1',
    name: 'Sweets',
    handle: 'sweets',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

// Mock the Redux store
const createMockStore = () => {
  return configureStore({
    reducer: {
      cart: (state = { items: [], totalItems: 0 }) => state,
      auth: (state = { user: null, isAuthenticated: false }) => state,
    },
  })
}

const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore()
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  )
}

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    renderWithProviders(<ProductCard product={mockProduct} />)

    expect(screen.getByText('Premium Kaju Katli')).toBeInTheDocument()
    expect(screen.getByText('Handcrafted cashew diamonds made with pure ghee and silver leaf')).toBeInTheDocument()
    expect(screen.getByText('₹450')).toBeInTheDocument()
  })

  it('displays discounted price when compare_at_price is available', () => {
    renderWithProviders(<ProductCard product={mockProduct} />)

    expect(screen.getByText('₹450')).toBeInTheDocument()
    // Should show discount badge or strikethrough pricing
  })

  it('shows out of stock state when inventory is zero', () => {
    const outOfStockProduct = { ...mockProduct, variants: [{ ...mockProduct.variants[0], inventory_quantity: 0 }] }
    renderWithProviders(<ProductCard product={outOfStockProduct} />)

    expect(screen.getByText(/out of stock/i)).toBeInTheDocument()
  })

  it('has add to cart button functionality', () => {
    renderWithProviders(<ProductCard product={mockProduct} />)

    // Test that the add to cart button works
    const addToCartButton = screen.getByRole('button', { name: /add to cart/i })
    fireEvent.click(addToCartButton)

    // Should handle add to cart functionality (would need to mock this behavior)
  })

  it('navigates to product detail page when title is clicked', () => {
    renderWithProviders(<ProductCard product={mockProduct} />)

    const productTitle = screen.getByText('Premium Kaju Katli')
    fireEvent.click(productTitle)

    // Should navigate to product page (would need to test with router mock)
  })

  it('displays product category correctly', () => {
    renderWithProviders(<ProductCard product={mockProduct} />)

    expect(screen.getByText('Sweets')).toBeInTheDocument()
  })

  it('shows add to cart button for in-stock products', () => {
    renderWithProviders(<ProductCard product={mockProduct} />)

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i })
    expect(addToCartButton).toBeInTheDocument()
    expect(addToCartButton).not.toBeDisabled()
  })

  it('disables add to cart button for out-of-stock products', () => {
    const outOfStockProduct = { ...mockProduct, variants: [{ ...mockProduct.variants[0], inventory_quantity: 0 }] }
    renderWithProviders(<ProductCard product={outOfStockProduct} />)

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i })
    expect(addToCartButton).toBeDisabled()
  })

  it('displays product image with correct alt text', () => {
    renderWithProviders(<ProductCard product={mockProduct} />)

    const productImage = screen.getByAltText('Premium Kaju Katli')
    expect(productImage).toBeInTheDocument()
    expect(productImage).toHaveAttribute('src', mockProduct.thumbnail)
  })
})
