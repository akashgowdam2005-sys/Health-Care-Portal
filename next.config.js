/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  webpack: (config) => {
    config.cache = {
      type: 'filesystem',
      maxMemoryGenerations: 1,
      compression: 'gzip'
    }
    return config
  }
}

module.exports = nextConfig