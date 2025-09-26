'use client'

import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store/store'
import { addToCart } from '@/store/slices/cartSlice'
import { Product } from '@/store/slices/productsSlice'
import WhatsAppOrderButton from '@/components/whatsapp/WhatsAppOrderButton'
import { 
  ShoppingCart, 
  Star, 
  Heart, 
  Eye, 
  Plus, 
  Minus,
  Check,
  Package
} from 'lucide-react'

interface ProductCardProps {
  product: Product
  onQuickView?: (product: Product) => void
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    
    dispatch(addToCart({
      product_id: product.id,
      variant_id: selectedVariant.id,
      quantity: quantity,
      title: product.title,
      unit_price: selectedVariant.price
    }))

    // Show success feedback
    setTimeout(() => {
      setIsAddingToCart(false)
    }, 1000)
  }

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    // Would dispatch wishlist action here
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(10, quantity + delta))
    setQuantity(newQuantity)
  }

  const discountPercentage = selectedVariant.compare_at_price 
    ? Math.round(((selectedVariant.compare_at_price - selectedVariant.price) / selectedVariant.compare_at_price) * 100)
    : 0

  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={product.thumbnail || '/shared/assets/products/confectionery/colorful-indian-sweets.png'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {discountPercentage}% OFF
          </div>
        )}

        {/* Stock Status */}
        {selectedVariant.inventory_quantity < 10 && selectedVariant.inventory_quantity > 0 && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            Only {selectedVariant.inventory_quantity} left
          </div>
        )}

        {selectedVariant.inventory_quantity === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-gray-800 text-white px-4 py-2 rounded-lg font-medium">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleWishlist}
            className={`p-2 rounded-full shadow-lg transition-colors ${
              isWishlisted 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-gray-600 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          
          {onQuickView && (
            <button
              onClick={() => onQuickView(product)}
              className="p-2 bg-white text-gray-600 hover:text-yellow-600 rounded-full shadow-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Categories */}
        <div className="flex flex-wrap gap-1 mb-2">
          {product.categories.slice(0, 2).map((category) => (
            <span
              key={category.id}
              className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full"
            >
              {category.name}
            </span>
          ))}
        </div>

        {/* Product Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors">
          {product.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">(4.2)</span>
          <span className="text-xs text-gray-500 ml-1">• 127 reviews</span>
        </div>

        {/* Variant Selection */}
        {product.variants.length > 1 && (
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">Size:</label>
            <div className="flex flex-wrap gap-1">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    selectedVariant.id === variant.id
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {variant.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              ₹{selectedVariant.price.toLocaleString()}
            </span>
            {selectedVariant.compare_at_price && (
              <span className="text-sm text-gray-500 line-through">
                ₹{selectedVariant.compare_at_price.toLocaleString()}
              </span>
            )}
          </div>
          
          {/* Stock Indicator */}
          <div className="flex items-center text-xs">
            <Package className="w-3 h-3 mr-1 text-green-600" />
            <span className="text-green-600 font-medium">In Stock</span>
          </div>
        </div>

        {/* Quantity & Add to Cart */}
        <div className="flex items-center space-x-3">
          {/* Quantity Selector */}
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= 10}
              className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={selectedVariant.inventory_quantity === 0 || isAddingToCart}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors font-medium"
          >
            {isAddingToCart ? (
              <>
                <Check className="w-4 h-4" />
                <span className="text-sm">Added!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm">Add to Cart</span>
              </>
            )}
          </button>
        </div>

        {/* WhatsApp Order Option */}
        <div className="mt-2">
          <WhatsAppOrderButton
            variant="inline"
            productId={product.id}
            variantId={selectedVariant.id}
            quantity={quantity}
            className="w-full text-sm"
          />
        </div>
      </div>
    </div>
  )
}
