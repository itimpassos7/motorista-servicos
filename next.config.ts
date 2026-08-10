import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.15.20",
    "localhost",
    "barriers-shareware-designer-duck.trycloudflare.com"
  ],
};

export default nextConfig;