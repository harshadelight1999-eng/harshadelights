import { redirect } from 'next/navigation';
import { getCurrentUser, getCurrentOrganization } from '@/lib/auth';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { 
  Package, 
  ShoppingCart, 
  CreditCard, 
  TrendingUp,
  AlertTriangle,
  Clock
} from 'lucide-react';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const organization = await getCurrentOrganization();

  if (!user || !organization) {
    redirect('/auth/sign-in');
  }

  // Mock data - replace with actual API calls
  const stats = {
    totalOrders: 156,
    totalSpent: 2850000,
    pendingOrders: 3,
    creditUtilized: organization.creditUtilized,
    creditLimit: organization.creditLimit,
    creditAvailable: organization.creditLimit - organization.creditUtilized,
  };

  const recentOrders = [
    {
      id: 'ORD-2024-001',
      date: '2024-09-15',
      amount: 125000,
      status: 'delivered',
      items: 12,
    },
    {
      id: 'ORD-2024-002',
      date: '2024-09-18',
      amount: 85000,
      status: 'processing',
      items: 8,
    },
    {
      id: 'ORD-2024-003',
      date: '2024-09-19',
      amount: 45000,
      status: 'pending',
      items: 5,
    },
  ];

  const topProducts = [
    { name: 'Kaju Katli', quantity: 150, amount: 22500 },
    { name: 'Milk Chocolate', quantity: 200, amount: 18000 },
    { name: 'Namkeen Mix', quantity: 100, amount: 12000 },
    { name: 'Almond Cookies', quantity: 80, amount: 9600 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName || user.email}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your account today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
              <p className="text-xs text-muted-foreground">Lifetime purchases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credit Available</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.creditAvailable)}</div>
              <p className="text-xs text-muted-foreground">Out of {formatCurrency(stats.creditLimit)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your last 3 orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-gray-600">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.amount)}</p>
                      <p className={`text-sm ${
                        order.status === 'delivered' ? 'text-green-600' :
                        order.status === 'processing' ? 'text-blue-600' :
                        'text-yellow-600'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Your most purchased items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.quantity} units</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(product.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Place New Order</CardTitle>
                <CardDescription>Start a new bulk order</CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Quick Order</CardTitle>
                <CardDescription>Use SKU-based quick ordering</CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Download Invoice</CardTitle>
                <CardDescription>Access recent invoices</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
