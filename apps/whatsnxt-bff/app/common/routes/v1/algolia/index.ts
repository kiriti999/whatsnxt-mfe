import express from "express";
const router = express.Router();
import algoliaController from "../../../controllers/algoliaController";

// Reset specific index by type (dynamic route)
router.delete("/reset/:type", algoliaController.resetIndex);

// Reset specific indexes (explicit routes for clarity)
router.delete("/reset/blog", algoliaController.resetBlogIndex);
router.delete("/reset/course", algoliaController.resetCourseIndex);
router.delete("/reset/tutorial", algoliaController.resetTutorialIndex);

// Reset all indexes
router.delete("/reset/all", algoliaController.resetAllIndexes);

// Get service information
router.get("/info", algoliaController.getServiceInfo);

// Legacy route for backward compatibility
router.post("/reset", algoliaController.resetAllIndexes);

export default router;
