'use client';

import Link from 'next/link';
import { Button } from '../ui/Button';
import { LuxuryProductCard } from '@harshadelights/shared-components';
import { Star } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  comparePrice?: number;
  thumbnail?: string;
  category: string;
  rating?: number;
  reviews?: number;
  inStock: boolean;
  stockCount?: number;
  isPremium?: boolean;
  isNew?: boolean;
}

const featuredProducts: Product[] = [
  {
    id: '1',
    title: 'Premium Kaju Katli',
    description: 'Rich cashew fudge made with pure cashews and silver leaf',
    price: 899,
    comparePrice: 999,
    thumbnail: '/assets/products/categories/kaju-katli.jpg',
    rating: 4.9,
    reviews: 234,
    category: 'Traditional Sweets',
    inStock: true,
    stockCount: 25,
    isPremium: true,
  },
  {
    id: '2',
    title: 'Belgian Dark Chocolate Box',
    description: 'Assorted premium Belgian chocolates in elegant gift box',
    price: 1299,
    thumbnail: '/assets/products/confectionery/chocolates.png',
    rating: 4.8,
    reviews: 156,
    category: 'Chocolates',
    inStock: true,
    stockCount: 15,
    isNew: true,
  },
  {
    id: '3',
    title: 'Special Mixture Namkeen',
    description: 'Crispy traditional mix with nuts, raisins, and spices',
    price: 449,
    comparePrice: 499,
    thumbnail: '/assets/products/confectionery/chivda-bombay-mix.png',
    rating: 4.7,
    reviews: 89,
    category: 'Namkeens',
    inStock: true,
    stockCount: 8,
  },
  {
    id: '4',
    title: 'Premium Dry Fruit Box',
    description: 'Handpicked almonds, walnuts, cashews, and pistachios',
    price: 1899,
    thumbnail: '/assets/products/categories/dry-fruits.png',
    rating: 4.9,
    reviews: 321,
    category: 'Dry Fruits',
    inStock: true,
    stockCount: 12,
    isPremium: true,
  },
];

export default function FeaturedProducts() {

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
            <LuxuryProductCard
              key={product.id}
              product={product}
              onAddToCart={(productId) => console.log('Add to cart:', productId)}
              onWishlist={(productId) => console.log('Add to wishlist:', productId)}
              onQuickView={(productId) => console.log('Quick view:', productId)}
            />
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