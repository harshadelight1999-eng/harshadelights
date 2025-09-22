import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, TrendingUp } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Sign In to Harsha Delights B2B Portal
            </h1>
            <p className="text-xl text-gray-600">
              Access your wholesale account and manage your orders
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="mr-2 h-6 w-6" />
                    Enterprise Features
                  </CardTitle>
                  <CardDescription>
                    Everything you need for wholesale ordering
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Multi-user organizations</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Bulk pricing & discounts</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Account management</span>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  New to our B2B portal?
                </p>
                <Button variant="outline" asChild className="mt-2">
                  <Link href="/register">
                    Request Account
                  </Link>
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sign In Options</CardTitle>
                  <CardDescription>
                    Choose your preferred authentication method
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    asChild
                    className="w-full"
                    size="lg"
                  >
                    <Link href="/api/auth/sign-in">
                      Sign In with WorkOS
                    </Link>
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Enterprise SSO Available
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• Google Workspace</p>
                    <p>• Microsoft Azure AD</p>
                    <p>• Okta</p>
                    <p>• Custom SAML providers</p>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center text-sm text-gray-600">
                <p>
                  By signing in, you agree to our{' '}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
