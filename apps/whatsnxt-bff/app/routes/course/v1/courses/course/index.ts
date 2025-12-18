import express from "express";
const router = express.Router();
import courseController from "../../../../../controllers/course/courseController";
import authMiddleware from "../../../../../common/middlewares/auth-middleware";
import authorization from "../../../../../common/middlewares/course/authorization";

// Course Routes
router.get("/", courseController.getCourses); // Handles ?tagName, limit, offset
router.post(
  "/",
  authMiddleware,
  authorization.verifyTrainer,
  courseController.createCourseName,
);
router.post(
  "/:courseId/publish",
  authMiddleware,
  courseController.publishCourse,
);

// Specific course by slug (more specific route)
router.get("/slug/:slug", courseController.getCourseBySlug);
// Stream lecture videos
router.get("/stream", authMiddleware, courseController.getVideoStream);

router.get(
  "/status",
  authorization.verifyAdminUser,
  courseController.getCourseStatus,
);

// Specific course by ID (generic route placed after specific routes)
// router.get('/:id', courseController.getCourseById);
router.delete(
  "/:id",
  authMiddleware,
  authorization.verifyTrainer,
  courseController.deleteCourse,
);

router.post(
  "/sections/:sectionId/videos/publishAll",
  authMiddleware,
  courseController.publishAllVideosInSection,
);
router.post(
  "/sections/:sectionId/videos/:videoId/publish",
  authMiddleware,
  courseController.publishVideo,
);

export default router;
