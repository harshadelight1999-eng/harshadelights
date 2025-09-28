import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Eye, Download, Package, Clock, CheckCircle, Truck } from 'lucide-react';

// Mock orders data - replace with actual API calls
const mockOrders = [
  {
    id: 'ORD-2024-001',
    orderNumber: 'HD-B2B-2024-001',
    date: '2024-09-19',
    items: [
      { name: 'Kaju Katli', quantity: 10, price: 1350 },
      { name: 'Milk Chocolate', quantity: 20, price: 720 },
    ],
    subtotal: 27900,
    tax: 3348,
    total: 31248,
    status: 'delivered',
    deliveryDate: '2024-09-21',
    trackingNumber: 'HD-TRACK-001',
  },
  {
    id: 'ORD-2024-002',
    orderNumber: 'HD-B2B-2024-002',
    date: '2024-09-18',
    items: [
      { name: 'Namkeen Mix', quantity: 15, price: 540 },
      { name: 'Almond Cookies', quantity: 8, price: 1080 },
    ],
    subtotal: 16740,
    tax: 2009,
    total: 18749,
    status: 'shipped',
    deliveryDate: '2024-09-20',
    trackingNumber: 'HD-TRACK-002',
  },
  {
    id: 'ORD-2024-003',
    orderNumber: 'HD-B2B-2024-003',
    date: '2024-09-17',
    items: [
      { name: 'Premium Almonds', quantity: 5, price: 2250 },
    ],
    subtotal: 11250,
    tax: 1350,
    total: 12600,
    status: 'processing',
    deliveryDate: '2024-09-22',
    trackingNumber: null,
  },
  {
    id: 'ORD-2024-004',
    orderNumber: 'HD-B2B-2024-004',
    date: '2024-09-16',
    items: [
      { name: 'Sweet Buns', quantity: 50, price: 360 },
      { name: 'Kaju Katli', quantity: 5, price: 1350 },
    ],
    subtotal: 24750,
    tax: 2970,
    total: 27720,
    status: 'pending',
    deliveryDate: null,
    trackingNumber: null,
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'delivered':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'shipped':
      return <Truck className="h-4 w-4 text-blue-600" />;
    case 'processing':
      return <Package className="h-4 w-4 text-orange-600" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusBadge = (status: string) => {
  const variants = {
    delivered: 'default',
    shipped: 'secondary',
    processing: 'destructive',
    pending: 'outline',
  } as const;

  return (
    <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default async function OrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders</h1>
          <p className="text-gray-600">
            Track your orders and view order history
          </p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              Showing {mockOrders.length} orders
            </p>
          </div>
          <Button>
            <Package className="mr-2 h-4 w-4" />
            Place New Order
          </Button>
        </div>

        <div className="space-y-6">
          {mockOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                    <CardDescription>
                      Ordered on {formatDate(order.date)}
                      {order.deliveryDate && (
                        <span className="ml-2">
                          • Delivery: {formatDate(order.deliveryDate)}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.name} × {item.quantity}</span>
                          <span>{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Order Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (12%):</span>
                        <span>{formatCurrency(order.tax)}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {order.trackingNumber && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm">
                      <span className="font-semibold">Tracking Number:</span> {order.trackingNumber}
                    </p>
                  </div>
                )}
              </CardContent>

              <CardContent className="pt-0">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
