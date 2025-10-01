'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react'
import { RootState } from '@/store/store';
import { toggleCartSidebar } from '@/store/slices/cartSlice';

export default function Header() {
  const dispatch = useDispatch();
  const { itemCount } = useSelector((state: RootState) => state.cart);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Categories', href: '/categories' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Blog', href: '/blog' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-royal-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
              <Image
                src="/assets/branding/logos/elegant_monogram_logo_for_harsha_delights_a-removebg-preview.png"
                alt="Harsha Delights - Premium Confectionery"
                width={48}
                height={48}
                className="drop-shadow-lg"
                priority
              />
              <span className="text-xl font-bold bg-royal-gradient bg-clip-text text-transparent hidden sm:block font-royal">
                Harsha Delights
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-royal-700 px-3 py-2 text-sm font-medium transition-colors relative group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-royal-gradient group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-royal-500 focus:border-royal-500 transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">

            {/* Shopping Cart */}
            <button
              onClick={() => dispatch(toggleCartSidebar())}
              className="relative p-2 text-gray-600 hover:text-royal-700 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-royal-gradient text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-royal animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Account */}
            <div className="flex items-center space-x-2">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/account"
                    className="flex items-center space-x-1 text-gray-600 hover:text-royal-700 transition-colors"
                  >
                    <User className="h-6 w-6" />
                    <span className="hidden sm:block text-sm">{user.first_name}</span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/auth/login"
                    className="text-gray-600 hover:text-royal-700 text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-royal-gradient text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-royal hover:shadow-luxury hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-gray-600 hover:text-royal-700 font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile Search */}
            <div className="mt-4 px-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-royal-500 focus:border-royal-500 transition-all"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Promotional Banner */}
      <div className="bg-royal-gradient text-white text-center py-2 text-sm shadow-royal">
        ✨ Free shipping on orders above ₹1000 | Same day delivery in select cities
      </div>
    </header>
  );
}