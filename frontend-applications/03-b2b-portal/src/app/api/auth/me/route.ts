import { NextRequest, NextResponse } from 'next/server';
// TODO: Fix WorkOS AuthKit imports after version compatibility resolved
// import { getUser } from '@workos-inc/authkit-nextjs';

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement actual WorkOS auth after fixing import issues
    // const { user } = await getUser();
    
    // Temporary stub for demo functionality
    const user = {
      id: 'temp-user-id',
      email: 'demo@harshadelights.com',
      firstName: 'Demo',
      lastName: 'User',
      organizationId: 'temp-org-id',
      organizationName: 'Demo Organization',
      lastSignInAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customAttributes: { role: 'admin' }
    };
    
    // if (!user) {
    //   return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    // }

    // Transform WorkOS user to our User type
    const formattedUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.customAttributes?.role as 'admin' | 'purchaser' | 'viewer' || 'viewer',
      organizationId: user.organizationId,
      lastLoginAt: user.lastSignInAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // TODO: Fetch organization details from API
    const organization = {
      id: user.organizationId,
      name: user.organizationName || 'Demo Organization',
      slug: user.organizationId?.substring(0, 8) || 'demo-org',
      customerTier: 'gold',
      creditLimit: 100000,
      creditUtilized: 25000,
      paymentTerms: 'Net 30',
      contactInfo: {
        phone: '+91-9876543210',
        address: 'Mumbai, Maharashtra',
        gstNumber: '27AABCU9603R1ZX',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      user: formattedUser,
      organization,
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
