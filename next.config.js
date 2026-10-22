// eslint-disable-next-line no-undef
module.exports = {
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            // 'unsafe-inline' is required in script-src: Next.js injects an inline
            // bootstrap <script> into every page, and without it the client bundle
            // never runs, so nothing hydrates and no button works. Covered by e2e/.
            value:
              "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com; img-src 'self' data:;"
          },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
        ]
      }
    ];
  }
};
