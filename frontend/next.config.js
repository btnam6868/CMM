/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output standalone để giảm kích thước image
  output: 'standalone',
  
  // Webpack config cho hot reload trong Docker
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
}

module.exports = nextConfig;
