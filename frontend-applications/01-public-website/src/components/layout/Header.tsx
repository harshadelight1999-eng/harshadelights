'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/Button';
import { Menu, X, Phone, Mail, ShoppingCart, User, ChevronDown } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/' },
  {
    name: 'Products',
    href: '/products',
    children: [
      { name: 'Traditional Sweets', href: '/products/sweets' },
      { name: 'Chocolates', href: '/products/chocolates' },
      { name: 'Namkeens', href: '/products/namkeens' },
      { name: 'Dry Fruits', href: '/products/dry-fruits' },
      { name: 'Gift Boxes', href: '/products/gift-boxes' },
    ]
  },
  { name: 'About Us', href: '/about' },
  { name: 'Quality', href: '/quality' },
  { name: 'B2B Portal', href: '/b2b' },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-harsha-purple-500 text-white py-2 px-4 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-1 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>info@harshadelights.com</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span>Free delivery on orders above ₹500</span>
            <div className="flex space-x-2">
              <span>EN</span>
              <span>|</span>
              <span>हिं</span>
              <span>|</span>
              <span>ગુ</span>
              <span>|</span>
              <span>मर</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
          isScrolled ? 'shadow-lg' : 'shadow-md'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-3">
                <Image
                  src="/assets/branding/logos/elegant_monogram_logo_for_harsha_delights_a-removebg-preview.png"
                  alt="Harsha Delights"
                  width={50}
                  height={50}
                  className="drop-shadow-sm"
                />
                <div className="hidden sm:block">
                  <span className="text-xl font-bold text-gray-900">Harsha Delights</span>
                  <p className="text-xs text-harsha-purple-600">Premium Confectionery</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className="nav-link flex items-center space-x-1"
                    onMouseEnter={() => item.children && setActiveDropdown(item.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <span>{item.name}</span>
                    {item.children && <ChevronDown className="h-4 w-4" />}
                  </Link>

                  {/* Dropdown Menu */}
                  {item.children && activeDropdown === item.name && (
                    <div
                      className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 animate-slide-down"
                      onMouseEnter={() => setActiveDropdown(item.name)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-harsha-purple-50 hover:text-harsha-purple-600 transition-colors"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {/* Search Bar - Hidden on mobile */}
              <div className="hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-harsha-purple-500 focus:border-transparent"
                  />
                  <button className="absolute right-2 top-2 text-gray-400 hover:text-harsha-purple-500">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 108 2a6 6 0 000 12z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="relative">
                  <User className="h-5 w-5" />
                </Button>

                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-harsha-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    0
                  </span>
                </Button>

                <div className="hidden lg:block">
                  <Button variant="primary" size="sm">
                    Shop Now
                  </Button>
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMenu}
                  aria-expanded="false"
                  aria-label="Toggle navigation menu"
                >
                  {isMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4 animate-slide-down">
              <div className="space-y-4">
                {/* Mobile Search */}
                <div className="px-2">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-harsha-purple-500"
                  />
                </div>

                {/* Mobile Navigation Links */}
                <div className="space-y-2">
                  {navigation.map((item) => (
                    <div key={item.name}>
                      <Link
                        href={item.href}
                        className="block px-4 py-2 text-gray-700 hover:bg-harsha-purple-50 hover:text-harsha-purple-600 transition-colors rounded-lg mx-2"
                        onClick={closeMenu}
                      >
                        {item.name}
                      </Link>

                      {/* Mobile Submenu */}
                      {item.children && (
                        <div className="ml-4 mt-2 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className="block px-4 py-2 text-sm text-gray-600 hover:bg-harsha-purple-50 hover:text-harsha-purple-600 transition-colors rounded-lg mx-2"
                              onClick={closeMenu}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Mobile Action Buttons */}
                <div className="px-4 pt-4 border-t border-gray-200">
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-center">
                      Sign In
                    </Button>
                    <Button variant="primary" className="w-full justify-center">
                      Shop Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>
    </>
  );
}