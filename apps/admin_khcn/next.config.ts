import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/admin',
  reactCompiler: true,
  //   cacheComponents: true,
  //   experimental: {
  //     useCache: true,
  //   },
  typescript: {
    ignoreBuildErrors: true,
  },
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: 'https',
  //       hostname: 'api.your-backend.com',
  //     },
  //   ],
  // },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
