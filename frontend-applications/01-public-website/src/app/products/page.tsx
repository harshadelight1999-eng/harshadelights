import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Star, Search, Filter, Grid, List, ShoppingCart, Heart, Eye, Award, Leaf, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Premium Products - Harsha Delights | Traditional Sweets & Chocolates',
  description: 'Explore our extensive range of premium traditional sweets, chocolates, namkeens, and dry fruits. Authentic flavors crafted with finest ingredients.',
  keywords: 'traditional sweets, premium chocolates, namkeens, dry fruits, confectionery products, indian sweets, harsha delights products',
  openGraph: {
    title: 'Premium Products - Traditional Sweets & Chocolates | Harsha Delights',
    description: 'Discover authentic traditional sweets, premium chocolates, and confectionery made with finest ingredients.',
    url: 'https://harshadelights.com/products',
    images: ['/images/og-products.jpg'],
  },
};

const categories = [
  {
    id: 'traditional-sweets',
    name: 'Traditional Sweets',
    description: 'Authentic Indian sweets made with traditional recipes',
    image: '/images/categories/traditional-sweets.jpg',
    productCount: 150,
    featured: true,
    badge: 'Most Popular',
    color: 'from-orange-400 to-red-500',
  },
  {
    id: 'premium-chocolates',
    name: 'Premium Chocolates',
    description: 'Handcrafted chocolates with exquisite flavors',
    image: '/images/categories/chocolates.jpg',
    productCount: 85,
    featured: true,
    badge: 'Premium',
    color: 'from-amber-400 to-orange-500',
  },
  {
    id: 'namkeens-snacks',
    name: 'Namkeens & Snacks',
    description: 'Crispy and flavorful traditional snacks',
    image: '/images/categories/namkeens.jpg',
    productCount: 120,
    featured: false,
    color: 'from-yellow-400 to-orange-400',
  },
  {
    id: 'dry-fruits-nuts',
    name: 'Dry Fruits & Nuts',
    description: 'Premium quality dry fruits and nuts',
    image: '/images/categories/dry-fruits.jpg',
    productCount: 65,
    featured: false,
    color: 'from-green-400 to-emerald-500',
  },
  {
    id: 'gift-collections',
    name: 'Gift Collections',
    description: 'Beautifully packaged gift sets for special occasions',
    image: '/images/categories/gift-collections.jpg',
    productCount: 45,
    featured: true,
    badge: 'Gift Special',
    color: 'from-purple-400 to-pink-500',
  },
  {
    id: 'seasonal-specials',
    name: 'Seasonal Specials',
    description: 'Limited edition products for festivals and seasons',
    image: '/images/categories/seasonal.jpg',
    productCount: 30,
    featured: false,
    color: 'from-indigo-400 to-purple-500',
  },
];

const featuredProducts = [
  {
    id: 'gulab-jamun-premium',
    name: 'Premium Gulab Jamun',
    category: 'Traditional Sweets',
    price: 450,
    originalPrice: 500,
    rating: 4.8,
    reviewCount: 245,
    image: '/images/products/gulab-jamun.jpg',
    badges: ['Bestseller', 'Premium'],
    discount: 10,
  },
  {
    id: 'dark-chocolate-truffles',
    name: 'Dark Chocolate Truffles',
    category: 'Premium Chocolates',
    price: 850,
    rating: 4.9,
    reviewCount: 180,
    image: '/images/products/chocolate-truffles.jpg',
    badges: ['New', 'Premium'],
  },
  {
    id: 'kaju-katli-royal',
    name: 'Royal Kaju Katli',
    category: 'Traditional Sweets',
    price: 1200,
    rating: 4.7,
    reviewCount: 320,
    image: '/images/products/kaju-katli.jpg',
    badges: ['Royal Collection'],
  },
  {
    id: 'mixed-namkeen-combo',
    name: 'Mixed Namkeen Combo',
    category: 'Namkeens & Snacks',
    price: 350,
    originalPrice: 400,
    rating: 4.6,
    reviewCount: 155,
    image: '/images/products/mixed-namkeen.jpg',
    badges: ['Combo Deal'],
    discount: 12,
  },
];

const filters = [
  {
    name: 'Category',
    options: ['All', 'Traditional Sweets', 'Chocolates', 'Namkeens', 'Dry Fruits', 'Gift Sets'],
  },
  {
    name: 'Price Range',
    options: ['Under ₹300', '₹300 - ₹600', '₹600 - ₹1000', 'Above ₹1000'],
  },
  {
    name: 'Dietary',
    options: ['Vegetarian', 'Vegan', 'Sugar-Free', 'Organic', 'Gluten-Free'],
  },
  {
    name: 'Occasion',
    options: ['Festival', 'Wedding', 'Birthday', 'Corporate Gifts', 'Daily Treats'],
  },
];

const features = [
  {
    icon: Shield,
    title: 'Quality Assured',
    description: 'FSSAI certified products',
  },
  {
    icon: Leaf,
    title: 'Natural Ingredients',
    description: 'No artificial preservatives',
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'Finest ingredients sourced',
  },
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-harsha-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Premium Product
              <span className="text-harsha-orange-500"> Collection</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover our extensive range of traditional sweets, premium chocolates, and confectionery
              crafted with the finest ingredients and authentic recipes.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products, categories, or flavors..."
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-harsha-orange-500 focus:border-transparent"
                />
                <Button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  Search
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                  <feature.icon className="w-6 h-6 text-harsha-orange-500" />
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">{feature.title}</div>
                    <div className="text-sm text-gray-600">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our carefully curated product categories, each offering authentic flavors and premium quality.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products/${category.id}`}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className={`aspect-[4/3] bg-gradient-to-br ${category.color} relative`}>
                  {/* Placeholder for category image */}
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>

                  {/* Badge */}
                  {category.badge && (
                    <div className="absolute top-4 left-4 bg-white bg-opacity-90 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                      {category.badge}
                    </div>
                  )}

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-harsha-orange-200 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-white text-opacity-90 mb-3">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {category.productCount} Products
                      </span>
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                        <span className="text-sm">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-xl text-gray-600">
                Our most popular and highest-rated products
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button className="p-2 bg-harsha-orange-500 text-white">
                  <Grid className="w-4 h-4" />
                </button>
                <button className="p-2 bg-white text-gray-600 hover:bg-gray-50">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-harsha-orange-100 to-harsha-orange-200 flex items-center justify-center">
                    <ShoppingCart className="w-16 h-16 text-harsha-orange-400" />
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.badges.map((badge, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-harsha-orange-500 text-white text-xs font-semibold rounded-full"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  {/* Discount */}
                  {product.discount && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      -{product.discount}%
                    </div>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-harsha-orange-500 hover:text-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-harsha-orange-500 hover:text-white transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="text-sm text-harsha-orange-500 font-medium mb-1">
                    {product.category}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-harsha-orange-600 transition-colors">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.rating} ({product.reviewCount})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl font-bold text-gray-900">
                      ₹{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <Button className="w-full gap-2" size="sm">
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline">
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-harsha-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-xl text-harsha-orange-100 mb-8 max-w-3xl mx-auto">
            We offer custom orders and bulk quantities for special occasions and business needs.
            Contact us to discuss your requirements.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="secondary" size="lg" className="gap-2">
              <Heart className="w-5 h-5" />
              Custom Orders
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-harsha-orange-600">
              Bulk Inquiries
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}