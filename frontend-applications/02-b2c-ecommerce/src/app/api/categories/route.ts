import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Connect to Medusa backend for categories
    const medusaResponse = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/product-categories`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!medusaResponse.ok) {
      // Fallback to sample data if Medusa is not available
      return NextResponse.json({
        categories: getSampleCategories(),
      });
    }

    const data = await medusaResponse.json();

    return NextResponse.json({
      categories: data.product_categories || getSampleCategories(),
    });
  } catch (error) {
    console.error('Categories API error:', error);
    // Return sample data for development
    return NextResponse.json({
      categories: getSampleCategories(),
    });
  }
}

function getSampleCategories() {
  return [
    {
      id: 'cat_1',
      name: 'Traditional Sweets',
      handle: 'traditional-sweets',
      description: 'Authentic traditional Indian sweets made with time-honored recipes',
      image: '/images/categories/traditional-sweets.jpg',
      product_count: 45,
    },
    {
      id: 'cat_2',
      name: 'Premium Chocolates',
      handle: 'premium-chocolates',
      description: 'Handcrafted chocolates made with finest Belgian cocoa',
      image: '/images/categories/premium-chocolates.jpg',
      product_count: 28,
    },
    {
      id: 'cat_3',
      name: 'Namkeens & Snacks',
      handle: 'namkeens-snacks',
      description: 'Crispy and flavorful traditional Indian snacks',
      image: '/images/categories/namkeens-snacks.jpg',
      product_count: 35,
    },
    {
      id: 'cat_4',
      name: 'Dry Fruits & Nuts',
      handle: 'dry-fruits-nuts',
      description: 'Premium quality dry fruits and nuts from the finest sources',
      image: '/images/categories/dry-fruits-nuts.jpg',
      product_count: 22,
    },
    {
      id: 'cat_5',
      name: 'Gift Collections',
      handle: 'gift-collections',
      description: 'Beautifully packaged gift sets for special occasions',
      image: '/images/categories/gift-collections.jpg',
      product_count: 18,
    },
    {
      id: 'cat_6',
      name: 'Seasonal Specials',
      handle: 'seasonal-specials',
      description: 'Limited edition products for festivals and special occasions',
      image: '/images/categories/seasonal-specials.jpg',
      product_count: 12,
    },
  ];
}