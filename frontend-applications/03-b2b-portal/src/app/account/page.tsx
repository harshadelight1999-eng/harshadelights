import { redirect } from 'next/navigation';
import { getCurrentUser, getCurrentOrganization } from '@/lib/auth';

export const dynamic = 'force-dynamic';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import {
  CreditCard,
  Download,
  User,
  Building,
  Phone,
  MapPin,
  FileText,
  Settings,
  Users,
} from 'lucide-react';

export default async function AccountPage() {
  const user = await getCurrentUser();
  const organization = await getCurrentOrganization();

  if (!user || !organization) {
    redirect('/auth/sign-in');
  }

  // Mock data - replace with actual API calls
  const accountSummary = {
    totalOrders: 156,
    totalSpent: 2850000,
    averageOrderValue: 18269,
    creditLimit: organization.creditLimit,
    creditUtilized: organization.creditUtilized,
    creditAvailable: organization.creditLimit - organization.creditUtilized,
    pendingInvoices: 3,
    overdueAmount: 15000,
  };

  const recentInvoices = [
    {
      id: 'INV-2024-001',
      orderNumber: 'HD-B2B-2024-001',
      amount: 31248,
      dueDate: '2024-10-15',
      status: 'paid',
    },
    {
      id: 'INV-2024-002',
      orderNumber: 'HD-B2B-2024-002',
      amount: 18749,
      dueDate: '2024-10-10',
      status: 'paid',
    },
    {
      id: 'INV-2024-003',
      orderNumber: 'HD-B2B-2024-003',
      amount: 12600,
      dueDate: '2024-09-25',
      status: 'overdue',
    },
  ];

  const customerTier = organization.customerTier;
  const tierBenefits = {
    gold: ['10% discount on all products', 'Priority delivery', 'Dedicated account manager', 'Extended payment terms'],
    silver: ['7% discount on all products', 'Standard delivery', 'Email support', 'Standard payment terms'],
    bronze: ['5% discount on all products', 'Standard delivery', 'Phone support', 'Standard payment terms'],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Management</h1>
          <p className="text-gray-600">
            Manage your account settings, credit limits, and billing information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Overview */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Overview</CardTitle>
                <CardDescription>Your account summary and key metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold">{accountSummary.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold">{formatCurrency(accountSummary.totalSpent)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Average Order Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(accountSummary.averageOrderValue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending Invoices</p>
                    <p className="text-2xl font-bold">{accountSummary.pendingInvoices}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Credit Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Credit Information
                </CardTitle>
                <CardDescription>Your credit limit and utilization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Credit Limit:</span>
                    <span className="font-semibold">{formatCurrency(accountSummary.creditLimit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Credit Utilized:</span>
                    <span className="font-semibold">{formatCurrency(accountSummary.creditUtilized)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Credit Available:</span>
                    <span className="font-semibold text-luxury-champagne-600">
                      {formatCurrency(accountSummary.creditAvailable)}
                    </span>
                  </div>
                  {accountSummary.overdueAmount > 0 && (
                    <div className="flex justify-between text-luxury-burgundy-600">
                      <span>Overdue Amount:</span>
                      <span className="font-semibold">
                        {formatCurrency(accountSummary.overdueAmount)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-royal-600 h-2 rounded-full"
                    style={{
                      width: `${(accountSummary.creditUtilized / accountSummary.creditLimit) * 100}%`,
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Invoices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Recent Invoices
                </CardTitle>
                <CardDescription>Your latest invoices and payment status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentInvoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{invoice.id}</p>
                        <p className="text-sm text-gray-600">Order: {invoice.orderNumber}</p>
                        <p className="text-sm text-gray-600">Due: {invoice.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                        <Badge
                          variant={invoice.status === 'paid' ? 'default' : 'destructive'}
                          className="mt-1"
                        >
                          {invoice.status}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organization Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Organization Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">{organization.name}</p>
                  <Badge variant="outline" className="mt-1">
                    {customerTier.charAt(0).toUpperCase() + customerTier.slice(1)} Customer
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-gray-400" />
                    {organization.contactInfo.phone}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                    {organization.contactInfo.address}
                  </div>
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-gray-400" />
                    GST: {organization.contactInfo.gstNumber}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Tier Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  {customerTier.charAt(0).toUpperCase() + customerTier.slice(1)} Benefits
                </CardTitle>
                <CardDescription>Your current tier benefits</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {tierBenefits[customerTier as keyof typeof tierBenefits].map((benefit, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-luxury-champagne-500 rounded-full mr-3"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Button>
                <Button className="w-full" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
                <Button className="w-full" variant="outline">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payment Methods
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
