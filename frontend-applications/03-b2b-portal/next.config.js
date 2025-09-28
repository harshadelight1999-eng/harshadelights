/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3003"]
    },
    externalDir: false
  },
  images: {
    unoptimized: true,
    domains: ['localhost', 'harshadelights.com', 'harshadelights.onrender.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://harshadelights.onrender.com'
  }
};

module.exports = nextConfig;
