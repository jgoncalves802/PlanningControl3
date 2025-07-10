/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

module.exports = withNextIntl({
  images: {
    domains: ['images.unsplash.com', 'api.dicebear.com'],
  },
  
  // Headers de segurança para NFC
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'nfc=*, camera=*, microphone=*, geolocation=*',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
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
})