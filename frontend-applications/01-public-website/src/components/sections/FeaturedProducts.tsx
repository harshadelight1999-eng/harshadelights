'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { Star, ShoppingCart, Eye, Heart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  isNew?: boolean;
  isFeatured?: boolean;
}

const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Kaju Katli',
    description: 'Rich cashew fudge made with pure cashews and silver leaf',
    price: 899,
    originalPrice: 999,
    image: '/images/products/kaju-katli.jpg',
    rating: 4.9,
    reviews: 234,
    category: 'Traditional Sweets',
    isFeatured: true,
  },
  {
    id: '2',
    name: 'Belgian Dark Chocolate Box',
    description: 'Assorted premium Belgian chocolates in elegant gift box',
    price: 1299,
    image: '/images/products/belgian-chocolates.jpg',
    rating: 4.8,
    reviews: 156,
    category: 'Chocolates',
    isNew: true,
  },
  {
    id: '3',
    name: 'Special Mixture Namkeen',
    description: 'Crispy traditional mix with nuts, raisins, and spices',
    price: 449,
    originalPrice: 499,
    image: '/images/products/special-mixture.jpg',
    rating: 4.7,
    reviews: 89,
    category: 'Namkeens',
  },
  {
    id: '4',
    name: 'Premium Dry Fruit Box',
    description: 'Handpicked almonds, walnuts, cashews, and pistachios',
    price: 1899,
    image: '/images/products/dry-fruits.jpg',
    rating: 4.9,
    reviews: 321,
    category: 'Dry Fruits',
    isFeatured: true,
  },
];

export default function FeaturedProducts() {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  return (
    <section className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto container-padding">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 bg-harsha-orange-100 rounded-full px-4 py-2 text-sm font-medium text-harsha-orange-700">
            <Star className="h-4 w-4 fill-current" />
            <span>Featured Products</span>
          </div>

          <h2 className="heading-responsive font-bold text-gray-900">
            Our Premium Collection
          </h2>

          <p className="body-responsive text-gray-600 max-w-2xl mx-auto">
            Discover our most popular confectionery items, carefully crafted with premium ingredients
            and traditional recipes passed down through generations.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <div className="absolute inset-0 bg-gradient-to-br from-harsha-orange-100 to-harsha-yellow-100 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-harsha-orange-200 rounded-full mx-auto flex items-center justify-center">
                      <span className="text-2xl">🍯</span>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{product.category}</p>
                  </div>
                </div>

                {/* Product Badges */}
                <div className="absolute top-3 left-3 flex flex-col space-y-2">
                  {product.isNew && (
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      NEW
                    </span>
                  )}
                  {product.isFeatured && (
                    <span className="bg-harsha-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      FEATURED
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      SALE
                    </span>
                  )}
                </div>

                {/* Quick Actions */}
                <div className={`absolute top-3 right-3 flex flex-col space-y-2 transition-opacity duration-300 ${
                  hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
                }`}>
                  <button className="p-2 bg-white rounded-full shadow-md hover:bg-harsha-orange-50 transition-colors">
                    <Heart className="h-4 w-4 text-gray-600 hover:text-harsha-orange-500" />
                  </button>
                  <button className="p-2 bg-white rounded-full shadow-md hover:bg-harsha-orange-50 transition-colors">
                    <Eye className="h-4 w-4 text-gray-600 hover:text-harsha-orange-500" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                {/* Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({product.reviews})</span>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>

                {/* Product Name */}
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-harsha-orange-600 transition-colors">
                  {product.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {product.description}
                </p>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-harsha-orange-600">
                      ₹{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {product.originalPrice && (
                    <span className="text-sm font-medium text-green-600">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-3"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/products">
            <Button variant="outline" size="lg" className="group">
              View All Products
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}