const withBundleAnalyzer = require('@next/bundle-analyzer')
/**
 * @type {import('next').NextConfig}
 */
const config = {
  images: {
    formats: ['image/avif', 'image/webp']
  },
  allowedDevOrigins: ['http://localhost:3000', 'http://192.168.0.105:3000']
}
module.exports = (_phase, { defaultConfig: _ }) => {
  const plugins = [
    withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })
  ]
  return plugins.reduce((acc, plugin) => plugin(acc), { ...config })
}
