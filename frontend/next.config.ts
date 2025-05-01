
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Output a standalone build for better deployment compatibility
  output: 'standalone',
  // For Vercel, ensure the correct route paths
  trailingSlash: false,
  // Better image handling
  images: {
    domains: [],
    // Use unoptimized for simpler asset handling on first deploy
    unoptimized: true
  },
  // Enable server actions
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
