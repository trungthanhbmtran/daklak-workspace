import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: "/admin",
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  cacheComponents: true,
  experimental: {
    useCache: true,
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
