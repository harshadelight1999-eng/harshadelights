'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  ShoppingBag,
  DollarSign,
  Package,
  Star,
  Award,
  Target,
  PieChart,
  LineChart,
  Zap,
  Crown,
  Users,
  Clock,
  Percent
} from 'lucide-react'
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'3months' | '6months' | '1year' | 'all'>('6months')
  const [activeMetric, setActiveMetric] = useState<'orders' | 'spending' | 'loyalty'>('orders')

  // Comprehensive analytics data - in real app would come from API
  const analyticsData = {
    overview: {
      totalOrders: 28,
      totalSpent: 82500,
      averageOrderValue: 2946,
      loyaltyPointsEarned: 1250,
      comparisonPeriod: '+18%'
    },
    spendingTrends: [
      { month: 'Mar', spending: 18500, orders: 6 },
      { month: 'Apr', spending: 22800, orders: 8 },
      { month: 'May', spending: 19500, orders: 5 },
      { month: 'Jun', spending: 34100, orders: 11 },
      { month: 'Jul', spending: 28900, orders: 7 },
      { month: 'Aug', spending: 38200, orders: 12 }
    ],
    productCategories: [
      { name: 'Dark Chocolate', value: 35, amount: 28875, color: '#7c3aed' },
      { name: 'Milk Chocolate', value: 28, amount: 23100, color: '#ffc107' },
      { name: 'Gift Sets', value: 22, amount: 18150, color: '#e8bc5e' },
      { name: 'Custom Orders', value: 10, amount: 8250, color: '#b04848' },
      { name: 'Promotional', value: 5, amount: 4125, color: '#9c6eff' }
    ],
    seasonalTrends: [
      { season: 'Q1', orders: 12, avgSpending: 2850, change: '+15%' },
      { season: 'Q2', orders: 16, avgSpending: 3260, change: '+24%' },
      { season: 'Q3', orders: 18, avgSpending: 2980, change: '+12%' },
      { season: 'Q4', avgSpending: 0, orders: 0, change: 'N/A' } // Historical data projected
    ],
    loyaltyMetrics: {
      currentTier: 'Gold',
      pointsToNextTier: 250,
      pointsEarnedThisPeriod: 425,
      redemptionRate: 68,
      averagePointsPerOrder: 45
    },
    behaviorInsights: {
      preferredShoppingTime: 'Weekends (2-4 PM)',
      averageItemsPerOrder: 3.2,
      returnCustomerRate: 87,
      abandonedCartRate: 12,
      wishlistConversionRate: 71
    }
  }

  const filteredTrends = useMemo(() => {
    switch (timeRange) {
      case '3months': return analyticsData.spendingTrends.slice(-3)
      case '6months': return analyticsData.spendingTrends.slice(-6)
      case '1year': return analyticsData.spendingTrends // Would have full year data in real app
      default: return analyticsData.spendingTrends
    }
  }, [timeRange])

  const spendingComparison = {
    current: analyticsData.spendingTrends.slice(-3).reduce((sum, m) => sum + m.spending, 0),
    previous: analyticsData.spendingTrends.slice(-6, -3).reduce((sum, m) => sum + m.spending, 0)
  }

  const spendingGrowth = spendingComparison.previous > 0
    ? ((spendingComparison.current - spendingComparison.previous) / spendingComparison.previous * 100).toFixed(1)
    : 0

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`Month: ${label}`}</p>
          <p className="text-sm text-gray-600">
            {`Spending: ₹${payload[0].value?.toLocaleString()}`}
          </p>
          {payload[0].payload && (
            <p className="text-sm text-gray-600">
              {`Orders: ${payload[0].payload.orders}`}
            </p>
          )}
        </div>
      )
    }
    return null
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
              <h1 className="text-3xl font-bold text-gray-900">Shopping Analytics</h1>
            </div>

            {/* Time Range Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Time Range:</span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-royal-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-royal-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalOrders}</p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500">{analyticsData.overview.comparisonPeriod} vs last period</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-luxury-champagne-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-luxury-champagne-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">₹{analyticsData.overview.totalSpent.toLocaleString()}</p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500">+{spendingGrowth}% vs last period</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-luxury-gold-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-luxury-gold-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Order Value</p>
                <p className="text-2xl font-bold text-gray-900">₹{analyticsData.overview.averageOrderValue.toLocaleString()}</p>
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 text-luxury-gold-500 mr-1" />
                  <span className="text-luxury-gold-600">Above average customer</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-royal-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-royal-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Loyalty Points</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.loyaltyPointsEarned.toLocaleString()}</p>
                <div className="flex items-center text-sm">
                  <Crown className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-purple-600">Gold Member Tier</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Spending Trends Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Spending Trends</h2>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Peak spending in June</span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="spending"
                    stroke="#ffc107"
                    fill="#fff9e6"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Category Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Product Preferences</h2>
              <div className="text-sm text-gray-600 flex items-center space-x-1">
                <PieChart className="w-4 h-4 text-royal-500" />
                <span>Top categories by spending</span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={analyticsData.productCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.productCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any, props: any) => [
                      `₹${props.payload.amount.toLocaleString()}`,
                      props.payload.name
                    ]}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Insights */}
            <div className="mt-6 space-y-3">
              {analyticsData.productCategories.slice(0, 3).map((category, index) => (
                <div key={category.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₹{category.amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{category.value}% of spending</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Seasonal Trends Analysis */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Seasonal Buying Behavior</h2>
              <div className="text-sm text-gray-600 flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-green-500" />
                <span>Q2 shows highest engagement</span>
              </div>
            </div>

            <div className="space-y-4">
              {analyticsData.seasonalTrends.map((season) => (
                <div key={season.season} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center font-bold text-gray-900">
                      {season.season}
                    </div>
                    <div>
                      <div className="font-medium">Quarter {season.season.slice(1)}</div>
                      <div className="text-sm text-gray-600">Avg ₹{season.avgSpending.toLocaleString()}/order</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold">{season.orders}</div>
                    <div className="text-sm text-gray-600">orders</div>
                    {season.change !== 'N/A' && (
                      <div className={`text-sm flex items-center justify-end mt-1 ${
                        season.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {season.change.startsWith('+') ?
                          <TrendingUp className="w-3 h-3 mr-1" /> :
                          <TrendingDown className="w-3 h-3 mr-1" />
                        }
                        {season.change}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-luxury-gold-50 rounded-lg border border-luxury-gold-200">
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-luxury-gold-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-luxury-gold-900">Seasonal Insight</h4>
                  <p className="text-sm text-luxury-gold-800 mt-1">
                    Your spending peaks during Q2 (Apr-Jun), likely due to summer celebrations, festivals, and gift-giving occasions.
                    Consider your shopping patterns show holiday and event-driven purchasing behavior.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Loyalty Program Analytics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Loyalty Program Performance</h2>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Crown className="w-4 h-4 text-luxury-gold-500" />
                <span className="bg-luxury-gold-100 text-luxury-gold-800 px-2 py-1 rounded text-xs font-medium">
                  Gold Member
                </span>
              </div>
            </div>

            {/* Points Progress */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 text-white mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Points Progress</h3>
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Current Points</span>
                  <span className="font-bold">{analyticsData.loyaltyMetrics.pointsEarnedThisPeriod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>To Platinum Tier</span>
                  <span className="font-bold">{analyticsData.loyaltyMetrics.pointsToNextTier}</span>
                </div>
              </div>

              <div className="w-full bg-white bg-opacity-30 rounded-full h-3 mb-2">
                <div
                  className="bg-white h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(analyticsData.loyaltyMetrics.pointsEarnedThisPeriod / (analyticsData.loyaltyMetrics.pointsEarnedThisPeriod + analyticsData.loyaltyMetrics.pointsToNextTier)) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm opacity-90">Keep earning to reach Platinum tier benefits!</p>
            </div>

            {/* Loyalty Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analyticsData.loyaltyMetrics.redemptionRate}%</div>
                <div className="text-sm text-gray-600">Redemption Rate</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analyticsData.loyaltyMetrics.averagePointsPerOrder}</div>
                <div className="text-sm text-gray-600">Points/Order</div>
              </div>
            </div>

            {/* Behavior Insights */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Behavior Insights</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium">Preferred Shopping Time</span>
                  </div>
                  <span className="text-sm text-gray-600">{analyticsData.behaviorInsights.preferredShoppingTime}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">Avg Items per Order</span>
                  </div>
                  <span className="text-sm text-gray-600">{analyticsData.behaviorInsights.averageItemsPerOrder}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-medium">Return Customer Rate</span>
                  </div>
                  <span className="text-sm text-gray-600">{analyticsData.behaviorInsights.returnCustomerRate}%</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <Percent className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium">Wishlist Conversion</span>
                  </div>
                  <span className="text-sm text-gray-600">{analyticsData.behaviorInsights.wishlistConversionRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations Section */}
        <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-8 text-white">
          <div className="flex items-center space-x-3 mb-6">
            <BarChart3 className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
              <p className="text-indigo-100">Advanced analytics powered by machine learning</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <TrendingUp className="w-6 h-6 text-green-300 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Next Purchase Prediction</h3>
              <p className="text-sm text-indigo-100 mb-4">
                Based on your shopping patterns, you're likely to purchase again in the next 14 days.
                Your average purchase frequency is every 3-4 weeks.
              </p>
              <div className="text-sm font-medium text-green-300">
                Confidence: 87%
              </div>
            </div>

            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <Star className="w-6 h-6 text-yellow-300 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Seasonal Recommendation</h3>
              <p className="text-sm text-indigo-100 mb-4">
                Based on Q2 spending patterns, consider adding festive season gift sets to your next order.
                Your historical data shows 35% higher spending during festivals.
              </p>
              <div className="text-sm font-medium text-yellow-300">
                Suggested: Holiday Collection
              </div>
            </div>

            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <Target className="w-6 h-6 text-orange-300 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Loyalty Optimization</h3>
              <p className="text-sm text-indigo-100 mb-4">
                You're close to Platinum tier! Increase your average order value to ₹3,500 or make one more order to unlock premium benefits.
              </p>
              <div className="text-sm font-medium text-orange-300">
                250 points to Platinum
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
