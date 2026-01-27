const withBundleAnalyzer = require('@next/bundle-analyzer')
const path = require('path')
/**
 * @type {import('next').NextConfig}
 */
const config = {
  images: {
    formats: ['image/avif', 'image/webp']
  },
  turbopack: {
    root: path.join(__dirname, '..')
  },
  allowedDevOrigins: ['http://localhost:3000', 'http://192.168.0.105:3000']
}
module.exports = (_phase, { defaultConfig: _ }) => {
  const plugins = [
    withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })
  ]
  return plugins.reduce((acc, plugin) => plugin(acc), { ...config })
}
