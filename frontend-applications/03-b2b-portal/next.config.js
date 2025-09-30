/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  experimental: {
    externalDir: false
  },
  images: {
    domains: ['localhost', 'harshadelights.com', 'harshadelights.onrender.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://harshadelights.onrender.com'
  }
};

module.exports = nextConfig;
