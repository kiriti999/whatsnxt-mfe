import express from "express";
import interviewController from "../../../../../controllers/course/interviewController";
import authMiddleware from "../../../../../common/middlewares/auth-middleware";
import extractUser from "../../../../../common/middlewares/extract-user";
const router = express.Router();

router.get("/", interviewController.getAllQuestionAnswers);
router.get(
  "/course/:courseId",
  extractUser,
  interviewController.getQuestionAnswersByCourseID,
);
router.get("/:slug", interviewController.getQuestionAnswerBySlug);
router.post("/", authMiddleware, interviewController.createQuestionAnswer);
router.put("/:questionId", interviewController.updateQuestionAnswer);
router.delete("/:questionId", interviewController.removeQuestionAnswer);

router.post("/suggestionByGemini", interviewController.getSuggestionByGemini);

router.post(
  "/suggestionByChatGpt",
  authMiddleware,
  interviewController.getSuggestionByChatGpt,
);

router.post("/saveKey", authMiddleware, interviewController.saveKey);

export default router;
