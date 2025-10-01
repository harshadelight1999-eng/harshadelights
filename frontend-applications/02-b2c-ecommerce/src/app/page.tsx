'use client'

import Link from 'next/link'
import { ArrowRight, ShoppingCart, Truck, Award, Sparkles, MessageCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import Categories from '@/components/sections/Categories'
import FeaturedProducts from '@/components/sections/FeaturedProducts'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-royal-50">
      <Header />

      {/* Diwali Banner */}
      <div className="bg-gradient-to-r from-luxury-gold-600 via-luxury-champagne-600 to-luxury-gold-600 py-3 px-4 shadow-gold animate-gold-glow">
        <div className="max-w-7xl mx-auto flex items-center justify-center flex-wrap gap-2 text-center">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
          <p className="text-white font-semibold text-sm md:text-base">
            🎆 Diwali Special! Browse Our Premium Collection & Order via WhatsApp for Instant Response
          </p>
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-royal-50 to-luxury-champagne-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-royal">
            Welcome to{' '}
            <span className="bg-royal-gradient bg-clip-text text-transparent">Harsha Delights</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover the finest selection of premium sweets, chocolates, namkeens, and dry fruits.
            Experience traditional flavors with modern convenience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-royal-gradient text-white font-semibold px-8 py-4 rounded-xl shadow-royal hover:shadow-luxury hover:scale-105 transition-all duration-300 text-center inline-flex items-center justify-center"
            >
              Browse Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'}?text=${encodeURIComponent('Hi! I would like to browse your Diwali collection.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-luxury-champagne-600 hover:bg-luxury-champagne-700 text-white font-semibold px-8 py-4 rounded-xl shadow-gold hover:shadow-luxury hover:scale-105 transition-all duration-300 text-center inline-flex items-center justify-center"
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              Order via WhatsApp
            </a>
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
            <div className="text-center p-6 bg-royal-50 rounded-lg border border-royal-200 hover:shadow-royal transition-all duration-300">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-royal-gradient shadow-royal">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 font-heading">
                Premium Quality
              </h3>
              <p className="text-gray-600">
                Carefully sourced ingredients and traditional recipes passed down through generations.
              </p>
            </div>

            <div className="text-center p-6 bg-luxury-champagne-50 rounded-lg border border-luxury-champagne-200 hover:shadow-gold transition-all duration-300">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gold-gradient shadow-gold">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 font-heading">
                Fast Delivery
              </h3>
              <p className="text-gray-600">
                Fresh products delivered to your doorstep within hours of preparation.
              </p>
            </div>

            <div className="text-center p-6 bg-luxury-champagne-50 rounded-lg border border-luxury-champagne-200 hover:shadow-gold transition-all duration-300">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-luxury-gradient shadow-gold">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 font-heading">
                WhatsApp Ordering
              </h3>
              <p className="text-gray-600">
                Browse online, order via WhatsApp. Get instant responses and personalized service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-luxury-gradient py-16 shadow-luxury">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-royal">
            🎆 Make This Diwali Sweeter!
          </h2>
          <p className="text-white/90 mb-8 text-lg md:text-xl max-w-2xl mx-auto">
            Browse our premium collection and order via WhatsApp for instant, personalized service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'}?text=${encodeURIComponent('Hi! I would like to place an order for Diwali. Can you help me with the available options?')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-luxury-gold-700 px-8 py-4 rounded-xl font-bold hover:bg-luxury-gold-50 hover:shadow-gold inline-flex items-center justify-center transition-all duration-300 text-lg"
            >
              <MessageCircle className="mr-2 w-6 h-6" />
              Order via WhatsApp
            </a>
            <Link
              href="/products"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 inline-flex items-center justify-center transition-all duration-300 text-lg"
            >
              Browse Catalog
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
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
