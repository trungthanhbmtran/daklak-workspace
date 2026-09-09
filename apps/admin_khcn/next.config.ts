import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/admin',
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Expose env vars cho Edge Runtime (proxy.ts)
  env: {
    JWT_SECRET: process.env.JWT_SECRET || '',
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  cacheComponents: true,
  experimental: {
    useCache: true,
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
