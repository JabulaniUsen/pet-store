import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images from placeholder service and Supabase storage
    domains: ['via.placeholder.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
