import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Harsha Delights B2B Portal
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Streamline your wholesale ordering process with our comprehensive B2B platform. 
            Access exclusive pricing, manage your account, and track orders in real-time.
          </p>
          <div className="flex justify-center space-x-4">
            <Button asChild size="lg">
              <Link href="/auth/sign-in">Sign In to Portal</Link>
            </Button>
            <Button variant="outline" size="lg">
              <Link href="/register">Register Account</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Product Catalog
              </CardTitle>
              <CardDescription>
                Browse our complete range of premium confectionery products with detailed specifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Sweets & Mithai</li>
                <li>• Chocolates & Candies</li>
                <li>• Namkeens & Snacks</li>
                <li>• Dry Fruits & Nuts</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Bulk Ordering
              </CardTitle>
              <CardDescription>
                Place bulk orders with custom pricing and volume discounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Quick Order Forms</li>
                <li>• CSV Upload Support</li>
                <li>• Order Templates</li>
                <li>• Real-time Stock</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Account Management
              </CardTitle>
              <CardDescription>
                Manage your account, credit limits, and payment terms.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Credit Limit Tracking</li>
                <li>• Payment History</li>
                <li>• Invoice Downloads</li>
                <li>• User Management</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Analytics
              </CardTitle>
              <CardDescription>
                Track your purchasing patterns and business insights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Purchase Analytics</li>
                <li>• Top Products</li>
                <li>• Spending Trends</li>
                <li>• Order History</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to get started?</h2>
          <p className="text-gray-600 mb-6">
            Join hundreds of wholesale partners who trust Harsha Delights for their confectionery needs.
          </p>
          <Button asChild size="lg">
            <Link href="/register">Create Your Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
