/** @format */
import withBundleAnalyzer from '@next/bundle-analyzer';

// Custom environment handling for GitHub compatibility
const getEnv = () => {
  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    ANALYZE: process.env.ANALYZE || 'false',
    // Add any other environment variables as needed
  };
};

const env = getEnv();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Improve compatibility with various hosting environments
  trailingSlash: true,
  
  // Security and performance optimizations
  poweredByHeader: false,
  compress: true,
  
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: env.NODE_ENV === 'development',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Performance optimizations
  swcMinify: true,
  reactStrictMode: true,
  
  // Production error handling
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Disable source maps in production to reduce bundle size
  productionBrowserSourceMaps: false,
  
  // Enable experimental features for better performance
  experimental: {
    // Optimize server components and improve bundle splitting
    serverComponentsExternalPackages: [],
    optimizeCss: true,
    
    // Enable modern JavaScript features
    serverActions: {
      allowedOrigins: ['https://stiflingchip.com', 'localhost:3000'],
    },
    typedRoutes: true,
    
    // Improve development experience
    webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'TTFB', 'INP'],
    
    // Use new optimizations in React 19
    ppr: true,
    taint: true,
    
    // Additional optimizations
    turbo: {
      loaders: {
        '.svg': ['@svgr/webpack'],
      },
    },
    optimizePackageImports: [
      '@heroicons/react',
      'framer-motion',
      '@tanstack/react-query',
    ],
  },
  
  // Custom headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://telegram.org; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; connect-src 'self' https://api.telegram.org; frame-src 'self' https://telegram.org; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ]
      }
    ];
  },

  // Webpack configuration for optimizations
  webpack(config) {
    // Optimize SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

// Conditionally enable bundle analyzer in analyze script
const analyzeBundleEnabled = env.ANALYZE === 'true';
export default analyzeBundleEnabled 
  ? withBundleAnalyzer({ enabled: true })(nextConfig)
  : nextConfig;
