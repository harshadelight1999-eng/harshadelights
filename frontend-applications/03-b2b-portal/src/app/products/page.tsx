import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/layout/navbar';
import { ProductGrid } from '@/components/products/product-grid';
import { ProductFilters } from '@/components/products/product-filters';
import { ProductSearch } from '@/components/products/product-search';

// Mock products data - replace with actual API calls
const mockProducts = [
  {
    id: '1',
    sku: 'HD-KK-001',
    name: 'Kaju Katli',
    description: 'Premium cashew-based sweet delicacy',
    category: 'Sweets',
    images: ['/api/placeholder/300/300'],
    basePrice: 1500,
    customerPrice: 1350,
    discount: 10,
    discountType: 'percentage' as const,
    unit: 'kg',
    minimumOrderQuantity: 5,
    inStock: true,
    stockQuantity: 100,
    specifications: {
      'Shelf Life': '15 days',
      'Ingredients': 'Cashew, Sugar, Ghee',
      'Packaging': 'Premium box',
    },
  },
  {
    id: '2',
    sku: 'HD-MC-001',
    name: 'Milk Chocolate Bar',
    description: 'Rich milk chocolate with 35% cocoa',
    category: 'Chocolates',
    images: ['/api/placeholder/300/300'],
    basePrice: 800,
    customerPrice: 720,
    discount: 10,
    discountType: 'percentage' as const,
    unit: 'kg',
    minimumOrderQuantity: 10,
    inStock: true,
    stockQuantity: 200,
    specifications: {
      'Shelf Life': '12 months',
      'Cocoa Content': '35%',
      'Packaging': 'Foil wrapper',
    },
  },
  {
    id: '3',
    sku: 'HD-NM-001',
    name: 'Namkeen Mix',
    description: 'Traditional Indian savory snack mix',
    category: 'Namkeens',
    images: ['/api/placeholder/300/300'],
    basePrice: 600,
    customerPrice: 540,
    discount: 10,
    discountType: 'percentage' as const,
    unit: 'kg',
    minimumOrderQuantity: 10,
    inStock: true,
    stockQuantity: 150,
    specifications: {
      'Shelf Life': '6 months',
      'Type': 'Spicy mix',
      'Packaging': 'Sealed pouch',
    },
  },
  {
    id: '4',
    sku: 'HD-AC-001',
    name: 'Almond Cookies',
    description: 'Buttery cookies with premium almonds',
    category: 'Cookies',
    images: ['/api/placeholder/300/300'],
    basePrice: 1200,
    customerPrice: 1080,
    discount: 10,
    discountType: 'percentage' as const,
    unit: 'kg',
    minimumOrderQuantity: 5,
    inStock: true,
    stockQuantity: 80,
    specifications: {
      'Shelf Life': '3 months',
      'Main Ingredient': 'Almond',
      'Packaging': 'Cookie tin',
    },
  },
  {
    id: '5',
    sku: 'HD-DF-001',
    name: 'Premium Almonds',
    description: 'California almonds, premium grade',
    category: 'Dry Fruits',
    images: ['/api/placeholder/300/300'],
    basePrice: 2500,
    customerPrice: 2250,
    discount: 10,
    discountType: 'percentage' as const,
    unit: 'kg',
    minimumOrderQuantity: 2,
    inStock: true,
    stockQuantity: 50,
    specifications: {
      'Origin': 'California',
      'Grade': 'Premium',
      'Packaging': 'Vacuum sealed',
    },
  },
  {
    id: '6',
    sku: 'HD-BU-001',
    name: 'Sweet Buns',
    description: 'Fresh sweet buns with cardamom flavor',
    category: 'Buns',
    images: ['/api/placeholder/300/300'],
    basePrice: 400,
    customerPrice: 360,
    discount: 10,
    discountType: 'percentage' as const,
    unit: 'dozen',
    minimumOrderQuantity: 20,
    inStock: true,
    stockQuantity: 300,
    specifications: {
      'Shelf Life': '2 days',
      'Flavor': 'Cardamom',
      'Packaging': 'Paper box',
    },
  },
];

export default async function ProductsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600">
            Browse our complete catalog with your exclusive wholesale pricing
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64">
            <ProductFilters />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <ProductSearch />
            </div>
            <ProductGrid products={mockProducts} />
          </div>
        </div>
      </main>
    </div>
  );
}
