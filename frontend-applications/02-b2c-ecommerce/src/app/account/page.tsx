'use client'

import { useSelector, useDispatch } from 'react-redux'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User,
  ShoppingBag,
  MapPin,
  Settings,
  LogOut,
  Package,
  CreditCard,
  Heart,
  Award,
  Calendar,
  Truck,
  MessageCircle,
  ChevronRight,
  Star,
  Bell
} from 'lucide-react'
import { AppDispatch, RootState } from '@/store/store'
import { logout } from '@/store/slices/authSlice'

export default function AccountPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  const handleLogout = () => {
    dispatch(logout())
    router.push('/')
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to access your account
          </h1>
          <p className="text-gray-600 mb-6">
            Access your order history, account preferences, and more.
          </p>
          <Link
            href="/auth/login"
            className="btn-primary inline-flex items-center"
          >
            Sign In to My Account
          </Link>
        </div>
      </div>
    )
  }

  // Mock data - in real app, this would come from API
  const userStats = {
    totalOrders: 12,
    totalSpent: 15750,
    loyaltyPoints: 245,
    pendingOrders: 2
  }

  const recentOrders = [
    {
      id: 'ORD-001',
      date: '2025-09-20',
      status: 'Delivered',
      total: 850,
      items: 3
    },
    {
      id: 'ORD-002',
      date: '2025-09-18',
      status: 'In Transit',
      total: 1200,
      items: 5
    },
    {
      id: 'ORD-003',
      date: '2025-09-15',
      status: 'Delivered',
      total: 650,
      items: 2
    }
  ]

  const menuItems = [
    {
      title: 'Order History',
      description: 'View your previous orders and track current deliveries',
      icon: ShoppingBag,
      href: '/account/orders',
      color: 'bg-luxury-gold-500',
      unreadCount: 2
    },
    {
      title: 'Address Book',
      description: 'Manage your delivery addresses',
      icon: MapPin,
      href: '/account/addresses',
      color: 'bg-luxury-champagne-500'
    },
    {
      title: 'Payment Methods',
      description: 'Manage stored payment methods',
      icon: CreditCard,
      href: '/account/payments',
      color: 'bg-royal-500'
    },
    {
      title: 'Wishlist',
      description: 'Items you saved for later',
      icon: Heart,
      href: '/account/wishlist',
      color: 'bg-luxury-burgundy-500',
      unreadCount: 3
    },
    {
      title: 'Support & Help',
      description: 'Get help and contact customer service',
      icon: MessageCircle,
      href: '/account/support',
      color: 'bg-royal-600'
    },
    {
      title: 'Account Settings',
      description: 'Update your personal information and preferences',
      icon: Settings,
      href: '/account/settings',
      color: 'bg-gray-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user.first_name}! Here's your account overview.</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Profile & Quick Stats */}
          <div className="space-y-6">
            {/* User Profile Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-luxury-gold-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-luxury-gold-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user.first_name} {user.last_name}
                  </h2>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-500">Gold Member</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Link
                  href="/account/profile"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-yello-600 text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-md transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Link>
                <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
                  <Bell className="w-4 h-4 mr-2" />
                  Notification Settings
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-royal-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-royal-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{userStats.totalOrders.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Total Orders</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-luxury-gold-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-luxury-gold-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{userStats.loyaltyPoints.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Loyalty Points</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-luxury-champagne-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-luxury-champagne-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">₹{userStats.totalSpent.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Lifetime Value</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{userStats.pendingOrders}</div>
                    <div className="text-xs text-gray-500">Pending Orders</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column - Recent Orders */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <Link
                  href="/account/orders"
                  className="text-yellow-600 hover:text-yellow-500 text-sm font-medium flex items-center"
                >
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/account/orders/${order.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:shadow-sm transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Package className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.id}</div>
                          <div className="text-xs text-gray-500">{order.date}</div>
                          <div className="text-xs text-gray-500">{order.items} items</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">₹{order.total}</div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          order.status === 'Delivered'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Account Menu */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Management</h3>
              <div className="grid grid-cols-2 gap-6">
                {menuItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group"
                  >
                    <div className="p-4 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${item.color} group-hover:scale-105 transition-transform`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-yellow-600 transition-colors">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      {item.unreadCount && (
                        <div className="mt-2 flex items-center justify-end">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {item.unreadCount} new
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Activity Timeline & Recommendations */}
          <div className="space-y-6">
            {/* Activity Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      Order <span className="font-medium">ORD-001</span> has been delivered successfully
                    </p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      Support ticket <span className="font-medium">#45892</span> has been resolved
                    </p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Award className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      Earned <span className="font-medium">50 loyalty points</span> from your recent order
                    </p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      Added new favorite: <span className="font-medium">Dark Chocolate Box</span>
                    </p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button className="text-yellow-600 hover:text-yellow-500 text-sm font-medium">
                  View All Activity →
                </button>
              </div>
            </div>

            {/* Personalized Recommendations */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 text-white">
              <div className="flex items-center space-x-3 mb-4">
                <Award className="w-6 h-6" />
                <h3 className="text-lg font-bold">Personalized For You</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Premium Chocolate Gift Set</h4>
                  <p className="text-sm opacity-90 mb-3">Perfect for special occasions</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">₹2,450</span>
                    <button className="px-4 py-2 bg-white text-yellow-600 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <button className="text-white underline text-sm hover:text-gray-100">
                    View More Recommendations
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
