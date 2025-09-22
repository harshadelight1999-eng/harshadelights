import { getUser, signOut } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import { User, Organization } from '@/types';

export async function getCurrentUser() {
  const { user } = await getUser();
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.customAttributes?.role as 'admin' | 'purchaser' | 'viewer' || 'viewer',
    organizationId: user.organizationId,
    lastLoginAt: user.lastSignInAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
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
  await signOut();
  redirect('/');
}
