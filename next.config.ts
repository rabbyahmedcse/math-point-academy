
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose", "mongodb"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ibb.co.com",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
      {
        protocol: "https",
        hostname: "photos.app.goo.gl",
      },
    ],
  },
};

export default nextConfig;
