import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  basePath: isProd ? "/Tienda-Emma" : "",
  assetPrefix: isProd ? "/Tienda-Emma" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
