import express from "express";
const router = express.Router();
import { CourseFeedbackController } from "../../../../../controllers/course/courseFeedbackController";
import authMiddleware from "../../../../../common/middlewares/auth-middleware";

const courseFeedbackController = new CourseFeedbackController();

// Course reviews
router.get("/:courseId/reviews", courseFeedbackController.getFeedbackComments);
router.get("/course", (req, res) =>
  courseFeedbackController.getUserFeedbackComment(req, res),
);
router.post(
  "/:courseId/reviews",
  authMiddleware,
  courseFeedbackController.createFeedbackComment,
);
router.patch("/:commentId/edit", (req, res) =>
  courseFeedbackController.editFeedbackComment(req, res),
);
router.delete("/:commentId", (req, res) =>
  courseFeedbackController.deleteFeedbackComment(req, res),
);

// #region Review comment actions
router.post("/:id/toggleLike", (req, res) =>
  courseFeedbackController.toggleFeedbackLike(req, res),
);
router.post("/:id/toggleDislike", (req, res) =>
  courseFeedbackController.toggleFeedbackDislike(req, res),
);
router.patch("/:id/flag", (req, res) =>
  courseFeedbackController.flagFeedbackComment(req, res),
);
// #endregion

// #region Course ratings
router.post(
  "/:courseId/rating",
  authMiddleware,
  courseFeedbackController.addRating,
);
router.get("/:courseId/rating", courseFeedbackController.getRating);
router.patch(
  "/:courseId/rating",
  authMiddleware,
  courseFeedbackController.updateRating,
);
router.delete(
  "/:courseId/rating",
  authMiddleware,
  courseFeedbackController.deleteRating,
);
// #endregion

export default router;
