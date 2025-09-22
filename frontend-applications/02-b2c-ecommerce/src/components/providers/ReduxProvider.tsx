'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';
import CartSidebar from '@/components/cart/CartSidebar';

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-white">
        <main className="relative">
          {children}
        </main>
        <CartSidebar />
      </div>
    </Provider>
  );
}