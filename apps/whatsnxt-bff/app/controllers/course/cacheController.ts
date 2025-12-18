import { redisClient } from "../../common/utils/redis";

/**
 * Clears all cache from Redis
 * @returns {Promise<number>} Number of keys deleted
 */
async function clearAllCache() {
  try {
    // Get all keys matching the cache pattern
    const cacheKeys = await redisClient.keys("cache:*");

    if (cacheKeys.length > 0) {
      // Delete all cache keys in a single operation
      const deletedCount = await redisClient.del(...cacheKeys);
      console.log(`Cleared ${deletedCount} cache entries`);
      return deletedCount;
    }

    console.log("No cache entries found to clear");
    return 0;
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
}

/**
 * Request handler for cache invalidation
 */
async function handleInvalidation(req, res) {
  try {
    console.log("Clearing all cache entries");
    const deletedCount = await clearAllCache();

    res.status(200).json({
      message: "Cache cleared successfully!",
      deletedCount,
    });
  } catch (err) {
    console.error("Error in handleInvalidation handler:", err);
    res.status(500).json({ error: "Failed to clear cache" });
  }
}

export { handleInvalidation, clearAllCache };
