/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static optimization for Vercel
  // output: 'standalone', // Commented out for local testing
  
  // Handle image optimization
  images: {
    domains: ['localhost', 'vercel.app'],
    unoptimized: false,
  },
  
  // Handle file uploads and Prisma in production
  serverExternalPackages: ['@prisma/client'],
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Temporarily disable ESLint for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
