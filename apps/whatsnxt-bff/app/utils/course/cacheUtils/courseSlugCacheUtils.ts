import { redisClient } from "../../../common/utils/redis";

const courseSlugCacheUtils = {
  /**
   * Generate cache key for course slug
   * @param {string} slug - Course slug
   * @param {Object} [options] - Additional options for key generation
   * @returns {string} Generated cache key
   */
  generateSlugCacheKey(slug: string, options: any = {}) {
    // Construct query parameters if needed
    const params = new URLSearchParams();
    params.append("slug", slug);

    // Add any additional options
    Object.entries(options).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, String(value));
      }
    });

    return `${process.env.REDIS_COURSE_CACHE_PREFIX}/course/slug?${params.toString()}`;
  },

  /**
   * Invalidate cache for a specific course slug
   * @param {string} slug - Course slug to invalidate
   * @param {Object} [options] - Additional invalidation options
   */
  async invalidateCourseSlugCache(slug, options = {}) {
    try {
      // Generate potential cache keys
      const scenarios = [
        // Basic slug key
        this.generateSlugCacheKey(slug),

        // With invalidate option
        this.generateSlugCacheKey(slug, { invalidate: "true" }),

        // Pattern-based matching for additional flexibility
        `${process.env.REDIS_COURSE_CACHE_PREFIX}/course/slug*${slug}*`,
      ];

      // Remove duplicate keys
      const uniqueKeys = [...new Set(scenarios)];

      // Batch delete keys
      for (const key of uniqueKeys) {
        // Use keys method to find matching keys
        const matchingKeys = await redisClient.keys(key);

        if (matchingKeys.length > 0) {
          await redisClient.del(...matchingKeys);
          console.log(
            `Invalidated course slug cache: ${key}, Matched keys: ${matchingKeys.length}`,
          );
        }
      }
    } catch (error) {
      console.error("Error invalidating course slug cache:", error);
    }
  },

  /**
   * Invalidate all course slug caches
   */
  async invalidateAllCourseSlugCaches() {
    try {
      // Use pattern matching to delete all course slug related caches
      const matchingKeys = await redisClient.keys(
        `${process.env.REDIS_COURSE_CACHE_PREFIX}/course/slug*`,
      );

      if (matchingKeys.length > 0) {
        await redisClient.del(...matchingKeys);
        console.log(
          `Invalidated ${matchingKeys.length} course slug cache keys`,
        );
      }
    } catch (error) {
      console.error("Error invalidating all course slug caches:", error);
    }
  },
};

export default courseSlugCacheUtils;
