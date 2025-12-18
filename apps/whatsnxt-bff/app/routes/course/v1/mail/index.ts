import express from "express";
const router = express.Router();
import mailController from "../../../../controllers/course/mailController";

router.post("/sendCoursePurchaseMail", mailController.sendCoursePurchaseMail);
router.post("/contactUsMail", mailController.contactUsMail);
router.post(
  "/sendTrainerContactedMail",
  mailController.sendTrainerContactedMail,
);
router.post("/sendTeacherApplyMail", mailController.sendTeacherApplyMail);
router.post("/sendCourseReviewMail", mailController.sendCourseReviewMail);
router.post(
  "/sendContactDetailsRefundMail",
  mailController.sendContactDetailsRefundMail,
);
router.post("/sendCourseRefundMail", mailController.sendCourseRefundMail);

export default router;
