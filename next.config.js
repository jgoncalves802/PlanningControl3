/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

module.exports = withNextIntl({
  images: {
    domains: ['images.unsplash.com', 'api.dicebear.com'],
  },
})