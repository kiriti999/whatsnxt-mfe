import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
    reactStrictMode: true,
    compress: true,
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

        // Only critical public env vars
        NEXT_PUBLIC_MFE_HOST: process.env.MFE_HOST,
        NEXT_PUBLIC_ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
        NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY: process.env.ALGOLIA_SEARCH_API_KEY,
        NEXT_PUBLIC_BFF_HOST_COURSE_API: process.env.BFF_HOST_COURSE_API,
        NEXT_PUBLIC_BFF_HOST_COMMON_API: process.env.BFF_HOST_COMMON_API,
        NEXT_PUBLIC_COOKIES_ACCESS_TOKEN: process.env.COOKIES_ACCESS_TOKEN,
        NEXT_PUBLIC_GA_ID: process.env.GA_ID,
    },
};

const configWithBundleAnalyzer = withBundleAnalyzer(nextConfig);

export default configWithBundleAnalyzer;