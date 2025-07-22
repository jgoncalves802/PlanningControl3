/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    domains: ['images.unsplash.com', 'api.dicebear.com'],
  },

  // Configuração experimental para HTTPS local
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },

  // Configuração para resolver problemas de preload
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Configurar para resolver problemas de preload
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // Configuração para melhorar performance
  poweredByHeader: false,
  
  // Configuração para resolver problemas de CORS
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },

  // Configuração para servir arquivos estáticos corretamente
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=*, microphone=*, geolocation=*',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },

  // Configuração para melhorar o build
  output: 'standalone',
  
  // Configuração para resolver problemas de assets com ngrok
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  
  // Configuração para resolver problemas de base path
  basePath: '',
  
  // Configuração para resolver problemas de trailing slash
  trailingSlash: false,
  
  // Configuração para resolver problemas de compressão
  compress: true,
}