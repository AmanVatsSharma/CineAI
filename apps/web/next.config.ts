import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@cineai/ui",
    "@cineai/domain-types",
    "@cineai/mock-data",
    "@cineai/api-client",
  ],
};

export default nextConfig;
