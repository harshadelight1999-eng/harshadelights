/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily remove static export for build testing
  // output: 'export',
  trailingSlash: true,
  eslint: {
    dirs: ['src'],
  },
  images: {
    unoptimized: true,
    domains: ['localhost', 'shop.harshadelights.com', 'api.harshadelights.com', 'harshadelights.onrender.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://harshadelights.onrender.com'
  },
  // Remove dependency on shared package for production build
  experimental: {
    externalDir: false
  }
};

// Temporarily disable next-intl for immediate Diwali deployment
// const withNextIntl = require('next-intl/plugin')();

module.exports = nextConfig;
