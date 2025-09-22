import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Connect to Medusa backend for featured products
    const medusaResponse = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/products?is_featured=true&limit=8`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!medusaResponse.ok) {
      // Fallback to sample data if Medusa is not available
      return NextResponse.json({
        products: getSampleFeaturedProducts(),
      });
    }

    const data = await medusaResponse.json();

    return NextResponse.json({
      products: data.products || getSampleFeaturedProducts(),
    });
  } catch (error) {
    console.error('Featured products API error:', error);
    // Return sample data for development
    return NextResponse.json({
      products: getSampleFeaturedProducts(),
    });
  }
}

function getSampleFeaturedProducts() {
  return [
    {
      id: 'prod_featured_1',
      title: 'Bestseller Gulab Jamun',
      subtitle: 'Most loved traditional sweet',
      description: 'Our signature gulab jamun that customers love the most',
      handle: 'bestseller-gulab-jamun',
      thumbnail: '/images/products/gulab-jamun-featured.jpg',
      images: [
        {
          id: 'img_f1',
          url: '/images/products/gulab-jamun-featured.jpg',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      variants: [
        {
          id: 'var_f1',
          title: '500g Box',
          product_id: 'prod_featured_1',
          inventory_quantity: 100,
          price: 450,
          compare_at_price: 500,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      categories: [
        {
          id: 'cat_1',
          name: 'Traditional Sweets',
          handle: 'traditional-sweets',
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod_featured_2',
      title: 'Premium Chocolate Collection',
      subtitle: 'Artisan crafted chocolates',
      description: 'Handpicked selection of our finest chocolate varieties',
      handle: 'premium-chocolate-collection',
      thumbnail: '/images/products/chocolate-collection.jpg',
      images: [
        {
          id: 'img_f2',
          url: '/images/products/chocolate-collection.jpg',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      variants: [
        {
          id: 'var_f2',
          title: 'Assorted Box',
          product_id: 'prod_featured_2',
          inventory_quantity: 50,
          price: 1200,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      categories: [
        {
          id: 'cat_2',
          name: 'Premium Chocolates',
          handle: 'premium-chocolates',
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod_featured_3',
      title: 'Festival Special Mix',
      subtitle: 'Perfect for celebrations',
      description: 'Curated mix of traditional sweets perfect for festivals',
      handle: 'festival-special-mix',
      thumbnail: '/images/products/festival-mix.jpg',
      images: [
        {
          id: 'img_f3',
          url: '/images/products/festival-mix.jpg',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      variants: [
        {
          id: 'var_f3',
          title: '1kg Gift Box',
          product_id: 'prod_featured_3',
          inventory_quantity: 30,
          price: 2000,
          compare_at_price: 2200,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      categories: [
        {
          id: 'cat_3',
          name: 'Gift Collections',
          handle: 'gift-collections',
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod_featured_4',
      title: 'Premium Dry Fruits Mix',
      subtitle: 'Finest quality nuts',
      description: 'Hand-selected premium dry fruits and nuts from Kashmir',
      handle: 'premium-dry-fruits-mix',
      thumbnail: '/images/products/dry-fruits-mix.jpg',
      images: [
        {
          id: 'img_f4',
          url: '/images/products/dry-fruits-mix.jpg',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      variants: [
        {
          id: 'var_f4',
          title: '500g Pack',
          product_id: 'prod_featured_4',
          inventory_quantity: 40,
          price: 1800,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      categories: [
        {
          id: 'cat_4',
          name: 'Dry Fruits & Nuts',
          handle: 'dry-fruits-nuts',
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}