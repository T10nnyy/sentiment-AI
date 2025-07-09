/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    // Make these available to both server and client
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8000/graphql",
    NEXT_PUBLIC_ENABLE_LIVE_TYPING: process.env.NEXT_PUBLIC_ENABLE_LIVE_TYPING || "true",
    NEXT_PUBLIC_DEBOUNCE_DELAY: process.env.NEXT_PUBLIC_DEBOUNCE_DELAY || "500",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/:path*`,
      },
      {
        source: "/graphql",
        destination: `${process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8000/graphql"}`,
      },
    ]
  },
  // Enable standalone output for Docker
  output: "standalone",
}

module.exports = nextConfig
