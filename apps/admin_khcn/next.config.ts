import type { NextConfig } from "next";
import { INTERNAL_GATEWAY_URL } from "./config/constants";

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
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${INTERNAL_GATEWAY_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
