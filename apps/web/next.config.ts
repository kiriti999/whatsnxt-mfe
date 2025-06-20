import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
    reactStrictMode: true,
    // compress: true,
    productionBrowserSourceMaps: true,

    generateBuildId: async () => {
        return process.env.VERCEL_GIT_COMMIT_SHA || `build-${Date.now()}`
    },

    experimental: {
        optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
    },

    // NEW: Stable Turbopack configuration (replaces experimental.turbo)
    turbopack: {
        rules: {
            // Handle SVG files
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
            // Add any aliases you need
        },
    },

    transpilePackages: [],

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ik.imagekit.io',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'mdbcdn.b-cdn.net',
                pathname: '/**',
            },
        ],
    },

    env: {
        JWT_SECRET: 'djhfghbdsgrasklkajsdgf',
        CLOUDINARY_UPLOAD_PRESET: 'whatsnxt',
        CLOUDINARY_NAME: 'cloudinary999',
        CLOUDINARY_API_KEY: '429854764125427',
        CLOUDINARY_SECRET: 'PxEdUKCLC9Shs-DJbMWUEmZGC-s',
        CLOUDINARY_VIDEO_URL:
            'https://api.cloudinary.com/v1_1/cloudinary999/video/upload',
        CLOUDINARY_IMAGE_UPLOAD_URL:
            'https://api.cloudinary.com/v1_1/cloudinary999/image/upload',
        RAZORPAY_KEY: 'rzp_test_XA4B2CfvFvPv5D',
        RAZORPAY_SECRET: 'SrkzJCpJMAGFbi4GJnrtBIUU',
        RAZORPAY_LOGO: 'https://res.cloudinary.com/cloudinary999/image/upload/v1713640702/whatsnxt/logo.png',
        NEXT_PUBLIC_ALGOLIA_APP_ID: '9SA5PPC1N4',
        ALGOLIA_SEARCH_ADMIN_KEY: '183f7ddb740690df8b6fe7cd82008198',
        NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY: 'dda22bdfa7963a4e2fec2f95b4846863',
        GOOGLE_CLIENT_ID:
            '350555049939-53jicjsuep5l1c3rsdhe2u63n40ndqeb.apps.googleusercontent.com',
        GOOGLE_CLIENT_SECRET: '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',
        NEXT_PUBLIC_MFE_HOST: process.env.MFE_HOST,
        NEXT_PUBLIC_ADMIN_EMAIL: process.env.ADMIN_EMAIL,
        NEXT_PUBLIC_BLOG_HOST_API: process.env.BFF_BLOG_HOST_API,
        NEXT_PUBLIC_BFF_HOST_COURSE_API: process.env.BFF_HOST_COURSE_API,
        NEXT_PUBLIC_BFF_HOST_COMMON_API: process.env.BFF_HOST_COMMON_API,
        NEXT_PUBLIC_BFF_HOST_GOOGLE_API: process.env.GOOGLE_LOGIN_URL,
        NEXT_PUBLIC_BFF_VERSION: process.env.BFF_VERSION,
        NEXT_PUBLIC_BFF_BLOG_HOST: process.env.BFF_BLOG_HOST,
        NEXT_PUBLIC_GRAPHQL_URL: process.env.GRAPHQL_URL,
        NEXT_PUBLIC_ALGOLIA_COURSE_INDEX_NAME: process.env.ALGOLIA_COURSE_INDEX_NAME,
        NEXT_PUBLIC_ALGOLIA_BLOG_INDEX_NAME: process.env.ALGOLIA_BLOG_INDEX_NAME,
        NEXT_PUBLIC_ALGOLIA_TUTORIAL_INDEX_NAME: process.env.ALGOLIA_TUTORIAL_INDEX_NAME,
        NEXT_PUBLIC_COOKIES_ACCESS_TOKEN: process.env.COOKIES_ACCESS_TOKEN,
        NEXT_PUBLIC_COOKIES_USER_PROFILE: process.env.NEXT_PUBLIC_COOKIES_USER_PROFILE,
        NEXT_PUBLIC_COOKIES_USER_INFO: process.env.COOKIES_USER_INFO,
    },
};

const configWithBundleAnalyzer = withBundleAnalyzer(nextConfig);

export default configWithBundleAnalyzer;