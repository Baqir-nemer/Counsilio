import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Electron loads the UI at 127.0.0.1; Next treats that as a different
  // origin from localhost and blocks /_next and font assets without this.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
