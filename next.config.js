/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

module.exports = withNextIntl({
  experimental: {
    appDir: true
  },
  i18n: {
    locales: ['pt-BR', 'en-US'],
    defaultLocale: 'pt-BR',
    localeDetection: true
  },
  messages: {
    path: './messages'
  },
  images: {
    domains: ['images.unsplash.com', 'api.dicebear.com'],
  },
})