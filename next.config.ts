import type { NextConfig } from "next";

const isGHExport = process.env.NEXT_GH_EXPORT === "true";

const nextConfig: NextConfig = {
  output: isGHExport ? "export" : undefined,
  basePath: isGHExport ? "/vizbiz-website" : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "*.loca.lt",
  ],
  // Skip server-only routes during static export
  ...(isGHExport ? {
    skipTrailingSlashRedirect: true,
    // Exclude API routes and mission-control from static export
    // by using generateBuildId to skip them
  } : {}),
};

export default nextConfig;
