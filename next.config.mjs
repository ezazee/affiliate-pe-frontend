/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["mongodb"],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "blsfkizrchqzahqa.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
