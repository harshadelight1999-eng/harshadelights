import { redirect } from 'next/navigation';
import { getUser } from '@workos-inc/authkit-nextjs';

export default async function AuthCallbackPage() {
  const { user } = await getUser();

  if (!user) {
    redirect('/auth/error');
  }

  // Redirect to dashboard after successful authentication
  redirect('/dashboard');
}
