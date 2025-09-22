'use client';

import { useSelector, useDispatch } from 'react-redux';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { RootState, AppDispatch } from '@/store/store';
import { updateCartItem, removeFromCart, toggleCartSidebar } from '@/store/slices/cartSlice';

export default function CartSidebar() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, isOpen, total, itemCount } = useSelector((state: RootState) => state.cart);

  const handleUpdateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch(removeFromCart(variantId));
    } else {
      dispatch(updateCartItem({ variant_id: variantId, quantity }));
    }
  };

  const handleRemoveItem = (variantId: string) => {
    dispatch(removeFromCart(variantId));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => dispatch(toggleCartSidebar())}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-start justify-between p-4 border-b border-gray-200">
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        Shopping Cart
                      </Dialog.Title>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                          onClick={() => dispatch(toggleCartSidebar())}
                        >
                          <span className="absolute -inset-0.5" />
                          <span className="sr-only">Close panel</span>
                          <X className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
                      {items.length === 0 ? (
                        <div className="text-center py-12">
                          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                          <p className="mt-1 text-sm text-gray-500">Start adding some products to get started!</p>
                          <div className="mt-6">
                            <Link
                              href="/products"
                              className="btn-primary"
                              onClick={() => dispatch(toggleCartSidebar())}
                            >
                              Continue Shopping
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="flow-root">
                          <ul role="list" className="-my-6 divide-y divide-gray-200">
                            {items.map((item) => (
                              <li key={item.variant_id} className="flex py-6">
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                  <div className="h-full w-full bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
                                    <ShoppingBag className="w-8 h-8 text-yellow-400" />
                                  </div>
                                </div>

                                <div className="ml-4 flex flex-1 flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                      <h3>
                                        <Link href={`/products/${item.product_id}`}>
                                          {item.title}
                                        </Link>
                                      </h3>
                                      <p className="ml-4">₹{item.unit_price}</p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                                  </div>
                                  <div className="flex flex-1 items-end justify-between text-sm">
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => handleUpdateQuantity(item.variant_id, item.quantity - 1)}
                                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                        disabled={item.quantity <= 1}
                                      >
                                        <Minus className="w-4 h-4" />
                                      </button>
                                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                                      <button
                                        onClick={() => handleUpdateQuantity(item.variant_id, item.quantity + 1)}
                                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    </div>

                                    <div className="flex">
                                      <button
                                        type="button"
                                        className="font-medium text-red-600 hover:text-red-500"
                                        onClick={() => handleRemoveItem(item.variant_id)}
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                      <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <p>Subtotal</p>
                          <p>₹{subtotal}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                        <div className="mt-6">
                          <Link
                            href="/checkout"
                            className="btn-primary w-full text-center"
                            onClick={() => dispatch(toggleCartSidebar())}
                          >
                            Checkout
                          </Link>
                        </div>
                        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                          <p>
                            or{' '}
                            <button
                              type="button"
                              className="font-medium text-yellow-600 hover:text-yellow-500"
                              onClick={() => dispatch(toggleCartSidebar())}
                            >
                              Continue Shopping
                              <span aria-hidden="true"> &rarr;</span>
                            </button>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}