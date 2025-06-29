/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Add file upload configuration
  experimental: {
    serverComponentsExternalPackages: ['xlsx', 'papaparse']
  },
  // Increase body size limits for file uploads
  serverRuntimeConfig: {
    maxFileSize: '50mb'
  },
  publicRuntimeConfig: {
    maxFileSize: '50mb'
  }
};

module.exports = nextConfig;