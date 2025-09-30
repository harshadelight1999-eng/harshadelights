import { NextRequest, NextResponse } from 'next/server'
import { getProductsList } from '@/lib/data/products'

// API Gateway configuration  
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3001'

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

    // Try to get products through the enhanced data service (which uses API Gateway)
    const { products, pagination } = await getProductsList(params)

    return NextResponse.json({
      products,
      pagination,
      count: pagination.count,
      message: 'Products fetched successfully'
    })
  } catch (error) {
    console.error('Error in products API route:', error)

    return NextResponse.json({
      error: 'Failed to fetch products',
      message: 'Both API Gateway and Medusa backend are unavailable',
      products: [],
      pagination: { count: 0, offset: 0, limit: 12, hasMore: false, totalPages: 0 }
    }, { status: 503 })
  }
}