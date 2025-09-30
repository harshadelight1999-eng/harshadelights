import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';

// Web Service deployment - restore dynamic configuration
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { user } = await withAuth();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Transform WorkOS user to our User type
    const formattedUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: 'viewer' as 'admin' | 'purchaser' | 'viewer', // TODO: Get role from user metadata or your business system
      organizationId: (user as any).organizationId || null, // TODO: Get from WorkOS organization membership
      lastLoginAt: user.updatedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // TODO: Replace with actual API call to your business system
    // This should fetch organization details from your backend:
    // const orgResponse = await fetch(`${process.env.BUSINESS_API_URL}/organizations/${user.organizationId}`)
    // const organization = await orgResponse.json()
    
    const organization = formattedUser.organizationId ? {
      id: formattedUser.organizationId,
      name: `Organization ${formattedUser.organizationId}`, // TODO: Get from your business system
      slug: formattedUser.organizationId?.substring(0, 8) || 'unknown',
      customerTier: 'silver', // Get from your business system
      creditLimit: 50000, // Get from your business system  
      creditUtilized: 12000, // Calculate from your order system
      paymentTerms: 'Net 30', // Business rule from your system
      contactInfo: {
        phone: '+91-0000000000', // From organization profile
        address: 'Address not set', // From organization profile
        gstNumber: 'GST-NOT-SET', // From organization profile
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } : null;

    return NextResponse.json({
      user: formattedUser,
      organization,
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
