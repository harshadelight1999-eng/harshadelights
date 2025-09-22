import { NextRequest, NextResponse } from 'next/server'
import { getProductsList } from '@/lib/data/products'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const params = {
      limit: parseInt(searchParams.get('limit') || '12'),
      offset: parseInt(searchParams.get('offset') || '0'),
      q: searchParams.get('q') || undefined,
      category_id: searchParams.get('category_id')?.split(',') || undefined,
      order: searchParams.get('order') || undefined,
    }

    const { products, pagination } = await getProductsList(params)

    return NextResponse.json({
      products,
      pagination,
      count: pagination.count,
      message: 'Products fetched successfully'
    })
  } catch (error) {
    console.error('Error in products API route:', error)

    // Return mock data as fallback
    const mockProducts = [
      {
        id: '1',
        title: 'Premium Kaju Katli',
        description: 'Handcrafted cashew diamonds made with pure ghee and silver leaf',
        handle: 'premium-kaju-katli',
        thumbnail: '/api/placeholder/300/300',
        price: 450,
        compare_at_price: 500,
        variants: [{ id: '1-v1', price: 450, inventory_quantity: 50 }],
        categories: [{ id: 'c1', name: 'Sweets', handle: 'sweets' }]
      }
    ]

    return NextResponse.json({
      products: mockProducts,
      pagination: { count: 1, offset: 0, limit: 12, hasMore: false, totalPages: 1 },
      message: 'Using fallback data - Medusa backend unavailable'
    })
  }
}