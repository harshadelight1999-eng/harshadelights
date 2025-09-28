// TODO: Fix WorkOS AuthKit imports after version compatibility resolved
// import { getUser, signOut } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import { User, Organization } from '@/types';

export async function getCurrentUser() {
  // TODO: Implement actual WorkOS auth after fixing import issues
  // const { user } = await getUser();
  // if (!user) return null;
  
  // Temporary stub to enable builds
  return {
    id: 'temp-user-id',
    email: 'demo@harshadelights.com',
    firstName: 'Demo',
    lastName: 'User',
    role: 'admin' as 'admin' | 'purchaser' | 'viewer',
    organizationId: 'temp-org-id',
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as User;
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
  const user = await getCurrentUser();
  if (!user || !user.organizationId) return null;

  // TODO: Fetch organization details from API
  // For now, return mock data
  return {
    id: user.organizationId,
    name: 'Demo Organization',
    slug: 'demo-org',
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
}

export async function signOutUser() {
  'use server';
  // TODO: Implement actual WorkOS signOut after fixing import issues
  // await signOut();
  redirect('/');
}
