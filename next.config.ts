import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['firebase-admin', 'yahoo-finance2'],
};

export default nextConfig;
