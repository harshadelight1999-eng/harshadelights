'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Send,
  Heart,
  Star,
  Shield,
  Truck,
  CreditCard,
  CheckCircle,
  ArrowUp
} from 'lucide-react';

const footerSections = [
  {
    title: 'Quick Links',
    links: [
      { name: 'Home', href: '/' },
      { name: 'About Us', href: '/about' },
      { name: 'Products', href: '/products' },
      { name: 'Quality Assurance', href: '/quality' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Track Order', href: '/track-order' },
    ]
  },
  {
    title: 'Product Categories',
    links: [
      { name: 'Traditional Sweets', href: '/products/sweets' },
      { name: 'Premium Chocolates', href: '/products/chocolates' },
      { name: 'Namkeens & Snacks', href: '/products/namkeens' },
      { name: 'Dry Fruits & Nuts', href: '/products/dry-fruits' },
      { name: 'Gift Collections', href: '/products/gift-boxes' },
      { name: 'Seasonal Specials', href: '/products/seasonal' },
    ]
  },
  {
    title: 'Business',
    links: [
      { name: 'B2B Portal', href: '/b2b' },
      { name: 'Wholesale Pricing', href: '/wholesale' },
      { name: 'Bulk Orders', href: '/bulk-orders' },
      { name: 'Franchise Opportunities', href: '/franchise' },
      { name: 'Partner with Us', href: '/partnership' },
      { name: 'Distributor Network', href: '/distributors' },
    ]
  },
  {
    title: 'Support',
    links: [
      { name: 'Customer Service', href: '/support' },
      { name: 'Order Help', href: '/support/orders' },
      { name: 'Returns & Refunds', href: '/returns' },
      { name: 'Shipping Information', href: '/shipping' },
      { name: 'FAQs', href: '/faqs' },
      { name: 'Feedback', href: '/feedback' },
    ]
  },
];

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/harshadelights', color: 'hover:text-blue-600' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/harshadelights', color: 'hover:text-pink-600' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/harshadelights', color: 'hover:text-blue-400' },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/harshadelights', color: 'hover:text-red-600' },
];

const paymentMethods = [
  { name: 'Visa', logo: '💳' },
  { name: 'Mastercard', logo: '💳' },
  { name: 'RuPay', logo: '💳' },
  { name: 'UPI', logo: '📱' },
  { name: 'Net Banking', logo: '🏦' },
  { name: 'Paytm', logo: '📱' },
];

const certifications = [
  { name: 'FSSAI Certified', icon: Shield, description: 'Food Safety License' },
  { name: 'ISO 22000', icon: Star, description: 'Quality Management' },
  { name: 'Secure Payments', icon: CreditCard, description: 'SSL Encrypted' },
  { name: 'Fast Delivery', icon: Truck, description: 'Pan India' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show scroll to top button when scrolled down
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setShowScrollTop(window.scrollY > 500);
    });
  }

  return (
    <footer className="bg-gray-900 text-white relative">
      {/* Newsletter Section */}
      <div className="bg-harsha-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Stay Sweet with Our Newsletter
              </h3>
              <p className="text-orange-100">
                Get the latest updates on new products, special offers, and sweet inspiration
                delivered straight to your inbox.
              </p>
            </div>

            <div className="space-y-4">
              {isSubscribed ? (
                <div className="flex items-center space-x-2 text-white">
                  <CheckCircle className="h-5 w-5" />
                  <span>Thank you for subscribing! Check your email for a welcome gift.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex space-x-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white text-gray-900"
                    required
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-harsha-orange-500"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Subscribe
                  </Button>
                </form>
              )}

              <p className="text-orange-100 text-sm">
                Join 10,000+ happy subscribers. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Logo and Description */}
            <div>
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-harsha-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">HD</span>
                </div>
                <div>
                  <span className="text-xl font-bold">Harsha Delights</span>
                  <p className="text-sm text-gray-400">Premium Confectionery</p>
                </div>
              </Link>

              <p className="text-gray-300 leading-relaxed">
                For over 25 years, we've been crafting premium confectionery with traditional
                recipes and modern techniques, bringing authentic flavors to families across India.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-white">Contact Information</h4>

              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-harsha-orange-400" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-harsha-orange-400" />
                  <span>info@harshadelights.com</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-harsha-orange-400 mt-0.5" />
                  <span>123, Sweet Street, Confectionery Hub<br />Mumbai, Maharashtra 400001</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-harsha-orange-400" />
                  <span>Mon-Sat: 9AM-8PM | Sun: 10AM-6PM</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="font-semibold text-lg text-white mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 bg-gray-800 rounded-lg transition-colors ${social.color}`}
                    aria-label={social.name}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Links Sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="font-semibold text-lg text-white">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-harsha-orange-400 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Certifications and Trust Badges */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="mb-8">
            <h4 className="font-semibold text-lg text-white mb-6 text-center">
              Trusted & Certified
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {certifications.map((cert) => (
                <div
                  key={cert.name}
                  className="flex flex-col items-center space-y-2 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <cert.icon className="h-8 w-8 text-harsha-orange-400" />
                  <h5 className="font-medium text-white text-sm text-center">{cert.name}</h5>
                  <p className="text-gray-400 text-xs text-center">{cert.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="text-center mb-8">
            <h4 className="font-semibold text-lg text-white mb-4">We Accept</h4>
            <div className="flex justify-center items-center space-x-4 flex-wrap">
              {paymentMethods.map((method) => (
                <div
                  key={method.name}
                  className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-lg"
                >
                  <span className="text-lg">{method.logo}</span>
                  <span className="text-sm text-gray-300">{method.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>© 2024 Harsha Delights Pvt. Ltd. All rights reserved.</span>
              <span className="text-red-400">|</span>
              <span className="flex items-center space-x-1">
                <span>Made with</span>
                <Heart className="h-4 w-4 text-red-400 fill-current" />
                <span>in India</span>
              </span>
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-harsha-orange-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-gray-400 hover:text-harsha-orange-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookie-policy" className="text-gray-400 hover:text-harsha-orange-400 transition-colors">
                Cookie Policy
              </Link>
              <Link href="/sitemap" className="text-gray-400 hover:text-harsha-orange-400 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>

          {/* Business Info */}
          <div className="mt-4 pt-4 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500">
              Harsha Delights Pvt. Ltd. | CIN: U15400MH1998PTC123456 | FSSAI License: 12345678901234 |
              GST: 27ABCDE1234F1Z5 | Registered Office: Mumbai, Maharashtra, India
            </p>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-harsha-orange-500 text-white rounded-full shadow-lg hover:bg-harsha-orange-600 transition-colors z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </footer>
  );
}