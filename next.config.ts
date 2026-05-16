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
  async rewrites() {
    return [
      {
        source: '/google151e827d1737bb24.html',
        destination: '/api/gsc-verify',
      },
      {
        source: '/google151e827d1737bb24.html/',
        destination: '/api/gsc-verify',
      },
    ];
  },
};

export default nextConfig;
