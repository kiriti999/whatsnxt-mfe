import { getLogger } from "../../../config/logger";
const logger = getLogger("redis-middleware");
import { redisClient } from "../utils/redis";

// Default cache configuration
const DEFAULT_CACHE_EXPIRY = 60 * 60; // 1 hour in seconds

interface CacheOptions {
  expiry?: number;
  generateKey?: (req: any) => string;
  invalidationPaths?: string[];
  crossPathInvalidation?: string[];
}

/**
 * Redis Caching Middleware with Automatic Cache Invalidation
 * @param {Object} options - Configuration options for caching
 * @param {number} [options.expiry=3600] - Cache expiration time in seconds
 * @param {function} [options.generateKey] - Custom key generation function
 * @param {string[]} [options.invalidationPaths] - Additional paths to invalidate on write operations
 * @param {string[]} [options.crossPathInvalidation] - Specific cache keys/patterns to invalidate regardless of current path
 * @returns {Function} Express middleware for Redis caching
 */
const redisCachingMiddleware = (options: CacheOptions = {}) => {
  const {
    expiry = DEFAULT_CACHE_EXPIRY,
    generateKey = defaultKeyGenerator,
    invalidationPaths = [],
    crossPathInvalidation = [],
  } = options;

  return async (req, res, next) => {
    // Caching and invalidation logic
    if (req.method === "GET") {
      try {
        // Generate unique cache key
        const cacheKey = generateKey(req);

        // Skip caching if key generator returns null
        if (!cacheKey) {
          return next();
        }

        // logger.info('');
        // logger.info(' 🔑 Cache Key:', cacheKey);
        // logger.info('');

        // Try to retrieve cached data
        const cachedData = await redisClient.get(cacheKey);
        // logger.info('');
        // logger.info(" 📦 Cache Result:", cachedData ? '✅ HIT' : '❌ MISS');
        // logger.info('');

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
        await invalidateRelatedCaches(
          req,
          invalidationPaths,
          crossPathInvalidation,
        );
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
 * @param {string[]} crossPathInvalidation - Specific cache keys/patterns to invalidate regardless of current path
 */
async function invalidateRelatedCaches(
  req,
  additionalPaths = [],
  crossPathInvalidation = [],
) {
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

  // Add cross-path invalidation patterns
  const crossPathPatterns = crossPathInvalidation.map(
    (path) => `cache:*${path}*`,
  );
  keysToDelete.push(...crossPathPatterns);

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
 Helper function to invalidate specific cache keys using existing redisClient
 * @param { string } slug - Current slug to invalidate
 * @param { string } oldSlug - Previous slug to invalidate(optional)
 */
async function invalidateSpecificCaches(slug, oldSlug = null) {
  try {
    const cacheKeys = [];

    // Current slug cache key
    if (slug) {
      cacheKeys.push(`${process.env.REDIS_ARTICLE_CACHE_PREFIX}/slug/${slug}`);
    }

    // Old slug cache key (if slug was changed)
    if (oldSlug && oldSlug !== slug) {
      cacheKeys.push(
        `${process.env.REDIS_ARTICLE_CACHE_PREFIX}/slug/${oldSlug}`,
      );
    }

    // Delete specific cache keys using existing redisClient
    if (cacheKeys.length > 0) {
      const result = await redisClient.del(...cacheKeys);
      logger.info(`✅ Invalidated ${result} specific caches:`, cacheKeys);
    }

    // Also invalidate any wildcard patterns that might contain this slug
    await invalidatePostListCachesContainingSlug(slug);
    if (oldSlug && oldSlug !== slug) {
      await invalidatePostListCachesContainingSlug(oldSlug);
    }
  } catch (error) {
    logger.error("❌ Error invalidating specific caches:", error);
    throw error; // Re-throw to handle in calling function
  }
}

// Add this function to your middleware file
async function invalidatePostListCachesContainingSlug(slug) {
  try {
    // Get all getPosts cache keys
    const cacheKeys = await redisClient.keys("cache:*/post/getPosts*");

    for (const key of cacheKeys) {
      try {
        const cachedData = await redisClient.get(key);
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);

          // Check if this cache contains the edited post
          const containsPost = parsedData?.data?.some(
            (post) => post.slug === slug,
          );

          if (containsPost) {
            await redisClient.del(key);
            logger.info(
              `🎯 Invalidated cache ${key} containing post with slug: ${slug}`,
            );
          }
        }
      } catch (parseError) {
        // If we can't parse, better to invalidate it
        await redisClient.del(key);
        logger.info(`🗑️ Invalidated unparseable cache: ${key}`);
      }
    }
  } catch (error) {
    logger.error("Error in smart cache invalidation:", error);
    // Fallback to invalidating all getPosts caches
    await invalidateSpecificCaches("cache:*/post/getPosts*");
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

export {
  redisCachingMiddleware,
  clearCache,
  flushCache,
  redisClient,
  invalidateSpecificCaches,
  invalidatePostListCachesContainingSlug,
};

// Error handling for Redis connection
redisClient.on("error", (err) => {
  logger.error("Redis Client Error", err);
});
