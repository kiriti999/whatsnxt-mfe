import express from "express";
const router = express.Router();
import courseTrainerController from "../../../../../controllers/course/courseTrainerController";
import authMiddleware from "../../../../../common/middlewares/auth-middleware";

router.get("/get-details/:id", courseTrainerController.getTrainerDetails);
router.get(
  "/notifications",
  authMiddleware,
  courseTrainerController.notifications,
);
router.post(
  "/delete-notifications",
  authMiddleware,
  courseTrainerController.deleteNotifications,
);
router.post(
  "/read-notifications",
  authMiddleware,
  courseTrainerController.readNotifications,
);
router.get(
  "/course-history",
  authMiddleware,
  courseTrainerController.courseHistory,
);
router.get(
  "/trainer-courses",
  authMiddleware,
  courseTrainerController.trainerCourses,
);
router.get("/get-sections", courseTrainerController.sections);
router.get(
  "/get-course-names",
  authMiddleware,
  courseTrainerController.listNames,
);
router.get(
  "/get-sections-by-video",
  courseTrainerController.listSectionsByVideo,
);
router.get("/get-bookings", authMiddleware, courseTrainerController.bookings);
router.post("/update-booking", courseTrainerController.updateBooking);
router.post("/checkout", courseTrainerController.checkout);
router.get("/trainers", courseTrainerController.trainers);
router.post("/hire-trainer", courseTrainerController.hireTrainer);
router.get("/search-trainers", courseTrainerController.searchTrainers);
router.post(
  "/update-contacted-students/:trainerId",
  courseTrainerController.updateContactedStudents,
);

export default router;
