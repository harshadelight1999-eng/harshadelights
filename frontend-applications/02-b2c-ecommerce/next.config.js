/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['src'],
  },
  images: {
    domains: ['localhost', 'shop.harshadelights.com', 'api.harshadelights.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `http://localhost:9000/api/:path*`, // Medusa.js backend
      },
    ];
  },
};

const withNextIntl = require('next-intl/plugin')();

module.exports = withNextIntl(nextConfig);
