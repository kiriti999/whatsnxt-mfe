import { getLogger } from "../../../../config/logger";
const logger = getLogger("redis-middleware");
import { redisClient } from "../../../utils/redis";

// Default cache configuration
const DEFAULT_CACHE_EXPIRY = 60 * 60; // 1 hour in seconds

interface CacheOptions {
  expiry?: number;
  generateKey?: (req: any) => string;
  invalidationPaths?: string[];
}

/**
 * Redis Caching Middleware with Automatic Cache Invalidation
 * @param {Object} options - Configuration options for caching
 * @param {number} [options.expiry=3600] - Cache expiration time in seconds
 * @param {function} [options.generateKey] - Custom key generation function
 * @param {string[]} [options.invalidationPaths] - Additional paths to invalidate on write operations
 * @returns {Function} Express middleware for Redis caching
 */
const redisCachingMiddleware = (options: CacheOptions = {}) => {
  const {
    expiry = DEFAULT_CACHE_EXPIRY,
    generateKey = defaultKeyGenerator,
    invalidationPaths = [],
  } = options;

  return async (req, res, next) => {
    // Caching and invalidation logic
    if (req.method === "GET") {
      try {
        // Generate unique cache key
        const cacheKey = generateKey(req);
        logger.info(" return :: cacheKey:", cacheKey);

        // Try to retrieve cached data
        const cachedData = await redisClient.get(cacheKey);
        logger.info(" return :: cachedData:", cachedData);

        if (cachedData) {
          // If cached data exists, parse and send
          try {
            const parsedData = JSON.parse(cachedData);
            res.json(parsedData);
            return; // Exit middleware after sending cached response
          } catch (parseError) {
            // If parsing fails, proceed with original route handler
            logger.warn("Failed to parse cached data:", parseError);
          }
        }

        // Modify response.json to cache the response
        const originalJson = res.json;
        res.json = function (data) {
          // Cache the response with expiry
          redisClient
            .set(cacheKey, JSON.stringify(data), "EX", expiry)
            .catch((err) => logger.error("Redis caching error:", err));

          // Call original json method
          return originalJson.call(this, data);
        };

        // Continue to next middleware/controller
        next();
      } catch (error) {
        logger.error("Redis middleware error:", error);
        next(); // Continue on error
      }
    } else {
      // For non-GET methods (POST, PUT, PATCH, DELETE), invalidate relevant caches
      try {
        await invalidateRelatedCaches(req, invalidationPaths);
      } catch (error) {
        logger.error("Cache invalidation error:", error);
      }
      next(); // Always continue for non-GET methods
    }
  };
};

/**
 * Invalidate related cache entries based on the current request
 * @param {Object} req - Express request object
 * @param {string[]} additionalPaths - Additional paths to invalidate
 */
async function invalidateRelatedCaches(req, additionalPaths = []) {
  // Base paths to invalidate
  const basePaths = [
    req.baseUrl,
    req.path,
    ...(req.params
      ? Object.values(req.params).map((param) => `/${param}`)
      : []),
    ...additionalPaths,
  ];

  // Patterns to match and delete
  const keysToDelete = basePaths.flatMap((path) => [
    `cache:*${path}*`,
    `cache:user:*${path}*`,
  ]);

  // Delete matching cache keys
  for (const pattern of keysToDelete) {
    try {
      const matchingKeys = await redisClient.keys(pattern);
      if (matchingKeys.length > 0) {
        await redisClient.del(...matchingKeys);
        logger.info(
          `Invalidated ${matchingKeys.length} cache entries matching ${pattern}`,
        );
      }
    } catch (error) {
      logger.error(`Error invalidating cache for pattern ${pattern}:`, error);
    }
  }
}

/**
 * Default cache key generator
 * @param {Object} req - Express request object
 * @returns {string} Generated cache key
 */
function defaultKeyGenerator(req) {
  // Create a cache key based on path and query parameters
  const path = req.baseUrl + req.path;
  const queryParams = new URLSearchParams(req.query).toString();

  return `cache:${path}${queryParams ? `?${queryParams}` : ""}`;
}

/**
 * Clear specific cache entry
 * @param {string} key - Cache key to clear
 * @returns {Promise<number>} Number of keys deleted
 */
const clearCache = async (key) => {
  return await redisClient.del(key);
};

/**
 * Flush entire Redis cache
 * @returns {Promise<string>} Redis response
 */
const flushCache = async () => {
  return await redisClient.flushdb();
};

export { redisCachingMiddleware, clearCache, flushCache, redisClient };

// Error handling for Redis connection
redisClient.on("error", (err) => {
  logger.error("Redis Client Error", err);
});
