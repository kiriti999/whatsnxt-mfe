import { cookies } from 'next/headers';

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

        const URI = BASEURL ? `${BASEURL}${URL}` : `undefined`;

        const response = await fetch(
            `${URI}`,
            fetchOptions
        );

        if (!response.ok) {
            console.error('🔍 Server Fetcher - Response not OK:', response.status, response.statusText);
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.error('🚀 Server Fetcher Error:', error);
    }
};

export const getPostBySlugServer = async (slug: string): Promise<any> => {
    try {
        const BASEURL = process.env.BFF_ARTICLE_HOST_API as string;
        return await serverFetcher(BASEURL, `/post/slug/${slug}`, {
            cache: 'force-cache', // Cache published posts
        });
    } catch (error) {
        console.error(`Failed to fetch post with slug: ${slug}`, error);
    }
};