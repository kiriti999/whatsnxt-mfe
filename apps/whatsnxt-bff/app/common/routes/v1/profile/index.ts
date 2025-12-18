import express from "express";
const router = express.Router();
import profileController from "../../../controllers/profileController";
import authMiddleware from "../../../middlewares/auth-middleware";

router.get("/", authMiddleware, profileController.handler);
router.patch("/edit-profile", authMiddleware, profileController.editProfile);
router.patch("/edit-password", authMiddleware, profileController.editPassword);
router.patch(
  "/edit-profile-info",
  authMiddleware,
  profileController.editProfileInfo,
);
router.post(
  "/reset-password-request",
  authMiddleware,
  profileController.resetPassword,
);
router.post(
  "/reset-password/:userId/:token",
  authMiddleware,
  profileController.createResetPasswordToken,
);

export default router;
