import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  images: {
    loader: "akamai",
    path: "",
    unoptimized: true,
  },
  basePath: "/voter-map",
  assetPrefix: "/voter-map",
};

export default nextConfig;
