'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { ArrowRight, Star, Truck, Award, Users } from 'lucide-react';

const stats = [
  { icon: Users, label: 'Happy Customers', value: '10,000+' },
  { icon: Award, label: 'Years of Excellence', value: '25+' },
  { icon: Star, label: 'Product Varieties', value: '500+' },
  { icon: Truck, label: 'Daily Deliveries', value: '200+' },
];

const heroImages = [
  '/images/hero/sweets-collection.jpg',
  '/images/hero/chocolates-display.jpg',
  '/images/hero/traditional-sweets.jpg',
  '/images/hero/gift-boxes.jpg',
];

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % heroImages.length
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-harsha-orange-50 via-white to-harsha-yellow-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-harsha-orange-100 rounded-full -translate-y-48 translate-x-48 opacity-50" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-harsha-yellow-100 rounded-full translate-y-40 -translate-x-40 opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px] py-16 lg:py-24">
          {/* Content Side */}
          <div className="space-y-8 animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-harsha-orange-200 rounded-full px-4 py-2 text-sm font-medium text-harsha-orange-700">
              <Award className="h-4 w-4" />
              <span>Premium Quality Since 1998</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="heading-responsive font-bold text-gray-900 leading-tight">
                Authentic Flavors,{' '}
                <span className="hero-text-gradient">
                  Premium Quality
                </span>
              </h1>
              <p className="body-responsive text-gray-600 max-w-lg">
                Experience the finest traditional sweets, premium chocolates, and artisanal confectionery.
                Made with love, delivered fresh to your doorstep across India.
              </p>
            </div>

            {/* Key Features */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>100% Pure Ingredients</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Fresh Daily Production</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-harsha-orange-500 rounded-full" />
                <span>Pan-India Delivery</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                size="lg"
                className="group"
              >
                Explore Our Products
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
              >
                B2B Partnership
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center space-x-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">4.9/5 from 2,500+ reviews</span>
              </div>
            </div>
          </div>

          {/* Visual Side */}
          <div className="relative animate-slide-up animate-delay-200">
            {/* Main Product Image */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <div className="relative w-full h-full bg-gradient-to-br from-harsha-orange-100 to-harsha-yellow-100">
                  {/* Placeholder for product image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-32 h-32 bg-harsha-orange-200 rounded-full mx-auto flex items-center justify-center">
                        <div className="w-16 h-16 bg-harsha-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">HD</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-gray-800">Premium Collection</h3>
                        <p className="text-gray-600">Traditional sweets & modern delights</p>
                      </div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg animate-float">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-sm font-medium">Fresh Today</span>
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg animate-float animate-delay-300">
                    <div className="text-center">
                      <div className="text-lg font-bold text-harsha-orange-600">₹199</div>
                      <div className="text-xs text-gray-600">Starting from</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-harsha-yellow-200 rounded-full opacity-60 animate-pulse" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-harsha-orange-200 rounded-full opacity-60 animate-pulse animate-delay-500" />
            </div>

            {/* Product Categories Preview */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { name: 'Traditional Sweets', image: '🍯', color: 'bg-yellow-100' },
                { name: 'Premium Chocolates', image: '🍫', color: 'bg-amber-100' },
                { name: 'Crunchy Namkeens', image: '🥜', color: 'bg-orange-100' },
                { name: 'Dry Fruits', image: '🌰', color: 'bg-red-100' },
              ].map((category, index) => (
                <div
                  key={category.name}
                  className={`${category.color} rounded-xl p-4 text-center hover:scale-105 transition-transform cursor-pointer animate-slide-up`}
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <div className="text-2xl mb-2">{category.image}</div>
                  <div className="text-sm font-medium text-gray-700">{category.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="border-t border-gray-200 pt-12 pb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center space-y-2 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-harsha-orange-100 rounded-lg">
                  <stat.icon className="h-6 w-6 text-harsha-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}