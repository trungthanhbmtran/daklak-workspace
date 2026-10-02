import type { NextConfig } from "next";
import { join } from "node:path";

const workspaceRoot = join(__dirname, "../..");

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: workspaceRoot,
  turbopack: { root: workspaceRoot },
  basePath: "/admin",
  reactCompiler: true,
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

