import { withAuth, signOut } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import { User, Organization } from '@/types';

export async function getCurrentUser() {
  try {
    const { user } = await withAuth();
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: 'viewer' as 'admin' | 'purchaser' | 'viewer', // TODO: Get role from user metadata or your business system
      organizationId: (user as any).organizationId || null, // TODO: Get from WorkOS organization membership
      lastLoginAt: user.updatedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as User;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/sign-in');
  }
  return user;
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    redirect('/unauthorized');
  }
  return user;
}

export async function getCurrentOrganization(): Promise<Organization | null> {
  try {
    const user = await getCurrentUser();
    if (!user || !user.organizationId) return null;

    // TODO: Fetch organization details from your business API using organizationId
    // This should call your backend to get organization-specific data like:
    // - Customer tier, credit limits, payment terms
    // - Contact information, GST number
    // - Business-specific metadata
    
    // For now, return basic organization structure
    // Replace this with actual API call to your business system
    return {
      id: user.organizationId,
      name: `Organization ${user.organizationId}`, // Get from your API
      slug: `org-${user.organizationId}`,
      customerTier: 'silver', // Determine from your business logic
      creditLimit: 50000, // Get from your business system
      creditUtilized: 12000, // Calculate from orders
      paymentTerms: 'Net 30', // Business rule
      contactInfo: {
        phone: '+91-0000000000', // From organization profile
        address: 'Address not set', // From organization profile
        gstNumber: 'GST-NOT-SET', // From organization profile
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    console.error('Error getting current organization:', error);
    return null;
  }
}

export async function signOutUser() {
  try {
    await signOut();
    redirect('/');
  } catch (error) {
    console.error('Error signing out:', error);
    redirect('/');
  }
}
