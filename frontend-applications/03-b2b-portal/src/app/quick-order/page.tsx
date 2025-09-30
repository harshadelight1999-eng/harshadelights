import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
import { Navbar } from '@/components/layout/navbar';
import { QuickOrderForm } from '@/components/orders/quick-order-form';

export default async function QuickOrderPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quick Order</h1>
          <p className="text-gray-600">
            Place bulk orders quickly using SKUs or upload a CSV file
          </p>
        </div>

        <QuickOrderForm />
      </main>
    </div>
  );
}
