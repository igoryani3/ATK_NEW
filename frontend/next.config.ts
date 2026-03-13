import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  basePath: '/projects/ATK',
  assetPrefix: '/projects/ATK',

  // Ensure trailing slashes are handled correctly
  trailingSlash: true,

  // Image optimization
  images: {
    unoptimized: true, // Set to false if using Next.js Image Optimization
  },
};

export default nextConfig;
