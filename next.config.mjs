/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  distDir: '.next',
  basePath: '',
  cleanDistDir: true,
  crossOrigin: 'anonymous',
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-UA-Compatible',
            value: 'IE=edge,chrome=1'
          }
        ]
      }
    ]
  }
}

export default nextConfig
