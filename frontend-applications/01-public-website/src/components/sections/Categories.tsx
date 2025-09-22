'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { ArrowRight, Package, TrendingUp, Users, Award } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  productCount: number;
  image: string;
  color: string;
  bgColor: string;
  trending?: boolean;
  popular?: boolean;
}

const categories: Category[] = [
  {
    id: 'traditional-sweets',
    name: 'Traditional Sweets',
    description: 'Authentic Indian sweets made with traditional recipes and premium ingredients',
    icon: '🍯',
    href: '/products/sweets',
    productCount: 125,
    image: '/images/categories/traditional-sweets.jpg',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 hover:bg-amber-100',
    popular: true,
  },
  {
    id: 'chocolates',
    name: 'Premium Chocolates',
    description: 'Handcrafted chocolates and imported premium chocolate collections',
    icon: '🍫',
    href: '/products/chocolates',
    productCount: 89,
    image: '/images/categories/chocolates.jpg',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 hover:bg-amber-100',
    trending: true,
  },
  {
    id: 'namkeens',
    name: 'Crunchy Namkeens',
    description: 'Crispy and flavorful savory snacks perfect for every occasion',
    icon: '🥜',
    href: '/products/namkeens',
    productCount: 67,
    image: '/images/categories/namkeens.jpg',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
  },
  {
    id: 'dry-fruits',
    name: 'Premium Dry Fruits',
    description: 'Handpicked nuts and dried fruits sourced from the finest regions',
    icon: '🌰',
    href: '/products/dry-fruits',
    productCount: 45,
    image: '/images/categories/dry-fruits.jpg',
    color: 'text-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100',
  },
  {
    id: 'gift-boxes',
    name: 'Gift Collections',
    description: 'Beautifully curated gift boxes perfect for festivals and celebrations',
    icon: '🎁',
    href: '/products/gift-boxes',
    productCount: 34,
    image: '/images/categories/gift-boxes.jpg',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    trending: true,
  },
  {
    id: 'seasonal',
    name: 'Seasonal Specials',
    description: 'Limited edition treats crafted for festivals and special occasions',
    icon: '✨',
    href: '/products/seasonal',
    productCount: 28,
    image: '/images/categories/seasonal.jpg',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 hover:bg-pink-100',
  },
];

const stats = [
  { icon: Package, label: 'Total Products', value: '500+' },
  { icon: TrendingUp, label: 'Categories', value: '6' },
  { icon: Users, label: 'Happy Customers', value: '10,000+' },
  { icon: Award, label: 'Years of Excellence', value: '25+' },
];

export default function Categories() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto container-padding">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 bg-harsha-orange-100 rounded-full px-4 py-2 text-sm font-medium text-harsha-orange-700">
            <Package className="h-4 w-4" />
            <span>Product Categories</span>
          </div>

          <h2 className="heading-responsive font-bold text-gray-900">
            Explore Our Diverse Range
          </h2>

          <p className="body-responsive text-gray-600 max-w-3xl mx-auto">
            From traditional Indian sweets to modern confectionery, discover our carefully curated
            categories that bring authentic flavors and premium quality to your celebrations.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 p-6 bg-gray-50 rounded-2xl">
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

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={category.href}
              className="group block"
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div
                className={`relative p-6 rounded-2xl border-2 border-transparent transition-all duration-300 ${category.bgColor} group-hover:border-harsha-orange-200 group-hover:shadow-lg animate-slide-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Category Badges */}
                <div className="absolute top-4 right-4 flex flex-col space-y-2">
                  {category.trending && (
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      TRENDING
                    </span>
                  )}
                  {category.popular && (
                    <span className="bg-harsha-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                      <Award className="h-3 w-3 mr-1" />
                      POPULAR
                    </span>
                  )}
                </div>

                {/* Category Icon */}
                <div className="relative mb-4">
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl transition-transform duration-300 ${
                      hoveredCategory === category.id ? 'scale-110' : ''
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${category.color.replace('text-', 'from-')}20, ${category.color.replace('text-', 'to-')}10)`,
                    }}
                  >
                    {category.icon}
                  </div>

                  {/* Decorative elements */}
                  <div
                    className={`absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-60 transition-all duration-300 ${
                      hoveredCategory === category.id ? 'scale-125 opacity-80' : ''
                    }`}
                    style={{ backgroundColor: category.color.replace('text-', '') }}
                  />
                </div>

                {/* Category Content */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-xl font-semibold group-hover:${category.color} transition-colors`}>
                      {category.name}
                    </h3>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Package className="h-4 w-4" />
                      <span className="text-sm">{category.productCount}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    {category.description}
                  </p>

                  {/* Category Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-700">
                      {category.productCount} Products
                    </span>

                    <div className={`flex items-center space-x-1 text-sm font-medium group-hover:${category.color} transition-colors`}>
                      <span>Explore</span>
                      <ArrowRight className={`h-4 w-4 transition-transform duration-300 ${
                        hoveredCategory === category.id ? 'translate-x-1' : ''
                      }`} />
                    </div>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-harsha-orange-500/5 to-harsha-yellow-500/5 opacity-0 transition-opacity duration-300 ${
                  hoveredCategory === category.id ? 'opacity-100' : ''
                }`} />
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 p-8 bg-gradient-to-r from-harsha-orange-50 to-harsha-yellow-50 rounded-2xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Looking for Something Specific?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our team can help you find the perfect products
            or create custom gift collections for your special occasions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button variant="primary" size="lg">
                Contact Our Team
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" size="lg">
                Browse All Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}