import { cookies } from 'next/headers';

const API_CONFIG = {
    baseUrl: process.env.BFF_HOST_API,
};

interface FetcherOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: Record<string, any>;
    headers?: Record<string, string>;
    cache?: RequestCache;
}

interface FetcherOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: Record<string, any>;
    headers?: Record<string, string>;
    cache?: RequestCache;
}

export const serverFetcher = async (BASEURL: string, URL: string, options: FetcherOptions = {}): Promise<any> => {
    console.log(' serverFetcher :: URL:', URL)
    console.log(' serverFetcher :: URL:', URL)
    try {
        const tokenKeyName = process.env.NEXT_PUBLIC_COOKIES_ACCESS_TOKEN || 'whatsnxt_access_token';
        const cookieStore = await cookies();
        const token = cookieStore.get(tokenKeyName)?.value;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': token }), // Send as Authorization header (not Bearer prefix since middleware expects raw token)
            ...options.headers,
        };

        const fetchOptions: RequestInit = {
            method: options.method || 'GET',
            headers,
            cache: options.cache || 'no-store', // Don't cache during SSR by default
        };

        if (options.method === 'POST' || options.method === 'PUT') {
            fetchOptions.body = JSON.stringify(options.body);
        }

        const URI = BASEURL ? `${BASEURL}${URL}` : `${API_CONFIG.baseUrl}${URL}`;
        console.log(' serverFetcher :: URI:', URI);
        console.log(' serverFetcher :: token present:', !!token);

        const response = await fetch(
            `${URI}`,
            fetchOptions
        );

        if (!response.ok) {
            console.error('🔍 Server Fetcher - Response not OK:', response.status, response.statusText);
        }

        const data = await response.json();
        console.log('🔍 Server Fetcher - Success, authenticated:', data._meta?.isAuthenticated);

        return data;
    } catch (error) {
        console.error('🚀 Server Fetcher Error:', error);
    }
};
// Specific function for getting post by slug
export const getCourseBySlugServer = async (slug: string): Promise<any> => {
    try {
        const BASEURL = process.env.BFF_HOST_API as string;
        return await serverFetcher(BASEURL, `/course/slug/${slug}`, {
            cache: 'force-cache', // Cache published posts
        });
    } catch (error) {
        console.error(`Failed to fetch post with slug: ${slug}`, error);
    }
};

export const getPostBySlugServer = async (slug: string): Promise<any> => {
    try {
        const BASEURL = process.env.BFF_BLOG_HOST_API as string;
        return await serverFetcher(BASEURL, `/post/slug/${slug}`, {
            cache: 'force-cache', // Cache published posts
        });
    } catch (error) {
        console.error(`Failed to fetch post with slug: ${slug}`, error);
    }
};