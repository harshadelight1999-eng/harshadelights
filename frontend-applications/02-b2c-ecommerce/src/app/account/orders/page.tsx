'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  Filter,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ShoppingCart,
  Eye,
  RefreshCw,
  Download,
  Calendar,
  ChevronDown,
  SortAsc,
  SortDesc
} from 'lucide-react'

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  image: string
}

interface Order {
  id: string
  date: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
  total: number
  items: OrderItem[]
  tracking?: {
    number: string
    carrier: string
    estimatedDelivery: string
  }
  payment: {
    method: string
    status: 'paid' | 'pending' | 'failed' | 'refunded'
  }
  shipping: {
    address: string
    method: string
  }
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'total' | 'status'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Mock data - in real app would come from API
  const [orders] = useState<Order[]>([
    {
      id: 'ORD-001',
      date: '2025-09-20',
      status: 'delivered',
      total: 2850,
      items: [
        { id: 'item1', name: 'Dark Chocolate Gift Set', quantity: 1, price: 2150, image: '/api/placeholder/100/100' },
        { id: 'item2', name: 'Walnut Chocolate Bars', quantity: 2, price: 350, image: '/api/placeholder/100/100' }
      ],
      tracking: {
        number: 'HD123456789IN',
        carrier: 'BlueDart',
        estimatedDelivery: '2025-09-22'
      },
      payment: { method: 'Credit Card', status: 'paid' },
      shipping: { address: '123 MG Road, Mumbai, Maharashtra 400001', method: 'Express Delivery' }
    },
    {
      id: 'ORD-002',
      date: '2025-09-18',
      status: 'shipped',
      total: 1250,
      items: [
        { id: 'item3', name: 'Milk Chocolate Assortment', quantity: 1, price: 750, image: '/api/placeholder/100/100' },
        { id: 'item4', name: 'Dark & Milk Chocolate Mix', quantity: 1, price: 500, image: '/api/placeholder/100/100' }
      ],
      tracking: {
        number: 'HD987654321IN',
        carrier: 'Delhivery',
        estimatedDelivery: '2025-09-22'
      },
      payment: { method: 'UPI', status: 'paid' },
      shipping: { address: '456 Brigade Road, Bangalore, Karnataka 560001', method: 'Standard Delivery' }
    },
    {
      id: 'ORD-003',
      date: '2025-09-15',
      status: 'processing',
      total: 650,
      items: [
        { id: 'item5', name: 'Single Origin Dark Chocolate', quantity: 1, price: 650, image: '/api/placeholder/100/100' }
      ],
      payment: { method: 'Cash on Delivery', status: 'pending' },
      shipping: { address: '789 Connaught Place, Delhi 110001', method: 'Standard Delivery' }
    },
    {
      id: 'ORD-004',
      date: '2025-09-12',
      status: 'pending',
      total: 1900,
      items: [
        { id: 'item6', name: 'Premium Chocolate Box', quantity: 1, price: 950, image: '/api/placeholder/100/100' },
        { id: 'item7', name: 'Gift Packaging', quantity: 1, price: 200, image: '/api/placeholder/100/100' },
        { id: 'item8', name: 'Chocolate Making Kit', quantity: 1, price: 750, image: '/api/placeholder/100/100' }
      ],
      payment: { method: 'Net Banking', status: 'paid' },
      shipping: { address: '321 Park Street, Kolkata, West Bengal 700017', method: 'Express Delivery' }
    },
    {
      id: 'ORD-005',
      date: '2025-09-08',
      status: 'cancelled',
      total: 450,
      items: [
        { id: 'item9', name: 'White Chocolate Bars', quantity: 1, price: 450, image: '/api/placeholder/100/100' }
      ],
      payment: { method: 'Credit Card', status: 'refunded' },
      shipping: { address: '654 Reference Road, Chennai, Tamil Nadu 600028', method: 'Standard Delivery' }
    }
  ])

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      const matchesSearch = !searchTerm ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter

      const orderDate = new Date(order.date)
      const now = new Date()
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

      const matchesDate = dateFilter === 'all' ||
        (dateFilter === 'thisMonth' && orderDate >= new Date(now.getFullYear(), now.getMonth(), 1)) ||
        (dateFilter === 'lastMonth' && orderDate >= lastMonth && orderDate < new Date(now.getFullYear(), now.getMonth(), 1)) ||
        (dateFilter === 'last3Months' && orderDate >= threeMonthsAgo)

      return matchesSearch && matchesStatus && matchesDate
    })

    // Sort orders
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'date':
          comparison = new Date(b.date).getTime() - new Date(a.date).getTime()
          break
        case 'total':
          comparison = b.total - a.total
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
      }
      return sortDir === 'asc' ? -comparison : comparison
    })

    return filtered
  }, [orders, searchTerm, statusFilter, dateFilter, sortBy, sortDir])

  const handleSort = (field: 'date' | 'total' | 'status') => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('desc')
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'shipped': return <Truck className="w-5 h-5 text-blue-600" />
      case 'processing': return <RefreshCw className="w-5 h-5 text-yellow-600" />
      case 'pending': return <Clock className="w-5 h-5 text-orange-600" />
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-600" />
      default: return <Package className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-orange-100 text-orange-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleReorder = (orderId: string) => {
    // Would integrate with cart system
    alert(`Reorder functionality for ${orderId} would integrate with cart system`)
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
              <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders by ID or product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="all">All Time</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="last3Months">Last 3 Months</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-600">
            Showing {filteredAndSortedOrders.length} of {orders.length} orders
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Sort by:</span>
            {[
              { key: 'date', label: 'Order Date' },
              { key: 'total', label: 'Order Total' },
              { key: 'status', label: 'Status' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleSort(key as any)}
                className={`flex items-center space-x-1 text-sm px-3 py-1 rounded-md transition-colors ${
                  sortBy === key ? 'bg-yellow-100 text-yellow-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{label}</span>
                {sortBy === key && (
                  sortDir === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredAndSortedOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Order Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                <div className="flex items-center space-x-4 mb-2 lg:mb-0">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                    <p className="text-sm text-gray-600">Placed on {order.date}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ')}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">₹{order.total.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-sm text-gray-600">{order.items.length} item{order.items.length !== 1 ? 's' : ''}:</span>
                <div className="flex space-x-2">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-md">
                      <img src={item.image} alt={item.name} className="w-8 h-8 rounded-md" />
                      <span className="text-sm text-gray-900 truncate max-w-32">{item.name}</span>
                      <span className="text-sm text-gray-600">×{item.quantity}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <span className="text-sm text-gray-600">+{order.items.length - 3} more</span>
                  )}
                </div>
              </div>

              {/* Tracking Info (if shipped) */}
              {order.tracking && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="text-sm font-semibold text-blue-900">Tracking Information</h4>
                        <p className="text-sm text-blue-800">
                          {order.tracking.carrier}: {order.tracking.number}
                        </p>
                        <p className="text-sm text-blue-700">
                          Est. delivery: {order.tracking.estimatedDelivery}
                        </p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                      Track Package
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>

                {order.status !== 'cancelled' && (
                  <>
                    <button
                      onClick={() => handleReorder(order.id)}
                      className="inline-flex items-center px-4 py-2 border border-yellow-600 text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-md text-sm font-medium"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Reorder
                    </button>

                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <Download className="w-4 h-4 mr-2" />
                      Download Invoice
                    </button>
                  </>
                )}

                {(order.status === 'delivered' || order.status === 'cancelled') && (
                  <button className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md text-sm font-medium">
                    <Calendar className="w-4 h-4 mr-2" />
                    Write Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'You haven\'t placed any orders yet.'}
            </p>
            <Link
              href="/"
              className="btn-primary inline-flex items-center"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Start Shopping
            </Link>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 pt-20 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Order #{selectedOrder.id}</h3>
                    <p className="text-gray-600">Placed on {selectedOrder.date}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1).replace('-', ' ')}
                </div>
              </div>

              <div className="p-6">
                {/* Order Items */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Items Ordered</h4>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg" />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.name}</h5>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">₹{item.price.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">₹{(item.price * item.quantity).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Order Total:</div>
                      <div className="text-xl font-bold text-gray-900">₹{selectedOrder.total.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Order Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h4>
                    <p className="text-gray-700">{selectedOrder.shipping.address}</p>
                    <p className="text-sm text-gray-600 mt-1">Shipping Method: {selectedOrder.shipping.method}</p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h4>
                    <p className="text-gray-700">Method: {selectedOrder.payment.method}</p>
                    <p className="text-sm text-gray-700">Status: {selectedOrder.payment.status}</p>
                  </div>
                </div>

                {/* Tracking Information */}
                {selectedOrder.tracking && (
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Tracking Information</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-blue-900">Tracking Number</div>
                          <div className="text-lg font-mono text-blue-800">{selectedOrder.tracking.number}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-blue-900">Carrier</div>
                          <div className="text-blue-800">{selectedOrder.tracking.carrier}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-blue-900">Estimated Delivery</div>
                          <div className="text-blue-800">{selectedOrder.tracking.estimatedDelivery}</div>
                        </div>
                        <div>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                            Track Package
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleReorder(selectedOrder.id)}
                    className="btn-primary"
                  >
                    Reorder Items
                  </button>
                  {selectedOrder.status === 'delivered' && (
                    <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-sm font-medium">
                      Write Review
                    </button>
                  )}
                  <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md text-sm font-medium">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
