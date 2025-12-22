/** @type {import('next').NextConfig} */
const nextConfig = {
  // ==========================================
  // OPTIMISATIONS DE PERFORMANCE AVANCÉES
  // ==========================================

  // Compression optimale
  compress: true,

  // Optimisations de production
  productionBrowserSourceMaps: false, // Désactiver sourcemaps en prod

  // SWC Minification (plus rapide que Terser)
  swcMinify: true,

  // Optimisation des images
  images: {
    formats: ['image/webp', 'image/avif'], // Formats modernes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // Cache 1 an
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Optimisation des polices
  optimizeFonts: true,

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Code splitting plus agressif
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Vendor chunks séparés
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
                return `npm.${packageName.replace('@', '')}`
              },
              priority: 10,
            },
            // Framework séparé
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // UI library séparée
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|@headlessui|lucide-react)[\\/]/,
              name: 'ui-lib',
              priority: 30,
            },
            // Charts séparés
            charts: {
              test: /[\\/]node_modules[\\/](recharts|d3-|victory-)[\\/]/,
              name: 'charts',
              priority: 25,
            },
            // Commons
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
            },
          },
        },
      }

      // Réduire la taille du bundle
      config.optimization.usedExports = true
      config.optimization.sideEffects = true
    }

    // Ignorer les locales moment.js non utilisées
    config.plugins.push(
      new (require('webpack')).IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      })
    )

    return config
  },

  // Headers de sécurité et performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Sécurité
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          // Performance - Preconnect vers API
          {
            key: 'Link',
            value: '<http://localhost:3001>; rel=preconnect'
          },
        ],
      },
      // Cache agressif pour assets statiques
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Redirections et rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/:path*`,
      },
    ]
  },

  // Configuration expérimentale pour meilleures performances
  experimental: {
    // Optimistic client cache
    optimisticClientCache: true,

    // Partial prerendering (Next.js 14+)
    // ppr: true,

    // Server Actions
    serverActions: true,

    // Optimiser CSS
    optimizeCss: true,

    // Middleware optimizations
    middlewarePrefetch: 'strict',
  },

  // Output standalone pour Docker
  output: 'standalone',

  // Désactiver x-powered-by header
  poweredByHeader: false,

  // React strict mode pour détecter problèmes
  reactStrictMode: true,

  // Transpiler certains modules ESM
  transpilePackages: [],
}

module.exports = nextConfig
