import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
    turbopack: {
    },
    reactStrictMode: true,
    compress: true,
    productionBrowserSourceMaps: false, // Disable in production for better performance

    generateBuildId: async () => {
        return process.env.VERCEL_GIT_COMMIT_SHA || `build-${Date.now()}`
    },

    // HTTPS redirect configuration
    async redirects() {
        return [
            {
                source: '/(.*)',
                has: [
                    {
                        type: 'header',
                        key: 'x-forwarded-proto',
                        value: 'http',
                    },
                ],
                destination: 'https://www.whatsnxt.in/$1',
                permanent: true,
            },
        ];
    },

    // NEXT.JS 16: Updated experimental features
    experimental: {
        // Next.js 16 specific optimizations
        optimizePackageImports: [
            '@mantine/core',
            '@mantine/hooks',
            '@mantine/notifications',
            'lodash',
            'react-icons'
        ],
        // Temporarily disabled - incompatible with dynamic routes using cookies()
        // Will re-enable once routes are refactored to use 'use cache' directive properly
        // cacheComponents: true,
        authInterrupts: true, // Better auth handling
    },

    // NEXT.JS 16: Enhanced compiler options
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn'],
        } : false,
        // Next.js 16 has better React compiler integration
        reactRemoveProperties: process.env.NODE_ENV === 'production',
    },

    // Specify packages to transpile (important for Next.js 16)
    transpilePackages: [
        '@mantine/core',
        '@mantine/hooks',
        '@mantine/notifications',
        'diagram-core'
    ],

    // OPTIMIZATION: Enhanced image configuration for Next.js 16
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'api.cloudinary.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'ik.imagekit.io',
                pathname: '/**',
            },
            // Add other domains if you use them for images
            {
                protocol: 'https',
                hostname: 'whatsnxt.in',
                pathname: '/**',
            },
            // Unsplash for fallback images
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/**',
            },
        ],
        // Next.js 15 image optimization
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        // New in Next.js 15
        unoptimized: false,
        loader: 'default',
    },

    // NEXT.JS 16: Enhanced webpack configuration
    webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
        if (!dev && !isServer) {
            // Enhanced chunk splitting for Next.js 16 with aggressive optimization
            config.optimization.splitChunks = {
                chunks: 'all',
                minSize: 20000,
                maxSize: 244000,
                minChunks: 1,
                maxAsyncRequests: 30,
                maxInitialRequests: 30,
                enforceSizeThreshold: 50000,
                cacheGroups: {
                    // Default group with higher threshold
                    default: {
                        minChunks: 2,
                        priority: -20,
                        reuseExistingChunk: true,
                        maxSize: 100000,
                    },

                    // React and React DOM - highest priority
                    react: {
                        test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
                        name: 'react',
                        chunks: 'all',
                        priority: 30,
                        enforce: true,
                    },

                    // Next.js framework chunks
                    nextjs: {
                        test: /[\\/]node_modules[\\/]next[\\/]/,
                        name: 'nextjs',
                        chunks: 'all',
                        priority: 25,
                        enforce: true,
                    },

                    // Mantine UI library
                    mantine: {
                        test: /[\\/]node_modules[\\/]@mantine[\\/]/,
                        name: 'mantine',
                        chunks: 'all',
                        priority: 20,
                        maxSize: 150000,
                    },

                    // Algolia search
                    algolia: {
                        test: /[\\/]node_modules[\\/](algoliasearch|@algolia)[\\/]/,
                        name: 'algolia',
                        chunks: 'all',
                        priority: 18,
                    },

                    // Lodash utility library
                    lodash: {
                        test: /[\\/]node_modules[\\/]lodash[\\/]/,
                        name: 'lodash',
                        chunks: 'all',
                        priority: 15,
                    },

                    // Common libraries that tend to be large
                    polyfills: {
                        test: /[\\/]node_modules[\\/](core-js|regenerator-runtime|@babel\/runtime)[\\/]/,
                        name: 'polyfills',
                        chunks: 'all',
                        priority: 12,
                    },

                    // Combine small vendor chunks - this is the key optimization
                    smallVendors: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        minSize: 0,
                        maxSize: 50000, // Smaller chunks get combined
                        chunks: 'all',
                        priority: 5,
                        enforce: false,
                    },

                    // Large vendor libraries get their own chunks
                    largeVendors: {
                        test: /[\\/]node_modules[\\/]/,
                        name(module) {
                            // Get the name of the package
                            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1];
                            if (packageName) {
                                // Clean up scoped package names
                                return `vendor.${packageName.replace('@', '')}`;
                            }
                            return 'vendor.misc';
                        },
                        minSize: 50000, // Only large packages get separate chunks
                        chunks: 'all',
                        priority: 8,
                        maxSize: 200000,
                    },

                    // Common application code
                    commons: {
                        name: 'commons',
                        minChunks: 2,
                        chunks: 'all',
                        priority: 0,
                        maxSize: 100000,
                    },
                },
            };

            // Additional optimizations
            config.optimization.usedExports = true;
            config.optimization.sideEffects = false;

            // Tree shaking improvements for Next.js 16
            config.plugins.push(
                new webpack.IgnorePlugin({
                    resourceRegExp: /^\.\/locale$/,
                    contextRegExp: /moment$/,
                })
            );

            // Remove unused CSS
            if (config.optimization.minimizer) {
                config.optimization.minimizer.forEach((plugin) => {
                    if (plugin.constructor.name === 'CssMinimizerPlugin') {
                        plugin.options.minimizerOptions = {
                            ...plugin.options.minimizerOptions,
                            preset: [
                                'default',
                                {
                                    discardComments: { removeAll: true },
                                    reduceIdents: true,
                                    zindex: false,
                                },
                            ],
                        };
                    }
                });
            }

            // Optimize module resolution
            config.resolve.alias = {
                ...config.resolve.alias,
                // Add specific optimizations for problematic packages
                'lodash': 'lodash-es', // Use ES modules version
            };

            // Module concatenation for better tree shaking
            config.optimization.concatenateModules = true;

            // Aggressive dead code elimination
            config.optimization.innerGraph = true;
            config.optimization.providedExports = true;
            config.optimization.usedExports = true;
        }

        return config;
    },

    // ENHANCED SECURITY HEADERS - Updated to fix Google Search Console issues
    async headers() {
        // Dynamic CSP based on environment
        const isDevelopment = process.env.NODE_ENV === 'development';

        // Get your API hosts from environment variables
        const apiHosts = [
            process.env.BFF_HOST_COURSE_API,
            process.env.BFF_HOST_COMMON_API,
            process.env.BFF_HOST_CLOUDINARY_API,
            process.env.BFF_HOST_IMAGEKIT_API,
            process.env.BFF_ARTICLE_HOST_API,
            process.env.GOOGLE_LOGIN_URL,
        ].filter(Boolean); // Remove undefined values

        // Build connect-src directive with ALL required domains
        const connectSrc = [
            "'self'",
            // Development localhost support
            ...(isDevelopment ? ['http://localhost:*', 'ws://localhost:*'] : []),
            // Your API domain - COMPLETE ACCESS
            'https://api.whatsnxt.in',
            // Legacy specific paths (remove these after testing)
            // ...apiHosts,
            // Search services
            'https://*.algolia.net',
            'https://*.algolianet.com',
            // Media services
            'https://res.cloudinary.com',
            'https://api.cloudinary.com',
            'https://*.cloudinary.com',
            'https://ik.imagekit.io',
            // Payment services - Razorpay
            'https://api.razorpay.com',
            'https://checkout.razorpay.com',
            'https://lumberjack.razorpay.com',
            'https://*.razorpay.com',
            // Analytics services - Google Analytics (all domains)
            'https://www.google-analytics.com',
            'https://analytics.google.com',
            'https://www.googletagmanager.com',
            'https://*.google-analytics.com',
            'https://*.google.com',
            'https://*.google.co.in',
            'https://stats.g.doubleclick.net',
            'https://www.google.com',
        ].join(' ');

        return [
            {
                source: '/(.*)',
                headers: [
                    // DNS Prefetch Control
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    // STRONG HSTS POLICY - Forces HTTPS and prevents downgrade attacks
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=31536000; includeSubDomains; preload'
                    },
                    // CLICKJACKING PROTECTION - Prevents embedding in iframes
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    // CONTENT TYPE PROTECTION
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    // XSS PROTECTION
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    // REFERRER POLICY
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    // CONTENT SECURITY POLICY - Prevents XSS attacks with Partytown support
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            // PARTYTOWN: Allow all Partytown scripts and external analytics
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://checkout.razorpay.com data: blob:",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "font-src 'self' https://fonts.gstatic.com",
                            // Updated img-src to specifically include Cloudinary domains and localhost for development
                            `img-src 'self' data: https: blob: https://res.cloudinary.com https://*.cloudinary.com https://api.cloudinary.com https://ik.imagekit.io https://*.imagekit.io https://img.youtube.com https://i.ytimg.com${isDevelopment ? ' http://localhost:*' : ''}`,
                            `media-src 'self' https: blob: https://res.cloudinary.com https://*.cloudinary.com https://api.cloudinary.com${isDevelopment ? ' http://localhost:*' : ''}`,
                            `connect-src ${connectSrc}`,
                            "frame-src 'self' https://api.razorpay.com https://www.youtube.com https://youtube.com",
                            // PARTYTOWN SPECIFIC: Essential for web workers and service workers
                            "worker-src 'self' blob: data:",
                            "child-src 'self' blob: data:",
                            // PARTYTOWN: Allow service worker registration
                            "manifest-src 'self'",
                            "frame-ancestors 'none'",
                            "base-uri 'self'",
                            "form-action 'self'",
                            "upgrade-insecure-requests",
                            "block-all-mixed-content"
                        ].join('; ')
                    },
                    // CROSS-ORIGIN OPENER POLICY - Ensures proper origin isolation
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin-allow-popups'
                    },
                    // CROSS-ORIGIN EMBEDDER POLICY
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'unsafe-none'
                    },
                    // PERMISSIONS POLICY - Controls access to browser features
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://api.razorpay.com" "https://checkout.razorpay.com"), fullscreen=(self)'
                    },
                    // CROSS-ORIGIN RESOURCE POLICY
                    {
                        key: 'Cross-Origin-Resource-Policy',
                        value: 'cross-origin'
                    }
                ],
            },
            // PARTYTOWN: Specific headers for Partytown files
            {
                source: '/~partytown/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                    {
                        key: 'Content-Type',
                        value: 'application/javascript',
                    },
                    // Allow cross-origin access for service workers
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'unsafe-none',
                    },
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin-allow-popups',
                    },
                    // Essential for service worker registration
                    {
                        key: 'Service-Worker-Allowed',
                        value: '/',
                    },
                ],
            },
            {
                source: '/static/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/_next/static/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/fonts/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/images/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },

    // NEXT.JS 16: Updated environment variable handling
    env: {
        NEXT_PUBLIC_ALGOLIA_SEARCH_ADMIN_KEY: process.env.ALGOLIA_SEARCH_ADMIN_KEY,
        NEXT_PUBLIC_CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
        NEXT_PUBLIC_UPLOAD_CLOUDINARY_PRESET: process.env.CLOUDINARY_PRESET,
        NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL: process.env.CLOUDINARY_IMAGE_UPLOAD_URL,
        NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_URL: process.env.CLOUDINARY_VIDEO_UPLOAD_URL,
        NEXT_PUBLIC_CLOUDINARY_FILE_UPLOAD_URL: process.env.CLOUDINARY_FILE_UPLOAD_URL,
        NEXT_PUBLIC_ALGOLIA_INDEX_NAME: process.env.ALGOLIA_INDEX_NAME,

        NEXT_PUBLIC_COOKIES_DOMAIN: process.env.COOKIES_DOMAIN,
        NEXT_PUBLIC_COOKIES_USER: process.env.COOKIES_USER,

        NEXT_PUBLIC_COOKIES_USER_INFO: process.env.COOKIES_USER_INFO,
        NEXT_PUBLIC_COOKIES_USER_PROFILE: process.env.NEXT_PUBLIC_COOKIES_USER_PROFILE,
        NEXT_PUBLIC_ALGOLIA_TUTORIAL_INDEX_NAME: process.env.ALGOLIA_TUTORIAL_INDEX_NAME,
        NEXT_PUBLIC_ALGOLIA_COURSE_INDEX_NAME: process.env.ALGOLIA_COURSE_INDEX_NAME,
        NEXT_PUBLIC_ALGOLIA_BLOG_INDEX_NAME: process.env.ALGOLIA_BLOG_INDEX_NAME,

        NEXT_PUBLIC_ADMIN_EMAIL: process.env.ADMIN_EMAIL,
        NEXT_PUBLIC_ARTICLE_HOST_API: process.env.BFF_ARTICLE_HOST_API,
        NEXT_PUBLIC_BFF_HOST_GOOGLE_API: process.env.GOOGLE_LOGIN_URL,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_BFF_HOST_LAB_API: process.env.NEXT_PUBLIC_API_URL,

        // Only critical public env vars
        NEXT_PUBLIC_MFE_HOST: process.env.MFE_HOST,
        NEXT_PUBLIC_ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
        NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY: process.env.ALGOLIA_SEARCH_API_KEY,
        NEXT_PUBLIC_BFF_HOST_COURSE_API: process.env.BFF_HOST_COURSE_API,
        NEXT_PUBLIC_BFF_HOST_COMMON_API: process.env.BFF_HOST_COMMON_API,
        NEXT_PUBLIC_BFF_HOST_CLOUDINARY_API: process.env.BFF_HOST_CLOUDINARY_API,
        NEXT_PUBLIC_BFF_HOST_IMAGEKIT_API: process.env.BFF_HOST_IMAGEKIT_API,
        NEXT_PUBLIC_COOKIES_ACCESS_TOKEN: process.env.COOKIES_ACCESS_TOKEN,
        NEXT_PUBLIC_GA_ID: process.env.GA_ID,

        // Razorpay Configuration
        NEXT_PUBLIC_RAZORPAY_KEY: process.env.RAZOR_PAY_KEY,
        NEXT_PUBLIC_RAZORPAY_LOGO: process.env.RAZORPAY_LOGO,
    },

    // NEXT.JS 16: Output configuration
    output: 'standalone',

    // NEXT.JS 16: Enhanced PWA and caching
    async rewrites() {
        return [
            {
                source: '/sw.js',
                destination: '/_next/static/sw.js',
            },
            {
                source: '/api/v1/:path*',
                destination: `${process.env.BFF_HOST || 'http://localhost:4444'}/api/v1/:path*`,
            },
        ];
    },

    // NEXT.JS 16: Better asset optimization
    assetPrefix: process.env.NODE_ENV === 'production' ? process.env.CDN_URL : '',

    // NEXT.JS 16: Enhanced dev experience
    devIndicators: {
        position: 'bottom-right',
    },

    // NEXT.JS 16: Logging configuration
    logging: {
        fetches: {
            fullUrl: true,
        },
    },

    // NEXT.JS 16: Type checking optimization
    typescript: {
        // Only run type checking in development
        ignoreBuildErrors: process.env.NODE_ENV === 'production',
    },
};

const configWithBundleAnalyzer = withBundleAnalyzer(nextConfig);

export default configWithBundleAnalyzer;