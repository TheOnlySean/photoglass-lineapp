/** @type {import('next').NextConfig} */
const nextConfig = {
  // LINE Mini App最適化設定
  
  // 画像最適化設定
  images: {
    domains: [
      'profile.line-scdn.net', // LINEプロフィール画像
      'obs.line-scdn.net',     // LINE画像ストレージ
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // PWA設定（将来的な機能拡張用）
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // 環境変数の設定
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // ビルド最適化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // ESLint設定 - 完全無効化
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript設定 - 完全無効化  
  typescript: {
    ignoreBuildErrors: true,
  },

  // Vercel設定
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 