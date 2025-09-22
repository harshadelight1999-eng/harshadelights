'use client'

import Link from 'next/link'
import { ArrowRight, ShoppingCart, Truck, Award } from 'lucide-react'
import Header from '@/components/layout/Header'
import Categories from '@/components/sections/Categories'
import FeaturedProducts from '@/components/sections/FeaturedProducts'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-yellow-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-yellow-50 to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to{' '}
            <span className="text-yellow-600">Harsha Delights</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover the finest selection of premium sweets, chocolates, namkeens, and dry fruits.
            Experience traditional flavors with modern convenience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="btn-primary text-center inline-flex items-center justify-center"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/products"
              className="btn-secondary text-center inline-flex items-center justify-center"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Categories */}
      <Categories />

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Harsha Delights?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We pride ourselves on quality, tradition, and exceptional customer service.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-yellow-50 rounded-lg">
              <div className="brand-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Premium Quality
              </h3>
              <p className="text-gray-600">
                Carefully sourced ingredients and traditional recipes passed down through generations.
              </p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="brand-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Fast Delivery
              </h3>
              <p className="text-gray-600">
                Fresh products delivered to your doorstep within hours of preparation.
              </p>
            </div>

            <div className="text-center p-6 bg-yellow-50 rounded-lg">
              <div className="brand-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Easy Shopping
              </h3>
              <p className="text-gray-600">
                User-friendly online store with secure payments and instant updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-green-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Experience the Best?
          </h2>
          <p className="text-green-100 mb-8 text-lg">
            Join thousands of satisfied customers who trust Harsha Delights for their sweet cravings.
          </p>
          <Link
            href="/auth/register"
            className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-flex items-center"
          >
            Create Account
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="brand-primary px-4 py-2 rounded-lg font-bold text-lg mb-4 inline-block">
              Harsha Delights
            </div>
            <p className="text-gray-400 mb-4">
              Premium Confectionery & Traditional Sweets
            </p>
            <p className="text-gray-500 text-sm">
              © 2025 Harsha Delights. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
