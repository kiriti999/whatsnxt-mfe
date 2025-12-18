import axios from "axios";
import { getLogger } from "../config/logger"; // Assuming logger is available
// import { httpClient } from '@whatsnxt/http-client'; // Assuming this is the shared client

const logger = getLogger("HttpClientConfig");

// This would typically configure the shared @whatsnxt/http-client
// For now, we'll demonstrate using a basic axios instance with retry logic

const configureHttpClient = () => {
  // Use the shared httpClient if available and configured for retries
  // const instance = httpClient.create({ /* specific config for whatsnxt-bff */ });

  // Fallback/example using a new axios instance if shared client not ready or if specific overrides are needed
  const instance = axios.create({
    timeout: 5000, // Request timeout
  });

  // Request interceptor (example: add auth token)
  instance.interceptors.request.use(
    (config) => {
      // config.headers.Authorization = `Bearer ${YOUR_AUTH_TOKEN}`;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Response interceptor for retry mechanism
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config, response } = error;
      const MAX_RETRIES = 3;
      const RETRY_DELAY = 1000; // 1 second
      let retryCount = config.__retryCount || 0;

      if (
        response &&
        (response.status === 429 || response.status >= 500) && // Too Many Requests or Server Error
        retryCount < MAX_RETRIES
      ) {
        retryCount++;
        config.__retryCount = retryCount;
        logger.warn(
          `Retrying request ${config.url} (attempt ${retryCount}/${MAX_RETRIES})`,
        );

        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY * Math.pow(2, retryCount - 1)),
        );

        return instance(config); // Re-run the request
      }

      logger.error(
        `HTTP request failed after ${retryCount} retries: ${config.url}`,
        error,
      );
      return Promise.reject(error);
    },
  );

  return instance;
};

export const httpClient = configureHttpClient();
