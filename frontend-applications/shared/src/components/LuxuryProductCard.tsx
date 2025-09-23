"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Heart, ShoppingCart, Eye, Package, Crown } from 'lucide-react'
import { cardStyles, buttonStyles, luxuryStyles, utils } from '../lib/assets'

interface LuxuryProductCardProps {
  product: {
    id: string
    title: string
    description: string
    price: number
    comparePrice?: number
    thumbnail?: string
    category: string
    rating?: number
    reviews?: number
    inStock: boolean
    stockCount?: number
    isPremium?: boolean
    isNew?: boolean
  }
  onAddToCart?: (productId: string) => void
  onWishlist?: (productId: string) => void
  onQuickView?: (productId: string) => void
  className?: string
}

export default function LuxuryProductCard({
  product,
  onAddToCart,
  onWishlist,
  onQuickView,
  className = ''
}: LuxuryProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const discountPercentage = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    onAddToCart?.(product.id)
    setTimeout(() => setIsAddingToCart(false), 1500)
  }

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    onWishlist?.(product.id)
  }

  const cardClass = utils.combineStyles(
    cardStyles.luxury,
    'group relative overflow-hidden',
    className
  )

  return (
    <div className={cardClass}>
      {/* Premium Badge */}
      {product.isPremium && (
        <div className="absolute top-4 left-4 z-20">
          <div className={utils.combineStyles(
            'flex items-center gap-1 px-3 py-1.5 rounded-full',
            'bg-luxury-gradient text-white text-xs font-semibold',
            luxuryStyles.animations.glow
          )}>
            <Crown className="w-3 h-3" />
            <span>Premium</span>
          </div>
        </div>
      )}

      {/* New Badge */}
      {product.isNew && (
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-royal-gradient text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            New
          </div>
        </div>
      )}

      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-16 right-4 z-20">
          <div className="bg-luxury-burgundy-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {discountPercentage}% OFF
          </div>
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-2xl">
        {/* Shimmer overlay */}
        <div className={utils.combineStyles(
          'absolute inset-0 opacity-0 group-hover:opacity-100',
          'bg-royal-shimmer transition-opacity duration-500 z-10'
        )} />
        
        <Image
          src={product.thumbnail || '/api/placeholder/400/400'}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
            <span className="bg-luxury-burgundy-800 text-white px-6 py-3 rounded-xl font-medium">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            onClick={handleWishlist}
            className={utils.combineStyles(
              'p-2 rounded-full shadow-luxury transition-all duration-300',
              isWishlisted 
                ? 'bg-luxury-burgundy-600 text-white' 
                : 'bg-white/95 text-luxury-burgundy-600 hover:bg-luxury-burgundy-50'
            )}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          
          {onQuickView && (
            <button
              onClick={() => onQuickView(product.id)}
              className="p-2 bg-white/95 text-royal-600 hover:bg-royal-50 rounded-full shadow-luxury transition-all duration-300"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        {/* Category */}
        <div className="mb-3">
          <span className={utils.combineStyles(
            'text-xs font-medium px-3 py-1 rounded-full',
            'bg-luxury-champagne-100 text-luxury-champagne-800'
          )}>
            {product.category}
          </span>
        </div>

        {/* Title */}
        <Link href={`/products/${product.id}`}>
          <h3 className={utils.combineStyles(
            luxuryStyles.fonts.elegant,
            'text-xl font-semibold text-gray-900 mb-2 line-clamp-2',
            'group-hover:text-royal-700 transition-colors duration-300'
          )}>
            {product.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating!) 
                      ? 'text-luxury-gold-500 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              ({product.rating})
            </span>
            {product.reviews && (
              <span className="text-xs text-gray-500">
                • {product.reviews} reviews
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-3 mb-6">
          <span className={utils.combineStyles(
            luxuryStyles.fonts.royal,
            'text-2xl font-bold text-gray-900'
          )}>
            ₹{product.price.toLocaleString()}
          </span>
          {product.comparePrice && (
            <span className="text-lg text-gray-500 line-through">
              ₹{product.comparePrice.toLocaleString()}
            </span>
          )}
          
          {/* Stock Status */}
          {product.inStock && (
            <div className="flex items-center text-xs text-luxury-gold-600 ml-auto">
              <Package className="w-3 h-3 mr-1" />
              <span className="font-medium">
                {product.stockCount && product.stockCount < 10 
                  ? `Only ${product.stockCount} left`
                  : 'In Stock'
                }
              </span>
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock || isAddingToCart}
          className={utils.combineStyles(
            buttonStyles.royal,
            'w-full flex items-center justify-center gap-3',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
          )}
        >
          {isAddingToCart ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </>
          )}
        </button>

        {/* Quick Buy Option */}
        {product.inStock && (
          <Link href={`/checkout?product=${product.id}`}>
            <button className={utils.combineStyles(
              buttonStyles.outline,
              'w-full mt-3 py-3 text-sm'
            )}>
              Buy Now
            </button>
          </Link>
        )}
      </div>
    </div>
  )
}