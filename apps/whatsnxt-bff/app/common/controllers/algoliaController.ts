import { algoliaResetService } from "../../services/algoliaService";
import { StatusCodes } from "http-status-codes";
import { getLogger } from "../../../config/logger";
const logger = getLogger("algoliaController");

const algoliaController = {
  // Reset specific index by type
  resetIndex: async (req, res) => {
    try {
      const { type } = req.params; // blog, course, tutorial

      if (!type) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error:
            "Index type is required. Available types: blog, course, tutorial",
        });
      }

      const result = await algoliaResetService.resetIndex(type);
      res.status(StatusCodes.OK).json({
        message: result,
        indexType: type,
      });
    } catch (error) {
      logger.error(`Error resetting ${req.params.type} index:`, error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: error.message || "Failed to reset Algolia index",
      });
    }
  },

  // Reset blog index specifically
  resetBlogIndex: async (req, res) => {
    try {
      const result = await algoliaResetService.resetBlogIndex();
      res.status(StatusCodes.OK).json({
        message: result,
        indexType: "blog",
      });
    } catch (error) {
      logger.error("Error resetting blog index:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Failed to reset blog index",
      });
    }
  },

  // Reset course index specifically
  resetCourseIndex: async (req, res) => {
    try {
      const result = await algoliaResetService.resetCourseIndex();
      res.status(StatusCodes.OK).json({
        message: result,
        indexType: "course",
      });
    } catch (error) {
      logger.error("Error resetting course index:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Failed to reset course index",
      });
    }
  },

  // Reset tutorial index specifically
  resetTutorialIndex: async (req, res) => {
    try {
      const result = await algoliaResetService.resetTutorialIndex();
      res.status(StatusCodes.OK).json({
        message: result,
        indexType: "tutorial",
      });
    } catch (error) {
      logger.error("Error resetting tutorial index:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Failed to reset tutorial index",
      });
    }
  },

  // Reset all indexes at once
  resetAllIndexes: async (req, res) => {
    try {
      const result = await algoliaResetService.resetAllIndexes();
      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      logger.error("Error resetting all indexes:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Failed to reset all indexes",
      });
    }
  },

  // Get service info (useful for debugging/status)
  getServiceInfo: async (req, res) => {
    try {
      const info = {
        service: "AlgoliaResetService",
        availableIndexes: ["blog", "course", "tutorial"],
        endpoints: {
          resetSpecific: "/algolia/reset/:type",
          resetBlog: "/algolia/reset/blog",
          resetCourse: "/algolia/reset/course",
          resetTutorial: "/algolia/reset/tutorial",
          resetAll: "/algolia/reset/all",
        },
        indexNames: {
          blog: process.env.ALGOLIA_BLOG_INDEX_NAME,
          course: process.env.ALGOLIA_COURSE_INDEX_NAME,
          tutorial: process.env.ALGOLIA_TUTORIAL_INDEX_NAME,
        },
      };
      res.status(StatusCodes.OK).json(info);
    } catch (error) {
      logger.error("Error getting service info:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Failed to get service information",
      });
    }
  },
};

export default algoliaController;
