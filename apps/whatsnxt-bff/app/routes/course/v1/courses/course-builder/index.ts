import express from "express";
const router = express.Router();
import courseBuilderController from "../../../../../controllers/course/courseBuilderController"; // Adjust the path as needed
import authMiddleware from "../../../../../common/middlewares/auth-middleware";
import verifyAuth from "../../../../../common/middlewares/course/authorization";

// Routes
router.get("/:id", courseBuilderController.getCourseById);
router.patch(
  "/:courseId/update-course-name",
  courseBuilderController.updateCourseName,
);
router.delete("/:courseId", courseBuilderController.deleteCourse);
router.patch(
  "/:courseId/update-course-type",
  courseBuilderController.updateCourseType,
);
router.post("/:courseId/add-section", courseBuilderController.addSection);
router.patch(
  "/:courseId/update-pricing",
  courseBuilderController.updatePricing,
);
router.patch(
  "/:courseId/update-details",
  courseBuilderController.updateCourseLandingPageDetails,
);

router.patch(
  "/:courseId/submit-for-review",
  verifyAuth.verifyTrainer,
  courseBuilderController.submitCourseForReview,
);
router.patch(
  "/:courseId/approve-course",
  verifyAuth.verifyAdminUser,
  courseBuilderController.approveCourse,
);
router.patch(
  "/:courseId/reject-course",
  verifyAuth.verifyAdminUser,
  courseBuilderController.rejectCourse,
);

router.post(
  "/:courseId/sections/:sectionId/add-lecture",
  courseBuilderController.addLectureToSection,
);
router.patch(
  "/sections/:sectionId/reorder-video",
  courseBuilderController.reorderVideos,
);
router.delete(
  "/:courseId/sections/:sectionId/lectures/:lectureId/delete-video",
  courseBuilderController.deleteVideoFromLecture,
);
router.patch(
  "/:courseId/sections/:sectionId/lectures/:lectureId/add-video",
  authMiddleware,
  courseBuilderController.addVideoToLecture,
);

router.patch(
  "/:courseId/sections/:sectionId/lectures/:lectureId/add-lecture-link",
  courseBuilderController.addLectureLinkToLecture,
);
router.patch(
  "/:courseId/sections/:sectionId/lectures/:lectureId/links/:linkId/update-lecture-link",
  courseBuilderController.updateLectureLink,
);
router.delete(
  "/:courseId/sections/:sectionId/lectures/:lectureId/links/:linkId/delete-lecture-link",
  courseBuilderController.deleteLectureLink,
);

router.patch(
  "/:courseId/sections/:sectionId/lectures/:lectureId/update-video-preview",
  courseBuilderController.updateVideoPreview,
);
router.patch(
  "/:courseId/sections/:sectionId/lectures/:lectureId/add-doc",
  courseBuilderController.addDocToLecture,
);
router.delete(
  "/:courseId/sections/:sectionId/lectures/:lectureId/delete-doc",
  courseBuilderController.deleteDocFromLecture,
);
router.delete(
  "/:courseId/delete-section",
  courseBuilderController.deleteSection,
);
router.patch(
  "/:courseId/sections/reorder-section",
  courseBuilderController.reorderSection,
);
router.patch(
  "/:id/update-title",
  courseBuilderController.updateSectionOrVideoTitle,
);
router.delete("/:courseId/delete-video", courseBuilderController.deleteVideo);

export default router;
