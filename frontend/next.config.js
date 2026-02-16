/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.onrender.com',
      },
    ],
  },
  // Output standalone for better Vercel performance
  output: 'standalone',
}

module.exports = nextConfig
