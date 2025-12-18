import express from "express";
const router = express.Router();
import courseEnrolledController from "../../../../../controllers/course/courseEnrolledController";
import authMiddleware from "../../../../../common/middlewares/auth-middleware";

router.post("/", authMiddleware, courseEnrolledController.createEnrolledCourse);
router.get("/", authMiddleware, courseEnrolledController.handler);
router.patch("/", courseEnrolledController.handleCourseProgress);
router.get("/isEnrolled", authMiddleware, courseEnrolledController.isEnrolled);
router.get("/video", authMiddleware, courseEnrolledController.handleVideo);
router.get("/:id", courseEnrolledController.enrolledCount);
router.delete(
  "/:courseId",
  authMiddleware,
  courseEnrolledController.deleteEnrolledCourse,
);

export default router;
