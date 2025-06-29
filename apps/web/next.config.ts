import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
    reactStrictMode: true,
    compress: true,
    productionBrowserSourceMaps: false, // Disable in production for better performance

    generateBuildId: async () => {
        return process.env.VERCEL_GIT_COMMIT_SHA || `build-${Date.now()}`
    },

    // NEXT.JS 15: Updated experimental features
    experimental: {
        // Next.js 15 specific optimizations
        optimizePackageImports: [
            '@mantine/core',
            '@mantine/hooks',
            '@mantine/notifications',
            'lodash',
            'react-icons'
        ],
        // Turbopack is now stable in Next.js 15
        turbo: {
            rules: {
                '*.svg': {
                    loaders: ['@svgr/webpack'],
                    as: '*.js',
                },
            },
            resolveExtensions: [
                '.mdx',
                '.tsx',
                '.ts',
                '.jsx',
                '.js',
                '.mjs',
                '.json',
            ],
            resolveAlias: {
                '@': './src',
                '@components': './src/components',
                '@utils': './src/utils',
                '@styles': './src/styles',
            },
        },
        // New in Next.js 15
        // ppr: true, // Partial Prerendering
        // dynamicIO: true, // Dynamic IO for better streaming
        authInterrupts: true, // Better auth handling
        // instrumentationHook: true, // Performance monitoring
        optimisticClientCache: true, // Client-side caching
    },

    // NEXT.JS 15: Enhanced compiler options
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn'],
        } : false,
        // Next.js 15 has better React compiler integration
        reactRemoveProperties: process.env.NODE_ENV === 'production',
    },

    // Specify packages to transpile (important for Next.js 15)
    transpilePackages: [
        '@mantine/core',
        '@mantine/hooks',
        '@mantine/notifications'
    ],

    // OPTIMIZATION: Enhanced image configuration for Next.js 15
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
            // Add other domains if you use them for images
            {
                protocol: 'https',
                hostname: 'whatsnxt.in',
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

    // NEXT.JS 15: Enhanced webpack configuration
    webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
        if (!dev && !isServer) {
            // Enhanced chunk splitting for Next.js 15
            config.optimization.splitChunks = {
                chunks: 'all',
                minSize: 20000,
                maxSize: 244000,
                cacheGroups: {
                    default: {
                        minChunks: 2,
                        priority: -20,
                        reuseExistingChunk: true,
                    },
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        priority: -10,
                        chunks: 'all',
                    },
                    // React and React DOM
                    react: {
                        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                        name: 'react',
                        chunks: 'all',
                        priority: 20,
                    },
                    // Mantine UI library
                    mantine: {
                        test: /[\\/]node_modules[\\/]@mantine[\\/]/,
                        name: 'mantine',
                        chunks: 'all',
                        priority: 15,
                    },
                    // Algolia search
                    algolia: {
                        test: /[\\/]node_modules[\\/](algoliasearch|@algolia)[\\/]/,
                        name: 'algolia',
                        chunks: 'all',
                        priority: 12,
                    },
                    // Lodash utility library
                    lodash: {
                        test: /[\\/]node_modules[\\/]lodash[\\/]/,
                        name: 'lodash',
                        chunks: 'all',
                        priority: 10,
                    },
                },
            };

            // Tree shaking improvements for Next.js 15
            config.plugins.push(
                new webpack.IgnorePlugin({
                    resourceRegExp: /^\.\/locale$/,
                    contextRegExp: /moment$/,
                })
            );
        }

        return config;
    },

    // NEXT.JS 15: Enhanced headers with security improvements
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
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
                        value: 'DENY'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin'
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

    // NEXT.JS 15: Updated environment variable handling
    env: {
        NEXT_PUBLIC_ALGOLIA_SEARCH_ADMIN_KEY: process.env.ALGOLIA_SEARCH_ADMIN_KEY,
        NEXT_PUBLIC_CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
        NEXT_PUBLIC_UPLOAD_CLOUDINARY_PRESET: process.env.CLOUDINARY_PRESET,
        NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL: process.env.CLOUDINARY_IMAGE_UPLOAD_URL,
        NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_URL: process.env.CLOUDINARY_VIDEO_UPLOAD_URL,
        NEXT_PUBLIC_CLOUDINARY_FILE_UPLOAD_URL: process.env.CLOUDINARY_FILE_UPLOAD_URL,
        NEXT_PUBLIC_ALGOLIA_INDEX_NAME: process.env.ALGOLIA_INDEX_NAME,

        NEXT_PUBLIC_RAZORPAY_KEY: process.env.RAZORPAY_KEY,
        NEXT_PUBLIC_RAZORPAY_LOGO: process.env.RAZORPAY_LOGO,

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

        // Only critical public env vars
        NEXT_PUBLIC_MFE_HOST: process.env.MFE_HOST,
        NEXT_PUBLIC_ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
        NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY: process.env.ALGOLIA_SEARCH_API_KEY,
        NEXT_PUBLIC_BFF_HOST_COURSE_API: process.env.BFF_HOST_COURSE_API,
        NEXT_PUBLIC_BFF_HOST_COMMON_API: process.env.BFF_HOST_COMMON_API,
        NEXT_PUBLIC_COOKIES_ACCESS_TOKEN: process.env.COOKIES_ACCESS_TOKEN,
        NEXT_PUBLIC_GA_ID: process.env.GA_ID,
    },

    // NEXT.JS 15: Output configuration
    output: 'standalone',

    // NEXT.JS 15: Enhanced PWA and caching
    async rewrites() {
        return [
            {
                source: '/sw.js',
                destination: '/_next/static/sw.js',
            },
        ];
    },

    // NEXT.JS 15: Better asset optimization
    assetPrefix: process.env.NODE_ENV === 'production' ? process.env.CDN_URL : '',

    // NEXT.JS 15: Enhanced dev experience
    devIndicators: {
        buildActivity: true,
        buildActivityPosition: 'bottom-right',
    },

    // NEXT.JS 15: Logging configuration
    logging: {
        fetches: {
            fullUrl: true,
        },
    },

    // NEXT.JS 15: Type checking optimization
    typescript: {
        // Only run type checking in development
        ignoreBuildErrors: process.env.NODE_ENV === 'production',
    },

    // NEXT.JS 15: ESLint configuration
    eslint: {
        ignoreDuringBuilds: process.env.NODE_ENV === 'production',
    },
};

const configWithBundleAnalyzer = withBundleAnalyzer(nextConfig);

export default configWithBundleAnalyzer;