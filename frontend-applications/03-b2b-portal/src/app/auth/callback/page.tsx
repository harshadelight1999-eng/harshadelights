import { redirect } from 'next/navigation';
// TODO: Fix WorkOS AuthKit imports after version compatibility resolved
// import { getUser } from '@workos-inc/authkit-nextjs';

export default async function AuthCallbackPage() {
  // TODO: Implement actual WorkOS auth callback after fixing import issues
  // const { user } = await getUser();
  
  // Temporary stub - always redirect to dashboard for demo
  // if (!user) {
  //   redirect('/auth/error');
  // }

  // Redirect to dashboard after successful authentication
  redirect('/dashboard');
}
