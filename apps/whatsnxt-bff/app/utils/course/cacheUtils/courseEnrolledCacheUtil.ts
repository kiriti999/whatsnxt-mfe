import { redisClient } from "../../../common/utils/redis";

/**
 * Update the enrolled courses cache with a new enrollment
 * @param {string} userId - The user ID
 * @param {Object} newEnrollment - The new enrollment data
 * @returns {Promise<void>}
 */
async function updateEnrolledCoursesCache(userId, newEnrollment) {
  try {
    // Find the main enrolled courses cache key
    const enrolledCacheKey = `cache:/course/courses/enrolled?userId=${userId}`;

    console.log(
      " updateEnrolledCoursesCache :: enrolledCacheKey:",
      enrolledCacheKey,
    );
    // Check if cache exists
    const cachedData = await redisClient.get(enrolledCacheKey);

    if (cachedData) {
      // Parse existing cache
      const enrolledCourses = JSON.parse(cachedData);

      // If it's an array (list of enrolled courses), add the new one
      if (Array.isArray(enrolledCourses)) {
        // Add the new enrollment to the cached data
        enrolledCourses.push(newEnrollment);

        // Update the cache with the new data
        await redisClient.set(
          enrolledCacheKey,
          JSON.stringify(enrolledCourses),
        );

        console.log(`Updated cache with new enrollment: ${enrolledCacheKey}`);
      } else {
        // If the structure is different, invalidate and let it re-cache naturally
        await redisClient.del(enrolledCacheKey);
        console.log(
          `Cache structure didn't match expected, cleared for refresh: ${enrolledCacheKey}`,
        );
      }
    }
    // If no cache exists, it will be created on the next GET request naturally
  } catch (error) {
    console.error("Error in updateEnrolledCoursesCache:", error);
  }
}

/**
 * Remove a specific course from the enrolled courses cache
 * @param {string} userId - The user ID
 * @param {string} courseId - The course ID to remove
 * @returns {Promise<void>}
 */
async function removeFromEnrolledCoursesCache(userId, courseId) {
  try {
    // Find the main enrolled courses cache key
    const enrolledCacheKey = `cache:/course/courses/enrolled?userId=${userId}`;

    // Check if cache exists
    const cachedData = await redisClient.get(enrolledCacheKey);

    if (cachedData) {
      // Parse existing cache
      const enrolledCourses = JSON.parse(cachedData);

      // If it's an array (list of enrolled courses), filter out the deleted one
      if (Array.isArray(enrolledCourses)) {
        // Filter out the deleted course
        const updatedCourses = enrolledCourses.filter(
          (enrollment) => enrollment.course.toString() !== courseId,
        );

        // Update the cache with the filtered data
        await redisClient.set(enrolledCacheKey, JSON.stringify(updatedCourses));

        console.log(
          `Removed course ${courseId} from cache: ${enrolledCacheKey}`,
        );
      } else {
        // If the structure is different, invalidate and let it re-cache naturally
        await redisClient.del(enrolledCacheKey);
        console.log(
          `Cache structure didn't match expected, cleared for refresh: ${enrolledCacheKey}`,
        );
      }
    }
    // If no cache exists, no action needed
  } catch (error) {
    console.error("Error in removeFromEnrolledCoursesCache:", error);
  }
}

/**
/**
 * Updates the cache for bulk course enrollments
 * @param {string} userId - The user ID
 * @param {Array} newEnrollments - Array of newly enrolled courses
 */
/**
 * Updates the cache for bulk course enrollments
 * @param {string} userId - The user ID
 * @param {Array} newEnrollments - Array of newly enrolled courses
 */
async function updateBulkEnrolledCoursesCache(userId, newEnrollments) {
  try {
    // 1. Cache each enrollment individually with a course-specific key
    for (const enrollment of newEnrollments) {
      const courseId = enrollment.course.toString();
      const courseSpecificCacheKey = `${process.env.REDIS_COURSE_CACHE_PREFIX}/enrolled/course/${userId}/${courseId}`;

      // Set individual course enrollment in cache
      await redisClient.set(courseSpecificCacheKey, JSON.stringify(enrollment));

      // Also update the isEnrolled status
      const isEnrolledCacheKey = `${process.env.REDIS_COURSE_CACHE_PREFIX}/enrolled/isEnrolled?courseId=${courseId}&userId=${userId}`;
      await redisClient.set(
        isEnrolledCacheKey,
        JSON.stringify({ isEnrolled: true }),
      );

      const courseOnlyCacheKey = `${process.env.REDIS_COURSE_CACHE_PREFIX}/enrolled/isEnrolled?courseId=${courseId}`;
      await redisClient.set(
        courseOnlyCacheKey,
        JSON.stringify({ isEnrolled: true }),
      );

      console.log(
        `Cached individual enrollment for user ${userId}, course ${courseId}`,
      );
    }

    // 2. Update the course ID list - just store the IDs, not the full objects
    const courseIdsKey = `${process.env.REDIS_COURSE_CACHE_PREFIX}/enrolled/idList/${userId}`;
    const cachedIdsData = await redisClient.get(courseIdsKey);

    let courseIds = [];
    if (cachedIdsData) {
      // Get existing course IDs
      courseIds = JSON.parse(cachedIdsData);
    }

    // Add new course IDs that aren't already in the list
    const newCourseIds = newEnrollments.map((e) => e.course.toString());
    const updatedCourseIds = [...new Set([...courseIds, ...newCourseIds])];

    // Store the updated list of course IDs
    await redisClient.set(courseIdsKey, JSON.stringify(updatedCourseIds));

    console.log(
      `Updated course ID list for user ${userId}, now has ${updatedCourseIds.length} courses`,
    );

    // 3. Invalidate the full enrolled courses list cache
    const enrolledListCacheKey = `${process.env.REDIS_COURSE_CACHE_PREFIX}/enrolled/?userId=${userId}`;
    await redisClient.del(enrolledListCacheKey);

    // 4. Also invalidate the main enrollment list cache without query params
    const mainEnrollmentCacheKey = `${process.env.REDIS_COURSE_CACHE_PREFIX}/enrolled/`;
    await redisClient.del(mainEnrollmentCacheKey);

    console.log(`Invalidated main enrollment cache keys for refresh`);
  } catch (error) {
    console.error("Error in updateBulkEnrolledCoursesCache:", error);
  }
}

// /**
//  * Updates cache when a user un-enrolls from a course
//  * @param {string} userId - The user ID
//  * @param {string} courseId - The course ID being un-enrolled
//  */
// async function updateCacheForUnenrollment(userId, courseId) {
//     try {
//         const courseIdStr = courseId.toString();

//         // 1. Remove the individual course enrollment cache
//         const courseSpecificCacheKey = `cache:/course/courses/enrolled/course/${userId}/${courseIdStr}`;
//         await redisClient.del(courseSpecificCacheKey);

//         // 2. Update the isEnrolled status
//         const isEnrolledCacheKey = `cache:/course/courses/enrolled/isEnrolled?courseId=${courseIdStr}&userId=${userId}`;
//         await redisClient.set(
//             isEnrolledCacheKey,
//             JSON.stringify({ isEnrolled: false })
//         );

//         // 3. Update the course ID list
//         const courseIdsKey = `cache:/course/courses/enrolled/idList/${userId}`;
//         const cachedIdsData = await redisClient.get(courseIdsKey);

//         if (cachedIdsData) {
//             // Get existing course IDs and remove the un-enrolled one
//             let courseIds = JSON.parse(cachedIdsData);
//             courseIds = courseIds.filter(id => id !== courseIdStr);

//             // Store the updated list
//             await redisClient.set(
//                 courseIdsKey,
//                 JSON.stringify(courseIds)
//             );

//             console.log(`Updated course ID list after un-enrollment, user ${userId} now has ${courseIds.length} courses`);
//         }

//         // 4. Invalidate the full enrolled courses list cache
//         const enrolledListCacheKey = `cache:/course/courses/enrolled?userId=${userId}`;
//         await redisClient.del(enrolledListCacheKey);

//     } catch (error) {
//         console.error('Error updating cache for un-enrollment:', error);
//     }
// }

async function updateCacheForUnenrollment(userId, courseId) {
  try {
    const courseIdStr = courseId.toString();

    // 1. Remove the individual course enrollment cache
    const courseSpecificCacheKey = `${process.env.REDIS_COURSE_CACHE_PREFIX}/enrolled/course/${userId}/${courseIdStr}`;
    await redisClient.del(courseSpecificCacheKey);

    // 2. Update the isEnrolled status (with userId)
    const isEnrolledCacheKey = `${process.env.REDIS_COURSE_CACHE_PREFIX}/enrolled/isEnrolled?courseId=${courseIdStr}&userId=${userId}`;
    await redisClient.set(
      isEnrolledCacheKey,
      JSON.stringify({ isEnrolled: false }),
    );

    // 3. Also update the course-only isEnrolled key
    const courseOnlyCacheKey = `${process.env.REDIS_COURSE_CACHE_PREFIX}/enrolled/isEnrolled?courseId=${courseIdStr}`;
    await redisClient.set(
      courseOnlyCacheKey,
      JSON.stringify({ isEnrolled: false }),
    );

    // 4. Update the course ID list
    const courseIdsKey = `${process.env.REDIS_COURSE_CACHE_PREFIX}/enrolled/idList/${userId}`;
    const cachedIdsData = await redisClient.get(courseIdsKey);

    if (cachedIdsData) {
      // Get existing course IDs and remove the un-enrolled one
      let courseIds = JSON.parse(cachedIdsData);
      courseIds = courseIds.filter((id) => id !== courseIdStr);

      // Store the updated list
      await redisClient.set(courseIdsKey, JSON.stringify(courseIds));

      console.log(
        `Updated course ID list after un-enrollment, user ${userId} now has ${courseIds.length} courses`,
      );
    }

    // 5. Invalidate the full enrolled courses list cache
    const enrolledListCacheKey = `${process.env.REDIS_COURSE_CACHE_PREFIX}/enrolled/?userId=${userId}`;
    await redisClient.del(enrolledListCacheKey);

    // 6. Also invalidate the main enrollment list cache
    const mainEnrollmentCacheKey = `${process.env.REDIS_COURSE_CACHE_PREFIX}/enrolled/`;
    await redisClient.del(mainEnrollmentCacheKey);
  } catch (error) {
    console.error("Error updating cache for un-enrollment:", error);
  }
}

export {
  updateEnrolledCoursesCache,
  removeFromEnrolledCoursesCache,
  updateBulkEnrolledCoursesCache,
  updateCacheForUnenrollment,
};
