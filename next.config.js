/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Cloudflare Pages 适配
  output: 'standalone',
}

module.exports = nextConfig
