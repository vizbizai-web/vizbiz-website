import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "*.loca.lt",
  ],
};

export default nextConfig;
