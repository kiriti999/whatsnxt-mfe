// ApiClientFactory.ts
import xior from 'xior';

// Import store type instead of the store instance to avoid circular dependencies
type RootState = {
    user: {
        userToken: string | null;
        userObject: any | null;
    };
    // Add other state properties as needed
};

// Lazy import function to avoid circular dependency
const getStore = () => {
    try {
        // Dynamic import to avoid circular dependency issues
        const { store } = require('../../../../apps/web/store/store');
        return store;
    } catch (error) {
        console.warn('Could not access store:', error);
        return null;
    }
};

export type ApiClientType = 'common' | 'course' | 'article';

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
const commonErrorHandler = async (error: any) => {
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
            const customError = new Error(backendMessage || 'Unauthorized') as any;
            customError.status = statusCode;
            customError.response = error.response; // Preserve the full response object
            throw customError;
        }

        // For any error response, extract the backend message if available
        if (error.response) {
            const customError = new Error(backendMessage || error.message || 'An error occurred') as any;
            customError.status = statusCode;
            customError.response = error.response; // Preserve the full response object
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
const xiorRequestInterceptor = (config: any) => {
    console.log('🔍 Request to:', config.url);

    // Skip FormData requests
    if (config.data instanceof FormData) {
        return config;
    }

    let token = null;

    // Try to get token from multiple sources
    if (config.data?.accessToken) {
        token = config.data.accessToken;
        config.headers = config.headers || {};
        config.headers['Authorization'] = `${token}`;
        delete config.data.accessToken;
        console.log('✅ Token from request data');
    } else {
        // Try to get token from Redux store safely
        try {
            const store = getStore();
            if (store) {
                const state = store.getState() as RootState;
                // Safe access with optional chaining and proper typing
                token = state?.user?.userToken || null;
                if (token) {
                    console.log('✅ Token from Redux store');
                } else {
                    console.log('⚠️ No token found in Redux store');
                }
            } else {
                console.log('⚠️ Could not access Redux store');
            }
        } catch (e: any) {
            console.log('⚠️ Error accessing Redux store:', e.message);
        }
    }

    // Web Worker handling
    if (isWebWorker()) {
        console.log('🔧 Web Worker detected');

        if (token) {
            config.headers = config.headers || {};
            config.headers['Cookie'] = `${process.env.NEXT_PUBLIC_COOKIES_ACCESS_TOKEN}=${token}; ${config.headers['Cookie'] || ''}`;
            console.log('✅ Added token to Cookie header for Web Worker');
        } else {
            console.log('❌ No token available for Web Worker');
        }
    } else {
        console.log('🍪 Using HttpOnly cookie (sent automatically)');
    }

    return config;
};

const apiErrorHandler = async (error: any) => {
    const statusCode = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message;

    try {
        // Log the error for debugging
        if (statusCode) {
            console.info(`Axios API Error:: message: ${errorMessage} code: ${statusCode}`);
        }

        // For BFF errors, we want to preserve the custom error message from backend
        if (statusCode >= 400) {
            // Create a new error with the backend message and preserve response
            const customError = new Error(errorMessage) as any;
            customError.status = statusCode;
            customError.response = error.response; // Preserve the full response object
            throw customError;
        }

        return Promise.reject(error);
    } catch (e: any) {
        console.info(`Axios ErrorHandler Exception:: message: ${e.message}`);
        return Promise.reject(e);
    }
};

// Configuration for different API types
const getApiConfig = (type: ApiClientType): ApiClientConfig => {
    const baseConfig = {
        withCredentials: true,
    };

    switch (type) {
        case 'common':
            return {
                ...baseConfig,
                baseURL: process.env.NEXT_PUBLIC_BFF_HOST_COMMON_API!,
                requestInterceptor: xiorRequestInterceptor,
                errorHandler: commonErrorHandler,
            };

        case 'course':
            return {
                ...baseConfig,
                baseURL: process.env.NEXT_PUBLIC_BFF_HOST_COURSE_API!,
                requestInterceptor: xiorRequestInterceptor,
                errorHandler: apiErrorHandler,
            };

        case 'article':
            return {
                ...baseConfig,
                baseURL: process.env.NEXT_PUBLIC_ARTICLE_HOST_API!,
                requestInterceptor: xiorRequestInterceptor,
                errorHandler: apiErrorHandler,
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
                // Check if this is a long-running AI endpoint that needs more time
                const isLongRunningEndpoint = requestConfig.url && (
                    requestConfig.url.includes('/post/suggestionByChatGpt') ||
                    requestConfig.url.includes('/post/suggestionByAI') ||
                    requestConfig.url.includes('/visualizer/generate') ||
                    requestConfig.url.includes('/visualizer/regenerate') ||
                    requestConfig.url.includes('/linkedin/share')
                );

                // Only apply timeout for non-long-running endpoints
                if (!isLongRunningEndpoint) {
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
export const commonXiorInstance = createApiClient('common');
export const courseXiorInstance = createApiClient('course');
export const articleXiorInstance = createApiClient('article');

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
export const commonApiClient = {
    ...createApiMethods(commonXiorInstance),
    xiorInstance: commonXiorInstance
};

export const courseApiClient = {
    ...createApiMethods(courseXiorInstance),
    xiorInstance: courseXiorInstance
};

export const articleApiClient = {
    ...createApiMethods(articleXiorInstance),
    xiorInstance: articleXiorInstance
};