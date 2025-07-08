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
        ],
      },
    ];
  },

  // Configuração experimental para HTTPS local
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
})