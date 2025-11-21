/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['res.cloudinary.com', 'www.iremworld.com', 'iremworld.com', 'images.unsplash.com']
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Memory ve performance optimizasyonları
  experimental: {
    // Memory kullanımını azalt
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
    // WebAssembly optimizasyonu
    webVitalsAttribution: ['CLS', 'LCP'],
    // WebAssembly devre dışı bırak
    disableWebAssembly: true,
    // Chunk boyutlarını küçült
    largePageDataBytes: 128 * 1000,
  },
  
  // Webpack optimizasyonları
  webpack: (config, { dev, isServer }) => {
    // Production'da memory optimizasyonu
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          maxSize: 244000, // Daha küçük chunk'lar
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
              maxSize: 244000,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
              maxSize: 244000,
            },
          },
        },
      }
    }
    
    // Memory limit ayarları
    config.optimization.minimize = !dev

    // WebAssembly devre dışı bırak
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: false,
      syncWebAssembly: false,
    };

    // Gereksiz modülleri devre dışı bırak
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    return config
  },
  
  // Environment variables'ları build sırasında kullanılabilir yap
  env: {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
  },
  
  // Production için ek optimizasyonlar
  compress: true,
  poweredByHeader: false,
  swcMinify: true,
  
  // Static file serving optimizasyonu ve Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // DNS Prefetch Control - Performans için
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          // MIME sniffing koruması - Content-Type override engelleme
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Referrer Policy - Gizlilik koruması
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions Policy - Tarayıcı özellikleri kontrolü
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), payment=(), usb=(), interest-cohort=()'
          },
          // Strict Transport Security - HTTPS zorunluluğu
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          // Content Security Policy - XSS ve injection koruması (Development-friendly)
          (() => {
            const enabled = process.env.ENABLE_GOOGLE_TRANSLATE === 'true';
            const scriptSrc = [
              "'self'",
              "'unsafe-inline'",
              "'unsafe-eval'",
              'https://cdn.jsdelivr.net',
              'https://www.googletagmanager.com',
              'https://www.google-analytics.com',
              'https://cdn-ukwest.onetrust.com',
              'https://static.cloudflareinsights.com',
              'https://unpkg.com',
              'https://cdn.maptiler.com',
              'https://api.mapbox.com'
            ];
            if (enabled) scriptSrc.push('https://translate.google.com');

            return {
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                `script-src ${scriptSrc.join(' ')}`,
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://unpkg.com https://cdn.maptiler.com https://api.mapbox.com",
                "img-src 'self' data: blob: https: http:",
                "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
                "connect-src 'self' http://localhost:* ws://localhost:* https://localhost:* https://www.google-analytics.com https://www.googletagmanager.com https://*.iremworld.com https://iremworld.com http://iremworld.com https://www.iremworld.com https://api.maptiler.com https://api.mapbox.com https://*.tiles.mapbox.com",
                "frame-src 'self' https://www.google.com https://*.google.com https://maps.google.com https://www.youtube.com",
                "worker-src 'self' blob:",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'self'"
              ].join('; ')
            };
          })(),
          // Cross-Origin Resource Policy - Kaynak paylaşım kontrolü
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin'
          },
          // Cross-Origin-Opener-Policy - Tarayıcı izolasyonu
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups'
          },
          // Server bilgisi gizleme
          {
            key: 'X-Powered-By',
            value: 'IREMWORLD'
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin'
          },
        ],
      },
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/font/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
    ]
  },
  
  // Güvenlik için production'da bazı bilgileri gizle
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
