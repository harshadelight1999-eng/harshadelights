import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getB2BProductsList } from '@/lib/data/products';

export const dynamic = 'force-dynamic';
import { Navbar } from '@/components/layout/navbar';
import { ProductGrid } from '@/components/products/product-grid';
import { ProductFilters } from '@/components/products/product-filters';
import { ProductSearch } from '@/components/products/product-search';

interface PageProps {
  searchParams: {
    page?: string;
    limit?: string;
    category?: string;
    search?: string;
  };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Parse search parameters
  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '12');
  const offset = (page - 1) * limit;

  let products: any[] = [];
  let pagination = {
    count: 0,
    offset: 0,
    limit: 12,
    hasMore: false,
    totalPages: 0
  };
  let error: string | null = null;

  try {
    const result = await getB2BProductsList({
      limit,
      offset,
      q: searchParams.search,
      category_id: searchParams.category ? [searchParams.category] : undefined,
    });
    
    products = result.products;
    pagination = result.pagination;
  } catch (err) {
    console.error('Failed to fetch products:', err);
    error = 'Failed to load products. Please try again later.';
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

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        ) : null}

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
            
            {products.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Showing {pagination.offset + 1}-{Math.min(pagination.offset + pagination.limit, pagination.count)} of {pagination.count} products
                </div>
                <ProductGrid products={products} />
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex gap-2">
                      {page > 1 && (
                        <a
                          href={`?page=${page - 1}&limit=${limit}${searchParams.search ? `&search=${searchParams.search}` : ''}${searchParams.category ? `&category=${searchParams.category}` : ''}`}
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
                          href={`?page=${page + 1}&limit=${limit}${searchParams.search ? `&search=${searchParams.search}` : ''}${searchParams.category ? `&category=${searchParams.category}` : ''}`}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Next
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found.</p>
                {searchParams.search && (
                  <p className="text-gray-400 mt-2">Try adjusting your search criteria.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}