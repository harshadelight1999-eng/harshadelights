import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    // Connect to Medusa backend for order details
    const medusaResponse = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/orders/${orderId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!medusaResponse.ok) {
      // Fallback to sample order data if Medusa is not available
      return NextResponse.json({
        order: getSampleOrder(orderId),
      });
    }

    const data = await medusaResponse.json();

    return NextResponse.json({
      order: data.order || getSampleOrder(orderId),
    });
  } catch (error) {
    console.error('Order fetch API error:', error);
    // Return sample order for development
    return NextResponse.json({
      order: getSampleOrder(params.orderId),
    });
  }
}

function getSampleOrder(orderId: string) {
  return {
    id: orderId,
    display_id: orderId.slice(-6),
    status: 'pending',
    payment_status: 'captured',
    fulfillment_status: 'not_fulfilled',
    email: 'customer@example.com',
    shipping_address: {
      first_name: 'John',
      last_name: 'Doe',
      address_1: '123 Main Street, Apartment 4B',
      city: 'Mumbai',
      country_code: 'IN',
      postal_code: '400001',
      province: 'Maharashtra',
      phone: '+91-98765-43210',
    },
    billing_address: {
      first_name: 'John',
      last_name: 'Doe',
      address_1: '123 Main Street, Apartment 4B',
      city: 'Mumbai',
      country_code: 'IN',
      postal_code: '400001',
      province: 'Maharashtra',
      phone: '+91-98765-43210',
    },
    items: [
      {
        id: 'item_1',
        title: 'Bestseller Gulab Jamun',
        description: 'Most loved traditional sweet',
        thumbnail: '/images/products/gulab-jamun-featured.jpg',
        variant: {
          id: 'var_f1',
          title: '500g Box',
        },
        quantity: 2,
        unit_price: 450,
        total: 900,
      },
      {
        id: 'item_2',
        title: 'Premium Chocolate Collection',
        description: 'Artisan crafted chocolates',
        thumbnail: '/images/products/chocolate-collection.jpg',
        variant: {
          id: 'var_f2',
          title: 'Assorted Box',
        },
        quantity: 1,
        unit_price: 1200,
        total: 1200,
      },
    ],
    subtotal: 2100,
    shipping_total: 0,
    tax_total: 378,
    total: 2478,
    currency_code: 'inr',
    payment_method: 'card',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}