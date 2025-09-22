'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  TrendingUp,
  Target,
  Star,
  Heart,
  ShoppingCart,
  ArrowLeft,
  Gift,
  Zap,
  Users,
  Clock,
  TrendingUp as TrendingRight,
  Award,
  Crown,
  ChevronRight,
  RefreshCw
} from 'lucide-react'

interface Recommendation {
  id: string
  type: 'personality' | 'seasonal' | 'loyalty' | 'behavioral' | 'collaborative'
  priority: 'high' | 'medium' | 'low'
  confidence: number
  product: {
    id: string
    name: string
    price: number
    originalPrice?: number
    image: string
    category: string
    rating: number
    reviewCount: number
    tags: string[]
  }
  reason: string
  reasonDetails: string[]
  expectedConversion?: number
  urgency?: 'immediate' | 'soon' | 'anytime'
}

interface Bundle {
  id: string
  name: string
  items: {
    name: string
    price: number
    image: string
  }[]
  totalPrice: number
  savings: number
  personalizedScore: number
  theme: string
}

export default function RecommendationsPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'personality' | 'seasonal' | 'loyalty' | 'behavioral'>('all')
  const [sortBy, setSortBy] = useState<'confidence' | 'price' | 'rating'>('confidence')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock AI-generated recommendations - in real app would come from ML API
  const [recommendations] = useState<Recommendation[]>([
    {
      id: 'rec_1',
      type: 'personality',
      priority: 'high',
      confidence: 92,
      product: {
        id: 'prod_001',
        name: 'Single Origin Colombian Dark Chocolate (70%)',
        price: 875,
        originalPrice: 950,
        image: '/api/placeholder/150/150',
        category: 'Dark Chocolate',
        rating: 4.8,
        reviewCount: 234,
        tags: ['Premium', 'Single Origin', 'Award Winning']
      },
      reason: 'Based on your preference for premium dark chocolate with high cocoa content',
      reasonDetails: [
        'You\'ve purchased 4.9+ rated dark chocolate 3 times this month',
        'Historical purchases show 67% preference for 70%+ cocoa content',
        'Similar customers buy this product at 3x higher frequency'
      ],
      expectedConversion: 78,
      urgency: 'immediate'
    },
    {
      id: 'rec_2',
      type: 'seasonal',
      priority: 'high',
      confidence: 88,
      product: {
        id: 'prod_002',
        name: 'Festive Assortment Gift Box (Premium)',
        price: 2450,
        image: '/api/placeholder/150/150',
        category: 'Gift Sets',
        rating: 4.9,
        reviewCount: 156,
        tags: ['Festive', 'Assortment', 'Gift']
      },
      reason: 'Diwali festival season detected - your purchase patterns show 40% increase during festivals',
      reasonDetails: [
        'Q3 historical data shows 40% higher spending on gifts and sets',
        'Festivals account for 28% of your total orders',
        'Customer segment analysis shows high gift purchase intention'
      ],
      expectedConversion: 65,
      urgency: 'soon'
    },
    {
      id: 'rec_3',
      type: 'loyalty',
      priority: 'medium',
      confidence: 85,
      product: {
        id: 'prod_003',
        name: 'Gold Member Exclusive - Artisanal Collection',
        price: 1450,
        image: '/api/placeholder/150/150',
        category: 'Premium Collection',
        rating: 4.7,
        reviewCount: 89,
        tags: ['Exclusive', 'Artisanal', 'Member Only']
      },
      reason: 'Gold tier member benefit - unlock exclusive products and earn bonus points',
      reasonDetails: [
        'As Gold member, you have access to member-exclusive products',
        'Earning 50 bonus points per purchase for remaining 250 points to Platinum',
        'Similar tier customers purchase exclusive items at 2x rate'
      ],
      expectedConversion: 72,
      urgency: 'immediate'
    },
    {
      id: 'rec_4',
      type: 'behavioral',
      priority: 'medium',
      confidence: 79,
      product: {
        id: 'prod_004',
        name: 'Frequently Bought Together - Chocolate Making Kit',
        price: 1250,
        image: '/api/placeholder/150/150',
        category: 'DIY Experience',
        rating: 4.6,
        reviewCount: 203,
        tags: ['DIY', 'Interactive', 'Educational']
      },
      reason: 'Customers who buy premium chocolate bars also frequently purchase this item together',
      reasonDetails: [
        'Market basket analysis shows 41% co-purchase rate with dark chocolate',
        'Similar browsing patterns detected (3+ premium purchases)',
        'Watch time on chocolate education videos indicates interest'
      ],
      expectedConversion: 58,
      urgency: 'anytime'
    },
    {
      id: 'rec_5',
      type: 'collaborative',
      priority: 'low',
      confidence: 76,
      product: {
        id: 'prod_005',
        name: 'Organic Swiss Milk Chocolate (Award Winning)',
        price: 650,
        image: '/api/placeholder/150/150',
        category: 'Organic',
        rating: 4.5,
        reviewCount: 167,
        tags: ['Organic', 'Award Winner', 'Sustainable']
      },
      reason: 'Highly rated by customers with similar purchase history and preferences',
      reasonDetails: [
        '9 of 12 customers with similar purchases rated this 5 stars',
        '40% buy rate from customers who follow similar product reviews',
        'Shared demographic (age, region) shows 55% preference alignment'
      ],
      expectedConversion: 52,
      urgency: 'anytime'
    }
  ])

  const [bundles] = useState<Bundle[]>([
    {
      id: 'bundle_1',
      name: 'Your Personalized Diwali Collection',
      items: [
        { name: 'Premium Gift Box', price: 1250, image: '/api/placeholder/80/80' },
        { name: 'Handcrafted Sweets', price: 850, image: '/api/placeholder/80/80' },
        { name: 'Festive Packaging', price: 350, image: '/api/placeholder/80/80' }
      ],
      totalPrice: 1980,
      savings: 470,
      personalizedScore: 94,
      theme: 'festive'
    },
    {
      id: 'bundle_2',
      name: 'Dark Chocolate Explorer Set',
      items: [
        { name: '70% Dark Chocolate', price: 650, image: '/api/placeholder/80/80' },
        { name: '75% Intense Dark', price: 720, image: '/api/placeholder/80/80' },
        { name: '80% Extreme Dark', price: 750, image: '/api/placeholder/80/80' }
      ],
      totalPrice: 1980,
      savings: 440,
      personalizedScore: 88,
      theme: 'premium'
    }
  ])

  const filteredAndSortedRecommendations = useMemo(() => {
    let filtered = recommendations.filter(rec =>
      activeFilter === 'all' || rec.type === activeFilter
    )

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return b.confidence - a.confidence
        case 'price':
          return a.product.price - b.product.price
        case 'rating':
          return b.product.rating - a.product.rating
        default:
          return 0
      }
    })
  }, [recommendations, activeFilter, sortBy])

  const handleAddToCart = (productId: string, productName: string) => {
    alert(`Added ${productName} to cart! AI-powered recommendation system noted this purchase for future suggestions.`)
  }

  const handleAddToWishlist = (productId: string, productName: string) => {
    alert(`Added ${productName} to wishlist! Your preferences have been updated in our AI learning system.`)
  }

  const handleRefreshRecommendations = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      alert('Recommendations refreshed! AI system has analyzed latest trends and updated suggestions.')
    }, 2000)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'personality': return <Sparkles className="w-4 h-4 text-purple-500" />
      case 'seasonal': return <Target className="w-4 h-4 text-green-500" />
      case 'loyalty': return <Crown className="w-4 h-4 text-yellow-500" />
      case 'behavioral': return <TrendingRight className="w-4 h-4 text-blue-500" />
      case 'collaborative': return <Users className="w-4 h-4 text-indigo-500" />
      default: return <Sparkles className="w-4 h-4 text-gray-500" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'personality': return 'Personality Based'
      case 'seasonal': return 'Seasonal & Events'
      case 'loyalty': return 'Loyalty Benefits'
      case 'behavioral': return 'Buying Patterns'
      case 'collaborative': return 'Social Proof'
      default: return 'AI Recommended'
    }
  }

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'immediate': return 'bg-red-100 text-red-800 border-red-200'
      case 'soon': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'anytime': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/account"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">AI Recommendations</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 flex items-center space-x-1">
                <Zap className="w-4 h-4 text-purple-500" />
                <span>Real-time AI updates every 24h</span>
              </div>
              <button
                onClick={handleRefreshRecommendations}
                className={`px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm flex items-center space-x-2 ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh AI'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Insights Summary */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 mb-8 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Your AI Shopping Assistant</h2>
              <p className="text-purple-100">Powered by advanced machine learning algorithms</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-sm opacity-90">AI Confidence</div>
              <div className="text-2xl font-bold">89%</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-sm opacity-90">Personalization Score</div>
              <div className="text-2xl font-bold">9.4/10</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-sm opacity-90">Items Analyzed</div>
              <div className="text-2xl font-bold">12,847</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-sm opacity-90">Prediction Accuracy</div>
              <div className="text-2xl font-bold">92%</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Recommendations', count: recommendations.length },
                { key: 'personality', label: 'Personal Preferences', count: recommendations.filter(r => r.type === 'personality').length },
                { key: 'seasonal', label: 'Seasonal & Events', count: recommendations.filter(r => r.type === 'seasonal').length },
                { key: 'loyalty', label: 'Loyalty Benefits', count: recommendations.filter(r => r.type === 'loyalty').length },
                { key: 'behavioral', label: 'Buying Patterns', count: recommendations.filter(r => r.type === 'behavioral').length },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === filter.key
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="confidence">AI Confidence</option>
                <option value="price">Price (Low to High)</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recommendations List */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {filteredAndSortedRecommendations.map((rec) => (
                <div key={rec.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  {/* Header with AI badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(rec.type)}
                      <div>
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                          {getTypeLabel(rec.type)}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {rec.confidence}% confidence • {rec.priority} priority
                        </span>
                      </div>
                    </div>

                    {rec.urgency && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(rec.urgency)}`}>
                        {rec.urgency.charAt(0).toUpperCase() + rec.urgency.slice(1)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={rec.product.image}
                        alt={rec.product.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {rec.product.name}
                      </h3>

                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-medium">{rec.product.rating}</span>
                          <span className="text-xs text-gray-500">({rec.product.reviewCount} reviews)</span>
                        </div>
                        <span className="text-xs text-gray-500">{rec.product.category}</span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {rec.product.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center space-x-2 mb-4">
                        <span className="text-2xl font-bold text-gray-900">₹{rec.product.price}</span>
                        {rec.product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">₹{rec.product.originalPrice}</span>
                        )}
                      </div>

                      {/* AI Reasoning */}
                      <div className="bg-purple-50 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-semibold text-purple-900 mb-2">Why We Recommend This</h4>
                        <p className="text-sm text-purple-800 mb-3">{rec.reason}</p>
                        <ul className="text-xs text-purple-700 space-y-1">
                          {rec.reasonDetails.map((detail, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="w-1 h-1 rounded-full bg-purple-600 mt-2 flex-shrink-0"></div>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                        {rec.expectedConversion && (
                          <div className="mt-3 pt-3 border-t border-purple-200">
                            <span className="text-xs text-purple-600">
                              Expected conversion rate: {rec.expectedConversion}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleAddToCart(rec.product.id, rec.product.name)}
                          className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center space-x-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </button>
                        <button
                          onClick={() => handleAddToWishlist(rec.product.id, rec.product.name)}
                          className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personalized Bundles */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Gift className="w-5 h-5 text-orange-500" />
                <span>Personalized Bundles</span>
              </h3>

              {bundles.map((bundle) => (
                <div key={bundle.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-900">{bundle.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        Personalized Score: {bundle.personalizedScore}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {bundle.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <img src={item.image} alt={item.name} className="w-6 h-6 rounded" />
                        <span className="text-sm text-gray-700 truncate">{item.name}</span>
                        <span className="text-sm text-gray-600 ml-auto">₹{item.price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Total:</span>
                      <div>
                        <span className="line-through text-gray-500 text-sm">₹{bundle.totalPrice + bundle.savings}</span>
                        <span className="text-lg font-bold text-orange-600 ml-2">₹{bundle.totalPrice}</span>
                      </div>
                    </div>
                    <p className="text-xs text-green-600 font-medium">Save ₹{bundle.savings}!</p>
                  </div>

                  <button className="w-full mt-3 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md text-sm">
                    Add Bundle to Cart
                  </button>
                </div>
              ))}
            </div>

            {/* AI Tips Sidebar */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-purple-500" />
                <span>AI Learning Insights</span>
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-purple-900 mb-2">Your Preferences</h4>
                  <ul className="text-xs text-purple-700 space-y-1">
                    <li>• 68% preference for dark chocolate</li>
                    <li>• Average order value: ₹2,946</li>
                    <li>• Preferred time: Weekends 2-4 PM</li>
                    <li>• Seasonal effect: +40% during festivals</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-green-900 mb-2">Optimization Tips</h4>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>• Try our subscription service for 15% savings</li>
                    <li>• Mix gift sets increase cart value by 35%</li>
                    <li>• Weekend purchases save on shipping</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Next Best Actions</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Purchase predicted in next 14 days</li>
                    <li>• Add review to boost recommendation accuracy</li>
                    <li>• Complete profile for hyper-personalization</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
