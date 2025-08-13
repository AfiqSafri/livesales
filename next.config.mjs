/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static optimization for Vercel
  output: 'standalone',
  
  // Handle image optimization
  images: {
    domains: ['localhost', 'vercel.app'],
    unoptimized: false,
  },
  
  // Handle file uploads and Prisma in production
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
