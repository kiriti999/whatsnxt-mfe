// import { redis } from '../middlewares/redis-middleware';
import { redisClient } from "../../../common/utils/redis";

/**
 * Custom cache update utility for courses
 */
const courseCacheUtils = {
  /**
   * Generate cache key for home page courses
   * @param {number} limit - Number of courses to fetch
   * @param {number} offset - Starting offset
   * @returns {string} Generated cache key
   */
  generateHomeCoursesKey(limit = 30, offset = 0) {
    return `cache:/course/courses/course:limit=${limit}&offset=${offset}`;
  },

  /**
   * Add a new course to existing home page courses cache
   * @param {Object} newCourse - Newly published course
   * @param {number} [limit=30] - Number of courses in cache
   * @param {number} [offset=0] - Current cache offset
   */
  async updateHomeCoursesCache(newCourse, limit = 30, offset = 0) {
    try {
      const cacheKey = this.generateHomeCoursesKey(limit, offset);

      // Retrieve existing cached courses
      const cachedCoursesStr = await redisClient.get(cacheKey);

      if (cachedCoursesStr) {
        try {
          // Parse existing cached courses
          const cachedCourses = JSON.parse(cachedCoursesStr);

          // Check if the new course is already in the list
          const courseExists = cachedCourses.some(
            (course) =>
              course._id === newCourse._id || course.slug === newCourse.slug,
          );

          if (!courseExists) {
            // Add new course to the beginning of the list
            cachedCourses.unshift(newCourse);

            // Trim to maintain original limit
            const updatedCourses = cachedCourses.slice(0, limit);

            // Update cache with new course list
            await redisClient.set(cacheKey, JSON.stringify(updatedCourses));

            console.log("Updated home courses cache with new course");
          }
        } catch (parseError) {
          console.warn("Failed to parse existing courses cache:", parseError);
        }
      }
    } catch (error) {
      console.error("Error updating home courses cache:", error);
    }
  },

  /**
   * Invalidate home courses cache completely
   * @param {number} [limit=30] - Number of courses in cache
   * @param {number} [offset=0] - Current cache offset
   */
  async invalidateHomeCoursesCache(limit = 30, offset = 0) {
    try {
      const cacheKey = this.generateHomeCoursesKey(limit, offset);
      await redisClient.del(cacheKey);
      console.log("Invalidated home courses cache");
    } catch (error) {
      console.error("Error invalidating home courses cache:", error);
    }
  },
};

export default courseCacheUtils;
