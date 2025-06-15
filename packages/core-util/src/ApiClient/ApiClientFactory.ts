// ApiClientFactory.ts
import xior from 'xior';
import Cookie from 'js-cookie';

export type ApiClientType = 'auth' | 'bff' | 'blog';

interface ApiClientConfig {
    baseURL: string;
    withCredentials?: boolean;
    headers?: Record<string, string>;
    errorHandler?: (error: any) => Promise<any>;
    requestInterceptor?: (config: any) => any;
    responseInterceptor?: (response: any) => any;
}

function isWebWorker(): boolean {
    // @ts-ignore
    return typeof Worker !== 'undefined' && typeof importScripts === 'function';
}

// Auth-specific error handler
// Updated authErrorHandler in ApiClientFactory.ts
const authErrorHandler = async (error: any) => {
    const statusCode = error.response?.status;
    const backendMessage = error.response?.data?.message;

    try {
        // Log the error for debugging
        if (statusCode) {
            console.info(`ErrorHandler:: message: ${JSON.stringify(backendMessage)} code: ${statusCode}`);
        }

        // Special handling for 401 - could redirect to login or handle differently
        if (statusCode === 401) {
            console.warn(`Unauthorized:: message: ${backendMessage || error.response.statusText} code: ${statusCode}`);
            throw new Error(backendMessage || 'unauthorized');
        }

        // For any error response, extract the backend message if available
        if (error.response) {
            const customError = new Error(backendMessage || error.message || 'An error occurred') as any;
            customError.status = statusCode;
            customError.response = error.response;
            throw customError;
        }

        // For network errors or other non-response errors
        return Promise.reject(error);
    } catch (e: any) {
        console.info(`ErrorHandler Exception:: message: ${e.message}`);
        return Promise.reject(e);
    }
};

// BFF-specific request interceptor (preserving your existing token logic)
const bffRequestInterceptor = (config: any) => {

    // Skip ALL header modifications for FormData requests
    if (config.data instanceof FormData) {
        // Don't modify headers - let browser set Content-Type with boundary
        return config;
    }

    // @ts-ignore
    const token = config.data?.accessToken ? config.data?.accessToken : Cookie.get(process.env.NEXT_PUBLIC_COOKIES_ACCESS_TOKEN);

    if (token) {
        // Set Authorization header instead of Cookie
        config.headers = config.headers || {};
        config.headers['Authorization'] = `${token}`;

        // Remove the token from the payload if it exists
        if (config.data?.accessToken) {
            delete config.data.accessToken;
        }
    }

    if (isWebWorker() && config?.data?.accessToken) {
        // If running inside a Web Worker, manually include the token in the headers
        config.headers['Cookie'] = `${process.env.NEXT_PUBLIC_COOKIES_ACCESS_TOKEN}=${token}; ${config.headers['Cookie'] || ''}`;
        // Remove the token from the payload
        if (config.data?.accessToken) {
            delete config.data.accessToken;
        }
    }

    return config;
};

const bffErrorHandler = async (error: any) => {
    const statusCode = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message;

    try {
        // Log the error for debugging
        if (statusCode) {
            console.info(`BFF API Error:: message: ${errorMessage} code: ${statusCode}`);
        }

        // For BFF errors, we want to preserve the custom error message from backend
        if (statusCode >= 400) {
            // Create a new error with the backend message
            const customError = new Error(errorMessage) as any;
            customError.status = statusCode;
            throw customError;
        }

        return Promise.reject(error);
    } catch (e: any) {
        console.info(`BFF ErrorHandler Exception:: message: ${e.message}`);
        return Promise.reject(e);
    }
};

// Configuration for different API types
const getApiConfig = (type: ApiClientType): ApiClientConfig => {
    const baseConfig = {
        withCredentials: true,
    };

    switch (type) {
        case 'auth':
            return {
                ...baseConfig,
                baseURL: process.env.NEXT_PUBLIC_BFF_HOST_AUTH_API!,
                requestInterceptor: bffRequestInterceptor,
                errorHandler: authErrorHandler,
            };

        case 'bff':
            return {
                ...baseConfig,
                baseURL: process.env.NEXT_PUBLIC_BFF_HOST_API!, // Keep your original env var
                requestInterceptor: bffRequestInterceptor,
                errorHandler: bffErrorHandler,
            };

        case 'blog':
            return {
                ...baseConfig,
                baseURL: process.env.NEXT_PUBLIC_BLOG_HOST_API!, // Keep your original env var
                requestInterceptor: bffRequestInterceptor,
                errorHandler: bffErrorHandler,
            };

        default:
            throw new Error(`Unknown API client type: ${type}`);
    }
};

// Factory function to create API clients
const createApiClient = (type: ApiClientType) => {
    const config = getApiConfig(type);

    const api: any = xior.create({
        baseURL: config.baseURL,
        withCredentials: config.withCredentials,
        headers: config.headers,
    });

    // Request interceptors
    api.interceptors.request.use(
        (requestConfig: any) => {
            // Apply type-specific request interceptor if exists
            if (config.requestInterceptor) {
                // Check if this is the AI suggestion endpoint
                const isAISuggestionEndpoint = requestConfig.url && requestConfig.url.includes('/posts/suggestionByChatGpt');

                // Only apply timeout for non-AI suggestion endpoints
                if (!isAISuggestionEndpoint) {
                    const controller = new AbortController();
                    requestConfig.signal = controller.signal;

                    // Automatically abort the request after 10 seconds
                    const timeoutId = setTimeout(() => {
                        controller.abort();
                    }, 10000);

                    // Store the timeoutId in the config to clear later
                    requestConfig.timeoutId = timeoutId;
                }

                return config.requestInterceptor(requestConfig);
            }
            return requestConfig;
        },
        (error: any) => {
            console.log('🚀 ~ xior interceptor global error:', error);
            return Promise.reject(error);
        }
    );

    // Response interceptors
    api.interceptors.response.use(
        (response: any) => {
            // Clear timeout if exists
            if (response.config?.timeoutId) {
                clearTimeout(response.config.timeoutId);
            }

            // Apply type-specific response interceptor if exists
            if (config.responseInterceptor) {
                return config.responseInterceptor(response);
            }

            return response;
        },
        async (error: any) => {
            // Clear timeout if exists
            if (error.config?.timeoutId) {
                clearTimeout(error.config.timeoutId);
            }

            // Check for AbortError
            if (error.name === 'AbortError') {
                console.error('Request was aborted due to timeout');
            }

            // Apply type-specific error handler if exists
            if (config.errorHandler) {
                return config.errorHandler(error);
            }

            return Promise.reject(error);
        }
    );

    return api;
};

// Create specific client instances
export const authXiorInstance = createApiClient('auth');
export const bffXiorInstance = createApiClient('bff');
export const blogXiorInstance = createApiClient('blog');

// Generic API client wrapper
const createApiMethods = (xiorInstance: any) => ({
    put: async (url: string, data: unknown, config?: any): Promise<any> => {
        // Set JSON Content-Type for non-FormData requests
        const finalConfig = data instanceof FormData
            ? config
            : { ...config, headers: { 'Content-Type': 'application/json', ...config?.headers } };

        const response = await xiorInstance.put(url, data, finalConfig);
        return response;
    },

    post: async (url: string, data: unknown, config?: any): Promise<any> => {
        // Set JSON Content-Type for non-FormData requests
        const finalConfig = data instanceof FormData
            ? config
            : { ...config, headers: { 'Content-Type': 'application/json', ...config?.headers } };

        const response = await xiorInstance.post(url, data, finalConfig);
        return response;
    },

    get: async (url: string, config?: any): Promise<any> => {
        const response = await xiorInstance.get(url, config);
        return response;
    },

    patch: async (url: string, data?: unknown, config?: any): Promise<any> => {
        // Set JSON Content-Type for non-FormData requests
        const finalConfig = data instanceof FormData
            ? config
            : { ...config, headers: { 'Content-Type': 'application/json', ...config?.headers } };

        const response = await xiorInstance.patch(url, data, finalConfig);
        return response;
    },

    delete: async (url: string, config?: any): Promise<any> => {
        const response = await xiorInstance.delete(url, config);
        return response;
    },
});

// Export the API clients
export const authApiClient = {
    ...createApiMethods(authXiorInstance),
    xiorInstance: authXiorInstance
};

export const bffApiClient = {
    ...createApiMethods(bffXiorInstance),
    xiorInstance: bffXiorInstance
};

export const blogApiClient = {
    ...createApiMethods(blogXiorInstance),
    xiorInstance: blogXiorInstance
};