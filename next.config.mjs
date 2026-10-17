/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  allowedDevOrigins: ["172.20.10.6"],
};

export default nextConfig;