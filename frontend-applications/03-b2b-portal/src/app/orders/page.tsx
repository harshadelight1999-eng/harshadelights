import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getB2BOrdersList } from '@/lib/data/orders';

export const dynamic = 'force-dynamic';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Eye, Download, Package, Clock, CheckCircle, Truck } from 'lucide-react';

interface PageProps {
  searchParams: {
    page?: string;
    limit?: string;
    status?: string;
  };
}

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

export default async function OrdersPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Parse search parameters
  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '10');
  const offset = (page - 1) * limit;
  const status = searchParams.status as any;

  let orders: any[] = [];
  let pagination = {
    count: 0,
    offset: 0,
    limit: 10,
    hasMore: false,
    totalPages: 0
  };
  let error: string | null = null;

  try {
    const result = await getB2BOrdersList({
      limit,
      offset,
      status,
      organizationId: user.organizationId
    });
    
    orders = result.orders;
    pagination = result.pagination;
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    error = 'Failed to load orders. Please try again later.';
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

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        ) : null}

        <div className="mb-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              Showing {pagination.offset + 1}-{Math.min(pagination.offset + pagination.limit, pagination.count)} of {pagination.count} orders
            </p>
          </div>
          <div className="flex space-x-2">
            <select 
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={status || ''}
              onChange={(e) => {
                const newStatus = e.target.value;
                const params = new URLSearchParams(searchParams);
                if (newStatus) {
                  params.set('status', newStatus);
                } else {
                  params.delete('status');
                }
                params.delete('page'); // Reset to first page
                window.location.href = `?${params.toString()}`;
              }}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button>
              <Package className="mr-2 h-4 w-4" />
              Place New Order
            </Button>
          </div>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                      <CardDescription>
                        Ordered on {formatDate(order.createdAt)}
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
                        {order.items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.productName} × {item.quantity}</span>
                            <span>{formatCurrency(item.totalPrice)}</span>
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
                          <span>Tax:</span>
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

                  {order.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm">
                        <span className="font-semibold">Notes:</span> {order.notes}
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex gap-2">
                  {page > 1 && (
                    <a
                      href={`?page=${page - 1}&limit=${limit}${status ? `&status=${status}` : ''}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Previous
                    </a>
                  )}
                  <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                    Page {page} of {pagination.totalPages}
                  </span>
                  {pagination.hasMore && (
                    <a
                      href={`?page=${page + 1}&limit=${limit}${status ? `&status=${status}` : ''}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Next
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No orders found.</p>
            <p className="text-gray-400 mt-2">
              {status ? 'Try adjusting your filter criteria.' : 'Place your first order to get started.'}
            </p>
            <Button className="mt-4">
              <Package className="mr-2 h-4 w-4" />
              Browse Products
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
