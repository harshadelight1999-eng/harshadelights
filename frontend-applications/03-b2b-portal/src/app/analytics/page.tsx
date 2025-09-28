'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Download,
  Filter,
  Eye,
  Target,
  Award,
  AlertTriangle,
} from 'lucide-react'
import { addDays, subDays, format } from 'date-fns'

// Mock data for business intelligence
const salesData = [
  { month: 'Jan', revenue: 125000, orders: 145, customers: 89 },
  { month: 'Feb', revenue: 138000, orders: 162, customers: 96 },
  { month: 'Mar', revenue: 165000, orders: 189, customers: 112 },
  { month: 'Apr', revenue: 142000, orders: 156, customers: 98 },
  { month: 'May', revenue: 189000, orders: 215, customers: 134 },
  { month: 'Jun', revenue: 198000, orders: 234, customers: 145 },
  { month: 'Jul', revenue: 205000, orders: 245, customers: 152 },
  { month: 'Aug', revenue: 225000, orders: 267, customers: 168 },
  { month: 'Sep', revenue: 212000, orders: 251, customers: 159 },
  { month: 'Oct', revenue: 238000, orders: 289, customers: 178 },
  { month: 'Nov', revenue: 265000, orders: 312, customers: 195 },
  { month: 'Dec', revenue: 285000, orders: 342, customers: 208 },
]

const productCategoryData = [
  { name: 'Traditional Sweets', value: 45, revenue: 1285000, color: '#8884d8' },
  { name: 'Premium Chocolates', value: 25, revenue: 865000, color: '#82ca9d' },
  { name: 'Dry Fruits', value: 15, revenue: 520000, color: '#ffc658' },
  { name: 'Gift Boxes', value: 10, revenue: 425000, color: '#ff7c7c' },
  { name: 'Beverages', value: 5, revenue: 185000, color: '#8dd1e1' },
]

const customerSegmentData = [
  { segment: 'Premium (>₹50K)', customers: 45, revenue: 1850000, avgOrder: 15200 },
  { segment: 'Regular (₹20K-₹50K)', customers: 128, revenue: 2140000, avgOrder: 8500 },
  { segment: 'New (<₹20K)', customers: 267, revenue: 1890000, avgOrder: 4200 },
]

const performanceMetrics = [
  { metric: 'Conversion Rate', value: '3.45%', change: '+0.23%', trend: 'up' },
  { metric: 'Avg Order Value', value: '₹8,425', change: '+₹185', trend: 'up' },
  { metric: 'Customer Lifetime Value', value: '₹42,300', change: '+₹2,100', trend: 'up' },
  { metric: 'Cart Abandonment', value: '23.4%', change: '-1.8%', trend: 'down' },
]

const topProducts = [
  { name: 'Premium Kaju Katli', orders: 234, revenue: 125400, margin: '42%' },
  { name: 'Royal Gulab Jamun', orders: 189, revenue: 98200, margin: '38%' },
  { name: 'Chocolate Truffle Box', orders: 156, revenue: 156000, margin: '35%' },
  { name: 'Mixed Dry Fruits', orders: 145, revenue: 87000, margin: '48%' },
  { name: 'Festival Gift Hamper', orders: 98, revenue: 147000, margin: '32%' },
]

const recentOrders = [
  { id: 'ORD-2024-001', customer: 'Sweet Solutions Ltd', amount: 12500, status: 'delivered', date: '2024-01-15' },
  { id: 'ORD-2024-002', customer: 'Celebration Caterers', amount: 8200, status: 'shipped', date: '2024-01-14' },
  { id: 'ORD-2024-003', customer: 'Royal Events Co', amount: 15600, status: 'processing', date: '2024-01-14' },
  { id: 'ORD-2024-004', customer: 'Mumbai Sweets Chain', amount: 25000, status: 'delivered', date: '2024-01-13' },
  { id: 'ORD-2024-005', customer: 'Delhi Confectionery', amount: 9800, status: 'pending', date: '2024-01-13' },
]

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [selectedMetric, setSelectedMetric] = useState('revenue')
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly')

  // Calculated KPIs
  const totalRevenue = useMemo(() =>
    salesData.reduce((sum, item) => sum + item.revenue, 0), []
  )

  const totalOrders = useMemo(() =>
    salesData.reduce((sum, item) => sum + item.orders, 0), []
  )

  const totalCustomers = useMemo(() =>
    Math.max(...salesData.map(item => item.customers)), []
  )

  const averageOrderValue = Math.round(totalRevenue / totalOrders)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' && entry.name.includes('Revenue')
                ? `₹${entry.value.toLocaleString()}`
                : entry.value.toLocaleString()
              }
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Business Intelligence</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for your confectionery business
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <DatePickerWithRange
            date={dateRange}
            onDateChange={(date) => {
              if (date?.from && date?.to) {
                setDateRange({ from: date.from, to: date.to })
              }
            }}
          />
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalRevenue / 100000).toFixed(1)}L</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +12.5% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +8.2% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +15.3% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{averageOrderValue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +3.7% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue performance over the year</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `₹${(value / 1000)}K`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                      name="Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sales by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Revenue distribution across product categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {productCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Metrics</CardTitle>
              <CardDescription>Important business metrics and their trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">{metric.metric}</div>
                      {metric.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="text-2xl font-bold mt-2">{metric.value}</div>
                    <div className={`text-xs mt-1 ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change} from last period
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Overview Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Sales Performance</CardTitle>
                    <CardDescription>Revenue, orders, and customer trends</CardDescription>
                  </div>
                  <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="orders">Orders</SelectItem>
                      <SelectItem value="customers">Customers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) =>
                      selectedMetric === 'revenue' ? `₹${(value / 1000)}K` : value.toString()
                    } />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey={selectedMetric}
                      fill="#8884d8"
                      name={selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest order activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{order.id}</div>
                        <div className="text-xs text-muted-foreground">{order.customer}</div>
                        <div className="text-xs text-muted-foreground">{order.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">₹{order.amount.toLocaleString()}</div>
                        <Badge
                          variant={
                            order.status === 'delivered' ? 'default' :
                            order.status === 'shipped' ? 'secondary' :
                            order.status === 'processing' ? 'destructive' : 'outline'
                          }
                          className="text-xs"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
                <CardDescription>Best selling products by orders and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.orders} orders • {product.margin} margin
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">₹{product.revenue.toLocaleString()}</div>
                        <div className="flex items-center text-xs text-green-600">
                          <Award className="mr-1 h-3 w-3" />
                          #{index + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Revenue by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productCategoryData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip
                      formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Segments */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Segmentation</CardTitle>
                <CardDescription>Customer distribution by spend levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerSegmentData.map((segment, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{segment.segment}</div>
                        <Badge variant="secondary">{segment.customers} customers</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Total Revenue</div>
                          <div className="font-semibold">₹{(segment.revenue / 100000).toFixed(1)}L</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Avg Order Value</div>
                          <div className="font-semibold">₹{segment.avgOrder.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>New customer acquisition over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="customers"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ fill: '#8884d8' }}
                      name="New Customers"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}