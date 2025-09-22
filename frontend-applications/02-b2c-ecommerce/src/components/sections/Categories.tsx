'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { RootState, AppDispatch } from '@/store/store';
import { getCategories } from '@/store/slices/productsSlice';
import { ArrowRight, Package } from 'lucide-react';

export default function Categories() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, isLoading } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const categoryColors = [
    'from-orange-400 to-red-500',
    'from-amber-400 to-orange-500',
    'from-yellow-400 to-orange-400',
    'from-green-400 to-emerald-500',
    'from-purple-400 to-pink-500',
    'from-indigo-400 to-purple-500',
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our carefully curated categories of premium confectionery and traditional delights
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/products?category=${category.handle}`}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className={`aspect-[4/3] bg-gradient-to-br ${categoryColors[index % categoryColors.length]} relative`}>
                {/* Category Icon/Image Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="w-20 h-20 text-white text-opacity-60" />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>

                {/* Product Count Badge */}
                <div className="absolute top-4 right-4 bg-white bg-opacity-90 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                  {(category as any).product_count || '25+'} Products
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-200 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-white text-opacity-90 mb-4">
                    {(category as any).description || 'Discover amazing products in this category'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Explore Collection
                    </span>
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Special Offer Banner */}
        <div className="mt-16 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Special Festival Offer
            </h3>
            <p className="text-white text-opacity-90 mb-6 max-w-2xl mx-auto">
              Get 15% off on all traditional sweets and gift collections. Perfect for celebrations and gifting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products?category=traditional-sweets"
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Shop Traditional Sweets
              </Link>
              <Link
                href="/products?category=gift-collections"
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors"
              >
                View Gift Collections
              </Link>
            </div>
          </div>

          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-8 h-8 bg-white rounded-full"></div>
            <div className="absolute top-12 right-8 w-6 h-6 bg-white rounded-full"></div>
            <div className="absolute bottom-8 left-12 w-4 h-4 bg-white rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
}