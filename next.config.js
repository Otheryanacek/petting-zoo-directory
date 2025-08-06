/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // Use SWC for faster builds
  
  // Image optimization
  images: {
    domains: ['cdn.sanity.io'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Modern webpack 5 features
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Enable webpack 5 features
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    return config;
  },
  
  // Experimental features for better performance
  experimental: {
    // Enable modern bundling
    esmExternals: true,
    // Optimize server components
    serverComponentsExternalPackages: ['@sanity/client'],
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  },
};

module.exports = nextConfig;