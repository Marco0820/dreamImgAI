/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    defaultLocale: 'en',
    locales: [
      'en',
      'zh',
      'zh-TW',
      'ja',
      'ko',
      'de',
      'fr',
      'it',
      'es',
      'pt',
      'hi',
      'ar',
      'bn',
      'fa',
      'he',
      'id',
      'kn',
      'mr',
      'ms',
      'ne',
      'pl',
      'ru',
      'ta',
      'th',
      'tr',
      'ur',
      'vi',
    ],
    localeDetection: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'replicate.com',
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: 'p-us.a.yximgs.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
    // This option is removed as it's not supported in Next.js 14
    // nodeMiddleware: true, 
  },
};

export default nextConfig; 