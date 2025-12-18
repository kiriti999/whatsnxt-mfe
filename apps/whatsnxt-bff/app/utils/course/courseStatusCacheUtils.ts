import { redisClient } from "../redis";

const courseStatusCacheUtils = {
  /**
   * Generate cache key for course status
   * @param {Object} options - Cache key generation options
   * @param {string} [options.status] - Course status
   * @param {number} [options.limit=8] - Number of courses to fetch
   * @param {number} [options.offset=0] - Starting offset
   * @param {string} [options.tagName] - Category name filter
   * @returns {string} Generated cache key
   */
  generateCourseStatusKey(options: any = {}) {
    const { status = "all", limit = 8, offset = 0, tagName = "" } = options;

    // Construct query parameters manually to ensure exact match
    const params = [];
    params.push(`limit=${limit}`);
    params.push(`offset=${offset}`);

    if (status !== "all") {
      params.push(`status=${status}`);
    }

    if (tagName) {
      params.push(`tagName=${tagName}`);
    }

    // Use '?' to match the exact format
    return `${process.env.REDIS_COURSE_CACHE_PREFIX}/course/status?${params.join("&")}`;
  },

  /**
   * Invalidate course status cache
   * @param {Object} options - Cache invalidation options
   * @param {string} [options.status] - Course status to invalidate
   * @param {number} [options.limit=8] - Number of courses to fetch
   * @param {number} [options.offset=0] - Starting offset
   * @param {string} [options.tagName] - Category name filter
   */
  async invalidateCourseStatusCache(options = {}) {
    try {
      // Generate multiple cache keys to cover different scenarios
      const scenarios = [
        // Specific status cache
        this.generateCourseStatusKey(options),

        // All status caches
        this.generateCourseStatusKey({ ...options, status: "all" }),

        // Different offsets and limits
        this.generateCourseStatusKey({ ...options, limit: 1, offset: 0 }),
      ];

      // Remove duplicate keys
      const uniqueKeys = [...new Set(scenarios)];

      // Batch delete keys
      for (const key of uniqueKeys) {
        await redisClient.del(key);
        console.log(`Invalidated course status cache: ${key}`);
      }
    } catch (error) {
      console.error("Error invalidating course status cache:", error);
    }
  },

  /**
   * Invalidate all course status caches
   */
  async invalidateAllCourseStatusCaches() {
    try {
      // Use pattern matching to delete all course status related caches
      const matchingKeys = await redisClient.keys(
        `${process.env.REDIS_COURSE_CACHE_PREFIX}/course/status*`,
      );

      if (matchingKeys.length > 0) {
        await redisClient.del(...matchingKeys);
        console.log(
          `Invalidated ${matchingKeys.length} course status cache keys`,
        );
      }
    } catch (error) {
      console.error("Error invalidating all course status caches:", error);
    }
  },
};

export default courseStatusCacheUtils;
