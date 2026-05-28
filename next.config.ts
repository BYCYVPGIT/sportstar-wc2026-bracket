import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow embedding in Sportstar article pages
  async headers() {
    return [
      {
        source: '/b/:code*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

export default nextConfig;
