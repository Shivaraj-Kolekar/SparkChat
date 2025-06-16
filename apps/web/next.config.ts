import type { NextConfig } from 'next'
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'], // Add this line
    // You might also have remotePatterns for more specific patterns
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**' // Google user content often has this path
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**' // GitHub avatars can have various paths
      }
      // Add other domains/patterns as needed
    ]
  }
  // Other Next.js configurations...
}
export default nextConfig
