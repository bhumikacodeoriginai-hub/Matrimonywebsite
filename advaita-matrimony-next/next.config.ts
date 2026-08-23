import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/register.html', destination: '/register', permanent: false },
      { source: '/login.html', destination: '/login', permanent: false },
    ];
  },
};

export default nextConfig;
