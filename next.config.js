/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  images: {
    loader: "akamai",
    path: "",
    unoptimized: true,
  },
  basePath: "/aihacks_frontend",
  assetPrefix: "/aihacks_frontend",
};

module.exports = nextConfig;
